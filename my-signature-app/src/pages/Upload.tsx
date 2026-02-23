import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { docAPI } from '../api';

export const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file first.");

    const formData = new FormData();
    
    /**
     * KEY FIXES FOR YOUR BACKEND:
     * 1. 'file' matches upload.single("file") in docRoutes.js
     * 2. 'title' matches req.body.title in docController.js
     */
    formData.append('file', file); 
    formData.append('title', file.name.replace('.pdf', '')); 

    try {
      setLoading(true);
      await docAPI.upload(formData);
      
      // Redirect to dashboard on success
      navigate('/'); 
    } catch (err: any) {
      console.error("Upload Error Details:", err.response?.data);
      
      // Detailed error alert to help you debug
      const errorMessage = err.response?.data?.message || "Upload failed. Please check backend terminal.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Upload Document</h2>
          <p className="text-gray-500 mt-2">Add a new PDF to your signature queue</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-8">
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
              file ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-400'
            }`}
          >
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden" 
              id="pdf-upload" 
            />
            <label htmlFor="pdf-upload" className="cursor-pointer block">
              <div className="text-4xl mb-4">{file ? '📄' : '☁️'}</div>
              <div className="text-blue-600 font-bold text-lg mb-1">
                {file ? "File Ready" : "Select PDF Document"}
              </div>
              <p className="text-sm text-gray-400 truncate px-4">
                {file ? file.name : "Click to browse your files"}
              </p>
            </label>
            
            {file && (
              <button 
                type="button" 
                onClick={() => setFile(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading || !file}
            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
              loading || !file 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : "Upload and Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};