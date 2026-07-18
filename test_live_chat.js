async function testLiveChat() {
    try {
        console.log("1. User asks for human support...");
        let res = await fetch('http://127.0.0.1:8000/api/chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "tôi cần gặp hỗ trợ viên", history: [] })
        });
        let chatRes = await res.json();
        
        console.log("Chat API Response:", chatRes);
        if (!chatRes.transfer) {
            console.error("AI did not transfer to human!");
            return;
        }

        console.log("\n2. Starting Live Chat Session...");
        res = await fetch('http://127.0.0.1:8000/api/live-chat/start', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                history: [
                    { role: 'user', content: 'tôi cần gặp hỗ trợ viên' },
                    { role: 'model', content: chatRes.message }
                ]
            })
        });
        let startRes = await res.json();
        console.log("Start Session Response:", startRes);
        const sessionId = startRes.session_id;

        console.log("\n3. User sends a message in Live Chat...");
        await fetch(`http://127.0.0.1:8000/api/live-chat/${sessionId}/messages`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Alo, có ai không?" })
        });

        console.log("\n4. Admin logs in to get token...");
        res = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        let loginRes = await res.json();
        console.log("Login Response:", loginRes);
        const token = loginRes.data.token;
        console.log("Admin logged in. Token:", token ? "YES" : "NO");

        console.log("\n5. Admin fetches Live Chat Sessions...");
        res = await fetch('http://127.0.0.1:8000/api/admin/live-chat/sessions', {
            headers: { Authorization: `Bearer ${token}` }
        });
        let sessionsRes = await res.json();
        console.log("Admin Sessions:", sessionsRes.sessions.map(s => `Session ID: ${s.id}`));

        console.log("\n6. Admin sends reply...");
        await fetch(`http://127.0.0.1:8000/api/admin/live-chat/sessions/${sessionId}/messages`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ message: "Chào bạn, tôi là admin. Tôi có thể giúp gì?" })
        });

        console.log("\n7. User fetches messages...");
        res = await fetch(`http://127.0.0.1:8000/api/live-chat/${sessionId}/messages`);
        let userMsgsRes = await res.json();
        console.log("Final Chat History:");
        userMsgsRes.messages.forEach(m => {
            console.log(`[${m.sender_type.toUpperCase()}] ${m.message}`);
        });

        console.log("\nTest Completed Successfully!");
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testLiveChat();
