import React from 'react';
import HeroSection from '../../components/HeroSection';
import WhyEcoLinkSection from '../../components/WhyEcoLinkSection';
import HowItWorksSection from '../../components/HowItWorksSection';
import VerifiedImpactStory from '../../components/VerifiedImpactStory';
import PersonaShowcaseSection from '../../components/PersonaShowcaseSection';
import FeaturedCampaigns from '../../components/FeaturedCampaigns';
import EcoPassportPreview from '../../components/EcoPassportPreview';
import ImpactCalculatorSection from '../../components/ImpactCalculatorSection';
import WasteBankNetwork from '../../components/WasteBankNetwork';
import ForOrganizations from '../../components/ForOrganizations';
import TransparencySection from '../../components/TransparencySection';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* 1. Hero with Mockup, Live Ticker, and Stats */}
      <HeroSection />

      {/* 2. Mengapa EcoLink Berbeda (30-Sec Test: Traditional vs EcoLink & 3 Identitas) */}
      <WhyEcoLinkSection />

      {/* 3. Cara Kerja (4 Langkah Sederhana) */}
      <HowItWorksSection />

      {/* 4. Verified Impact Flow (Anti-Greenwashing) */}
      <VerifiedImpactStory />

      {/* 5. Kolaborasi 3 Pilar (Mahasiswa, Komunitas/BEM, Bank Sampah) */}
      <PersonaShowcaseSection />

      {/* 6. Featured Campaigns Pilihan */}
      <FeaturedCampaigns />

      {/* 7. Eco Passport Digital Preview & Gamifikasi */}
      <EcoPassportPreview />

      {/* 8. Interactive Impact & Carbon Calculator */}
      <ImpactCalculatorSection />

      {/* 9. Jaringan Bank Sampah Mitra & Peta */}
      <WasteBankNetwork />

      {/* 10. Nilai Khusus untuk Organisasi & Kampus */}
      <ForOrganizations />

      {/* 11. Transparansi Data, Keamanan AES-256, & Metodologi */}
      <TransparencySection />
    </div>
  );
}
