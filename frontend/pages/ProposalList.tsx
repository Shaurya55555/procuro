import React from 'react';
import { Link } from '../components/Spinner';
import Button from '../components/Button';
import { PlusCircle } from 'lucide-react';

const ProposalList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Proposals</h1>
        <Link to="/proposals/new">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Proposal
          </Button>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
         <p className="text-slate-600 mb-4">
           Proposals are best managed within the context of their specific RFP.
         </p>
         <Link to="/rfps" className="text-primary hover:underline">
           Go to RFPs List to see proposals by project &rarr;
         </Link>
      </div>
    </div>
  );
};

export default ProposalList;