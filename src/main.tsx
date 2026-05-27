import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: '#1C1712',
            color: '#FAF8F3',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '100px',
            padding: '9px 20px',
          },
        }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
