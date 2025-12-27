const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Maintenance Request Endpoints

// A) Create Maintenance Request
app.post('/api/requests', (req, res) => {
    const { subject, equipment_id, type, scheduled_date } = req.body;

    if (!subject || !equipment_id || !type) {
        return res.status(400).json({ error: 'Subject, equipment_id, and type are required' });
    }

    try {
        // Fetch equipment to get its maintenance team
        const equipment = db.prepare('SELECT maintenance_team_id FROM Equipment WHERE id = ?').get(equipment_id);
        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        const stmt = db.prepare(`
            INSERT INTO MaintenanceRequest (subject, equipment_id, team_id, type, status, scheduled_date)
            VALUES (?, ?, ?, ?, 'new', ?)
        `);
        const info = stmt.run(subject, equipment_id, equipment.maintenance_team_id, type, scheduled_date || null);

        const newRequest = db.prepare('SELECT * FROM MaintenanceRequest WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// B) Fetch Maintenance Requests
app.get('/api/requests', (req, res) => {
    const { status, equipment_id, type } = req.query;
    let query = `
        SELECT r.*, e.name as equipment_name, t.name as technician_name, mt.name as team_name
        FROM MaintenanceRequest r
        LEFT JOIN Equipment e ON r.equipment_id = e.id
        LEFT JOIN Technician t ON r.technician_id = t.id
        LEFT JOIN MaintenanceTeam mt ON r.team_id = mt.id
        WHERE 1=1
    `;
    const params = [];

    if (status) {
        query += ' AND r.status = ?';
        params.push(status);
    }
    if (equipment_id) {
        query += ' AND r.equipment_id = ?';
        params.push(equipment_id);
    }
    if (type) {
        query += ' AND r.type = ?';
        params.push(type);
    }

    try {
        const requests = db.prepare(query).all(...params);

        // Add overdue flag logic
        const now = new Date();
        const enrichedRequests = requests.map(r => ({
            ...r,
            isOverdue: r.scheduled_date && new Date(r.scheduled_date) < now && r.status !== 'repaired'
        }));

        res.json(enrichedRequests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// C) Update Request Status (with Scrap Logic)
app.patch('/api/requests/:id/status', (req, res) => {
    try {
        const { status, duration_hours } = req.body;
        const id = req.params.id;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const request = db.prepare('SELECT * FROM MaintenanceRequest WHERE id = ?').get(id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        // Update record
        db.prepare('UPDATE MaintenanceRequest SET status = ?, duration_hours = ? WHERE id = ?').run(
            status,
            duration_hours || request.duration_hours,
            id
        );

        // Scrap logic: If status moves to scrap, mark equipment as scrapped
        if (status === 'scrap') {
            db.prepare('UPDATE Equipment SET is_scrapped = 1 WHERE id = ?').run(request.equipment_id);
        }

        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// D) Assign Technician
app.patch('/api/requests/:id/assign', (req, res) => {
    const { technician_id } = req.body;
    const { id } = req.params;

    try {
        const request = db.prepare('SELECT * FROM MaintenanceRequest WHERE id = ?').get(id);
        const technician = db.prepare('SELECT * FROM Technician WHERE id = ?').get(technician_id);

        if (!request || !technician) {
            return res.status(404).json({ error: 'Request or Technician not found' });
        }

        if (technician.team_id !== request.team_id) {
            return res.status(400).json({ error: 'Technician must belong to the same maintenance team' });
        }

        db.prepare('UPDATE MaintenanceRequest SET technician_id = ? WHERE id = ?').run(technician_id, id);
        res.json({ message: 'Technician assigned successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Equipment Endpoints
app.get('/api/equipment', (req, res) => {
    try {
        const equipment = db.prepare('SELECT * FROM Equipment').all();
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/equipment/:id', (req, res) => {
    try {
        const equipment = db.prepare(`
            SELECT e.*, t.name as team_name,
            (SELECT COUNT(*) FROM MaintenanceRequest WHERE equipment_id = e.id AND status NOT IN ('repaired', 'scrap')) as open_requests_count
            FROM Equipment e
            LEFT JOIN MaintenanceTeam t ON e.maintenance_team_id = t.id
            WHERE e.id = ?
        `).get(req.params.id);

        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// E) Register New Equipment
app.post('/api/equipment', (req, res) => {
    const { name, serial_number, department, location, employee_name, purchase_date, warranty_info, maintenance_team_id } = req.body;

    if (!name || !department || !location) {
        return res.status(400).json({ error: 'Name, department, and location are required' });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO Equipment (name, serial_number, department, location, employee_name, purchase_date, warranty_info, maintenance_team_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(name, serial_number, department, location, employee_name || null, purchase_date || null, warranty_info || null, maintenance_team_id || null);

        const newEquip = db.prepare('SELECT * FROM Equipment WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newEquip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// F) Fetch Maintenance Teams
app.get('/api/teams', (req, res) => {
    try {
        const teams = db.prepare('SELECT * FROM MaintenanceTeam').all();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reports/Summary Endpoint
app.get('/api/reports/summary', (req, res) => {
    try {
        const teamSummary = db.prepare(`
            SELECT mt.name as team, 
                   COUNT(r.id) as total,
                   SUM(CASE WHEN r.status = 'repaired' THEN 1 ELSE 0 END) as completed,
                   SUM(CASE WHEN r.status != 'repaired' AND r.status != 'scrap' THEN 1 ELSE 0 END) as open
            FROM MaintenanceTeam mt
            LEFT JOIN MaintenanceRequest r ON mt.id = r.team_id
            GROUP BY mt.id
        `).all();

        const globalStats = db.prepare(`
            SELECT 
                COUNT(*) as total_requests,
                SUM(CASE WHEN status != 'repaired' AND status != 'scrap' THEN 1 ELSE 0 END) as total_open,
                SUM(duration_hours) as total_hours
            FROM MaintenanceRequest
        `).get();

        res.json({ teams: teamSummary, global: globalStats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
