const { createClient } = require('@supabase/supabase-js')

// 1. Your Project URL
const supabaseUrl = 'https://lobmtyvthfsjhdpadvdi.supabase.co'

// 2. Your Anon Key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYm10eXZ0aGZzamhkcGFkdmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQ3NzEsImV4cCI6MjA4MzI1MDc3MX0.vXes2PxPhEw4yJSdJ5O7UicFPRiWfDudKzoAxfSQMgw'

// Initialize the client
const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchData() {
  console.log("⏳ Connecting to 'player_history'...")

  // Fetch data from your specific table
  const { data, error } = await supabase
    .from('player_history')  // <--- Targeted table
    .select('*')
    .limit(5)                // Just get the first 5 rows for testing

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Success! Found', data.length, 'rows.')
    console.log('Here is the first row of data:', data[0])
  }
}

fetchData()