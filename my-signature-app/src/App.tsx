import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
// ✅ New High-Level Dashboard for stats
import { Dashboard } from './pages/Dashboard'; 
// ✅ Renamed 'Document' to 'Documents' (your earlier grid logic)
import { Documents } from './pages/Documents'; 
import { Upload } from './pages/Upload';
import { DocumentViewer } from './pages/DocumentViewer';
import { PublicSignature } from './pages/PublicSignature';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Public Auth Routes --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* --- External Client Signing Route --- */}
          <Route path="/public/:token" element={<PublicSignature />} />

          {/* --- Authenticated Protected Routes --- */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* ✅ Route 1: Main Landing (System Overview / Stats) */}
            <Route index element={<Dashboard />} />

            {/* ✅ Route 2: Document Management (The Grid/Vault) */}
            <Route path="documents" element={<Documents />} />

            {/* Route 3: File Upload Portal */}
            <Route path="upload" element={<Upload />} />

            {/* Route 4: Private Document Viewer */}
            <Route path="viewer/:id" element={<DocumentViewer />} />
          </Route>

          {/* --- Catch-all Redirect --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
