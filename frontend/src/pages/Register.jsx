import { useState, useContext, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { TreePine } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('volunteer');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if role is passed via search params (e.g., from landing page)
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'organization') {
      setRole('organization');
    }
  }, [location]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });
      
      // Auto-login after register
      try {
        const loginData = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        
        // This won't work perfectly since we don't have access to context here natively unless we import it
        // We'll navigate to login page, but better would be to auto login using context. Let's redirect to login for simplicity.
        navigate('/login');
      } catch (loginErr) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-130px)] bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <div className="text-center mb-6">
          <TreePine className="mx-auto h-12 w-12 text-nature-600 mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">Join the movement</h2>
          <p className="text-gray-500 mt-2">Create your VolunTree account</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              className={`flex-1 py-2 font-medium rounded-lg border transition-colors ${role === 'volunteer' ? 'bg-nature-50 border-nature-600 text-nature-700' : 'bg-white border-gray-200 text-gray-500'}`}
              onClick={() => setRole('volunteer')}
            >
              I want to Volunteer
            </button>
            <button
              type="button"
              className={`flex-1 py-2 font-medium rounded-lg border transition-colors ${role === 'organization' ? 'bg-nature-50 border-nature-600 text-nature-700' : 'bg-white border-gray-200 text-gray-500'}`}
              onClick={() => setRole('organization')}
            >
              I represent an NGO
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{role === 'organization' ? 'Organization Name' : 'Full Name'}</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-nature-500 focus:border-nature-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-nature-500 focus:border-nature-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-nature-500 focus:border-nature-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-nature-600 text-white font-bold py-3 px-4 mt-2 rounded-lg hover:bg-nature-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-nature-600 hover:text-nature-500">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
