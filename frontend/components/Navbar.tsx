import React from 'react';
import { Link, useLocation } from './Spinner';
import { NAV_LINKS } from '../constants';
import { FileText, LayoutDashboard, Users, Mail } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  const getIcon = (label: string) => {
    switch (label) {
      case 'Dashboard': return <LayoutDashboard className="w-5 h-5 mr-1" />;
      case 'RFPs': return <FileText className="w-5 h-5 mr-1" />;
      case 'Vendors': return <Users className="w-5 h-5 mr-1" />;
      case 'Proposals': return <Mail className="w-5 h-5 mr-1" />;
      default: return null;
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">Procuro AI</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === link.path
                      ? 'border-primary text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {getIcon(link.label)}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;