import React from 'react';
import { getStoredUser } from '../../services/api';

export default function OrganizationDashboardPage() {
  const user = getStoredUser();

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '3rem',
        background: '#031c12',
        color: 'white',
      }}
    >
      <h1>Dashboard Organisasi</h1>
      <p>Selamat datang, {user?.full_name || user?.name || 'Organisasi'}</p>
      <p>Dashboard organisasi akan dikembangkan pada tahap berikutnya.</p>
    </div>
  );
}
