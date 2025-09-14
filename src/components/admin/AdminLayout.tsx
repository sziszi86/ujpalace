'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAlert, AlertProvider } from './Alert';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  submenu?: MenuItem[];
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Hírek']); // Default expand Hírek
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const isAuthenticated = !!user;
  const isLoading = loading;

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Játékosok', href: '/admin/players', icon: '👤' },
    { name: 'Versenyek', href: '/admin/tournaments', icon: '🏆' },
    { name: 'Cash Games', href: '/admin/cash-games', icon: '💰' },
    { name: 'Struktúrák', href: '/admin/structures', icon: '📋' },
    { name: 'Bannerek', href: '/admin/banners', icon: '🖼️' },
    { 
      name: 'Hírek', 
      href: '/admin/news', 
      icon: '📰',
      submenu: [
        { name: 'Összes hír', href: '/admin/news', icon: '📝' },
        { name: 'Kategóriák', href: '/admin/news-categories', icon: '🗂️' }
      ]
    },
    { name: 'Rólunk', href: '/admin/about', icon: '🏢' },
    { name: 'Felhasználók', href: '/admin/users', icon: '👥' },
    { name: 'Galéria', href: '/admin/gallery', icon: '📸' },
  ];

  const toggleSubmenu = (menuName: string) => {
    if (expandedMenus.includes(menuName)) {
      setExpandedMenus(expandedMenus.filter(name => name !== menuName));
    } else {
      setExpandedMenus([...expandedMenus, menuName]);
    }
  };

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.submenu) {
      return item.submenu.some(subitem => pathname === subitem.href);
    }
    return pathname === item.href;
  };

  const isSubmenuActive = (href: string): boolean => {
    return pathname === href;
  };

  const handleLogout = async () => {
    await logout();
  };

  // Don't redirect here - let the middleware handle authentication redirects

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">
            {sidebarOpen ? 'Admin' : 'A'}
          </h2>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-poker-green hover:text-white transition-colors ${
                      isMenuActive(item) ? 'bg-poker-green text-white' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl">{item.icon}</span>
                      {sidebarOpen && (
                        <span className="ml-3">{item.name}</span>
                      )}
                    </div>
                    {sidebarOpen && (
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedMenus.includes(item.name) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  {sidebarOpen && expandedMenus.includes(item.name) && (
                    <div className="bg-gray-50">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className={`flex items-center px-8 py-2 text-sm text-gray-600 hover:bg-poker-green hover:text-white transition-colors ${
                            isSubmenuActive(subitem.href) ? 'bg-poker-green text-white' : ''
                          }`}
                        >
                          <span className="text-base mr-3">{subitem.icon}</span>
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-poker-green hover:text-white transition-colors ${
                    isMenuActive(item) ? 'bg-poker-green text-white' : ''
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {isAuthenticated && user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Üdv, <strong>{user.username}</strong>!
                </span>
                <Link
                  href="/"
                  className="text-poker-green hover:text-poker-darkgreen flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Oldal megtekintése
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Kijelentkezés
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AlertProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AlertProvider>
  );
}