// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { docAPI } from '../api';

// export const Documents = () => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   // ✅ NEW: State for Status Filtering
//   const [statusFilter, setStatusFilter] = useState('all'); 

//   const fetchDocs = async () => {
//     try {
//       setLoading(true);
//       const res = await docAPI.getAll();
//       setDocuments(res.data);
//     } catch (err) {
//       console.error("Fetch Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDocs();
//   }, []);

//   const handleDelete = async (id: string) => {
//     if (window.confirm("Are you sure? This will delete the document and all signatures.")) {
//       try {
//         await docAPI.delete(id);
//         fetchDocs(); 
//       } catch (err) {
//         alert("Failed to delete document. It might have been already removed.");
//         fetchDocs();
//       }
//     }
//   };

//   const copyToClipboard = (token: string) => {
//     const url = `${window.location.origin}/public/${token}`;
//     navigator.clipboard.writeText(url);
//     alert("Public signature link copied!");
//   };

//   // ✅ UPDATED: Combined Filter Logic (Search + Status)
//   const filteredDocs = documents.filter((doc: any) => {
//     const matchesSearch = (doc.title || "").toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   if (loading) return (
//     <div className="p-10 text-center animate-pulse text-gray-500 font-bold tracking-widest uppercase">
//       Fetching Vault Documents...
//     </div>
//   );

//   return (
//     <div className="space-y-6 p-4">
//       {/* Header Area */}
//       <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
//         <div className="w-full md:w-auto">
//           <h1 className="text-2xl font-black text-gray-800 tracking-tight">My Documents</h1>
//           <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Manage your signature queue</p>
//         </div>
        
//         <div className="flex flex-1 w-full max-w-md mx-4">
//           <input 
//             type="text"
//             placeholder="Search by title..."
//             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <Link to="/upload" className="w-full md:w-auto text-center bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
//           + New Document
//         </Link>
//       </div>

//       {/* ✅ NEW: Status Filter Toggles */}
//       <div className="flex gap-2 mb-6 px-2">
//         {['all', 'pending', 'signed'].map((status) => (
//           <button
//             key={status}
//             onClick={() => setStatusFilter(status)}
//             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
//               statusFilter === status 
//                 ? 'bg-gray-900 text-white shadow-lg' 
//                 : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
//             }`}
//           >
//             {status === 'all' ? 'Show All' : status}
//           </button>
//         ))}
//       </div>

//       {/* Documents Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredDocs.map((doc: any) => (
//           <div key={doc._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition group relative overflow-hidden flex flex-col gap-4">
            
//             {/* Header Logic */}
//             <div className="flex justify-between items-start">
//               <h3 className="font-bold text-gray-800 truncate w-40">{doc.title}</h3>
//               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
//                 doc.status === 'signed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
//               }`}>
//                 {doc.status}
//               </span>
//             </div>

//             {/* ✅ Signature Thumbnail Preview */}
//             {doc.status === 'signed' && doc.signatures?.[0]?.signatureImage ? (
//               <div className="relative h-24 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden group">
//                 <p className="absolute top-2 left-3 text-[8px] font-black text-gray-300 uppercase tracking-widest">Preview</p>
//                 <img 
//                   src={doc.signatures[0].signatureImage} 
//                   alt="Signature Preview" 
//                   className="h-16 object-contain mix-blend-multiply transition-transform group-hover:scale-110"
//                 />
//               </div>
//             ) : (
//               <div className="h-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center">
//                 <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
//                   {doc.status === 'signed' ? "No Preview" : "Pending Signature"}
//                 </p>
//               </div>
//             )}

//             {/* ✅ Audit Trail Quick View */}
//             {doc.status === 'signed' && doc.signatures?.[0] && (
//               <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
//                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Audit Trail</p>
//                 <div className="flex flex-col gap-1">
//                   <div className="flex justify-between text-[10px]">
//                     <span className="text-gray-500">IP Address:</span>
//                     <span className="font-mono font-bold text-gray-700">{doc.signatures[0].ipAddress || '127.0.0.1'}</span>
//                   </div>
//                   <div className="flex justify-between text-[10px]">
//                     <span className="text-gray-500">Signed At:</span>
//                     <span className="font-bold text-gray-700">
//                       {new Date(doc.signatures[0].createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}
                  
//             <div className="flex flex-col gap-2">
//               <Link 
//                 to={`/viewer/${doc._id}`} 
//                 className="text-center py-2 bg-slate-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition"
//               >
//                 Open Viewer
//               </Link>
              
//               <button 
//                 onClick={() => copyToClipboard(doc.publicToken)}
//                 className="text-center py-2 border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition"
//               >
//                 Copy Public Link
//               </button>

//               {doc.status === 'signed' && (
//                 <a 
//                   href={`http://localhost:5000/${doc.filePath.replace(/\\/g, '/')}`} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   download 
//                   className="text-center py-2 bg-green-50 text-green-600 rounded-xl text-sm font-black hover:bg-green-100 transition"
//                 >
//                   Download Signed PDF
//                 </a>
//               )}

//               <button 
//                 onClick={() => handleDelete(doc._id)}
//                 className="text-center py-2 text-red-400 text-xs font-bold hover:text-red-600 transition border-t border-gray-100 mt-2 pt-2"
//               >
//                 Delete Permanently
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
      
//       {filteredDocs.length === 0 && (
//         <div className="text-center p-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
//           <p className="text-gray-400 font-bold uppercase tracking-widest">
//             {searchTerm ? "No matching documents found" : "Your vault is empty"}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { docAPI } from '../api';

// export const Documents = () => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all'); 

//   const fetchDocs = async () => {
//     try {
//       setLoading(true);
//       const res = await docAPI.getAll();
//       setDocuments(res.data);
//     } catch (err) {
//       console.error("Fetch Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDocs();
//   }, []);

//   const handleDelete = async (id: string) => {
//     if (window.confirm("Are you sure? This will delete the document and all signatures.")) {
//       try {
//         await docAPI.delete(id);
//         fetchDocs(); 
//       } catch (err) {
//         alert("Failed to delete document. It might have been already removed.");
//         fetchDocs();
//       }
//     }
//   };

//   const copyToClipboard = (token: string) => {
//     const url = `${window.location.origin}/public/${token}`;
//     navigator.clipboard.writeText(url);
//     alert("Public signature link copied!");
//   };

//   const filteredDocs = documents.filter((doc: any) => {
//     const matchesSearch = (doc.title || "").toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   if (loading) return (
//     <div className="p-10 text-center animate-pulse text-gray-500 font-bold tracking-widest uppercase">
//       Fetching Vault Documents...
//     </div>
//   );

//   return (
//     <div className="space-y-6 p-4">
//       <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
//         <div className="w-full md:w-auto">
//           <h1 className="text-2xl font-black text-gray-800 tracking-tight">My Documents</h1>
//           <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Manage your signature queue</p>
//         </div>
        
//         <div className="flex flex-1 w-full max-w-md mx-4">
//           <input 
//             type="text"
//             placeholder="Search by title..."
//             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <Link to="/upload" className="w-full md:w-auto text-center bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
//           + New Document
//         </Link>
//       </div>

//       {/* ✅ UPDATED: Added 'rejected' to the filter list */}
//       <div className="flex gap-2 mb-6 px-2 overflow-x-auto pb-2">
//         {['all', 'pending', 'signed', 'rejected'].map((status) => (
//           <button
//             key={status}
//             onClick={() => setStatusFilter(status)}
//             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
//               statusFilter === status 
//                 ? 'bg-gray-900 text-white shadow-lg' 
//                 : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
//             }`}
//           >
//             {status === 'all' ? 'Show All' : status}
//           </button>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredDocs.map((doc: any) => (
//           <div key={doc._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition group relative overflow-hidden flex flex-col gap-4">
            
//             <div className="flex justify-between items-start">
//               <h3 className="font-bold text-gray-800 truncate w-40">{doc.title}</h3>
//               {/* ✅ UPDATED: Added conditional colors for 'rejected' status */}
//               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
//                 doc.status === 'signed' ? 'bg-green-100 text-green-600' : 
//                 doc.status === 'rejected' ? 'bg-red-100 text-red-600' : 
//                 'bg-yellow-100 text-yellow-600'
//               }`}>
//                 {doc.status}
//               </span>
//             </div>

//             {/* Signature Thumbnail Logic */}
//             {doc.status === 'signed' && doc.signatures?.[0]?.signatureImage ? (
//               <div className="relative h-24 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden group">
//                 <p className="absolute top-2 left-3 text-[8px] font-black text-gray-300 uppercase tracking-widest">Preview</p>
//                 <img 
//                   src={doc.signatures[0].signatureImage} 
//                   alt="Signature Preview" 
//                   className="h-16 object-contain mix-blend-multiply transition-transform group-hover:scale-110"
//                 />
//               </div>
//             ) : (
//               <div className={`h-24 rounded-2xl border border-dashed flex items-center justify-center ${
//                 doc.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
//               }`}>
//                 <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
//                   {doc.status === 'signed' ? "No Preview" : 
//                    doc.status === 'rejected' ? "No Signature" : "Pending Signature"}
//                 </p>
//               </div>
//             )}

//             {/* ✅ NEW: Rejection Reason Display */}
//             {doc.status === 'rejected' && (
//               <div className="p-3 bg-red-50 rounded-xl border border-red-100">
//                 <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Rejection Reason</p>
//                 <p className="text-xs text-red-700 italic font-medium">
//                   "{doc.rejectionReason || "No specific reason provided."}"
//                 </p>
//               </div>
//             )}

//             {/* Audit Trail View for Signed Docs */}
//             {doc.status === 'signed' && doc.signatures?.[0] && (
//               <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
//                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Audit Trail</p>
//                 <div className="flex flex-col gap-1">
//                   <div className="flex justify-between text-[10px]">
//                     <span className="text-gray-500">IP Address:</span>
//                     <span className="font-mono font-bold text-gray-700">{doc.signatures[0].ipAddress || '127.0.0.1'}</span>
//                   </div>
//                   <div className="flex justify-between text-[10px]">
//                     <span className="text-gray-500">Signed At:</span>
//                     <span className="font-bold text-gray-700">
//                       {new Date(doc.signatures[0].createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}
                  
//             <div className="flex flex-col gap-2">
//               <Link 
//                 to={`/viewer/${doc._id}`} 
//                 className="text-center py-2 bg-slate-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition"
//               >
//                 Open Viewer
//               </Link>
              
//               {/* ✅ Link only useful if not signed */}
//               {doc.status !== 'signed' && (
//                 <button 
//                   onClick={() => copyToClipboard(doc.publicToken)}
//                   className="text-center py-2 border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition"
//                 >
//                   Copy Public Link
//                 </button>
//               )}

//               {doc.status === 'signed' && (
//                 <a 
//                   href={`http://localhost:5000/${doc.filePath.replace(/\\/g, '/')}`} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   download 
//                   className="text-center py-2 bg-green-50 text-green-600 rounded-xl text-sm font-black hover:bg-green-100 transition"
//                 >
//                   Download Signed PDF
//                 </a>
//               )}

//               <button 
//                 onClick={() => handleDelete(doc._id)}
//                 className="text-center py-2 text-red-400 text-xs font-bold hover:text-red-600 transition border-t border-gray-100 mt-2 pt-2"
//               >
//                 Delete Permanently
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
      
//       {filteredDocs.length === 0 && (
//         <div className="text-center p-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
//           <p className="text-gray-400 font-bold uppercase tracking-widest">
//             {searchTerm ? "No matching documents found" : "Your vault is empty"}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };
import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { docAPI } from '../api';

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await docAPI.getAll();
      setDocuments(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This will delete the document and all signatures.")) {
      try {
        await docAPI.delete(id);
        fetchDocs(); 
      } catch (err) {
        alert("Failed to delete document. It might have been already removed.");
        fetchDocs();
      }
    }
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/public/${token}`;
    navigator.clipboard.writeText(url);
    alert("Public signature link copied!");
  };

  const filteredDocs = documents.filter((doc: any) => {
    const matchesSearch = (doc.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="p-10 text-center animate-pulse text-gray-500 font-bold tracking-widest uppercase">
      Fetching Vault Documents...
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">My Documents</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Manage your signature queue</p>
        </div>
        
        <div className="flex flex-1 w-full max-w-md mx-4">
          <input 
            type="text"
            placeholder="Search by title..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Link to="/upload" className="w-full md:w-auto text-center bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
          + New Document
        </Link>
      </div>

      {/* Status Filter Toggles */}
      <div className="flex gap-2 mb-6 px-2 overflow-x-auto pb-2">
        {['all', 'pending', 'signed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              statusFilter === status 
                ? 'bg-gray-900 text-white shadow-lg' 
                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'Show All' : status}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc: any) => (
          <div key={doc._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition group relative overflow-hidden flex flex-col gap-4">
            
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800 truncate w-40">{doc.title}</h3>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                doc.status === 'signed' ? 'bg-green-100 text-green-600' : 
                doc.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                'bg-yellow-100 text-yellow-600'
              }`}>
                {doc.status}
              </span>
            </div>

            {/* ✅ UPDATED: Rejection Reason Display Box */}
            {doc.status === 'rejected' && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-red-500 text-xs">⚠️</span>
                  <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Reason for Decline</p>
                </div>
                <p className="text-xs text-red-700 italic font-medium">
                  "{doc.rejectionReason || "No specific reason provided."}"
                </p>
              </div>
            )}

            {/* Signature Thumbnail Logic */}
            {doc.status === 'signed' && doc.signatures?.[0]?.signatureImage ? (
              <div className="relative h-24 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden group">
                <p className="absolute top-2 left-3 text-[8px] font-black text-gray-300 uppercase tracking-widest">Preview</p>
                <img 
                  src={doc.signatures[0].signatureImage} 
                  alt="Signature Preview" 
                  className="h-16 object-contain mix-blend-multiply transition-transform group-hover:scale-110"
                />
              </div>
            ) : (
              <div className={`h-24 rounded-2xl border border-dashed flex items-center justify-center ${
                doc.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  {doc.status === 'signed' ? "No Preview" : 
                   doc.status === 'rejected' ? "Verification Refused" : "Pending Signature"}
                </p>
              </div>
            )}

            {/* Audit Trail View for Signed Docs */}
            {doc.status === 'signed' && doc.signatures?.[0] && (
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Audit Trail</p>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">IP Address:</span>
                    <span className="font-mono font-bold text-gray-700">{doc.signatures[0].ipAddress || '127.0.0.1'}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Signed At:</span>
                    <span className="font-bold text-gray-700">
                      {new Date(doc.signatures[0].createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
                  
            <div className="flex flex-col gap-2 mt-auto">
              <Link 
                to={`/viewer/${doc._id}`} 
                className="text-center py-2 bg-slate-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition"
              >
                Open Viewer
              </Link>
              
              {doc.status !== 'signed' && (
                <button 
                  onClick={() => copyToClipboard(doc.publicToken)}
                  className="text-center py-2 border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition"
                >
                  Copy Public Link
                </button>
              )}

              {doc.status === 'signed' && (
                <a 
                  href={`https://document-signature-app-h0di.onrender.com/5000/${doc.filePath.replace(/\\/g, '/')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  download 
                  className="text-center py-2 bg-green-50 text-green-600 rounded-xl text-sm font-black hover:bg-green-100 transition"
                >
                  Download Signed PDF
                </a>
              )}

              <button 
                onClick={() => handleDelete(doc._id)}
                className="text-center py-2 text-red-400 text-xs font-bold hover:text-red-600 transition border-t border-gray-100 mt-2 pt-2"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDocs.length === 0 && (
        <div className="text-center p-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold uppercase tracking-widest">
            {searchTerm ? "No matching documents found" : "Your vault is empty"}
          </p>
        </div>
      )}
    </div>
  );
};