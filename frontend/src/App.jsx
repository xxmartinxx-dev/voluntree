import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VolunteerDashboard from './pages/VolunteerDashboard';
import OrgDashboard from './pages/OrgDashboard';
import CreateOffer from './pages/CreateOffer';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
              <Route path="/org-dashboard" element={<OrgDashboard />} />
              <Route path="/create-offer" element={<CreateOffer />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
