import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FooterCTA from '../components/FooterCTA';

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <FooterCTA />
    </>
  );
}
