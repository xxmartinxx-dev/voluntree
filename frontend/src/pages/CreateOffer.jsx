import { useState, useContext, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CreateOffer() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('animals');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'organization') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/offers', {
        method: 'POST',
        body: JSON.stringify({ title, description, location, category })
      });
      navigate('/org-dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900">Create Volunteering Offer</h1>
          <p className="text-sm text-gray-500 mt-1">Provide details for the opportunity to attract the right volunteers.</p>
        </div>
        
        <div className="px-8 py-8">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Weekend Shelter Assistant"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-nature-500 focus:border-nature-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-nature-500 focus:border-nature-500 bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="animals">Animals & Welfare</option>
                  <option value="seniors">Seniors Support</option>
                  <option value="eco">Environment & Eco</option>
                  <option value="education">Education & Youth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Downtown Community Center"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-nature-500 focus:border-nature-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description & Requirements</label>
              <textarea 
                required
                rows="5"
                placeholder="Describe what the volunteer will do, any required skills, and the impact they will have..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-nature-500 focus:border-nature-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/org-dashboard')}
                className="bg-white text-gray-700 font-medium py-2.5 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 mr-4 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-nature-600 text-white font-bold py-2.5 px-8 rounded-lg hover:bg-nature-700 transition disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Publishing...' : 'Publish Offer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
