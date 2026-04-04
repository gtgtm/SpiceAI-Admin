import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Employees from './pages/Employees';
import Visitors from './pages/Visitors';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/SpiceAI-Admin/admin">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
