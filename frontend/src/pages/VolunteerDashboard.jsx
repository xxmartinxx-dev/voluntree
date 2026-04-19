import { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Clock, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function VolunteerDashboard() {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'volunteer') {
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        const data = await apiFetch('/applications/volunteer');
        setApplications(data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, navigate]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted': return <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3"/> Accepted</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium"><XCircle className="w-3 h-3"/> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium"><Clock className="w-3 h-3"/> Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        <div className="bg-nature-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Volunteer Profile</h1>
        </div>
        <div className="px-6 py-6 md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <div className="mt-4 md:mt-0 bg-nature-50 rounded-lg px-6 py-3 border border-nature-100 text-center">
            <span className="block text-3xl font-extrabold text-nature-700">24</span>
            <span className="block text-xs font-medium text-nature-600 uppercase tracking-wide">Hours Volunteered</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Applications</h2>
        <Link to="/" className="text-nature-600 hover:text-nature-800 font-medium">Browse more opportunities</Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading your applications...</div>
      ) : applications.length > 0 ? (
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {applications.map((app) => (
              <li key={app.application_id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center justify-between sm:justify-start mb-2 sm:mb-1">
                      <h3 className="text-lg font-bold text-gray-900 mr-4">{app.title}</h3>
                      {getStatusBadge(app.application_status)}
                    </div>
                    <p className="text-nature-700 font-medium text-sm mb-1">{app.organization_name}</p>
                    <div className="flex flex-wrap items-center text-xs text-gray-500 gap-4 mt-2">
                      <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1"/> {app.location}</span>
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1"/> Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl">
          <Clock className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="text-gray-500 mt-1 mb-6">You haven't applied to any volunteering opportunities.</p>
          <Link to="/" className="bg-nature-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-nature-700 transition-colors">
            Find an opportunity
          </Link>
        </div>
      )}
    </div>
  );
}
