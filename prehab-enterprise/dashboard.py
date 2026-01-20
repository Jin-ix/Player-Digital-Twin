import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client
import streamlit as st
import requests
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

load_dotenv()

# =========================================================
# 1. CONFIGURATION & STATE MANAGEMENT
# =========================================================
API_URL = "http://127.0.0.1:8000/api/v1"
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

st.set_page_config(
    page_title="Prehab 2.0 | Elite Sports Twin",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State
if 'token' not in st.session_state:
    st.session_state.token = None
if 'role' not in st.session_state:
    st.session_state.role = None
if 'data' not in st.session_state:
    st.session_state.data = None

# =========================================================
# 2. GLOBAL STYLING (The "Superb" Aesthetics)
# =========================================================
st.markdown("""
<style>
    /* ----------------------------------
       ANIMATIONS
    ---------------------------------- */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    @keyframes glow {
        from { box-shadow: 0 0 5px #00CC96, 0 0 10px #00CC96; }
        to { box-shadow: 0 0 20px #00CC96, 0 0 30px #00CC96; }
    }

    /* ----------------------------------
       GLOBAL THEME
    ---------------------------------- */
    .stApp {
        background-color: #0E1117;
        font-family: 'Inter', sans-serif;
    }
    
    /* Apply fade-in to main containers */
    .block-container {
        animation: fadeIn 0.8s ease-out;
    }

    /* ----------------------------------
       HEADINGS & TEXT
    ---------------------------------- */
    h1, h2, h3 {
        color: #FFFFFF !important;
        font-weight: 700;
        letter-spacing: -0.5px;
    }
    
    .gradient-text {
        background: linear-gradient(45deg, #00CC96, #636EFA);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
    }

    /* ----------------------------------
       CARDS & CONTAINERS
    ---------------------------------- */
    .glass-card {
        background: rgba(30, 36, 44, 0.7);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        margin-bottom: 20px;
    }
    
    .glass-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border-color: rgba(255, 255, 255, 0.2);
    }
    
    /* Streamlit Containers Override */
    [data-testid="stMetricValue"] {
        font-size: 28px !important;
        font-weight: 700;
        color: #E6EDF3;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    /* ----------------------------------
       CUSTOM WIDGETS
    ---------------------------------- */
    .readiness-battery {
        height: 12px;
        background: #30363D;
        border-radius: 6px;
        overflow: hidden;
        margin-top: 5px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
    }
    
    .battery-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 1.5s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
        overflow: hidden;
    }
    
    .battery-fill::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: linear-gradient(
            45deg, 
            rgba(255,255,255,0.2) 25%, 
            transparent 25%, 
            transparent 50%, 
            rgba(255,255,255,0.2) 50%, 
            rgba(255,255,255,0.2) 75%, 
            transparent 75%, 
            transparent
        );
        background-size: 20px 20px;
        animation: moveStripe 1s linear infinite;
    }
    
    @keyframes moveStripe {
        0% { background-position: 0 0; }
        100% { background-position: 20px 20px; }
    }

    /* ----------------------------------
       SIDEBAR
    ---------------------------------- */
    [data-testid="stSidebar"] {
        background-color: #161B22;
        border-right: 1px solid #30363D;
    }

    /* ----------------------------------
       BUTTONS
    ---------------------------------- */
    .stButton>button {
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.2s;
        border: none;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.2);
    }
</style>
""", unsafe_allow_html=True)


# =========================================================
# 3. HELPER FUNCTIONS
# =========================================================

def get_readiness_color(score):
    if score >= 80: return "#00CC96" # Green
    if score >= 50: return "#FFA15A" # Orange
    return "#EF553B" # Red

def render_battery_widget(label, value, subtext=None):
    color = get_readiness_color(value)
    st.markdown(f"""
        <div class="glass-card" style="padding: 15px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                <span style="font-size:14px; color:#8B949E; font-weight:600;">{label.upper()}</span>
                <span style="font-size:24px; color:{color}; font-weight:800;">{value}%</span>
            </div>
            <div class="readiness-battery">
                <div class="battery-fill" style="width: {value}%; background: {color};"></div>
            </div>
            {f'<div style="margin-top:8px; font-size:12px; color:#8B949E;">{subtext}</div>' if subtext else ''}
        </div>
    """, unsafe_allow_html=True)

# =========================================================
# 4. VIEW: COACH DASHBOARD (LEGACY CODE WRAPPED)
# =========================================================
def render_coach_view():
    st.title("⚽ Coach Command Center")
    st.markdown("---")
    
    # PREMIUM TABS using emojis
    tab1, tab2, tab3 = st.tabs([
        "🧬 Biomechanics (Player)", 
        "🛡️ Squad Manager (Enterprise)", 
        "🧠 AI Coach (Anomaly)"
    ])
    
    # =========================================================
    # TAB 1: GNN BIOMECHANICS
    # =========================================================
    with tab1:
        st.subheader("🦾 AI Motion Capture & GNN Analysis")
        
        # --- INPUT SECTION ---
        col_left, col_right = st.columns([1, 2])
        
        with col_left:
            st.info("Upload game footage for frame-by-frame analysis.")
            uploaded_file = st.file_uploader("video_input", label_visibility="collapsed", type=['mp4', 'mov', 'avi'])
            
            if uploaded_file:
                # 1. Check File Size (Limit to 50MB to prevent browser crash)
                if uploaded_file.size > 50 * 1024 * 1024:
                    st.error("⚠️ File too large (>50MB). Please upload a smaller clip.")
                    uploaded_file = None
                else:
                    try:
                        st.video(uploaded_file)
                    except Exception as e:
                        st.error(f"Error rendering video: {e}")
        
        with col_right:
            if uploaded_file:
                if st.button("🚀 Execute Physics Engine + GNN", type="primary", use_container_width=True):
                    try:
                        with st.spinner("Processing Kinetic Chain..."):
                            # MOCK DATA GENERATION FOR DEMO
                            time.sleep(1.5) # Simulate processing
                            
                            # Data for Timeline
                            frames = list(range(0, 50))
                            knee_flexion = [45 + 15 * np.sin(i/5) for i in frames]
                            valgus_stress = [5 + 2 * np.cos(i/3) + np.random.normal(0, 0.5) for i in frames]
                            
                            # Data for GRF
                            grf_left = [0 if i < 10 or i > 40 else 800 + 100*np.random.randn() for i in frames]
                            grf_right = [0 if i < 12 or i > 42 else 750 + 100*np.random.randn() for i in frames]

                            # 1. METRIC CARDS
                            m1, m2, m3, m4 = st.columns(4)
                            m1.metric("ACL Risk Probability", "78.5%", "+12%", delta_color="inverse")
                            m2.metric("Critical Failure", "L_Knee", "Unstable")
                            m3.metric("Peak Valgus", "18.5°", "High Risk")
                            m4.metric("Landing Force", "3.2 BW", "Normal")

                            st.divider()

                            # --- ROW 1: CORE BIOMECHANICS ---
                            c1, c2, c3 = st.columns(3)
                            
                            with c1:
                                st.markdown("#### 1️⃣ Joint Dependency Graph")
                                fig_gnn = go.Figure()
                                nodes = ["Hip", "Knee", "Ankle", "Foot"]
                                x_nodes = [1, 2, 2, 1]
                                y_nodes = [3, 2, 1, 0]
                                fig_gnn.add_trace(go.Scatter(x=x_nodes, y=y_nodes, mode='lines', line=dict(color='#30363D', width=2), hoverinfo='none'))
                                fig_gnn.add_trace(go.Scatter(
                                    x=x_nodes, y=y_nodes, mode='markers+text', text=nodes, textposition="top right",
                                    marker=dict(size=20, color=['#00CC96', '#EF553B', '#FFA15A', '#00CC96'])
                                ))
                                fig_gnn.update_layout(height=250, margin=dict(l=10, r=10, t=10, b=10), xaxis=dict(visible=False), yaxis=dict(visible=False), paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                                st.plotly_chart(fig_gnn, use_container_width=True)

                            with c2:
                                st.markdown("#### 2️⃣ Dynamic ACL Risk Gauge")
                                fig_gauge = go.Figure(go.Indicator(
                                    mode = "gauge+number", value = 18.5,
                                    domain = {'x': [0, 1], 'y': [0, 1]},
                                    gauge = {
                                        'axis': {'range': [0, 30]}, 
                                        'bar': {'color': "#EF553B"},
                                        'steps': [{'range': [0, 15], 'color': "#00CC96"}, {'range': [15, 30], 'color': "#30363D"}]
                                    }
                                ))
                                fig_gauge.update_layout(height=250, margin=dict(l=20, r=20, t=30, b=20), paper_bgcolor='rgba(0,0,0,0)')
                                st.plotly_chart(fig_gauge, use_container_width=True)

                            with c3:
                                st.markdown("#### 3️⃣ Athlete vs Elite Benchmark")
                                categories = ['Stability', 'Symmetry', 'Force', 'Mobility', 'Power']
                                fig_radar = go.Figure()
                                fig_radar.add_trace(go.Scatterpolar(r=[50, 40, 80, 60, 70], theta=categories, fill='toself', name='Athlete', line_color='#EF553B'))
                                fig_radar.add_trace(go.Scatterpolar(r=[90, 95, 80, 85, 90], theta=categories, fill='toself', name='Elite', line_color='#00CC96', opacity=0.3))
                                fig_radar.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 100])), height=250, margin=dict(l=30, r=30, t=30, b=20), paper_bgcolor='rgba(0,0,0,0)')
                                st.plotly_chart(fig_radar, use_container_width=True)

                            # --- ROW 2: ADVANCED KINETICS ---
                            st.subheader("📉 Deep Dive Kinetics")
                            c4, c5, c6 = st.columns(3)

                            with c4:
                                st.markdown("#### 4️⃣ Joint Angle Timeline")
                                fig_line = go.Figure()
                                fig_line.add_trace(go.Scatter(x=frames, y=knee_flexion, mode='lines', name='Flexion', line=dict(color='#636EFA')))
                                fig_line.add_trace(go.Scatter(x=frames, y=valgus_stress, mode='lines', name='Valgus Stress', line=dict(color='#EF553B', dash='dot')))
                                fig_line.update_layout(
                                    xaxis_title="Frame (Time)", yaxis_title="Angle (°)", 
                                    height=250, margin=dict(l=10, r=10, t=30, b=10), legend=dict(orientation="h", y=1.1),
                                    paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font=dict(color="white")
                                )
                                st.plotly_chart(fig_line, use_container_width=True)

                            with c5:
                                st.markdown("#### 5️⃣ Ground Reaction Force (GRF)")
                                fig_area = go.Figure()
                                fig_area.add_trace(go.Scatter(x=frames, y=grf_left, stackgroup='one', name='Left Leg', line=dict(color='#00CC96')))
                                fig_area.add_trace(go.Scatter(x=frames, y=grf_right, stackgroup='one', name='Right Leg', line=dict(color='#AB63FA')))
                                fig_area.update_layout(
                                    xaxis_title="Frame", yaxis_title="Force (N)", 
                                    height=250, margin=dict(l=10, r=10, t=30, b=10), legend=dict(orientation="h", y=1.1),
                                    paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font=dict(color="white")
                                )
                                st.plotly_chart(fig_area, use_container_width=True)

                            with c6:
                                st.markdown("#### 6️⃣ Limb Asymmetry Index")
                                fig_bar = go.Figure()
                                fig_bar.add_trace(go.Bar(x=['Left', 'Right'], y=[np.max(grf_left), np.max(grf_right)], marker_color=['#00CC96', '#AB63FA']))
                                fig_bar.update_layout(
                                    yaxis_title="Peak Force (N)", 
                                    height=250, margin=dict(l=10, r=10, t=30, b=10),
                                    paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font=dict(color="white")
                                )
                                st.plotly_chart(fig_bar, use_container_width=True)
                    except Exception as e:
                        st.error(f"❌ Analysis Failed: {e}")
                        st.warning("Please verify the video file format (MP4 recommended) and your internet connection.")

            else:
                st.info("👈 Waiting for video upload to initialize engine...")

    # =========================================================
    # TAB 2: TEAM MANAGER
    # =========================================================
    with tab2:
        st.subheader("📂 Squad Management System")
        team_file = st.file_uploader("Upload 'team_data.csv'", type=['csv'])
        
        if team_file:
            df = pd.read_csv(team_file)
            df.columns = df.columns.str.strip()
            
            # --- KPI ROW ---
            avg_risk = df['Risk Score'].mean()
            k1, k2, k3, k4 = st.columns(4)
            k1.metric("Squad Readiness", "85%", "Match Day Ready")
            k2.metric("High Risk Players", len(df[df['Risk Score'] > 50]), "Critical Monitor", delta_color="inverse")
            k3.metric("Avg Acute Load", f"{df['Acute Load'].mean():.1f}", "Normal")
            k4.metric("Compliance", "98%", "+2%")
            
            st.divider()

            # --- ROW 1 ---
            c1, c2, c3 = st.columns(3)
            with c1:
                st.markdown("#### 1️⃣ Load vs Recovery Scatter")
                fig_scatter = px.scatter(
                    df, x="Acute Load", y="Recovery", size="Risk Score", color="Risk Score", 
                    hover_name="Player", color_continuous_scale="RdYlGn_r",
                    template="plotly_dark"
                )
                fig_scatter.update_layout(height=300, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                st.plotly_chart(fig_scatter, use_container_width=True)

            with c2:
                st.markdown("#### 2️⃣ Metrics Heatmap")
                fig_heat = px.imshow(
                    df.set_index('Player')[['Acute Load', 'Recovery', 'Risk Score']], 
                    aspect="auto", color_continuous_scale="Viridis",
                    template="plotly_dark"
                )
                fig_heat.update_layout(height=300, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                st.plotly_chart(fig_heat, use_container_width=True)

            with c3:
                st.markdown("#### 3️⃣ ACWR Distribution")
                fig_bar = go.Figure(data=[go.Bar(x=df['Player'], y=df['Acute Load'], marker_color='#636EFA')])
                fig_bar.update_layout(template="plotly_dark", height=300, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                st.plotly_chart(fig_bar, use_container_width=True)

            # --- ROW 2 ---
            c4, c5, c6 = st.columns(3)
            with c4:
                st.markdown("#### 4️⃣ Risk Zone Breakdown")
                df['Zone'] = pd.cut(df['Risk Score'], bins=[0, 30, 60, 100], labels=['Green', 'Orange', 'Red'])
                fig_pie = px.pie(df, names='Zone', color='Zone', color_discrete_map={'Green':'#00CC96', 'Orange':'#FFA15A', 'Red':'#EF553B'}, template="plotly_dark")
                fig_pie.update_layout(height=300, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                st.plotly_chart(fig_pie, use_container_width=True)

            with c5:
                st.markdown("#### 5️⃣ Training Compliance")
                fig_donut = go.Figure(data=[go.Pie(labels=['Completed', 'Missed'], values=[92, 8], hole=.6, marker_colors=['#00CC96', '#EF553B'])])
                fig_donut.update_layout(showlegend=False, template="plotly_dark", height=300, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', annotations=[dict(text='92%', x=0.5, y=0.5, font_size=20, showarrow=False)])
                st.plotly_chart(fig_donut, use_container_width=True)

            with c6:
                st.markdown("#### 6️⃣ Wellness vs Load Trend")
                fig_dual = make_subplots(specs=[[{"secondary_y": True}]])
                sorted_df = df.sort_values('Acute Load')
                fig_dual.add_trace(go.Bar(x=sorted_df['Player'], y=sorted_df['Acute Load'], name="Load", marker_color='#636EFA'), secondary_y=False)
                fig_dual.add_trace(go.Scatter(x=sorted_df['Player'], y=sorted_df['Recovery'], name="Wellness", line=dict(color='#FFA15A', width=3)), secondary_y=True)
                fig_dual.update_layout(template="plotly_dark", height=300, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', legend=dict(orientation="h", y=1.1))
                st.plotly_chart(fig_dual, use_container_width=True)

        else:
            st.info("👆 Please upload `team_data.csv` to activate Manager Analytics.")

    # =========================================================
    # TAB 3: ANOMALY (Existing Robustness)
    # =========================================================
    with tab3:
        st.subheader("🧬 Bio-Lab & RL Coach Agent")
        
        col_input, col_viz = st.columns([1, 3])
        
        # --- LEFT: FULL INPUT MATRIX ---
        with col_input:
            st.markdown("### 📥 Input Data")
            with st.expander("👤 Athlete Profile", expanded=True):
                sport = st.selectbox("Sport", ["Football", "Cricket", "Basketball"])
                age = st.number_input("Age", 16, 40, 24)
                weight = st.number_input("Weight (kg)", 50, 120, 75)
                height = st.number_input("Height (cm)", 150, 210, 180)

            with st.expander("📈 History Data (CSV/DB)", expanded=True):
                st.caption("Required for Anomaly Graphs")
                use_db = st.toggle("Fetch from Database (Supabase)", value=False)
                real_history = []
                
                if use_db:
                    if not SUPABASE_URL or not SUPABASE_KEY:
                        st.warning("⚠️ No database connection found. Running in Demo Mode.")
                        st.caption("Add SUPABASE_URL and SUPABASE_KEY to Streamlit Secrets to enable cloud features.")
                    else:
                        try:
                            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
                            response = supabase.table('player_history').select('load, hrv, sleep').order('created_at', desc=False).limit(30).execute()
                            if response.data:
                                real_history = [[r.get('load', 0), r.get('hrv', 0), r.get('sleep', 0)] for r in response.data]
                                st.success(f"✅ Fetched {len(real_history)} records from Cloud")
                            else:
                                st.warning("No records found in DB")
                        except Exception as e:
                            st.error(f"DB Connection Error: {e}")
                
                if not real_history:
                    history_file = st.file_uploader("Upload History CSV", type=['csv'])
                    if history_file:
                        try:
                            df_h = pd.read_csv(history_file)
                            real_history = df_h[['Load', 'HRV', 'Sleep']].values.tolist()
                            st.success(f"✅ Loaded {len(real_history)} days from CSV")
                        except: st.error("CSV Error: Need Load/HRV/Sleep columns")

            with st.expander("🏋️‍♀️ External Load", expanded=False):
                rpe = st.slider("Session RPE (1-10)", 1, 10, 7)
                duration = st.number_input("Duration (mins)", 10, 180, 90)
                chronic_load = st.number_input("Chronic Load (Weekly AU)", 1000, 5000, 2500)
                acwr_input = st.slider("Current ACWR", 0.5, 2.0, 1.1)
                sprint_dist = st.number_input("Sprint Distance (m)", 0, 2000, 500)

            with st.expander("❤️ Internal Load", expanded=False):
                hrv = st.slider("HRV (ms)", 10, 200, 65)
                resting_hr = st.number_input("Resting HR", 30, 100, 55)
                sleep_hrs = st.slider("Sleep Duration", 3.0, 12.0, 7.5)
                stress = st.slider("Physio Stress", 0, 100, 40)
                vo2 = st.number_input("VO2 Max", 30, 80, 52)
                spo2 = st.number_input("Blood Oxygen (%)", 80, 100, 98)
                hr_response = st.slider("HR Response %", 0, 100, 30)

            with st.expander("🧠 Psych Context", expanded=False):
                mood = st.slider("Mood (1-10)", 1, 10, 7)
                motiv = st.slider("Motivation (1-10)", 1, 10, 8)
                life_stress = st.slider("Life Stress (1-10)", 1, 10, 3)
                mental_fatigue = st.slider("Mental Fatigue (1-10)", 1, 10, 4)

            if st.button("🚀 Run Full Scan", type="primary"):
                payload = {
                    "biometrics": {"sport": sport, "age": age, "weight": weight, "height": height, "hrv": hrv, "vo2_max": vo2, "sleep_hours": sleep_hrs, "stress_index": stress, "sleep_quality": 80, "resting_hr": resting_hr, "blood_oxygen": spo2, "hr_response": hr_response},
                    "load_metrics": {"rpe": rpe, "duration_minutes": duration, "chronic_tolerance": chronic_load, "acwr": acwr_input, "sprint_distance": sprint_dist},
                    "wellness": {"mood_score": mood, "motivation": motiv, "life_stress": life_stress, "mental_fatigue": mental_fatigue},
                    "history": real_history if real_history else None
                }
                headers = {"Authorization": f"Bearer {st.session_state.token}"}
                try:
                    if st.session_state.token == "dev-token-bypass":
                         raise ConnectionError("Dev Mode - Skipping Backend")
                    res = requests.post(f"{API_URL}/analytics/analyze", headers=headers, json=payload)
                    if res.status_code == 200: 
                        st.session_state.data = res.json()
                    else: 
                        st.error("API Error")
                except Exception as e:
                    # MOCK FALLBACK
                    st.warning(f"Backend Offline ({e}). Loading Simulation Engine...")
                    mock_anomalies = [{"day": 10, "val": 2500}, {"day": 20, "val": 3000}]
                    mock_forecast = [30 + i*2 + np.random.randint(-5, 5) for i in range(15)]
                    st.session_state.data = {
                        "raw_metrics": {
                            "rl_strategy": {
                                "action": "Reduce Load",
                                "confidence": 88,
                                "state_assessment": "Overreaching Detected",
                                "explanation": "High acute load combined with low sleep quality."
                            }
                        },
                        "recommendations": [
                            "🚨 Reduce Sprint Volume by 20%",
                            "🤖 RL Agent: Suggests Active Recovery tomorrow",
                            "Monitor Sleep Hygiene"
                        ],
                        "anomaly_report": {"anomalies": mock_anomalies},
                        "forecast": mock_forecast
                    }

        # --- RIGHT: VISUALIZATIONS ---
        with col_viz:
            if st.session_state.data:
                data = st.session_state.data
                raw = data.get('raw_metrics', {})
                rl_data = raw.get('rl_strategy', {})

                if rl_data:
                    st.markdown("### 🤖 RL Coach Policy (Q-Learning)")
                    rl_c1, rl_c2 = st.columns([2, 1])
                    with rl_c1:
                        action = rl_data['action']
                        box_color = "#00CC96" 
                        if "Rest" in action: box_color = "#636EFA" 
                        elif "Reduce" in action: box_color = "#FFA15A" 
                        st.markdown(f"""
                            <div style="background-color:rgba(50,50,50,0.3); border-left: 6px solid {box_color}; padding: 15px; border-radius: 5px;">
                                <h2 style="margin:0; color: {box_color};">{action}</h2>
                                <p style="margin:5px 0 0 0; font-size:14px;">Confidence: <strong>{rl_data['confidence']}%</strong> | Reward Expectation: High</p>
                            </div>
                        """, unsafe_allow_html=True)
                    with rl_c2:
                        st.metric("Detected State", rl_data['state_assessment'])
                        st.caption(rl_data['explanation'])
                    st.divider()

                if data.get('recommendations'):
                    with st.expander("📋 Full Recommendation List", expanded=True):
                        for r in data['recommendations']:
                            if "🤖" in r: st.info(r)
                            elif "🚨" in r: st.error(r)
                            else: st.write(f"• {r}")
                
                if real_history:
                    loads = [x[0] for x in real_history]
                    hrvs = [x[1] for x in real_history]
                    sleeps = [x[2] for x in real_history]
                    days = [f"D{i+1}" for i in range(len(loads))]
                    
                    st.markdown("#### 1️⃣ Anomaly Timeline (Load Spikes)")
                    fig1 = go.Figure()
                    fig1.add_trace(go.Scatter(x=days, y=loads, mode='lines', name='Load', line=dict(color='#636EFA', width=3)))
                    if 'anomaly_report' in data:
                        anoms = data['anomaly_report'].get('anomalies', [])
                        if anoms:
                            ax = [f"D{a['day']+1}" for a in anoms]
                            ay = [a['val'] for a in anoms]
                            fig1.add_trace(go.Scatter(x=ax, y=ay, mode='markers', marker=dict(color='red', size=12, symbol='x'), name='Issue'))
                    fig1.update_layout(template="plotly_dark", height=250, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                    st.plotly_chart(fig1, use_container_width=True)
                    
                    if 'forecast' in data:
                        st.markdown("#### 2️⃣ AI Risk Forecast")
                        fig2 = px.line(y=data['forecast'], x=[f"T+{i+1}" for i in range(15)], labels={'x':'Future Timeline', 'y':'Risk %'}, template="plotly_dark")
                        fig2.add_hline(y=70, line_dash="dash", line_color="red")
                        fig2.update_traces(line_color='#00CC96', line_width=3)
                        fig2.update_layout(height=250, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                        st.plotly_chart(fig2, use_container_width=True)

                    c3, c4 = st.columns(2)
                    with c3:
                        st.markdown("#### 3️⃣ Recovery Link (Sleep vs HRV)")
                        fig3 = px.scatter(x=sleeps, y=hrvs, color=loads, color_continuous_scale='Bluered', labels={'x':'Sleep (h)', 'y':'HRV (ms)'}, template="plotly_dark")
                        fig3.update_layout(height=250, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                        st.plotly_chart(fig3, use_container_width=True)
                    with c4:
                        st.markdown("#### 4️⃣ Load Volume Distribution")
                        fig4 = go.Figure()
                        fig4.add_trace(go.Bar(x=days, y=loads, marker_color=loads, marker_colorscale='Viridis'))
                        fig4.update_layout(template="plotly_dark", height=250, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                        st.plotly_chart(fig4, use_container_width=True)
                    
                    st.markdown("#### 5️⃣ Recovery Tank (HRV + Sleep Trend)")
                    fig5 = go.Figure()
                    fig5.add_trace(go.Scatter(x=days, y=hrvs, fill='tozeroy', name='HRV Energy', line=dict(color='#AB63FA')))
                    fig5.add_trace(go.Scatter(x=days, y=[s*10 for s in sleeps], fill='tonexty', name='Sleep Capacity', line=dict(color='#00CC96')))
                    fig5.update_layout(hovermode="x unified", template="plotly_dark", height=250, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                    st.plotly_chart(fig5, use_container_width=True)
            else:
                st.info("👈 Upload History to view Analytics")


# =========================================================
# 5. VIEW: PLAYER LOCKER ROOM (NEW)
# =========================================================
def render_player_view():
    st.markdown("<h1 style='font-size: 3rem;'>👋 Locker Room: <span class='gradient-text'>Player #10</span></h1>", unsafe_allow_html=True)
    
    # --- HEADER: READINESS BATTERY ---
    # Calc logic: 60% Wellness + 40% Freshness
    wellness = 85
    freshness = 70
    battery_charge = int((wellness * 0.6) + (freshness * 0.4))
    
    # Custom CSS Grid for Header Widget
    st.markdown("""
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px;">
    """, unsafe_allow_html=True)
    
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        render_battery_widget("System Charge", battery_charge, "Ready for Match Day")
    with c2:
        render_battery_widget("Acute Load", 65, "Optimal Range")
    with c3:
        render_battery_widget("Recovery", 92, "Supercompensated")
    with c4:
        render_battery_widget("Injury Risk", 12, "Low Probability")

    st.markdown("</div>", unsafe_allow_html=True)
    
    # --- TABS ---
    tab1, tab2, tab3, tab4 = st.tabs([
        "📈 Performance Lab", 
        "📝 Log & Twin", 
        "🏋️ Homework",
        "👤 Profile"
    ])
    
    # Placeholder for tabs (Will implement in next steps)
    with tab1:
        st.subheader("📊 Performance Trends & Bio-Analytics")
        
        # --- GENERATE MOCK DATA FOR PLAYER VIEW ---
        # (In production, this would be fetched from Supabase)
        days = 30
        dates = pd.date_range(end=pd.Timestamp.now(), periods=days)
        daily_load = np.random.randint(100, 800, size=days)
        sleep_data = np.random.uniform(5, 9, size=days)
        wellness_scores = [min(100, max(0, int(s*10 + np.random.randint(-10, 10)))) for s in sleep_data]
        acwr_values = [0.8, 0.9, 1.1, 1.4, 1.2, 0.7, 1.0, 1.15] # Just a sample
        current_acwr = 1.15
        
        # --- ROW 1: ACWR Gauge & Bio-Radar (High Level) ---
        c1, c2 = st.columns([1, 1])
        
        with c1:
            st.markdown("#### 1️⃣ Acute:Chronic Workload Ratio (Injury Risk)")
            
            # ACWR Gauge
            fig_gauge = go.Figure(go.Indicator(
                mode = "gauge+number+delta",
                value = current_acwr,
                delta = {'reference': 1.0, 'position': "top", 'relative': False},
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Current ACWR", 'font': {'size': 18, 'color': "white"}},
                gauge = {
                    'axis': {'range': [0, 2.0], 'tickwidth': 1, 'tickcolor': "white"},
                    'bar': {'color': "#FFFFFF", 'thickness': 0.15},
                    'bgcolor': "#161B22",
                    'borderwidth': 0,
                    'steps': [
                        {'range': [0, 0.8], 'color': "#FFA15A"},  # Undertraining
                        {'range': [0.8, 1.3], 'color': "#00CC96"}, # Optimal
                        {'range': [1.3, 2.0], 'color': "#EF553B"}  # High Risk
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 1.5
                    }
                }
            ))
            fig_gauge.add_annotation(x=0.5, y=-0.1, text="Optimal Zone: 0.8 - 1.3", showarrow=False, font=dict(color="#8B949E"))
            fig_gauge.update_layout(height=350, margin=dict(l=30, r=30, t=50, b=50), paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_gauge, use_container_width=True)

        with c2:
            st.markdown("#### 2️⃣ Bio-Radar System Assessment")
            
            # Bio-Radar
            categories = ['Sleep Quality', 'Mood State', 'Freshness', 'Physio Status', 'Diet/Fuel']
            r_vals = [85, 70, 60, 90, 75]
            
            fig_radar = go.Figure()
            fig_radar.add_trace(go.Scatterpolar(
                r=r_vals,
                theta=categories,
                fill='toself',
                name='Current Status',
                line=dict(color='#636EFA'),
                fillcolor='rgba(99, 110, 250, 0.3)'
            ))
            fig_radar.update_layout(
                polar=dict(
                    radialaxis=dict(visible=True, range=[0, 100], tickfont=dict(color='white')),
                    angularaxis=dict(tickfont=dict(color='white', size=12))
                ),
                height=350,
                margin=dict(l=40, r=40, t=40, b=40),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)'
            )
            st.plotly_chart(fig_radar, use_container_width=True)
            
        st.divider()
        
        # --- ROW 2: Load Volume Area Chart ---
        st.markdown("#### 3️⃣ 60-Day Load Volume History")
        
        # Area Chart
        fig_area = go.Figure()
        fig_area.add_trace(go.Scatter(
            x=dates, 
            y=daily_load, 
            mode='lines',
            fill='tozeroy',
            name='Daily Load',
            line=dict(color='#00CC96', width=3),
            fillcolor='rgba(0, 204, 150, 0.2)'
        ))
        # Add Threshold Line
        fig_area.add_hline(y=700, line_dash="dash", line_color="#EF553B", annotation_text="High Load Warning")
        
        fig_area.update_layout(
            xaxis_title="Date",
            yaxis_title="Arbitrary Units (AU)",
            height=300,
            margin=dict(l=20, r=20, t=30, b=20),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color="white"),
            xaxis=dict(showgrid=False),
            yaxis=dict(gridcolor='#30363D')
        )
        st.plotly_chart(fig_area, use_container_width=True)
        
        # --- ROW 3: Correlations (Scatter & Histogram) ---
        c3, c4 = st.columns(2)
        
        with c3:
            st.markdown("#### 4️⃣ Sleep Duration vs. Wellness Score")
            # Scatter Plot
            fig_scatter = px.scatter(
                x=sleep_data, 
                y=wellness_scores,
                size=[10]*days,
                color=wellness_scores,
                color_continuous_scale="Viridis",
                labels={'x': 'Sleep (Hours)', 'y': 'Wellness Score'}
            )
            fig_scatter.update_layout(
                height=300,
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color="white")
            )
            st.plotly_chart(fig_scatter, use_container_width=True)
            
        with c4:
            st.markdown("#### 5️⃣ Training Intensity Distribution")
            # Histogram
            rpe_data = np.random.normal(7, 1.5, 100) # Mock RPE data
            rpe_data = np.clip(rpe_data, 1, 10)
            
            fig_hist = go.Figure(data=[go.Histogram(
                x=rpe_data, 
                xbins=dict(start=1, end=10, size=1),
                marker_color='#AB63FA',
                opacity=0.8
            )])
            fig_hist.update_layout(
                xaxis_title="RPE (Rate of Perceived Exertion)",
                yaxis_title="Frequency",
                height=300,
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color="white"),
                bargap=0.1
            )
            st.plotly_chart(fig_hist, use_container_width=True)
    with tab2:
        st.subheader("📝 Daily Log & Digital Twin Diagnostics")
        
        col_log, col_twin = st.columns([1, 1.5])
        
        # --- LEFT: DAILY LOG INPUTS ---
        with col_log:
            st.markdown("### 📋 Daily Athlete Report")
            with st.container(border=True):
                st.markdown("#### Workload")
                p_rpe = st.slider("Session RPE (1-10)", 1, 10, 6, key="p_rpe")
                p_dur = st.number_input("Duration (mins)", 0, 180, 60, key="p_dur")
                
                st.markdown("#### Wellness")
                p_sleep = st.slider("Sleep (Hours)", 4.0, 12.0, 7.5, 0.5, key="p_sleep")
                p_mood = st.slider("Mood (1-5)", 1, 5, 4, key="p_mood")
                p_soreness = st.slider("Soreness (1-5)", 1, 5, 2, key="p_soreness")
                p_stress = st.slider("Stress (1-5)", 1, 5, 2, key="p_stress")
                
                # Calculation for Twin Logic
                acute_load_val = p_rpe * p_dur
                
                st.divider()
                if st.button("🔄 Sync to Cloud", type="primary", use_container_width=True):
                     with st.spinner("Syncing to Digital Twin..."):
                         time.sleep(1)
                         st.toast("Data Synced Successfully!", icon="✅")
                         st.toast(f"Acute Load Updated: {acute_load_val}", icon="📈")

        # --- RIGHT: DIGITAL TWIN VISUALIZATION ---
        with col_twin:
            st.markdown("### 🧍 Digital Twin Status")
            
            # Logic for coloring
            # Knees/Quads red if Acute Load > 600
            quad_color = "#EB4034" if acute_load_val > 600 else "#00CC96"
            quad_status = "Overloaded" if acute_load_val > 600 else "Optimal"
            
            # Ankles/Calves red if Soreness >= 4
            calf_color = "#EB4034" if p_soreness >= 4 else "#00CC96"
            calf_status = "Inflamed" if p_soreness >= 4 else "Fresh"
            
            # General status (Neutral "Suit" color)
            suit_color = "#30363D" 
            head_color = "#636EFA"

            fig_twin = go.Figure()

            # Helper to draw polygons
            def add_muscle_group(x, y, color, name, show_legend=False):
                fig_twin.add_trace(go.Scatter(
                    x=x, y=y,
                    fill='toself',
                    mode='lines',
                    line=dict(color='white', width=1),
                    fillcolor=color,
                    name=name,
                    showlegend=show_legend,
                    hoverinfo='name'
                ))

            # --- 1. HEAD & NECK ---
            add_muscle_group([0, 0.5, 0.5, 0, -0.5, -0.5, 0], [9.5, 9.8, 10.5, 10.8, 10.5, 9.8, 9.5], head_color, "Head")
            add_muscle_group([-0.2, 0.2, 0.2, -0.2], [8.5, 8.5, 9.5, 9.5], suit_color, "Neck")

            # --- 2. TORSO (Traps, Chest, Abs) ---
            # Traps
            add_muscle_group([-0.2, -1.8, -1.5, 1.5, 1.8, 0.2], [8.8, 8.2, 7.8, 7.8, 8.2, 8.8], suit_color, "Traps")
            # Chest/Core
            add_muscle_group([-1.5, 1.5, 1.2, 0, -1.2, -1.5], [7.8, 7.8, 4.5, 4.0, 4.5, 7.8], suit_color, "Torso")

            # --- 3. ARMS (Shoulders, Biceps, Forearms) ---
            # Left Arm
            add_muscle_group([-1.8, -2.2, -2.0, -1.5], [8.2, 7.8, 6.5, 6.8], suit_color, "L_Shoulder_Bicep")
            add_muscle_group([-2.0, -2.2, -2.5, -2.3], [6.5, 6.3, 4.5, 4.7], suit_color, "L_Forearm")
            # Right Arm
            add_muscle_group([1.8, 2.2, 2.0, 1.5], [8.2, 7.8, 6.5, 6.8], suit_color, "R_Shoulder_Bicep")
            add_muscle_group([2.0, 2.2, 2.5, 2.3], [6.5, 6.3, 4.5, 4.7], suit_color, "R_Forearm")

            # --- 4. LEGS (Quads - REACTIVE) ---
            # Left Quad
            add_muscle_group([-1.2, -0.2, -0.3, -1.0], [4.5, 4.5, 2.5, 2.5], quad_color, f"L_Quad ({quad_status})")
            # Right Quad
            add_muscle_group([1.2, 0.2, 0.3, 1.0], [4.5, 4.5, 2.5, 2.5], quad_color, f"R_Quad ({quad_status})")

            # --- 5. LEGS (Calves - REACTIVE) ---
            # Left Calf
            add_muscle_group([-1.0, -0.3, -0.4, -0.9], [2.5, 2.5, 0.5, 0.5], calf_color, f"L_Calf ({calf_status})")
            # Right Calf
            add_muscle_group([1.0, 0.3, 0.4, 0.9], [2.5, 2.5, 0.5, 0.5], calf_color, f"R_Calf ({calf_status})")

            # --- 6. FEET ---
            add_muscle_group([-1.1, -0.3, -0.2, -1.2], [0.5, 0.5, 0.0, 0.0], suit_color, "L_Foot")
            add_muscle_group([1.1, 0.3, 0.2, 1.2], [0.5, 0.5, 0.0, 0.0], suit_color, "R_Foot")

            fig_twin.update_layout(
                height=550,
                xaxis=dict(visible=False, range=[-4, 4], fixedrange=True),
                yaxis=dict(visible=False, range=[-0.5, 11.5], fixedrange=True),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                margin=dict(l=10, r=10, t=10, b=10),
                showlegend=False,
                dragmode=False
            )
            
            st.plotly_chart(fig_twin, use_container_width=True)
            
            # Diagnostic Text
            if acute_load_val > 600 or p_soreness >= 4:
                st.error("🚨 DIAGNOSTIC ALERT: Biomechanical Risk Detected")
                if acute_load_val > 600:
                    st.markdown(f"- **Quadriceps**: High Mechanical Load (Acute: {acute_load_val})")
                if p_soreness >= 4:
                    st.markdown(f"- **Calf Complex**: Inflammation/Soreness (Level: {p_soreness}/5)")
            else:
                st.success("✅ BIOMECHANICS OPTIMAL: No Structural Risks")
    
    with tab3:
        st.subheader("🏋️ Assigned Protocols & Rehab")
        
        col_tasks, col_video = st.columns([1, 1.5])
        
        with col_tasks:
            st.markdown("### ✅ Today's Tasks")
            t1 = st.checkbox("Nordic Hamstring Curls (3x5)")
            t2 = st.checkbox("Copenhagen Adductor Plank (3x30s)")
            t3 = st.checkbox("Foam Roll Calves (5 mins)")
            t4 = st.checkbox("Ankle Mobility Drills")
            
            # Progress Bar
            total_tasks = 4
            completed = sum([t1, t2, t3, t4])
            progress = completed / total_tasks
            
            st.markdown(f"**Progress: {int(progress*100)}%**")
            st.progress(progress)
            
            if progress == 1.0:
                st.balloons()
                st.success("🎉 All tasks completed! Great work.")
        
        with col_video:
            st.markdown("### 📺 Demonstration")
            # Updated to a valid working video (Official FIFA Warmup or similar generic valid link)
            st.video("https://www.youtube.com/watch?v=OE-29u0W30w") 
            st.caption("Auto-playing: Injury Prevention Protocol")

    with tab4:
        st.subheader("👤 Athlete Profile Settings")
        
        p_c1, p_c2 = st.columns([1, 2])
        
        with p_c1:
            st.image("https://cdn-icons-png.flaticon.com/512/4140/4140048.png", width=150)
        
        with p_c2:
            st.markdown("## Player #10")
            st.markdown("**Team:** Kerala Blasters")
            st.markdown("**Position:** Forward")
            st.markdown("**Status:** active | ✅ Cleared for Training")
            
            st.divider()
            st.caption("🔒 Connected to Secure Health Database (Supabase)")
            st.caption(f"Session ID: {st.session_state.token[:10]}...")


# =========================================================
# 6. SIDEBAR: AUTHENTICATION & NAVIGATION
# =========================================================
with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/3048/3048122.png", width=80)
    st.markdown("## Prehab 2.0")
    st.caption("🚀 Elite Performance Intelligence")
    st.divider()
    
    if not st.session_state.token:
        st.subheader("🔐 Access Portal")
        
        # Role Switcher
        login_mode = st.radio("Login As:", ["Coach", "Player"], horizontal=True)
        
        email = st.text_input("Email", "coach@keralablasters.com" if login_mode == "Coach" else "player10@keralablasters.com")
        password = st.text_input("Password", "password", type="password")
        
        if st.button("Sign In", type="primary", use_container_width=True):
            with st.spinner("Authenticating..."):
                time.sleep(1) # Dramatic pause
                # SIMULATED AUTH LOGIC
                if login_mode == "Coach" and "coach" in email:
                    st.session_state.token = "coach-token"
                    st.session_state.role = "coach"
                    st.toast("Welcome back, Coach! 🏆", icon="✅")
                    st.rerun()
                elif login_mode == "Player" and "player" in email:
                    st.session_state.token = "player-token"
                    st.session_state.role = "player"
                    st.toast("Welcome to the Locker Room! 👟", icon="✅")
                    st.rerun()
                else:
                    st.error("Invalid Credentials")

        st.divider()
        st.caption("Backend unavailable?")
        if st.button("🔓 Enter Dev Mode (Coach)", type="secondary", use_container_width=True):
             st.session_state.token = "dev-token-bypass"
             st.session_state.role = "coach"
             st.toast("Dev Mode Activated", icon="🛠️")
             st.rerun()
    else:
        st.success("🟢 Online")
        
        role_color = "#58A6FF" if st.session_state.role == "coach" else "#00CC96"
        role_title = "Head of Performance" if st.session_state.role == "coach" else "Forward #10"
        
        st.markdown(
            f"""
            <div style="background-color: #1F242C; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #30363D;">
                <p style="margin:0; font-size: 12px; color: #8B949E; text-transform: uppercase; letter-spacing: 1px;">Logged in as</p>
                <p style="margin:5px 0 0 0; font-weight: 800; font-size: 18px; color: white;">{st.session_state.role.capitalize()}</p>
                <p style="margin:0; font-size: 14px; color: {role_color};">{role_title}</p>
            </div>
            """, 
            unsafe_allow_html=True
        )
        
        st.markdown("### 🛠️ Controls")
        
        if st.button("Run Diagnostics", use_container_width=True):
            st.toast("System Optimal", icon="⚡")
            
        st.divider()
        if st.button("Logout", use_container_width=True, type="secondary"):
            st.session_state.token = None
            st.session_state.data = None
            st.session_state.role = None
            st.rerun()

# =========================================================
# 7. MAIN APP ROUTER
# =========================================================
if st.session_state.token:
    if st.session_state.role == "player":
        render_player_view()
    else:
        render_coach_view()
else:
    # Landing Page / Login Prompt
    st.markdown("""
    <div style="text-align: center; padding: 50px;">
        <h1 style="font-size: 4rem;">PREHAB 2.0</h1>
        <p style="font-size: 1.5rem; color: #8B949E;">The Future of Athletic Performance</p>
        <div style="margin-top: 50px; opacity: 0.5;">🔒 Please Login via Sidebar</div>
    </div>
    """, unsafe_allow_html=True)