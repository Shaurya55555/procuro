import React, { useEffect, useState } from 'react';
import Spinner, { Link } from '../components/Spinner';
import { getRfps } from '../api/rfp';
import { Rfp } from '../types';
import { PlusCircle, Eye } from 'lucide-react';
import Button from '../components/Button';

const RfpList: React.FC = () => {
  const [rfps, setRfps] = useState<Rfp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRfps();
  }, []);

  const loadRfps = async () => {
    try {
      setLoading(true);
      const data = await getRfps();
      setRfps(data);
    } catch (err) {
      setError('Failed to load RFPs. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Request for Proposals</h1>
        <Link to="/rfps/new">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create RFP
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200">
        {rfps.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No RFPs found. Create one to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {rfps.map((rfp) => (
                <tr key={rfp.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{rfp.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{rfp.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{rfp.budget}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{rfp.delivery_timeline}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/rfps/${rfp.id}`} className="text-primary hover:text-blue-900 inline-flex items-center">
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RfpList;