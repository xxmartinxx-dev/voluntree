import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TreePine, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <TreePine className="h-8 w-8 text-nature-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">VolunTree</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-nature-600 text-white hover:bg-nature-700 font-medium px-4 py-2 rounded-md transition-colors shadow-sm">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to={user.role === 'organization' ? '/org-dashboard' : '/volunteer-dashboard'} 
                  className="text-gray-500 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l">
                  <span className="text-sm text-gray-500 font-medium">Hi, {user.name}</span>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
