// import React, { useEffect, useState } from 'react';
// import { docAPI } from '../api';
// import { Link } from 'react-router-dom';

// export const Dashboard = () => {
//   const [stats, setStats] = useState({ total: 0, pending: 0, signed: 0 });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     docAPI.getAll().then(res => {
//       const docs = res.data;
//       setStats({
//         total: docs.length,
//         pending: docs.filter((d: any) => d.status === 'pending').length,
//         signed: docs.filter((d: any) => d.status === 'signed').length
//       });
//       setLoading(false);
//     }).catch(() => setLoading(false));
//   }, []);

//   if (loading) return <div className="p-10 text-center animate-pulse font-black text-gray-400">LOADING METRICS...</div>;

//   return (
//     <div className="p-8 space-y-10">
//       <header>
//         <h1 className="text-3xl font-black text-gray-800 tracking-tight">System Overview</h1>
//         <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Real-time Signature Analytics</p>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-xl transition-all">
//           <div className="w-16 h-16 bg-yellow-100 rounded-2xl mb-4 flex items-center justify-center text-yellow-600 font-black text-2xl">!</div>
//           <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Awaiting Action</p>
//           <h2 className="text-6xl font-black text-gray-800">{stats.pending}</h2>
//           <p className="text-sm font-bold text-yellow-600 mt-2 uppercase tracking-tighter">Pending Signatures</p>
//         </div>

//         <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-xl transition-all">
//           <div className="w-16 h-16 bg-green-100 rounded-2xl mb-4 flex items-center justify-center text-green-600 font-black text-2xl">✓</div>
//           <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Successfully Verified</p>
//           <h2 className="text-6xl font-black text-gray-800">{stats.signed}</h2>
//           <p className="text-sm font-bold text-green-600 mt-2 uppercase tracking-tighter">Signed Documents</p>
//         </div>
//       </div>

//       <div className="flex flex-col md:flex-row gap-4 pt-6">
//         <Link to="/documents" className="flex-1 text-center py-5 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl">
//           Access Document Vault ({stats.total})
//         </Link>
//         <Link to="/upload" className="flex-1 text-center py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100">
//           Upload New Protocol
//         </Link>
//       </div>
//     </div>
//   );
// };
import React, { useEffect, useState } from 'react';
import { docAPI } from '../api';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  // ✅ Added rejected to state
  const [stats, setStats] = useState({ total: 0, pending: 0, signed: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    docAPI.getAll().then(res => {
      const docs = res.data;
      setStats({
        total: docs.length,
        pending: docs.filter((d: any) => d.status === 'pending').length,
        signed: docs.filter((d: any) => d.status === 'signed').length,
        // ✅ Calculate rejected documents
        rejected: docs.filter((d: any) => d.status === 'rejected').length
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse font-black text-gray-400">LOADING METRICS...</div>;

  return (
    <div className="p-8 space-y-10">
      <header>
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">System Overview</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Real-time Signature Analytics</p>
      </header>

      {/* ✅ Changed to grid-cols-3 to accommodate the new card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl mb-4 flex items-center justify-center text-yellow-600 font-black text-2xl">!</div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Awaiting Action</p>
          <h2 className="text-6xl font-black text-gray-800">{stats.pending}</h2>
          <p className="text-sm font-bold text-yellow-600 mt-2 uppercase tracking-tighter">Pending Signatures</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-green-100 rounded-2xl mb-4 flex items-center justify-center text-green-600 font-black text-2xl">✓</div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Successfully Verified</p>
          <h2 className="text-6xl font-black text-gray-800">{stats.signed}</h2>
          <p className="text-sm font-bold text-green-600 mt-2 uppercase tracking-tighter">Signed Documents</p>
        </div>

        {/* ✅ NEW: Rejected Documents Card */}
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-red-100 rounded-2xl mb-4 flex items-center justify-center text-red-600 font-black text-2xl">✕</div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Declined Protocols</p>
          <h2 className="text-6xl font-black text-gray-800">{stats.rejected}</h2>
          <p className="text-sm font-bold text-red-600 mt-2 uppercase tracking-tighter">Rejected Documents</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-6">
        <Link to="/documents" className="flex-1 text-center py-5 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl">
          Access Document Vault ({stats.total})
        </Link>
        <Link to="/upload" className="flex-1 text-center py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100">
          Upload New Protocol
        </Link>
      </div>
    </div>
  );
};