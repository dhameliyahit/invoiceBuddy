import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './components/Login'
import ConfigPage from './components/Config'
import Invoice from './components/Invoice'
import DashboardLayout from './components/DashboardLayout'
import DashboardHome from './components/DashboardHome'
import { initGA, logPageView } from '../utils/analytics'
import axios from 'axios'

const App = () => {
  const location = useLocation();

  const base_url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUserAndInitGA = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${base_url}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;
        initGA(user._id);
      } catch (err) {
        console.error("Failed to fetch user info for GA4:", err.message);
        initGA(); // initialize GA4 without user info
      }
    };

    fetchUserAndInitGA();
  }, []);

  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);


  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Main Dashboard Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="settings" element={<ConfigPage />} />
        </Route>

        {/* Legacy redirect or standalone access */}
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/invoice" element={<Invoice />} />
        
        <Route path="/*" element={<div>404 Not Found</div>} />
      </Routes>
    </>
  )
}

export default App