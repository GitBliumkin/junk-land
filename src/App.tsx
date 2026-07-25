import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ModernLayer from './modern/modern-layer';
import RetroLayer from './retro/retro-layer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ModernLayer />} />
        <Route path="/retro" element={<RetroLayer />} />
      </Routes>
    </BrowserRouter>
  );
}