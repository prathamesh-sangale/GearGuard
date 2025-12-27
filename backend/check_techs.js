// Native fetch

async function checkTechnicians() {
    try {
        console.log('Fetching technicians...');
        const res = await fetch('http://localhost:5000/api/technicians', {
            headers: {
                'X-User-Role': 'SUPER_ADMIN',
                'X-User-Id': '1',
                'X-User-Team-Id': ''
            }
        });
        const data = await res.json();
        console.log('Technicians found:', data.length);
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

checkTechnicians();
