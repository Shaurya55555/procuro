import React from 'react';
import { HashRouter as Router, Routes, Route } from './components/Spinner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RfpList from './pages/RfpList';
import RfpCreate from './pages/RfpCreate';
import RfpDetails from './pages/RfpDetails';
import VendorList from './pages/VendorList';
import ProposalList from './pages/ProposalList';
import ProposalCreate from './pages/ProposalCreate';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rfps" element={<RfpList />} />
          <Route path="/rfps/new" element={<RfpCreate />} />
          <Route path="/rfps/:id" element={<RfpDetails />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/proposals" element={<ProposalList />} />
          <Route path="/proposals/new" element={<ProposalCreate />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;