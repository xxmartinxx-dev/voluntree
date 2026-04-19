import { useState, useContext } from 'react';
import { apiFetch } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { TreePine } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      login(data.user, data.token);
      
      if (data.user.role === 'organization') {
        navigate('/org-dashboard');
      } else {
        navigate('/volunteer-dashboard');
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
        <div className="text-center mb-8">
          <TreePine className="mx-auto h-12 w-12 text-nature-600 mb-4" />
          <h2 className="text-3xl justify-center font-extrabold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-2">Sign in to your VolunTree account</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
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
            className="w-full bg-nature-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-nature-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          Not a member yet?{' '}
          <Link to="/register" className="font-medium text-nature-600 hover:text-nature-500">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
