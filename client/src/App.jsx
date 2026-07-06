import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Catalog from './pages/Catalog.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PublishListing from './pages/PublishListing.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/catalogo" element={<Catalog />} />
      <Route path="/vehiculo/:id" element={<VehicleDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/publicar" element={<PublishListing />} />
    </Routes>
  );
}
