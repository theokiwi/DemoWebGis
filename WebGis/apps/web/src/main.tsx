import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './styles/health-access.css';
import { HealthAccessPage } from './features/health-access/HealthAccessPage';
createRoot(document.getElementById('root')!).render(<StrictMode><HealthAccessPage /></StrictMode>);
