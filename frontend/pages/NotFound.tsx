import React from 'react';
import { Link } from '../components/router';

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div className="text-8xl font-bold text-slate-200 mb-4">404</div>
    <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
    <p className="text-slate-500 mb-8 max-w-sm">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      className="inline-flex items-center px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
    >
      ← Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
