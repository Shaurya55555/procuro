import React from 'react';
import { Link } from '../components/Spinner';
import { FilePlus, Search, ListPlus } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Welcome to Procuro AI</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <FilePlus className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Create New RFP</h2>
          <p className="text-slate-600 mb-4">Start a new procurement request using AI to draft from natural language.</p>
          <Link to="/rfps/new" className="text-primary hover:text-blue-700 font-medium">Get Started &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <ListPlus className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Process Proposals</h2>
          <p className="text-slate-600 mb-4">Parse vendor email responses automatically and add them to RFPs.</p>
          <Link to="/proposals/new" className="text-primary hover:text-blue-700 font-medium">Add Proposal &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
            <Search className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">View RFPs</h2>
          <p className="text-slate-600 mb-4">Track existing RFPs, manage vendor communications, and compare bids.</p>
          <Link to="/rfps" className="text-primary hover:text-blue-700 font-medium">View All &rarr;</Link>
        </div>
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h3 className="text-lg font-medium text-slate-900 mb-4">How it works</h3>
        <ol className="list-decimal list-inside space-y-3 text-slate-600">
          <li><strong>Create an RFP:</strong> Describe what you need in plain English. Our AI structures it for you.</li>
          <li><strong>Select Vendors:</strong> Choose from your vendor database to invite to the RFP.</li>
          <li><strong>Send Requests:</strong> Automatically email the RFP details to selected vendors.</li>
          <li><strong>Receive Proposals:</strong> Paste vendor email responses. AI extracts price, timeline, and terms.</li>
          <li><strong>Compare & Decide:</strong> View side-by-side comparisons and get AI recommendations.</li>
        </ol>
      </div>
    </div>
  );
};

export default Dashboard;