import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './stores/store.ts'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Enregistrement du Service Worker PWA
// En production, affiche un toast quand une nouvelle version est disponible
if (import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      // Demande douce à l'utilisateur de recharger pour la nouvelle version
      const confirmed = window.confirm(
        '📦 Une nouvelle version de SIGIE est disponible. Recharger maintenant ?'
      )
      if (confirmed) window.location.reload()
    },
    onOfflineReady() {
      console.info('[SIGIE] Application prête pour une utilisation hors-ligne.')
    },
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
