import { Routes, Route, Navigate } from 'react-router-dom';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import CredentialSetup from '@/pages/CredentialSetup';
import ConsultantDashboard from '@/pages/ConsultantDashboard';
import ApplicantForm from '@/pages/ApplicantForm';
import FormBuilder from '@/pages/FormBuilder';

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <Routes>
        {/* Sitio público de marketing */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Login y primer acceso (standalone, sin el header de la app) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/configurar-acceso" element={<CredentialSetup />} />

        {/* App autenticada */}
        <Route element={<AppLayout />}>
          <Route path="/consultant" element={<ConsultantDashboard />} />
          <Route path="/applicant" element={<ApplicantForm />} />
          <Route path="/builder" element={<FormBuilder />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </TooltipProvider>
  );
}
