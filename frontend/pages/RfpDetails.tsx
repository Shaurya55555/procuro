import React, { useEffect, useState } from 'react';
import Spinner, { useParams, Link } from '../components/Spinner';
import { getRfpById, compareProposals } from '../api/rfp';
import { getVendors } from '../api/vendor';
import { sendRfpEmail } from '../api/email';
import { getProposalsByRfpId } from '../api/proposal';
import { Rfp, Vendor, Proposal, ComparisonResult } from '../types';
import Button from '../components/Button';
import { Mail, CheckSquare, BarChart2, FileText, ArrowLeft, Send } from 'lucide-react';

const RfpDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [rfp, setRfp] = useState<Rfp | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (id) fetchData(parseInt(id));
  }, [id]);

  const fetchData = async (rfpId: number) => {
    try {
      setLoading(true);
      const [rfpData, vendorsData, proposalsData] = await Promise.all([
        getRfpById(rfpId),
        getVendors(),
        getProposalsByRfpId(rfpId)
      ]);
      setRfp(rfpData);
      setVendors(vendorsData);
      setProposals(proposalsData);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!id || selectedVendors.length === 0) return;
    setSendingEmail(true);
    try {
      await sendRfpEmail({ rfpId: parseInt(id), vendorIds: selectedVendors });
      setMsg({ type: 'success', text: 'RFPs sent to selected vendors successfully.' });
      setSelectedVendors([]);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to send emails.' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCompare = async () => {
    if (!id) return;
    setComparing(true);
    try {
      const result = await compareProposals(parseInt(id));
      setComparison(result);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to generate comparison.' });
    } finally {
      setComparing(false);
    }
  };

  const toggleVendor = (vendorId: number) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) ? prev.filter(v => v !== vendorId) : [...prev, vendorId]
    );
  };

  if (loading) return <Spinner />;
  if (!rfp) return <div>RFP not found</div>;

  return (
    <div className="space-y-8">
      <Link to="/rfps" className="inline-flex items-center text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
      </Link>

      {msg && (
        <div className={`p-4 rounded border ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* RFP Header Info */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{rfp.title}</h1>
            <div className="flex space-x-6 text-sm text-slate-500">
              <span><strong>Budget:</strong> {rfp.budget}</span>
              <span><strong>Timeline:</strong> {rfp.delivery_timeline}</span>
              <span><strong>Warranty:</strong> {rfp.warranty}</span>
            </div>
          </div>
          <div className="text-right text-sm text-slate-400">ID: #{rfp.id}</div>
        </div>
        <div className="mt-4">
          <h3 className="font-medium text-slate-900 mb-2">Requirements:</h3>
          <ul className="list-disc list-inside text-slate-600">
            {rfp.items.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Selection & Email */}
        <div className="bg-white shadow-sm rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" /> Send to Vendors
          </h2>
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {vendors.map(vendor => (
              <div key={vendor.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded">
                <input
                  type="checkbox"
                  id={`v-${vendor.id}`}
                  checked={selectedVendors.includes(vendor.id)}
                  onChange={() => toggleVendor(vendor.id)}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor={`v-${vendor.id}`} className="flex-1 cursor-pointer">
                  <span className="font-medium text-slate-900">{vendor.name}</span>
                  <span className="block text-xs text-slate-500">{vendor.email}</span>
                </label>
              </div>
            ))}
          </div>
          <Button 
            onClick={handleSendEmail} 
            disabled={selectedVendors.length === 0} 
            isLoading={sendingEmail}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Send RFP via Email
          </Button>
        </div>

        {/* Proposals List */}
        <div className="bg-white shadow-sm rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" /> Received Proposals
          </h2>
          {proposals.length === 0 ? (
            <div className="text-slate-500 text-sm">No proposals received yet.</div>
          ) : (
            <ul className="space-y-3">
              {proposals.map(p => {
                const vendorName = vendors.find(v => v.id === p.vendor_id)?.name || `Vendor #${p.vendor_id}`;
                return (
                  <li key={p.id} className="p-3 border rounded-md border-slate-100 hover:bg-slate-50">
                    <div className="flex justify-between">
                      <span className="font-medium">{vendorName}</span>
                      <span className="text-green-600 font-medium">{p.parsed?.price || 'N/A'}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Timeline: {p.parsed?.delivery_timeline || 'N/A'}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
           <div className="mt-6 pt-4 border-t border-slate-100">
              <Link to="/proposals/new">
                <Button variant="secondary" className="w-full">Manually Add Proposal</Button>
              </Link>
           </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2" /> 
            AI Comparison & Recommendation
          </h2>
          <Button onClick={handleCompare} isLoading={comparing} disabled={proposals.length < 1}>
             Run AI Comparison
          </Button>
        </div>
        
        {comparison && (
          <div className="space-y-6 animate-fade-in">
             {comparison.recommendation && (
               <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                 <h4 className="font-bold text-blue-900">Recommendation</h4>
                 <p className="text-blue-800 mt-1">{comparison.recommendation}</p>
               </div>
             )}
             
             {comparison.summary && (
               <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
                  <p className="text-slate-600">{comparison.summary}</p>
               </div>
             )}

             {/* Dynamic rendering of other comparison data if API returns complex objects */}
             {Object.entries(comparison).map(([key, value]) => {
                if (key === 'recommendation' || key === 'summary' || key === 'score') return null;
                return (
                  <div key={key} className="mt-4">
                     <h4 className="font-semibold capitalize text-slate-900">{key.replace(/_/g, ' ')}</h4>
                     <pre className="bg-slate-50 p-3 rounded text-sm text-slate-700 overflow-auto">
                       {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                     </pre>
                  </div>
                );
             })}
          </div>
        )}
        
        {!comparison && !comparing && (
           <div className="text-center text-slate-500 py-8">
             Click "Run AI Comparison" to analyze received proposals.
           </div>
        )}
      </div>
    </div>
  );
};

export default RfpDetails;