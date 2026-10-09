import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registra Service Worker para suporte PWA offline com auto-atualização
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(registration => {
        // Verifica se há uma versão atualizada do sw.js no servidor
        registration.update();
      })
      .catch(error => {
        console.log('Falha ao registrar Service Worker:', error);
      });
  });

  // Quando o novo Service Worker ativa e assume o controle, recarrega a página automaticamente
  let isRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isRefreshing) {
      isRefreshing = true;
      window.location.reload();
    }
  });
}
