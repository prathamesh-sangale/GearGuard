const Database = require('better-sqlite3');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = path.resolve(__dirname, '..', 'database_v3.db');

const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS MaintenanceTeam (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    serial_number TEXT,
    department TEXT NOT NULL,
    employee_name TEXT,
    assigned_employee TEXT,
    location TEXT NOT NULL,
    work_center TEXT,
    purchase_date TEXT,
    warranty_info TEXT,
    maintenance_team_id INTEGER,
    is_scrapped BOOLEAN DEFAULT 0,
    FOREIGN KEY (maintenance_team_id) REFERENCES MaintenanceTeam(id)
  );

  CREATE TABLE IF NOT EXISTS Technician (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('SUPER_ADMIN', 'TEAM_LEAD', 'TECHNICIAN')),
    team_id INTEGER,
    FOREIGN KEY (team_id) REFERENCES MaintenanceTeam(id)
  );

  CREATE TABLE IF NOT EXISTS MaintenanceRequest (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    equipment_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    technician_id TEXT,
    type TEXT CHECK(type IN ('corrective', 'preventive')) NOT NULL,
    status TEXT CHECK(status IN ('new', 'in_progress', 'repaired', 'scrap')) DEFAULT 'new',
    scheduled_date TEXT,
    duration_hours REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id TEXT,
    picked_up_by_user_id TEXT,
    completed_by_user_id TEXT,
    follow_up_of_request_id INTEGER,
    FOREIGN KEY (equipment_id) REFERENCES Equipment(id),
    FOREIGN KEY (team_id) REFERENCES MaintenanceTeam(id),
    FOREIGN KEY (technician_id) REFERENCES Technician(id)
  );
`);

// ... (Migrations omitted for brevity, keeping existing logic if needed but focusing on Master Data Phase)
// Re-running migrations is safe due to checks.

// MASTER DATA SEEDING (Idempotent / Reset)
const seedMasterData = () => {
  const teamCount = db.prepare('SELECT COUNT(*) as count FROM MaintenanceTeam').get().count;

  // Ensure Teams Exist
  if (teamCount === 0) {
    const insertTeam = db.prepare('INSERT INTO MaintenanceTeam (name) VALUES (?)');
    insertTeam.run('Mechanical');
    insertTeam.run('Electrical');
    insertTeam.run('IT');
    insertTeam.run('Facilities');
    insertTeam.run('Triage Squad');
  }

  // Get Team IDs
  const mechId = db.prepare("SELECT id FROM MaintenanceTeam WHERE name LIKE 'Mech%'").get()?.id;
  const elecId = db.prepare("SELECT id FROM MaintenanceTeam WHERE name LIKE 'Elec%'").get()?.id;
  const itId = db.prepare("SELECT id FROM MaintenanceTeam WHERE name LIKE 'IT%'").get()?.id;
  const facId = db.prepare("SELECT id FROM MaintenanceTeam WHERE name LIKE 'Fac%'").get()?.id;

  // MASTER DATA: STAFF
  // We use REPLACE INTO to ensure the definition matches exactly.
  const insertStaff = db.prepare('INSERT OR REPLACE INTO Technician (id, name, role, team_id) VALUES (?, ?, ?, ?)');

  // 1. Super Admin
  insertStaff.run('SA-001', 'Aman Patel', 'SUPER_ADMIN', null);

  // 2. Team Leads
  if (mechId) insertStaff.run('TL-MECH-01', 'Rahul Sharma', 'TEAM_LEAD', mechId);
  if (elecId) insertStaff.run('TL-ELEC-01', 'Amit Verma', 'TEAM_LEAD', elecId);
  if (itId) insertStaff.run('TL-IT-01', 'Pooja Nair', 'TEAM_LEAD', itId);
  if (facId) insertStaff.run('TL-FAC-01', 'Suresh Iyer', 'TEAM_LEAD', facId);

  // 3. Technicians
  // Mechanical
  if (mechId) {
    insertStaff.run('TECH-MECH-01', 'Varma Singh', 'TECHNICIAN', mechId);
    insertStaff.run('TECH-MECH-02', 'Deepak Yadav', 'TECHNICIAN', mechId);
    insertStaff.run('TECH-MECH-03', 'Rohit Patil', 'TECHNICIAN', mechId);
  }
  // Electrical
  if (elecId) {
    insertStaff.run('TECH-ELEC-01', 'Ankit Joshi', 'TECHNICIAN', elecId);
    insertStaff.run('TECH-ELEC-02', 'Pradeep Kumar', 'TECHNICIAN', elecId);
    insertStaff.run('TECH-ELEC-03', 'Sandeep Mishra', 'TECHNICIAN', elecId);
  }
  // IT
  if (itId) {
    insertStaff.run('TECH-IT-01', 'Kunal Mehta', 'TECHNICIAN', itId);
    insertStaff.run('TECH-IT-02', 'Riya Desai', 'TECHNICIAN', itId);
    insertStaff.run('TECH-IT-03', 'Abhishek Rao', 'TECHNICIAN', itId);
  }
  // Facilities
  if (facId) {
    insertStaff.run('TECH-FAC-01', 'Mahesh Kulkarni', 'TECHNICIAN', facId);
    insertStaff.run('TECH-FAC-02', 'Sunita Pawar', 'TECHNICIAN', facId);
    insertStaff.run('TECH-FAC-03', 'Irfan Shaikh', 'TECHNICIAN', facId);
  }

  // Ensure Equipment & Requests (Service Schedule Fix)
  const equipCount = db.prepare('SELECT COUNT(*) as count FROM Equipment').get().count;
  if (equipCount === 0 && mechId) {
    // Seed Equipment (Simplified re-run)
    const insertEquip = db.prepare('INSERT INTO Equipment (name, serial_number, department, location, maintenance_team_id) VALUES (?, ?, ?, ?, ?)');
    insertEquip.run('CNC Machine', 'CNC-001', 'Production', 'Zone A', mechId);
    insertEquip.run('Paint Booth', 'PNT-001', 'Paint', 'Zone B', elecId);
    insertEquip.run('Server Rack', 'SRV-001', 'IT', 'Server Room', itId);
    insertEquip.run('Air Compressor', 'AC-001', 'Utilities', 'Roof', facId);
  }

  // Ensure Preventive Requests
  const prevCount = db.prepare("SELECT COUNT(*) as count FROM MaintenanceRequest WHERE type = 'preventive'").get().count;
  if (prevCount === 0 && facId) {
    const compressor = db.prepare("SELECT id FROM Equipment WHERE name LIKE 'Air Compressor%'").get()?.id || 1;
    const insertReq = db.prepare('INSERT INTO MaintenanceRequest (subject, equipment_id, team_id, type, status, scheduled_date) VALUES (?, ?, ?, ?, ?, ?)');

    // 1. Current Month (Today & Future)
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    insertReq.run('Monthly AC Check', compressor, facId, 'preventive', 'new', today); // Today
    insertReq.run('Quarterly Server Maintenance', 7, itId, 'preventive', 'new', nextWeek); // Future

    // 2. Past (Overdue)
    insertReq.run('Scheduled inspection of Paint Booth Conveyor', 5, elecId, 'preventive', 'new', '2025-11-15');
    insertReq.run('Fire Safety System Audit', compressor, facId, 'preventive', 'new', '2025-10-01');

    // 3. Complete History (Manually Insert)
    const histStmt = db.prepare(`
        INSERT INTO MaintenanceRequest (subject, equipment_id, team_id, type, status, scheduled_date, created_at, completed_at, completed_by_user_id) 
        VALUES (?, ?, ?, 'preventive', 'repaired', ?, ?, ?, ?)
    `);
    histStmt.run('Annual Generator Service', compressor, facId, '2025-08-10', '2025-01-01', '2025-08-10', 'TECH-FAC-01');

    // 4. Far Future
    insertReq.run('Robotic Arm Calibration Phase 2', 2, mechId, 'preventive', 'new', '2026-02-01');
  }
};

// Force Schema Update for Technician (Drop/Create if needed for ID migration)
// WARNING: This resets user data. acceptable for "Master Data" phase.
try {
  const techTable = db.prepare("PRAGMA table_info(Technician)").all();
  const idCol = techTable.find(c => c.name === 'id');
  if (idCol && idCol.type !== 'TEXT') {
    console.log("Migrating Technician and Requests to new String ID Schema...");

    // Disable FKs to prevent locking issues during drop
    db.pragma('foreign_keys = OFF');

    // Drop dependent table first
    db.exec("DROP TABLE IF EXISTS MaintenanceRequest");
    db.exec("DROP TABLE IF EXISTS Technician");

    // Re-Enable FKs to ensure proper creation
    db.pragma('foreign_keys = ON');

    // Recreate Technician
    db.exec(`
          CREATE TABLE Technician (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('SUPER_ADMIN', 'TEAM_LEAD', 'TECHNICIAN')),
            team_id INTEGER,
            FOREIGN KEY (team_id) REFERENCES MaintenanceTeam(id)
          );
        `);

    // Recreate MaintenanceRequest (New Schema with TEXT IDs)
    db.exec(`
      CREATE TABLE MaintenanceRequest (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        equipment_id INTEGER NOT NULL,
        team_id INTEGER NOT NULL,
        technician_id TEXT, -- Changed to TEXT
        type TEXT CHECK(type IN ('corrective', 'preventive')) NOT NULL,
        status TEXT CHECK(status IN ('new', 'in_progress', 'repaired', 'scrap')) DEFAULT 'new',
        scheduled_date TEXT,
        duration_hours REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_user_id TEXT, -- Traceability V2
        picked_up_by_user_id TEXT,
        completed_by_user_id TEXT,
        follow_up_of_request_id INTEGER,
        FOREIGN KEY (equipment_id) REFERENCES Equipment(id),
        FOREIGN KEY (team_id) REFERENCES MaintenanceTeam(id),
        FOREIGN KEY (technician_id) REFERENCES Technician(id)
      );
    `);

    console.log("Migration Complete: Schema Updated.");
  }
} catch (e) { console.error("Migration Error:", e); }

seedMasterData();

console.log(`Connected and Initialized SQLite database at: ${dbPath}`);

// Traceability Migration: Add audit columns if they don't exist
const addAuditColumns = () => {
  const columnsToCheck = [
    "created_by_user_id INTEGER",
    "created_at DATETIME",
    "picked_up_by_user_id INTEGER",
    "picked_up_at DATETIME",
    "completed_by_user_id INTEGER",
    "completed_at DATETIME",
    "follow_up_of_request_id INTEGER"
  ];

  const tableInfo = db.prepare("PRAGMA table_info(MaintenanceRequest)").all();
  const existingColumns = new Set(tableInfo.map(c => c.name));

  columnsToCheck.forEach(colDef => {
    const colName = colDef.split(' ')[0];
    if (!existingColumns.has(colName)) {
      try {
        db.prepare(`ALTER TABLE MaintenanceRequest ADD COLUMN ${colDef}`).run();
        console.log(`Added column ${colName}`);
      } catch (err) {
        console.error(`Error adding column ${colName}:`, err);
      }
    }
  });
};
addAuditColumns();

module.exports = db;
