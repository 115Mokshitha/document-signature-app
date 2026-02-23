import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { docAPI, sigAPI } from '../api';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const SignatureBadge = ({ x, y }: { x: number; y: number }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: 'sig-box' });
  const style = {
    transform: transform 
      ? `translate3d(${transform.x + x}px, ${transform.y + y}px, 0)` 
      : `translate3d(${x}px, ${y}px, 0)`,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      className="absolute z-50 w-32 h-12 border-2 border-blue-600 bg-blue-100/70 backdrop-blur-sm flex items-center justify-center cursor-move rounded shadow-md select-none hover:bg-blue-200 transition-colors">
      <span className="text-blue-700 font-bold italic text-[10px] uppercase tracking-tight">Placement</span>
    </div>
  );
};

export const DocumentViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<any>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (id) {
      docAPI.getById(id)
        .then(res => setDoc(res.data))
        .catch(err => {
          console.error("Fetch Error:", err);
          setError("Could not load document details.");
        });
    }
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleDragEnd = (event: any) => {
    const { delta } = event;
    setPos(prev => ({
      x: Math.max(0, prev.x + delta.x),
      y: Math.max(0, prev.y + delta.y),
    }));
  };

  const handleSavePlacement = async () => {
    try {
      setLoading(true);
      await sigAPI.save({ 
        documentId: id!, 
        x: Math.round(pos.x), 
        y: Math.round(pos.y), 
        page: pageNumber 
      });
      alert(`Placement saved on Page ${pageNumber}!`);
    } catch (err) {
      alert("Failed to save placement.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (window.confirm("Finalizing will permanently embed signatures and lock this document. Proceed?")) {
      try {
        setLoading(true);
        await sigAPI.finalize(id!);
        alert("Document finalized and locked successfully!");
        navigate('/'); 
      } catch (err) {
        alert("Error finalizing document.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (error) return <div className="p-10 text-red-500 text-center font-bold">{error}</div>;
  if (!doc) return <div className="p-10 text-center text-gray-400 animate-pulse font-bold tracking-widest uppercase">Initializing...</div>;

  const isSigned = doc.status === 'signed';

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{doc.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${isSigned ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {doc.status}
            </span>
            
            {/* ✅ FIXED: Page Navigation UI is now visible for BOTH signed and unsigned docs */}
            {numPages && (
              <div className="flex items-center gap-3 ml-4 bg-gray-50 px-3 py-1 rounded-xl border">
                <button 
                   disabled={pageNumber <= 1} 
                   onClick={() => setPageNumber(p => p - 1)}
                   className="text-blue-600 font-extrabold disabled:text-gray-300 px-2 cursor-pointer hover:bg-gray-200 rounded">
                   ←
                </button>
                <span className="text-[10px] font-bold text-gray-500">Page {pageNumber} of {numPages}</span>
                <button 
                   disabled={pageNumber >= numPages} 
                   onClick={() => setPageNumber(p => p + 1)}
                   className="text-blue-600 font-extrabold disabled:text-gray-300 px-2 cursor-pointer hover:bg-gray-200 rounded">
                   →
                </button>
              </div>
            )}
          </div>
        </div>

        {!isSigned && (
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={handleSavePlacement} disabled={loading} className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
              {loading ? "Saving..." : "Lock Position"}
            </button>
            <button onClick={handleFinalize} disabled={loading} className="flex-1 md:flex-none bg-green-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100">
              {loading ? "Finalizing..." : "Finalize PDF"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-100 rounded-[40px] p-4 md:p-10 flex justify-center overflow-auto max-h-[80vh] border-8 border-white shadow-2xl">
        <DndContext onDragEnd={handleDragEnd}>
          <div className="relative bg-white shadow-2xl border border-gray-200 h-fit">
            <Document 
              file={`http://localhost:5000/${doc.filePath.replace(/\\/g, '/')}`} 
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="p-20 font-bold text-gray-300 uppercase tracking-widest text-center">Loading PDF...</div>}
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={false} 
                renderAnnotationLayer={false} 
                width={600} 
              />
            </Document>
            {/* Only show draggable badge if not finalized */}
            {!isSigned && <SignatureBadge x={pos.x} y={pos.y} />}
          </div>
        </DndContext>
      </div>
    </div>
  );
};
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Document, Page, pdfjs } from 'react-pdf';
// import { DndContext, useDraggable } from '@dnd-kit/core';
// import { docAPI, sigAPI } from '../api';

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url,
// ).toString();

// const SignatureBadge = ({ x, y }: { x: number; y: number }) => {
//   const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: 'sig-box' });
  
//   // ✅ Calculation for smooth movement relative to the drop point
//   const style = {
//     transform: transform 
//       ? `translate3d(${transform.x + x}px, ${transform.y + y}px, 0)` 
//       : `translate3d(${x}px, ${y}px, 0)`,
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...listeners} {...attributes}
//       className="absolute z-50 w-32 h-12 border-2 border-blue-600 bg-blue-100/70 backdrop-blur-sm flex items-center justify-center cursor-move rounded shadow-md select-none hover:bg-blue-200 transition-colors">
//       <span className="text-blue-700 font-bold italic text-[10px] uppercase tracking-tight">Placement</span>
//     </div>
//   );
// };

// export const DocumentViewer = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [doc, setDoc] = useState<any>(null);
  
//   // ✅ INITIAL POSITION: Standard starting point
//   const [pos, setPos] = useState({ x: 50, y: 50 });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [numPages, setNumPages] = useState<number | null>(null);
//   const [pageNumber, setPageNumber] = useState(1);

//   useEffect(() => {
//     if (id) {
//       docAPI.getById(id)
//         .then(res => setDoc(res.data))
//         .catch(err => {
//           console.error("Fetch Error:", err);
//           setError("Could not load document details.");
//         });
//     }
//   }, [id]);

//   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
//     setNumPages(numPages);
//   };

//   const handleDragEnd = (event: any) => {
//     const { delta } = event;
//     // ✅ BOUNDARY LOGIC: Constrains the badge to stay within the 600px page width
//     setPos(prev => ({
//       x: Math.min(Math.max(0, prev.x + delta.x), 472), // 600px - badge width (128px)
//       y: Math.max(0, prev.y + delta.y),
//     }));
//   };

//   const handleSavePlacement = async () => {
//     try {
//       setLoading(true);
//       await sigAPI.save({ 
//         documentId: id!, 
//         x: Math.round(pos.x), 
//         y: Math.round(pos.y), 
//         page: pageNumber 
//       });
//       alert(`Placement saved on Page ${pageNumber}!`);
//     } catch (err) {
//       alert("Failed to save placement.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFinalize = async () => {
//     if (window.confirm("Finalizing will permanently embed signatures and lock this document. Proceed?")) {
//       try {
//         setLoading(true);
//         await sigAPI.finalize(id!);
//         alert("Document finalized and locked successfully!");
//         navigate('/'); 
//       } catch (err) {
//         alert("Error finalizing document.");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   if (error) return <div className="p-10 text-red-500 text-center font-bold">{error}</div>;
//   if (!doc) return <div className="p-10 text-center text-gray-400 animate-pulse font-bold tracking-widest uppercase">Initializing...</div>;

//   const isSigned = doc.status === 'signed';

//   return (
//     <div className="space-y-6 p-4">
//       <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
//         <div>
//           <h2 className="text-xl font-black text-gray-800 tracking-tight">{doc.title}</h2>
//           <div className="flex items-center gap-2 mt-1">
//             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${isSigned ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
//               {doc.status}
//             </span>
            
//             {numPages && (
//               <div className="flex items-center gap-3 ml-4 bg-gray-50 px-3 py-1 rounded-xl border">
//                 <button 
//                    disabled={pageNumber <= 1} 
//                    onClick={() => setPageNumber(p => p - 1)}
//                    className="text-blue-600 font-extrabold disabled:text-gray-300 px-2 cursor-pointer hover:bg-gray-200 rounded text-sm">
//                    ←
//                 </button>
//                 <span className="text-[10px] font-bold text-gray-500">Page {pageNumber} of {numPages}</span>
//                 <button 
//                    disabled={pageNumber >= numPages} 
//                    onClick={() => setPageNumber(p => p + 1)}
//                    className="text-blue-600 font-extrabold disabled:text-gray-300 px-2 cursor-pointer hover:bg-gray-200 rounded text-sm">
//                    →
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {!isSigned && (
//           <div className="flex gap-4 w-full md:w-auto">
//             <button onClick={handleSavePlacement} disabled={loading} className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
//               {loading ? "Saving..." : "Lock Position"}
//             </button>
//             <button onClick={handleFinalize} disabled={loading} className="flex-1 md:flex-none bg-green-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100">
//               {loading ? "Finalizing..." : "Finalize PDF"}
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="bg-gray-100 rounded-[40px] p-4 md:p-10 flex justify-center overflow-auto max-h-[80vh] border-8 border-white shadow-2xl items-start">
//         <DndContext onDragEnd={handleDragEnd}>
//           {/* ✅ CRITICAL FIX: Explicit relative container with 600px width matching the Page component */}
//           <div className="relative bg-white shadow-2xl border border-gray-200 h-fit" style={{ width: '600px' }}>
//             <Document 
//               file={`http://localhost:5000/${doc.filePath.replace(/\\/g, '/')}`} 
//               onLoadSuccess={onDocumentLoadSuccess}
//               loading={<div className="p-20 font-bold text-gray-300 uppercase tracking-widest text-center">Loading PDF...</div>}
//             >
//               <Page 
//                 pageNumber={pageNumber} 
//                 renderTextLayer={false} 
//                 renderAnnotationLayer={false} 
//                 width={600} 
//               />
//             </Document>
//             {/* Draggable badge anchored to the 600px container */}
//             {!isSigned && <SignatureBadge x={pos.x} y={pos.y} />}
//           </div>
//         </DndContext>
//       </div>
//     </div>
//   );
// };