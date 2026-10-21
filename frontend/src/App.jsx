import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/public/LandingPage';
import ExploreCampaigns from './pages/public/ExploreCampaigns';
import CampaignDetail from './pages/public/CampaignDetail';
import WasteBankDiscovery from './pages/public/WasteBankDiscovery';
import WasteBankDetail from './pages/public/WasteBankDetail';
import AboutPage from './pages/public/AboutPage';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

import UserDashboard from './pages/app/UserDashboard';
import EcoPassportPage from './pages/app/EcoPassportPage';
import UserTransactionsPage from './pages/app/UserTransactionsPage';
import UserCampaignsPage from './pages/app/UserCampaignsPage';
import UserMissionsPage from './pages/app/UserMissionsPage';
import UserProfilePage from './pages/app/UserProfilePage';
import UserRewardsPage from './pages/app/UserRewardsPage';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Navbar and Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/campaigns" element={<ExploreCampaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/waste-banks" element={<WasteBankDiscovery />} />
          <Route path="/waste-banks/:id" element={<WasteBankDetail />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Auth Routes without Navbar/Footer */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* User Application Routes (Mahasiswa / Individu) */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="passport" element={<EcoPassportPage />} />
          <Route path="rewards" element={<UserRewardsPage />} />
          <Route path="transactions" element={<UserTransactionsPage />} />
          <Route path="campaigns" element={<UserCampaignsPage />} />
          <Route path="badges" element={<UserMissionsPage />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>

        {/* Alias /dashboard redirected to /app */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
