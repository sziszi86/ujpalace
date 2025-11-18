'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem } from '@/types';

// Detect mobile devices
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};

const menuItems: MenuItem[] = [
  { id: 'home', label: 'Főoldal', href: '/' },
  {
    id: 'tournaments',
    label: 'Versenyek',
    href: '/tournaments',
    children: [
      { id: 'tournament-calendar', label: 'Versenynaptár', href: '/tournaments' },
      { id: 'tournament-list', label: 'Lista nézet', href: '/tournaments/list' },
    ],
  },
  {
    id: 'cash-games',
    label: 'Cash Game',
    href: '/cash-games',
    children: [
      { id: 'cash-calendar', label: 'Naptár', href: '/cash-games' },
      { id: 'cash-list', label: 'Lista nézet', href: '/cash-games/list' },
    ],
  },
  { id: 'about', label: 'Rólunk', href: '/rolunk' },
  { id: 'gallery', label: 'Galéria', href: '/gallery' },
  { id: 'blog', label: 'Hírek', href: '/blog' },
  { id: 'player-protection', label: 'Játékosvédelem', href: '/jatekosvedelm' },
  { id: 'contact', label: 'Kapcsolat', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuTransitioning, setIsMenuTransitioning] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check device types
    setIsAndroidDevice(isAndroid());
    setIsMobile(isMobileDevice());

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      // For all mobile devices - prevent body scroll and touch actions
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.touchAction = 'none';

      // Add event listeners to prevent scroll
      const preventTouchMove = (e: TouchEvent) => {
        // Allow scrolling only within the menu container
        const target = e.target as Element;
        const menuContainer = target.closest('[data-mobile-menu]');
        const menuInner = target.closest('.glass-effect');
        
        if (!menuContainer || !menuInner) {
          e.preventDefault();
        }
      };

      const preventWheel = (e: WheelEvent) => {
        // Allow scrolling only within the menu container
        const target = e.target as Element;
        const menuContainer = target.closest('[data-mobile-menu]');
        const menuInner = target.closest('.glass-effect');
        
        if (!menuContainer || !menuInner) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      document.addEventListener('wheel', preventWheel, { passive: false });

      return () => {
        document.removeEventListener('touchmove', preventTouchMove);
        document.removeEventListener('wheel', preventWheel);
      };
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const mobileMenu = document.querySelector('[data-mobile-menu]');
      const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
      
      if (mobileMenuOpen && mobileMenu && !mobileMenu.contains(target) && !mobileMenuButton?.contains(target)) {
        if (!isMenuTransitioning) {
          setIsMenuTransitioning(true);
          setMobileMenuOpen(false);
          setTimeout(() => setIsMenuTransitioning(false), 500);
        }
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen, isMenuTransitioning]);

  return (
    <header className="bg-gradient-to-r from-poker-dark via-poker-secondary to-poker-dark shadow-2xl sticky top-0 z-50 backdrop-blur-md border-b border-poker-primary/20">
      {/* Info Bar */}
      <div className={`bg-gradient-to-r from-poker-primary to-poker-secondary text-white px-4 transition-all duration-500 ease-in-out transform origin-top lg:block ${isScrolled ? 'h-0 py-0 opacity-0 -translate-y-full scale-y-0' : 'h-auto py-3 opacity-100 translate-y-0 scale-y-100'} overflow-hidden`}>
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center text-sm space-y-2 lg:space-y-0">
          <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
            <div className="flex items-center space-x-2 animate-fade-in">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse opacity-80"></span>
              <span className="font-medium text-white/95">📍 9700 Szombathely, Semmelweis u. 2.</span>
            </div>
            <div className="flex items-center space-x-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="font-bold text-white text-lg bg-gradient-to-r from-green-200 to-white bg-clip-text text-transparent">
                📞 +36 30 971 5832
              </span>
            </div>
            <div className="flex items-center space-x-2 animate-fade-in flex-1 max-w-none" style={{animationDelay: '0.2s'}}>
              <span className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></span>
              <span className="font-medium text-white/95 text-xs lg:text-sm leading-tight">⚠️ Szerencsejátékban csak 18 éven felüliek vehetnek részt! A túlzásba vitt szerencsejáték ártalmas, függőséget okozhat! Kérje bejegyzését a játékosvédelmi nyilvántartásba! | Játékosvédelem:<Link href="/jatekosvedelm" className="ml-1 text-poker-accent hover:text-white underline transition-colors">36 80 205 352</Link></span>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
            <div className="flex space-x-3 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Link href="https://www.facebook.com/PalacePokerClubSzombathely" className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-poker-accent transition-all duration-300 transform hover:scale-110 hover:rotate-12">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'py-3 lg:py-6' : 'py-6'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center group animate-fade-in">
            <div className={`relative flex items-center justify-center ${!isAndroidDevice ? 'transform group-hover:scale-105 transition-all duration-300' : ''} ${isScrolled ? 'w-12 h-12 lg:w-20 lg:h-20' : 'w-20 h-20'}`}>
              <Image
                src="/images/logo.png"
                alt="Palace Poker Logo"
                width={isScrolled ? 48 : 80}
                height={isScrolled ? 48 : 80}
                className="object-contain lg:w-20 lg:h-20"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
            {menuItems.map((item, index) => (
              <div key={item.id} className="relative group">
                {item.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={item.href || '#'}
                      className="px-6 py-3 text-white font-medium hover:text-poker-accent cursor-pointer transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm relative overflow-hidden group flex items-center"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <span className="relative z-10 flex items-center">
                        {item.label}
                        <svg className={`w-4 h-4 ml-2 transform transition-transform duration-300 ${activeDropdown === item.id ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-poker-primary/20 to-poker-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </Link>
                    {activeDropdown === item.id && (
                      <div className="absolute top-full left-0 pt-2 w-56 z-50">
                        <div className="glass-effect animate-slide-down">
                          <div className="p-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href || '#'}
                              className="flex items-center px-4 py-3 text-white hover:text-poker-accent hover:bg-white/10 transition-all duration-200 rounded-lg group/item"
                            >
                              <span className="w-2 h-2 bg-poker-primary rounded-full mr-3 group-hover/item:bg-poker-accent transition-colors duration-200"></span>
                              {child.label}
                            </Link>
                          ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className="px-6 py-3 text-white font-medium hover:text-poker-accent transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm relative overflow-hidden group animate-fade-in"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-poker-primary/20 to-poker-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            data-mobile-menu-button
            className={`lg:hidden p-3 text-white hover:text-poker-accent rounded-xl hover:bg-white/10 backdrop-blur-sm relative overflow-hidden group ${!isAndroidDevice ? 'transition-all duration-300' : ''}`}
            onClick={() => {
              if (!isMenuTransitioning) {
                if (!isMobile) {
                  setIsMenuTransitioning(true);
                  setMobileMenuOpen(!mobileMenuOpen);
                  setTimeout(() => setIsMenuTransitioning(false), 300);
                } else {
                  setMobileMenuOpen(!mobileMenuOpen);
                }
              }
            }}
            disabled={!isMobile && isMenuTransitioning}
          >
            <div className="relative z-10">
              <svg className={`w-6 h-6 ${!isAndroidDevice ? 'transform transition-all duration-300' : ''} ${mobileMenuOpen ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-poker-primary/20 to-poker-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav 
          data-mobile-menu 
          className={`lg:hidden glass-effect mb-6 ${isMobile ? 'transition-none' : 'transition-all duration-300 ease-in-out transform origin-top'} ${mobileMenuOpen ? 'max-h-screen opacity-100 translate-y-0 scale-y-100 pointer-events-auto' : 'max-h-0 opacity-0 -translate-y-4 scale-y-0 pointer-events-none'}`} 
          style={{
            position: mobileMenuOpen ? 'fixed' : 'static',
            top: mobileMenuOpen ? '0' : 'auto',
            left: mobileMenuOpen ? '0' : 'auto',
            right: mobileMenuOpen ? '0' : 'auto',
            bottom: mobileMenuOpen ? '0' : 'auto',
            zIndex: mobileMenuOpen ? 9999 : 'auto',
            overflowY: mobileMenuOpen ? 'auto' : 'hidden',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            background: mobileMenuOpen ? 'rgba(0,0,0,0.95)' : 'transparent',
            paddingTop: mobileMenuOpen ? '120px' : '0'
          }}
          onTouchMove={(e) => {
            if (mobileMenuOpen) {
              e.stopPropagation();
            }
          }}
        >
          <div 
            className={`glass-effect mx-4 my-4 rounded-2xl ${isAndroidDevice ? 'transition-none' : 'transition-all duration-300 delay-75'} ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
            style={{
              maxHeight: mobileMenuOpen ? '70vh' : '0',
              overflowY: mobileMenuOpen ? 'auto' : 'hidden',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y'
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="p-3">
              {menuItems.map((item, index) => (
                <div key={item.id} className="mb-2">
                  {item.children ? (
                    <div>
                      <button
                        className={`w-full flex items-center justify-between px-4 py-4 text-white hover:text-poker-accent hover:bg-white/10 rounded-xl font-medium ${isAndroidDevice ? 'transition-none' : 'transition-all duration-300 animate-fade-in'}`}
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                        style={!isAndroidDevice ? {animationDelay: `${index * 0.1}s`} : {}}
                      >
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-poker-primary rounded-full mr-3"></span>
                          {item.label}
                        </div>
                        <svg className={`w-5 h-5 ${isAndroidDevice ? '' : 'transform transition-transform duration-300'} ${activeDropdown === item.id ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {activeDropdown === item.id && (
                        <div className={`ml-6 mt-2 space-y-1 ${isAndroidDevice ? '' : 'animate-slide-down'}`}>
                          {item.children.map((child, childIndex) => (
                            <Link
                              key={child.id}
                              href={child.href || '#'}
                              className={`flex items-center px-4 py-3 text-white/80 hover:text-poker-accent hover:bg-white/5 rounded-lg ${isAndroidDevice ? 'transition-none' : 'transition-all duration-200 animate-fade-in'}`}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                              style={!isAndroidDevice ? {animationDelay: `${childIndex * 0.1}s`} : {}}
                            >
                              <span className="w-1.5 h-1.5 bg-poker-accent rounded-full mr-3"></span>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className={`flex items-center px-4 py-4 text-white hover:text-poker-accent hover:bg-white/10 rounded-xl font-medium ${isAndroidDevice ? 'transition-none' : 'transition-all duration-300 animate-fade-in'}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setActiveDropdown(null);
                      }}
                      style={!isAndroidDevice ? {animationDelay: `${index * 0.1}s`} : {}}
                    >
                      <span className="w-2 h-2 bg-poker-primary rounded-full mr-3"></span>
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}