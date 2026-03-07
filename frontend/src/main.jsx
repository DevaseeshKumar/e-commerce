import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import App from './App.jsx'

// ── Global 401 / Session Expired Interceptor ──
const _originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await _originalFetch(...args);
  if (response.status === 401 && localStorage.getItem('token')) {
    // Prevent duplicate toasts when multiple requests fire at the same time
    if (!window._sessionExpiredHandled) {
      window._sessionExpiredHandled = true;
      localStorage.clear();
      toast.error('Session expired. Please login again.', { duration: 3000 });
      setTimeout(() => {
        window._sessionExpiredHandled = false;
        window.location.href = '/login';
      }, 1500);
    }
  }
  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              border: '1px solid #f3f4f6',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)