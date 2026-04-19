import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { MapPin, Tag, TreePine } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Landing() {
  const [offers, setOffers] = useState([]);
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffers();
  }, [category]); // Re-fetch when category changes

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (category !== 'all') qs.append('category', category);
      if (location) qs.append('location', location);
      
      const data = await apiFetch(`/offers?${qs.toString()}`);
      setOffers(data);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOffers();
  };

  const handleApply = async (offerId) => {
    try {
      await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({ offer_id: offerId })
      });
      alert('Successfully applied!');
      navigate('/volunteer-dashboard');
    } catch (err) {
      alert(`Error applying: ${err.message}`);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-nature-50 overflow-hidden border-b border-nature-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Make an impact in your community. <br/>
            <span className="text-nature-600">Grow with VolunTree.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto mb-10">
            Connect with local organizations, discover meaningful volunteering opportunities, and make a difference where it matters most.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-nature-600 text-white hover:bg-nature-700 font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:-translate-y-0.5">
              Start Volunteering
            </Link>
            <Link to="/register?role=organization" className="bg-white text-nature-600 border border-nature-200 hover:bg-nature-50 font-bold py-3 px-8 rounded-full shadow transition-colors">
              I Represent an NGO
            </Link>
          </div>
        </div>
      </div>

      {/* Offers Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 md:mb-0">Latest Opportunities</h2>
          
          <form onSubmit={handleSearch} className="flex w-full md:w-auto flex-col sm:flex-row gap-3">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white border text-gray-700 border-gray-300 rounded-lg focus:ring-nature-500 focus:border-nature-500 p-2.5"
            >
              <option value="all">All Categories</option>
              <option value="animals">Animals</option>
              <option value="seniors">Seniors</option>
              <option value="eco">Environment</option>
              <option value="education">Education</option>
            </select>
            <input 
              type="text" 
              placeholder="Search by location..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-white border text-gray-700 border-gray-300 rounded-lg focus:ring-nature-500 focus:border-nature-500 p-2.5 flex-grow"
            />
            <button type="submit" className="bg-gray-800 text-white rounded-lg px-5 py-2.5 hover:bg-gray-900 transition-colors">
              Filter
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading opportunities...</div>
        ) : offers.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {offers.map(offer => (
              <div key={offer.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
                <div className="px-6 py-6 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-nature-100 text-nature-800 uppercase tracking-wide">
                      <Tag className="w-3 h-3"/> {offer.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{offer.title}</h3>
                  <p className="text-nature-600 text-sm font-medium mb-4">{offer.organization_name}</p>
                  <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed mb-6">
                    {offer.description}
                  </p>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {offer.location}
                  </div>
                  {user ? (
                    user.role === 'volunteer' ? (
                      <button 
                        onClick={() => handleApply(offer.id)}
                        className="bg-nature-600 text-white hover:bg-nature-700 font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors"
                      >
                        Apply Now
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Org Account</span>
                    )
                  ) : (
                    <Link to="/login" className="text-nature-600 hover:text-nature-800 font-semibold text-sm transition-colors">
                      Login to Apply &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <TreePine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No opportunities found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
