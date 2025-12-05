import React, { useState, useEffect } from 'react';
import { useNavigate } from '../components/Spinner';
import { getRfps } from '../api/rfp';
import { getVendors } from '../api/vendor';
import { parseProposalEmail, createProposal } from '../api/proposal';
import { Rfp, Vendor, ParsedProposal } from '../types';
import Button from '../components/Button';
import { ArrowLeft, Sparkles, Check } from 'lucide-react';

const ProposalCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [rfps, setRfps] = useState<Rfp[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  // Form State
  const [selectedRfpId, setSelectedRfpId] = useState<number | ''>('');
  const [selectedVendorId, setSelectedVendorId] = useState<number | ''>('');
  const [rawEmail, setRawEmail] = useState('');
  
  // Parsed State
  const [parsedData, setParsedData] = useState<ParsedProposal | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load options for dropdowns
    Promise.all([getRfps(), getVendors()]).then(([r, v]) => {
      setRfps(r);
      setVendors(v);
    });
  }, []);

  const handleParse = async () => {
    if (!rawEmail) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseProposalEmail(rawEmail);
      setParsedData(parsed);
      setStep(2);
    } catch (err) {
      setError('Failed to parse email. Ensure backend AI service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRfpId || !selectedVendorId || !parsedData) return;
    setLoading(true);
    try {
      await createProposal({
        rfp_id: Number(selectedRfpId),
        vendor_id: Number(selectedVendorId),
        raw_email: rawEmail,
        parsed_data: parsedData 
      });
      navigate(`/rfps/${selectedRfpId}`);
    } catch (err) {
      setError('Failed to save proposal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="secondary" onClick={() => navigate('/proposals')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Add New Proposal</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}

      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center space-x-4 text-sm font-medium">
          <span className={step >= 1 ? 'text-primary' : 'text-slate-400'}>1. Input & Parse</span>
          <span className="text-slate-300">/</span>
          <span className={step === 2 ? 'text-primary' : 'text-slate-400'}>2. Review & Save</span>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select RFP</label>
                  <select 
                    className="w-full border rounded-md p-2"
                    value={selectedRfpId}
                    onChange={e => setSelectedRfpId(Number(e.target.value))}
                  >
                    <option value="">-- Select RFP --</option>
                    {rfps.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Vendor</label>
                  <select 
                    className="w-full border rounded-md p-2"
                    value={selectedVendorId}
                    onChange={e => setSelectedVendorId(Number(e.target.value))}
                  >
                    <option value="">-- Select Vendor --</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paste Vendor Email Content</label>
                <textarea
                  className="w-full border rounded-md p-3 h-48 focus:ring-primary focus:border-primary"
                  placeholder="Paste the raw email text here... e.g. 'Dear Manager, We are pleased to offer...'"
                  value={rawEmail}
                  onChange={e => setRawEmail(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleParse} 
                  isLoading={loading}
                  disabled={!selectedRfpId || !selectedVendorId || !rawEmail}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Parse with AI
                </Button>
              </div>
            </>
          )}

          {step === 2 && parsedData && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="text-green-800 font-semibold mb-2 flex items-center">
                  <Check className="w-4 h-4 mr-2" /> Data Extracted Successfully
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-green-900">
                  <div><strong>Price:</strong> {parsedData.price}</div>
                  <div><strong>Timeline:</strong> {parsedData.delivery_timeline}</div>
                  <div><strong>Warranty:</strong> {parsedData.warranty}</div>
                  <div><strong>Payment:</strong> {parsedData.payment_terms}</div>
                </div>
                <div className="mt-2 text-sm text-green-900">
                  <strong>Items:</strong> {parsedData.items.join(', ')}
                </div>
              </div>

              <div>
                 <p className="text-sm text-slate-500 mb-2">Review extracted data. If incorrect, go back and edit the text.</p>
                 <div className="flex justify-between">
                   <Button variant="secondary" onClick={() => setStep(1)}>Back to Edit</Button>
                   <Button onClick={handleSave} isLoading={loading}>Save Proposal</Button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalCreate;