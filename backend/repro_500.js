async function checkReset() {
    try {
        console.log('Triggering Reset...');
        // Node 18+ native fetch
        const res = await fetch('http://localhost:5000/api/admin/reset', {
            method: 'DELETE',
            headers: {
                'X-User-Role': 'SUPER_ADMIN',
                'X-User-Id': '1' // generic ID
            }
        });

        console.log(`Response Status: ${res.status}`);
        const text = await res.text();
        console.log('Response Body:', text);
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

checkReset();
