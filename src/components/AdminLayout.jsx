import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Search, Link2, LogOut, User, Menu, X } from 'lucide-react';
import '../Admin.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const navItems = [
    { name: 'الإحصائيات', path: '/admin', icon: LayoutDashboard },
    { name: 'سجلات التحليل', path: '/admin/logs', icon: Search },
    { name: 'الكلمات المفتاحية', path: '/admin/keywords', icon: MessageSquare },
    { name: 'المصادر الموثوقة', path: '/admin/sources', icon: Link2 },
  ];

  return (
    <div className="admin-body">
      <div className={`admin-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`} dir="rtl">
        {/* Mobile Backdrop */}
        {isSidebarOpen && <div className="mobile-overlay" onClick={toggleSidebar} />}

        {/* Sidebar */}
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <ShieldCheck size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'white' }}>تحقق الإدارة</h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>نظام كشف التضليل</p>
            </div>
            <button className="sidebar-close-btn" onClick={toggleSidebar}>
              <X size={24} />
            </button>
          </div>
          
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link-premium ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <header className="admin-header">
            <div className="header-left">
              <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <Menu size={24} />
              </button>
              <div className="header-title">
                <h1>
                  {navItems.find(i => i.path === location.pathname)?.name || 'النشاط الحالي'}
                </h1>
                <p>مرحباً بعودتك إلى لوحة التحكم</p>
              </div>
            </div>
            
            <div className="user-profile">
              <div className="user-info">
                <p>مدير النظام</p>
                <p>متصل الآن</p>
              </div>
              <div className="user-avatar">
                <User size={20} />
              </div>
            </div>
          </header>
          
          <div className="animate-fade">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const ShieldCheck = ({ size, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default AdminLayout;
