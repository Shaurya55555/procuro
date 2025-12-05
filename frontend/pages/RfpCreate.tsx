import React, { useState } from 'react';
import { useNavigate } from '../components/Spinner';
import { createRfp, generateRfpFromText } from '../api/rfp';
import { RfpInput } from '../types';
import Button from '../components/Button';
import { Sparkles, Save, ArrowLeft } from 'lucide-react';

const RfpCreate: React.FC = () => {
  const navigate = useNavigate();
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RfpInput>({
    title: '',
    budget: '',
    items: [],
    delivery_timeline: '',
    payment_terms: '',
    warranty: '',
  });

  const handleAiGenerate = async () => {
    if (!naturalLanguageInput.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const structuredData = await generateRfpFromText(naturalLanguageInput);
      setFormData(structuredData);
    } catch (err) {
      setError('Failed to generate RFP from text. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const items = e.target.value.split('\n').filter(item => item.trim() !== '');
    setFormData(prev => ({ ...prev, items }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await createRfp(formData);
      navigate('/rfps');
    } catch (err) {
      setError('Failed to create RFP. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="secondary" onClick={() => navigate('/rfps')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Create New RFP</h1>
      </div>

      {/* AI Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
          AI Assistant
        </h2>
        <p className="text-sm text-blue-700 mb-4">
          Describe your needs in plain English (e.g., "I need 20 laptops with 16GB RAM for under $50k delivered in 30 days").
        </p>
        <div className="space-y-4">
          <textarea
            className="w-full p-3 rounded-md border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            placeholder="Describe what you need..."
            value={naturalLanguageInput}
            onChange={(e) => setNaturalLanguageInput(e.target.value)}
          />
          <Button 
            onClick={handleAiGenerate} 
            disabled={!naturalLanguageInput} 
            isLoading={isGenerating}
          >
            Generate Structure
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Budget</label>
            <input
              type="text"
              name="budget"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              value={formData.budget}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Timeline</label>
            <input
              type="text"
              name="delivery_timeline"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              value={formData.delivery_timeline}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
            <input
              type="text"
              name="payment_terms"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              value={formData.payment_terms}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Warranty</label>
            <input
              type="text"
              name="warranty"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              value={formData.warranty}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Line Items (One per line)</label>
            <textarea
              name="items"
              required
              rows={5}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              value={formData.items.join('\n')}
              onChange={handleItemsChange}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button type="submit" isLoading={isSaving} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Create RFP
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RfpCreate;