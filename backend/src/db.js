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
    purchase_date TEXT,
    warranty_info TEXT,
    maintenance_team_id INTEGER,
    is_scrapped BOOLEAN DEFAULT 0,
    FOREIGN KEY (maintenance_team_id) REFERENCES MaintenanceTeam(id)
  );

  CREATE TABLE IF NOT EXISTS Technician (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('SUPER_ADMIN', 'TEAM_ADMIN', 'TECHNICIAN')),
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

// Migration: Add assigned_employee column if it doesn't exist
const columns = db.prepare("PRAGMA table_info(Equipment)").all();
const hasAssignedEmployee = columns.some(c => c.name === 'assigned_employee');
if (!hasAssignedEmployee) {
  try {
    db.exec("ALTER TABLE Equipment ADD COLUMN assigned_employee TEXT");
    console.log("Migration: Added assigned_employee column to Equipment table");
  } catch (err) {
    console.error("Migration error adding assigned_employee:", err);
  }
}

// Seed Data (if empty)
const teamCount = db.prepare('SELECT COUNT(*) as count FROM MaintenanceTeam').get().count;
if (teamCount === 0) {
  const insertTeam = db.prepare('INSERT INTO MaintenanceTeam (name) VALUES (?)');
  const insertTechnician = db.prepare('INSERT INTO Technician (name, role, team_id) VALUES (?, ?, ?)');

  const mechTeam = insertTeam.run('Mechanical Team').lastInsertRowid;
  const elecTeam = insertTeam.run('Electrical Team').lastInsertRowid;
  const itTeam = insertTeam.run('IT Support Team').lastInsertRowid;
  const facilTeam = insertTeam.run('Facilities Team').lastInsertRowid;

  // 1. Super Admin (No team)
  insertTechnician.run('Nikunj (Super Admin)', 'SUPER_ADMIN', null);

  // 2. Team Admins (1 per team)
  insertTechnician.run('Rahul (Lead)', 'TEAM_ADMIN', mechTeam);
  insertTechnician.run('Amit (Lead)', 'TEAM_ADMIN', elecTeam);
  insertTechnician.run('Neha (Lead)', 'TEAM_ADMIN', itTeam);
  insertTechnician.run('Sunil (Lead)', 'TEAM_ADMIN', facilTeam);

  // 3. Technicians (The execution squad)
  insertTechnician.run('S. Varma', 'TECHNICIAN', mechTeam);
  insertTechnician.run('K. Singh', 'TECHNICIAN', elecTeam);
  insertTechnician.run('J. Doe', 'TECHNICIAN', itTeam);
  insertTechnician.run('M. Khan', 'TECHNICIAN', facilTeam);

  // Seed some equipment
  const insertEquip = db.prepare('INSERT INTO Equipment (name, serial_number, department, location, assigned_employee, employee_name, purchase_date, warranty_info, maintenance_team_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

  insertEquip.run('CNC Machine – Engine Block Line', 'CNC-EB-001', 'Production', 'Zone A - Machine Shop', 'N. Verma (Engine Specialist)', 'S. Kumar (Supervisor)', '2023-01-15', '3-year service contract', mechTeam);
  insertEquip.run('Robotic Welding Arm – Assembly Line 3', 'WELD-R-302', 'Assembly', 'Section 4 - Welding', 'A. Singh (Robotics Tech)', 'V. Singh (Line Lead)', '2023-05-20', 'Annual service plan', mechTeam);
  insertEquip.run('Hydraulic Press – Chassis Unit', 'PRES-CH-105', 'Production', 'Press Shop - Bay 2', 'K. Das (Press Operator)', 'A. Roy (Operator)', '2022-11-10', 'Parts warranty', mechTeam);
  insertEquip.run('Paint Booth Conveyor', 'PAINT-C-01', 'Paint Shop', 'Paint Dept - Line 1', 'M. Khan (Finishing Lead)', 'M. Das (Finishing)', '2021-08-05', 'Standard Coverage', elecTeam);
  insertEquip.run('Air Compressor – Utilities', 'UTIL-AC-02', 'Utilities', 'Utility Area - G/F', 'R. Patel (Utilities Admin)', 'P. Joshi (Facilities)', '2024-03-01', '24-month warranty', facilTeam);
  insertEquip.run('Quality Inspection Scanner', 'QUAL-SC-08', 'Production', 'End of Line Q-Point', 'J. Doe (Quality Tech)', 'R. Sharma (QA)', '2024-02-14', 'Software support active', itTeam);
  insertEquip.run('Factory Server Rack', 'IT-SRV-01', 'IT', 'Admin Server Room', 'Neha (Systems Admin)', 'Neha (Tech)', '2023-09-12', 'Mission Critical Support', itTeam);
  insertEquip.run('Office HVAC System', 'FAC-HVAC-01', 'Utilities', 'Office Building - Roof', 'Sunil (Facilities Lead)', 'Sunil (Maint)', '2020-10-10', 'Expired', facilTeam);

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
