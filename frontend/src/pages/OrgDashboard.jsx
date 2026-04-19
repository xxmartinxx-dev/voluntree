import { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Users, Check, X, Building, MapPin } from 'lucide-react';

export default function OrgDashboard() {
  const { user } = useContext(AuthContext);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'organization') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedOffers, fetchedApps] = await Promise.all([
        apiFetch('/offers/my-offers'),
        apiFetch('/applications/organization')
      ]);
      setOffers(fetchedOffers);
      setApplications(fetchedApps);
    } catch (err) {
      console.error('Failed to fetch org data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAppStatus = async (applicationId, status) => {
    try {
      await apiFetch(`/applications/${applicationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      // Refresh applications immediately by filtering out the handled one, or re-fetch.
      setApplications(apps => apps.filter(app => app.application_id !== applicationId));
    } catch (err) {
      alert(`Error updating application: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        <div className="bg-nature-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Organization Workspace</h1>
        </div>
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gray-100 p-3 rounded-full mr-4 hidden sm:block">
              <Building className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Link to="/create-offer" className="bg-nature-600 text-white font-medium py-2.5 px-5 flex items-center rounded-lg hover:bg-nature-700 transition">
            <PlusCircle className="w-5 h-5 mr-2" />
            New Offer
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Pending Applications */}
        <div className="lg:col-span-1 border-r border-gray-200 pr-0 lg:pr-8">
          <div className="flex items-center mb-6">
            <Users className="w-6 h-6 mr-2 text-nature-600" />
            <h2 className="text-xl font-bold text-gray-900">Action Required</h2>
          </div>
          
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.application_id} className="bg-white border text-sm border-orange-200 rounded-xl shadow-sm p-4">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide bg-orange-50 px-2 py-0.5 rounded">New Applicant</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{app.volunteer_name}</h3>
                  <p className="text-gray-600 mb-2">{app.volunteer_email}</p>
                  <p className="text-xs text-gray-500 mb-4 inline-flex">
                    Applied for: <span className="font-semibold text-gray-800 ml-1">{app.title}</span>
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAppStatus(app.application_id, 'accepted')}
                      className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 font-medium py-1.5 rounded flex justify-center items-center border border-green-200 transition"
                    >
                      <Check className="w-4 h-4 mr-1"/> Accept
                    </button>
                    <button 
                      onClick={() => handleAppStatus(app.application_id, 'rejected')}
                      className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 font-medium py-1.5 rounded flex justify-center items-center border border-red-200 transition"
                    >
                      <X className="w-4 h-4 mr-1"/> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
              <Check className="mx-auto w-8 h-8 text-green-400 mb-2"/>
              <p className="text-gray-500 text-sm">All caught up! No pending applications.</p>
            </div>
          )}
        </div>

        {/* Right Col: Active Offers */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Active Offers</h2>
          
          {loading ? (
             <div className="text-gray-500">Loading...</div>
          ) : offers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {offers.map(offer => (
                <div key={offer.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{offer.title}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">{offer.status}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <MapPin className="w-3.5 h-3.5 mr-1" /> {offer.location}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl">
              <Building className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No offers created yet</h3>
              <p className="text-gray-500 mt-1 mb-6">Create your first volunteering opportunity to start engaging the community.</p>
              <Link to="/create-offer" className="bg-nature-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-nature-700 transition-colors">
                Create First Offer
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
