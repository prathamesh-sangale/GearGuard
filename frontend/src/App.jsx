import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import KanbanPage from './pages/KanbanPage';
import CalendarPage from './pages/CalendarPage';
import EquipmentPage from './pages/EquipmentPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import { UserProvider } from './context/UserContext';
import RoleSwitcher from './components/RoleSwitcher';

function App() {
  return (
    <UserProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<KanbanPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
          </Routes>
        </AppLayout>
      </Router>
      <RoleSwitcher />
    </UserProvider>
  );
}

export default App;
