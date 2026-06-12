import { Routes, Route, Navigate } from 'react-router-dom';

import { MarketingLayout } from '@/components/layout/MarketingLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import Placeholder from '@/pages/Placeholder';

export default function App() {
  return (
    <Routes>
      {/* Sitio público de marketing */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Fase 2: páginas funcionales (placeholders por ahora) */}
      <Route path="/configurar-acceso" element={<Placeholder title="Configurar acceso" />} />
      <Route path="/consultant" element={<Placeholder title="Panel de Consultor" />} />
      <Route path="/applicant" element={<Placeholder title="Mis Estudios" />} />
      <Route path="/builder" element={<Placeholder title="Constructor de Formularios" />} />

      {/* Cualquier otra ruta vuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
