import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/global.css';
import App from './App.jsx';
import { applyBrandingSettings } from './utils/applyBranding';

fetch("http://localhost:5000/settings")
  .then(res => res.json())
  .then(applyBrandingSettings)
  .finally(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
