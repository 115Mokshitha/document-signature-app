import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkStyle = (path: string) => {
    const isActive = location.pathname === path;
    return `block p-4 rounded-2xl transition-all font-bold ${
      isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
    }`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-xl">
        <div className="p-8 text-3xl font-extrabold text-blue-500 tracking-tighter italic">SignFlow</div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link to="/" className={getLinkStyle('/')}>Dashboard</Link>
          <Link to="/documents" className={getLinkStyle('/documents')}>Documents</Link>
          <Link to="/upload" className={getLinkStyle('/upload')}>Upload Document</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-left p-4 text-red-400 hover:bg-red-900/20 rounded-2xl transition-colors font-bold uppercase text-xs">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-20 bg-white border-b border-gray-100 px-10 flex items-center justify-end sticky top-0 z-10">
          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs uppercase">
              {user?.email?.charAt(0) || 'M'}
            </div>
            <span className="text-xs font-black uppercase tracking-tight text-gray-400">
              Welcome, <span className="text-blue-600 lowercase font-bold">{user?.email || 'User'}</span>
            </span>
          </div>
        </header>
        <main className="p-10 w-full"><Outlet /></main>
      </div>
    </div>
  );
};