import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sun, Moon, Home, LogOut, History } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateBSD from './pages/CreateBSD';
import CreateSite from './pages/CreateSite';
import SiteBSDs from './pages/SiteBSDs';
import AllBSDs from './pages/AllBSDs';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function Sidebar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  if (!token) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-full z-40 group">
      {/* Sidebar Container */}
      <div className="h-full w-16 group-hover:w-64 glass-card rounded-none border-y-0 border-l-0 border-r border-purple-200/20 dark:border-purple-800/20 transition-all duration-300 flex flex-col items-center py-8 overflow-hidden shadow-2xl">
        
        {/* Logo / Top Icon */}
        <div className="mb-12 p-3 bg-purple-700 rounded-2xl shadow-lg">
          <Home className="text-white" size={24} />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 w-full px-2 space-y-4">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-600 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-400 transition-all group/item"
          >
            <Home size={24} className="min-w-[24px]" />
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Accueil</span>
          </Link>
          <Link 
            to="/all-bsds" 
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-600 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-400 transition-all group/item"
          >
            <History size={24} className="min-w-[24px]" />
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Historique Global</span>
          </Link>
        </nav>

        {/* Bottom Actions */}
        <div className="w-full px-2 pb-8">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-all group/logout"
          >
            <LogOut size={24} className="min-w-[24px]" />
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <BrowserRouter>
      <div className={`${isDarkMode ? 'dark' : ''} min-h-screen relative transition-colors duration-300`}>
        <div className="animated-bg" />
        
        <Sidebar />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="fixed top-6 right-6 z-50 p-3 glass-card rounded-2xl hover:scale-110 active:scale-95 transition-all text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50 shadow-lg"
          title={isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        {/* Main Content with padding for sidebar only if logged in */}
        <main className={localStorage.getItem('token') ? 'pl-16' : ''}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password/request" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/create-bsd/:siteId" 
              element={
                <PrivateRoute>
                  <CreateBSD />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/create-site" 
              element={
                <PrivateRoute>
                  <CreateSite />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/site-bsds/:siteId" 
              element={
                <PrivateRoute>
                  <SiteBSDs />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/all-bsds" 
              element={
                <PrivateRoute>
                  <AllBSDs />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
