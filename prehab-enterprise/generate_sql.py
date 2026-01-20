import pandas as pd
import numpy as np
from datetime import timedelta

# CONFIGURATION
INPUT_FILE = "history_v2.csv"
OUTPUT_FILE = "upload_me.sql"
TABLE_NAME = "player_history"
EXTRA_SYNTHETIC_ROWS = 50  # How many fake "similar" rows to add

def clean_value(val):
    """Format value for SQL (strings get quotes, dates get quotes, numbers don't)"""
    if pd.isna(val):
        return "NULL"
    if isinstance(val, (int, float, np.number)):
        return str(val)
    return f"'{str(val)}'"

def main():
    # 1. Read the CSV
    print(f"Reading {INPUT_FILE}...")
    try:
        df = pd.read_csv(INPUT_FILE)
    except FileNotFoundError:
        print(f"❌ Error: Could not find {INPUT_FILE}")
        return

    # Clean column names (lowercase, no spaces)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    columns = ", ".join(df.columns)

    sql_values = []

    # 2. Process ORIGINAL Data
    print(f"Processing {len(df)} original rows...")
    for _, row in df.iterrows():
        values = ", ".join([clean_value(val) for val in row])
        sql_values.append(f"({values})")

    # 3. Generate & Process SYNTHETIC Data
    print(f"Generating {EXTRA_SYNTHETIC_ROWS} similar rows...")
    for i in range(EXTRA_SYNTHETIC_ROWS):
        fake_row = []
        for col in df.columns:
            # Get original column data to learn from
            orig_col = df[col]
            
            # Logic: If number, add slight random noise. If date, add days.
            if pd.api.types.is_numeric_dtype(orig_col):
                mean = orig_col.mean()
                std = orig_col.std() if len(df) > 1 else 1
                new_val = np.random.normal(mean, std)
                # Keep positive if original was positive
                if orig_col.min() >= 0: new_val = abs(new_val)
                # Round integers correctly
                if pd.api.types.is_integer_dtype(orig_col):
                    fake_row.append(int(new_val))
                else:
                    fake_row.append(round(new_val, 2))
            
            elif 'date' in col or 'time' in col:
                # Add 1 day per new row to the max existing date
                last_date = pd.to_datetime(orig_col).max()
                new_date = last_date + timedelta(days=i+1)
                fake_row.append(str(new_date.date()))
            
            else:
                # For text (names, IDs), just pick a random existing one
                fake_row.append(np.random.choice(orig_col.unique()))
        
        # Format the fake row for SQL
        values = ", ".join([clean_value(val) for val in fake_row])
        sql_values.append(f"({values})")

    # 4. Write to SQL File
    print(f"Writing to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        # Write the CREATE TABLE part (just in case)
        f.write(f"-- Auto-generated SQL for {TABLE_NAME}\n")
        
        # Write the INSERT statement
        # We break it into chunks of 1000 to avoid SQL size limits
        chunk_size = 1000
        for i in range(0, len(sql_values), chunk_size):
            chunk = sql_values[i:i + chunk_size]
            f.write(f"INSERT INTO {TABLE_NAME} ({columns}) VALUES\n")
            f.write(",\n".join(chunk))
            f.write(";\n\n")

    print(f"✅ Done! Open '{OUTPUT_FILE}', copy the text, and paste it into Supabase.")

if __name__ == "__main__":
    main()