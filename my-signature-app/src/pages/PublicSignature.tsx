import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import { Document, Page, pdfjs } from "react-pdf";
import { DndContext, useDraggable } from "@dnd-kit/core";
import SignatureCanvas from "react-signature-canvas";
import { docAPI } from "../api";
import axios from "axios"; // ✅ Added for the reject call

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const SignatureBadge = ({ x, y }: { x: number; y: number }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "public-sig-badge",
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x + x}px, ${transform.y + y}px, 0)`
      : `translate3d(${x}px, ${y}px, 0)`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="absolute z-50 w-32 h-12 border-2 border-green-600 bg-green-50/90 flex items-center justify-center cursor-move rounded shadow-xl select-none"
    >
      <span className="text-green-700 font-bold italic text-[10px] uppercase">
        Sign Placement
      </span>
    </div>
  );
};

export const PublicSignature = () => {
  const { token } = useParams();
  const navigate = useNavigate(); // ✅ To redirect after rejection
  const [doc, setDoc] = useState<any>(null);
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [loading, setLoading] = useState(false);
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (token) {
      docAPI
        .getByToken(token)
        .then((res) => setDoc(res.data))
        .catch(() => alert("Invalid or expired link"));
    }
  }, [token]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleDragEnd = (event: any) => {
    const { delta } = event;
    setPos((prev) => ({
      x: Math.max(0, prev.x + delta.x),
      y: Math.max(0, prev.y + delta.y),
    }));
  };

  // ✅ NEW: Handle Rejection Logic
  const handleReject = async () => {
  const reason = window.prompt("Please enter the reason for rejecting this document:");
  if (!reason) return;

  try {
    setLoading(true);
    // ✅ Change the URL to include /public/ before /reject/
    await axios.post(`https://document-signature-app-h0di.onrender.com/5000/api/signatures/public/reject/${doc._id}`, { reason });
    
    alert("Document has been rejected. The owner will be notified.");
    navigate("/login"); 
  } catch (err: any) {
    alert("Failed to reject document.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleCompleteSigning = async () => {
    if (!doc || !sigCanvas.current || sigCanvas.current.isEmpty()) {
      return alert("Please provide a signature first.");
    }

    if (doc.status === "signed") {
      return alert("This document is already signed.");
    }

    try {
      setLoading(true);
      const canvas = sigCanvas.current.getCanvas();
      const signatureImage = canvas.toDataURL("image/png");

      const saveRes = await fetch(
        "https://document-signature-app-h0di.onrender.com/5000/api/signatures/public",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: doc._id,
            x: Math.round(pos.x),
            y: Math.round(pos.y),
            page: pageNumber,
            signatureImage,
          }),
        }
      );

      if (!saveRes.ok) throw new Error("Error saving signature");

      const finalizeRes = await fetch(
        `https://document-signature-app-h0di.onrender.com/5000/api/signatures/public/finalize/${doc._id}`,
        { method: "POST" }
      );

      if (!finalizeRes.ok) throw new Error("Error finalizing PDF");

      alert("Signed Successfully! Your audit trail has been generated.");
      window.location.href = "/";
    } catch (err: any) {
      alert(err.message || "Signing failed");
    } finally {
      setLoading(false);
    }
  };

  if (!doc) return <div className="p-20 text-center font-bold text-gray-400">Loading Document...</div>;

  if (doc.status === "signed") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-green-600">This document is already signed.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-white border-r p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-black mb-4">{doc.title}</h1>
          <div className="relative border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{ width: 280, height: 150, className: "relative z-10" }}
            />
          </div>
          <button onClick={() => sigCanvas.current?.clear()} className="text-red-500 text-xs mt-2 font-bold uppercase">
            Clear Canvas
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {/* Page Controls */}
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
            <button 
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(prev => prev - 1)}
              className="px-3 py-1 bg-white rounded shadow disabled:opacity-50 font-bold"
            > ← </button>
            <span className="text-xs font-bold uppercase text-gray-500">
              Page {pageNumber} of {numPages || "..."}
            </span>
            <button 
              disabled={pageNumber >= (numPages || 1)}
              onClick={() => setPageNumber(prev => prev + 1)}
              className="px-3 py-1 bg-white rounded shadow disabled:opacity-50 font-bold"
            > → </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCompleteSigning}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
            >
              {loading ? "Processing..." : "Sign & Finalize"}
            </button>

            {/* ✅ THE NEW REJECT BUTTON */}
            <button
              onClick={handleReject}
              disabled={loading}
              className="w-full bg-white border-2 border-red-100 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 transition"
            >
              Reject Document
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto bg-gray-200 flex justify-center">
        <DndContext onDragEnd={handleDragEnd}>
          <div className="relative bg-white shadow-2xl h-fit">
            <Document
              file={`https://document-signature-app-h0di.onrender.com/5000/${doc.filePath.replace(/\\/g, "/")}`}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <Page pageNumber={pageNumber} width={600} renderTextLayer={false} renderAnnotationLayer={false} />
            </Document>

            <SignatureBadge x={pos.x} y={pos.y} />
          </div>
        </DndContext>
      </main>
    </div>
  );
};
// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Document, Page, pdfjs } from "react-pdf";
// import { DndContext, useDraggable } from "@dnd-kit/core";
// import SignatureCanvas from "react-signature-canvas";
// import { docAPI } from "../api";
// import axios from "axios";

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url
// ).toString();

// const SignatureBadge = ({ x, y }: { x: number; y: number }) => {
//   const { attributes, listeners, setNodeRef, transform } = useDraggable({
//     id: "public-sig-badge",
//   });

//   // ✅ Calculation ensures smooth movement relative to the drop point
//   const style = {
//     transform: transform
//       ? `translate3d(${transform.x + x}px, ${transform.y + y}px, 0)`
//       : `translate3d(${x}px, ${y}px, 0)`,
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       {...listeners}
//       {...attributes}
//       className="absolute z-50 w-32 h-12 border-2 border-green-600 bg-green-50/90 flex items-center justify-center cursor-move rounded shadow-xl select-none"
//     >
//       <span className="text-green-700 font-bold italic text-[10px] uppercase">
//         Sign Placement
//       </span>
//     </div>
//   );
// };

// export const PublicSignature = () => {
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const [doc, setDoc] = useState<any>(null);
  
//   // ✅ INITIAL POSITION: Start at a visible spot
//   const [pos, setPos] = useState({ x: 50, y: 50 }); 
//   const [loading, setLoading] = useState(false);
//   const [numPages, setNumPages] = useState<number | null>(null);
//   const [pageNumber, setPageNumber] = useState(1);

//   const sigCanvas = useRef<SignatureCanvas>(null);

//   useEffect(() => {
//     if (token) {
//       docAPI
//         .getByToken(token)
//         .then((res) => setDoc(res.data))
//         .catch(() => alert("Invalid or expired link"));
//     }
//   }, [token]);

//   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
//     setNumPages(numPages);
//   };

//   const handleDragEnd = (event: any) => {
//     const { delta } = event;
//     // ✅ BOUNDARY LOGIC: Keeps the badge inside the 600px width
//     setPos((prev) => ({
//       x: Math.min(Math.max(0, prev.x + delta.x), 472), // 600px - badge width (128px)
//       y: Math.max(0, prev.y + delta.y),
//     }));
//   };

//   const handleReject = async () => {
//     const reason = window.prompt("Please enter the reason for rejecting this document:");
//     if (!reason) return;

//     try {
//       setLoading(true);
//       await axios.post(`http://localhost:5000/api/signatures/public/reject/${doc._id}`, { reason });
//       alert("Document has been rejected. The owner will be notified.");
//       navigate("/login"); 
//     } catch (err: any) {
//       alert("Failed to reject document.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCompleteSigning = async () => {
//     if (!doc || !sigCanvas.current || sigCanvas.current.isEmpty()) {
//       return alert("Please provide a signature first.");
//     }

//     try {
//       setLoading(true);
//       const canvas = sigCanvas.current.getCanvas();
//       const signatureImage = canvas.toDataURL("image/png");

//       const saveRes = await fetch(
//         "http://localhost:5000/api/signatures/public",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             documentId: doc._id,
//             x: Math.round(pos.x),
//             y: Math.round(pos.y),
//             page: pageNumber,
//             signatureImage,
//           }),
//         }
//       );

//       if (!saveRes.ok) throw new Error("Error saving signature");

//       const finalizeRes = await fetch(
//         `http://localhost:5000/api/signatures/public/finalize/${doc._id}`,
//         { method: "POST" }
//       );

//       if (!finalizeRes.ok) throw new Error("Error finalizing PDF");

//       alert("Signed Successfully!");
//       window.location.href = "/";
//     } catch (err: any) {
//       alert(err.message || "Signing failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!doc) return <div className="p-20 text-center font-bold text-gray-400">Loading Document...</div>;

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
//       <aside className="w-full md:w-80 bg-white border-r p-6 shadow-xl flex flex-col justify-between">
//         <div>
//           <h1 className="text-xl font-black mb-4">{doc.title}</h1>
//           <div className="relative border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
//             <SignatureCanvas
//               ref={sigCanvas}
//               penColor="black"
//               canvasProps={{ width: 280, height: 150, className: "relative z-10" }}
//             />
//           </div>
//           <button onClick={() => sigCanvas.current?.clear()} className="text-red-500 text-xs mt-2 font-bold uppercase">
//             Clear Canvas
//           </button>
//         </div>

//         <div className="mt-8 space-y-3">
//           <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
//             <button 
//               disabled={pageNumber <= 1}
//               onClick={() => setPageNumber(prev => prev - 1)}
//               className="px-3 py-1 bg-white rounded shadow disabled:opacity-50 font-bold"
//             > ← </button>
//             <span className="text-xs font-bold uppercase text-gray-500">
//               Page {pageNumber} of {numPages || "..."}
//             </span>
//             <button 
//               disabled={pageNumber >= (numPages || 1)}
//               onClick={() => setPageNumber(prev => prev + 1)}
//               className="px-3 py-1 bg-white rounded shadow disabled:opacity-50 font-bold"
//             > → </button>
//           </div>

//           <div className="space-y-2">
//             <button
//               onClick={handleCompleteSigning}
//               disabled={loading}
//               className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
//             >
//               {loading ? "Processing..." : "Sign & Finalize"}
//             </button>
//             <button
//               onClick={handleReject}
//               disabled={loading}
//               className="w-full bg-white border-2 border-red-100 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 transition"
//             >
//               Reject Document
//             </button>
//           </div>
//         </div>
//       </aside>

//       <main className="flex-1 p-6 overflow-auto bg-gray-200 flex justify-center items-start">
//         <DndContext onDragEnd={handleDragEnd}>
//           {/* ✅ CRITICAL FIX: Fixed width and relative positioning */}
//           <div className="relative bg-white shadow-2xl h-fit" style={{ width: '600px' }}>
//             <Document
//               file={`http://localhost:5000/${doc.filePath.replace(/\\/g, "/")}`}
//               onLoadSuccess={onDocumentLoadSuccess}
//             >
//               <Page pageNumber={pageNumber} width={600} renderTextLayer={false} renderAnnotationLayer={false} />
//             </Document>

//             <SignatureBadge x={pos.x} y={pos.y} />
//           </div>
//         </DndContext>
//       </main>
//     </div>
//   );
// };