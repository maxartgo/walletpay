import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { Admin } from './pages/Admin';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
