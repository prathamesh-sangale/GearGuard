// Native fetch
async function checkHealth() {
    try {
        console.log('Checking server health...');
        const res = await fetch('http://localhost:5000/api/health');
        if (res.ok) {
            const data = await res.json();
            console.log('Server is HEALTHY:', data);
        } else {
            console.error('Server responded with error:', res.status);
        }
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}
checkHealth();
