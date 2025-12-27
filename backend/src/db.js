const Database = require('better-sqlite3');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = path.resolve(__dirname, '..', 'database_v2.db');

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
    location TEXT NOT NULL,
    purchase_date TEXT,
    warranty_info TEXT,
    maintenance_team_id INTEGER,
    is_scrapped BOOLEAN DEFAULT 0,
    FOREIGN KEY (maintenance_team_id) REFERENCES MaintenanceTeam(id)
  );

  CREATE TABLE IF NOT EXISTS Technician (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team_id INTEGER,
    FOREIGN KEY (team_id) REFERENCES MaintenanceTeam(id)
  );

  CREATE TABLE IF NOT EXISTS MaintenanceRequest (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    equipment_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    technician_id INTEGER,
    type TEXT CHECK(type IN ('corrective', 'preventive')) NOT NULL,
    status TEXT CHECK(status IN ('new', 'in_progress', 'repaired', 'scrap')) DEFAULT 'new',
    scheduled_date TEXT,
    duration_hours REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES Equipment(id),
    FOREIGN KEY (team_id) REFERENCES MaintenanceTeam(id),
    FOREIGN KEY (technician_id) REFERENCES Technician(id)
  );
`);

// Seed Data (if empty)
const teamCount = db.prepare('SELECT COUNT(*) as count FROM MaintenanceTeam').get().count;
if (teamCount === 0) {
  const insertTeam = db.prepare('INSERT INTO MaintenanceTeam (name) VALUES (?)');
  const insertTechnician = db.prepare('INSERT INTO Technician (name, team_id) VALUES (?, ?)');

  const mechTeam = insertTeam.run('Mechanical Team').lastInsertRowid;
  const elecTeam = insertTeam.run('Electrical Team').lastInsertRowid;
  const itTeam = insertTeam.run('IT Support Team').lastInsertRowid;
  const facilTeam = insertTeam.run('Facilities Team').lastInsertRowid;

  insertTechnician.run('Rahul', mechTeam);
  insertTechnician.run('Amit', elecTeam);
  insertTechnician.run('Neha', itTeam);
  insertTechnician.run('Sunil', facilTeam);

  // Seed some equipment
  const insertEquip = db.prepare('INSERT INTO Equipment (name, serial_number, department, location, employee_name, purchase_date, warranty_info, maintenance_team_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

  insertEquip.run('CNC Machine – Engine Block Line', 'CNC-EB-001', 'Production', 'Zone A - Machine Shop', 'S. Kumar (Supervisor)', '2023-01-15', '3-year service contract', mechTeam);
  insertEquip.run('Robotic Welding Arm – Assembly Line 3', 'WELD-R-302', 'Assembly', 'Section 4 - Welding', 'V. Singh (Line Lead)', '2023-05-20', 'Annual service plan', mechTeam);
  insertEquip.run('Hydraulic Press – Chassis Unit', 'PRES-CH-105', 'Production', 'Press Shop - Bay 2', 'A. Roy (Operator)', '2022-11-10', 'Parts warranty', mechTeam);
  insertEquip.run('Paint Booth Conveyor', 'PAINT-C-01', 'Paint Shop', 'Paint Dept - Line 1', 'M. Das (Finishing)', '2021-08-05', 'Standard Coverage', elecTeam);
  insertEquip.run('Air Compressor – Utilities', 'UTIL-AC-02', 'Utilities', 'Utility Area - G/F', 'P. Joshi (Facilities)', '2024-03-01', '24-month warranty', facilTeam);
  insertEquip.run('Quality Inspection Scanner', 'QUAL-SC-08', 'Production', 'End of Line Q-Point', 'R. Sharma (QA)', '2024-02-14', 'Software support active', itTeam);
  insertEquip.run('Factory Server Rack', 'IT-SRV-01', 'IT', 'Admin Server Room', 'Neha (Tech)', '2023-09-12', 'Mission Critical Support', itTeam);
  insertEquip.run('Office HVAC System', 'FAC-HVAC-01', 'Utilities', 'Office Building - Roof', 'Sunil (Maint)', '2020-10-10', 'Expired', facilTeam);

  const insertRequest = db.prepare('INSERT INTO MaintenanceRequest (subject, equipment_id, team_id, status, type, scheduled_date, duration_hours) VALUES (?, ?, ?, ?, ?, ?, ?)');

  // Seed some requests
  const cnc = db.prepare('SELECT id FROM Equipment WHERE name LIKE "CNC Machine%"').get().id;
  const weld = db.prepare('SELECT id FROM Equipment WHERE name LIKE "Robotic Welding%"').get().id;
  const press = db.prepare('SELECT id FROM Equipment WHERE name LIKE "Hydraulic Press%"').get().id;
  const compressor = db.prepare('SELECT id FROM Equipment WHERE name LIKE "Air Compressor%"').get().id;
  const conveyor = db.prepare('SELECT id FROM Equipment WHERE name LIKE "Paint Booth%"').get().id;
  const scanner = db.prepare('SELECT id FROM Equipment WHERE name LIKE "Quality Inspection%"').get().id;

  // Corrective Flows (Production Board)
  insertRequest.run('CNC Machine vibration issue', cnc, mechTeam, 'new', 'corrective', null, null);
  insertRequest.run('Robotic Welding Arm not responding', weld, mechTeam, 'in_progress', 'corrective', null, null);
  insertRequest.run('Brake Caliper Assembly Line Jam', weld, mechTeam, 'new', 'corrective', null, null);
  insertRequest.run('Hydraulic Press oil leakage', press, mechTeam, 'scrap', 'corrective', null, null);
  insertRequest.run('QA Scanner Calibration Error', scanner, itTeam, 'new', 'corrective', null, null);

  // Preventive Flows (Service Schedule)
  insertRequest.run('Monthly maintenance of Air Compressor', compressor, facilTeam, 'new', 'preventive', '2025-12-30', null);
  insertRequest.run('Scheduled inspection of Paint Booth Conveyor', conveyor, elecTeam, 'new', 'preventive', '2025-12-15', null); // Overdue
  insertRequest.run('Quarterly Server Backup & Cleaning', 7, itTeam, 'new', 'preventive', '2026-01-10', null);
}

console.log(`Connected and Initialized SQLite database at: ${dbPath}`);

module.exports = db;
