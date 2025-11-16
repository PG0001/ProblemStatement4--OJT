import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { EventsProvider } from './hooks/EventContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EventsProvider>
      <App />
    </EventsProvider>
  </StrictMode>,
)
