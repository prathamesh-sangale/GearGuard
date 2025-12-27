import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import KanbanPage from './pages/KanbanPage';
import ServiceSchedulePage from './pages/ServiceSchedulePage';
import EquipmentPage from './pages/EquipmentPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import StaffPage from './pages/StaffPage';
import { UserProvider } from './context/UserContext';
import RoleSwitcher from './components/RoleSwitcher';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Landing Page - No Layout */}
          <Route path="/" element={<LandingPage />} />

          {/* Dashboard Routes - With Layout */}
          <Route path="/*" element={
            <AppLayout>
              <Routes>
                <Route path="/dashboard" element={<KanbanPage />} />
                <Route path="/calendar" element={<ServiceSchedulePage />} />
                <Route path="/equipment" element={<EquipmentPage />} />
                <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
                <Route path="/staff" element={<StaffPage />} />
                {/* Redirect legacy root accesses or 404s to dashboard if needed, or just let them fallback */}
                <Route path="*" element={<KanbanPage />} /> {/* Fallback to Kanban for now inside dashboard */}
              </Routes>
            </AppLayout>
          } />
        </Routes>
      </Router>
      <RoleSwitcher />
    </UserProvider>
  );
}

export default App;
