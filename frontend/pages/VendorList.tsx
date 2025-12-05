import React, { useEffect, useState } from 'react';
import { getVendors, createVendor } from '../api/vendor';
import { Vendor, VendorInput } from '../types';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { Plus, User } from 'lucide-react';

const VendorList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [newVendor, setNewVendor] = useState<VendorInput>({ name: '', email: '', contact_person: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await getVendors();
      setVendors(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createVendor(newVendor);
      await loadVendors();
      setShowForm(false);
      setNewVendor({ name: '', email: '', contact_person: '' });
    } catch (err) {
      alert('Failed to create vendor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Add Vendor
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 animate-slide-down">
          <h3 className="text-lg font-medium mb-4">New Vendor Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Company Name"
              required
              className="border p-2 rounded"
              value={newVendor.name}
              onChange={e => setNewVendor({...newVendor, name: e.target.value})}
            />
             <input
              type="email"
              placeholder="Email Address"
              required
              className="border p-2 rounded"
              value={newVendor.email}
              onChange={e => setNewVendor({...newVendor, email: e.target.value})}
            />
             <input
              type="text"
              placeholder="Contact Person (Optional)"
              className="border p-2 rounded"
              value={newVendor.contact_person || ''}
              onChange={e => setNewVendor({...newVendor, contact_person: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-3">
             <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
             <Button type="submit" isLoading={saving}>Save Vendor</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map(vendor => (
          <div key={vendor.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{vendor.name}</h3>
                <p className="text-sm text-slate-500">{vendor.contact_person || 'No contact person'}</p>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100 text-sm text-slate-600">
              <span className="font-medium">Email:</span> {vendor.email}
            </div>
          </div>
        ))}
        {vendors.length === 0 && !loading && (
           <div className="col-span-full text-center py-10 text-slate-500 bg-white border rounded-lg border-dashed">
             No vendors found. Add one to get started.
           </div>
        )}
      </div>
    </div>
  );
};

export default VendorList;
