import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudioPage from './pages/StudioPage';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/studio" element={<StudioPage />} />
            {/* Redirect root to studio for now until we build the premium landing page */}
            <Route path="/" element={<Navigate to="/studio" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
