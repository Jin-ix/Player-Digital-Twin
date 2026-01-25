// Verification script using native fetch (Node 18+)

async function checkUrl(url, options = {}) {
    console.log(`Checking ${url} [${options.method || 'GET'}]...`);
    try {
        const res = await fetch(url, options);
        if (res.ok) {
            console.log(`Status: ${res.status} OK`);
            const data = await res.json();
            // console.log("Response:", JSON.stringify(data).slice(0, 100) + "...");
            return data;
        } else {
            const txt = await res.text();
            console.error(`Error ${res.status}: ${res.statusText}`);
            console.error(txt);
            return null;
        }
    } catch (e) {
        console.error(`Fetch failed for ${url}:`, e.message);
        return null;
    }
}

async function run() {
    console.log("--- Starting Backend Verification ---");

    // 1. Check Health
    await checkUrl("http://127.0.0.1:8000/api/v1/injuries/test");
    await checkUrl("http://127.0.0.1:8000/api/v1/injuries/check_db");

    // NEW: Check Library logic (Triage)
    console.log("\nChecking Injury Library (Triage Flow)...");
    const hamInjuries = await checkUrl("http://127.0.0.1:8000/api/v1/injuries/library/Hamstring");
    console.log("Hamstring Result:", JSON.stringify(hamInjuries));

    // 2. Check Active Injury (GET)
    let injury = await checkUrl("http://127.0.0.1:8000/api/v1/injuries/current/player_10");

    if (!injury) {
        console.log("No active injury found. Attempting to assign one for testing...");
        // Assign injury library id 1
        const assignRes = await checkUrl("http://127.0.0.1:8000/api/v1/injuries/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                player_id: "player_10",
                injury_library_id: 1,
                start_date: new Date().toISOString().split('T')[0]
            })
        });
        if (assignRes) {
            console.log("Assigned injury for testing.");
            injury = assignRes;
        } else {
            console.error("Failed to assign injury. Aborting resolve test.");
        }
    }

    // 3. Check Homework Endpoint
    console.log("\nChecking Homework...");
    const hw = await checkUrl("http://127.0.0.1:8000/api/v1/homework/player_10");
    if (hw) {
        console.log("Homework Status:", hw.status);
        console.log("Tasks Found:", hw.tasks ? hw.tasks.length : 0);
        if (hw.tasks && hw.tasks.length > 0) {
            console.log("First Task:", hw.tasks[0]);
        } else {
            console.log("WARNING: No tasks in homework! This is likely the bug.");
        }
    }

    // 4. Test Resolve (POST) - SKIPPED for persistent UI testing
    console.log("\nSkipping resolve test to keep injury active.");

    console.log("\n--- Verification Complete ---");
}

run();
