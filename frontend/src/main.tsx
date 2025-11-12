import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ThemeProvider from './components/Theme/ThemeProvider.tsx'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
