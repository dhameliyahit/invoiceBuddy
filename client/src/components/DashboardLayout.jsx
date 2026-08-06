import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User,
  CreditCard,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../../utils/api';

const base_url = BASE_URL;

const DashboardLayout = () => {
  const [profile, setProfile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }
        const res = await axios.get(`${base_url}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.user);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        if (err.response?.status === 401) {
          navigate("/");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Create Invoice', path: '/dashboard/invoice', icon: <FileText size={20} /> },
    { name: 'Productivity', path: '/dashboard/productivity', icon: <Target size={20} /> },
    { name: 'Business Config', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-[#19183B] text-white transition-all duration-300 flex flex-col shadow-xl z-30`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold truncate" style={{ fontFamily: "Playfair Display, cursive" }}>
              Invoice Buddy
            </h1>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-xl font-bold">IB</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-white/10 rounded-md transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  {item.icon}
                </div>
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                {!isSidebarOpen && (
                    <div className="absolute left-16 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        {item.name}
                    </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 w-full group relative"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
            {!isSidebarOpen && (
                <div className="absolute left-16 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    Logout
                </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hidden lg:block"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
              {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {profile.businessName || 'Business Owner'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile.email}
                  </p>
                </div>
                <img
                  src={profile.logo || `https://ui-avatars.com/api/?name=${String(profile.businessName || "Owner").replaceAll(' ', '+')}`}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
