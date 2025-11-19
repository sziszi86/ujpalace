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

const isFirefox = () => {
  if (typeof window === 'undefined') return false;
  return /Firefox/i.test(navigator.userAgent);
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
  const [hasScrolledOnAndroid, setHasScrolledOnAndroid] = useState(false);
  const [isFirefoxBrowser, setIsFirefoxBrowser] = useState(false);

  useEffect(() => {
    // Check device types
    setIsAndroidDevice(isAndroid());
    setIsMobile(isMobileDevice());
    setIsFirefoxBrowser(isFirefox());

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);
      
      // On Android, permanently hide after first scroll
      if (isAndroid() && scrollY > 100 && !hasScrolledOnAndroid) {
        setHasScrolledOnAndroid(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolledOnAndroid]);

  useEffect(() => {
    if (mobileMenuOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      
      // Prevent touch events on body
      const preventDefault = (e: TouchEvent) => {
        const target = e.target as Element;
        const isMenuContent = target.closest('[data-mobile-menu]');
        if (!isMenuContent) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('touchmove', preventDefault, { passive: false });
      
      return () => {
        document.removeEventListener('touchmove', preventDefault);
        
        // Restore scroll position
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        
        window.scrollTo(0, scrollY);
      };
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
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
    <header className={`bg-gradient-to-r from-poker-dark via-poker-secondary to-poker-dark shadow-2xl sticky top-0 z-50 border-b border-poker-primary/20 ${isFirefoxBrowser && isMobile ? '' : 'backdrop-blur-md'}`}>
      {/* Info Bar */}
      <div 
        className={`bg-gradient-to-r from-poker-primary to-poker-secondary text-white px-4 lg:block overflow-hidden ${
          isAndroidDevice 
            ? `${hasScrolledOnAndroid ? 'hidden' : 'block py-3'}` 
            : `transition-all duration-500 ease-in-out transform origin-top ${isScrolled ? 'h-0 py-0 opacity-0 -translate-y-full scale-y-0' : 'h-auto py-3 opacity-100 translate-y-0 scale-y-100'}`
        }`}
        style={isAndroidDevice ? { 
          willChange: 'auto',
          transition: 'none',
          transform: 'none'
        } : { 
          willChange: 'transform, opacity, height' 
        }}
      >
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center text-sm space-y-2 lg:space-y-0">
          <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
            <div className={`flex items-center space-x-2 ${isAndroidDevice ? '' : 'animate-fade-in'}`}>
              <span className={`w-2 h-2 bg-white rounded-full opacity-80 ${isAndroidDevice ? '' : 'animate-pulse'}`}></span>
              <span className="font-medium text-white/95">📍 9700 Szombathely, Semmelweis u. 2.</span>
            </div>
            <div className={`flex items-center space-x-2 ${isAndroidDevice ? '' : 'animate-fade-in'}`} style={!isAndroidDevice ? {animationDelay: '0.1s'} : undefined}>
              <span className={`w-2 h-2 bg-green-400 rounded-full ${isAndroidDevice ? '' : 'animate-pulse'}`}></span>
              <span className="font-bold text-white text-lg bg-gradient-to-r from-green-200 to-white bg-clip-text text-transparent">
                📞 +36 30 971 5832
              </span>
            </div>
            <div className={`flex items-center space-x-2 flex-1 max-w-none ${isAndroidDevice ? '' : 'animate-fade-in'}`} style={!isAndroidDevice ? {animationDelay: '0.2s'} : undefined}>
              <span className={`w-2 h-2 bg-orange-300 rounded-full ${isAndroidDevice ? '' : 'animate-pulse'}`}></span>
              <span className="font-medium text-white/95 text-xs lg:text-sm leading-tight">⚠️ Szerencsejátékban csak 18 éven felüliek vehetnek részt! A túlzásba vitt szerencsejáték ártalmas, függőséget okozhat! Kérje bejegyzését a játékosvédelmi nyilvántartásba! | Játékosvédelem:<Link href="/jatekosvedelm" className="ml-1 text-poker-accent hover:text-white underline transition-colors">36 80 205 352</Link></span>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
            <div className={`flex space-x-3 ${isAndroidDevice ? '' : 'animate-fade-in'}`} style={!isAndroidDevice ? {animationDelay: '0.6s'} : undefined}>
              <Link 
                href="https://www.facebook.com/PalacePokerClubSzombathely" 
                className={`p-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-poker-accent ${!isAndroidDevice ? 'transition-all duration-300 transform hover:scale-110 hover:rotate-12' : ''}`}
                style={isAndroidDevice ? { 
                  transition: 'none',
                  transform: 'none'
                } : {}}
              >
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
        <div 
          className={`flex justify-between items-center ${isScrolled ? 'py-3 lg:py-6' : 'py-6'}`}
          style={isAndroidDevice ? { 
            willChange: 'auto',
            transition: 'none',
            height: 'auto',
            padding: isScrolled ? '0.75rem 0' : '1.5rem 0'
          } : { 
            willChange: 'height, padding',
            transition: 'all 300ms'
          }}
        >
          {/* Logo */}
          <Link href="/" className={`flex items-center group ${!isAndroidDevice ? 'animate-fade-in' : ''}`}>
            <div 
              className={`relative flex items-center justify-center ${isScrolled ? 'w-12 h-12 lg:w-20 lg:h-20' : 'w-20 h-20'}`}
              style={isAndroidDevice ? { 
                transform: 'none', 
                willChange: 'auto',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              } : { 
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/logo.png"
                alt="Palace Poker Logo"
                width={isScrolled ? 48 : 80}
                height={isScrolled ? 48 : 80}
                className={`object-contain lg:w-20 lg:h-20 ${!isAndroidDevice ? 'transform group-hover:scale-105 transition-all duration-300' : ''}`}
                priority
                style={isAndroidDevice ? { 
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                } : {}}
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
              setMobileMenuOpen(!mobileMenuOpen);
              setActiveDropdown(null);
            }}
            style={isAndroidDevice ? { 
              willChange: 'auto',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            } : {}}
          >
            <div className="relative z-10">
              <svg 
                className={`w-6 h-6 ${!isAndroidDevice ? `transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-45' : ''}` : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={isAndroidDevice ? { transform: 'none' } : {}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </div>
            {!isAndroidDevice && (
              <div className="absolute inset-0 bg-gradient-to-r from-poker-primary/20 to-poker-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            )}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Navigation Sidebar */}
        <nav 
          data-mobile-menu 
          className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-poker-dark to-poker-secondary z-50 ${!isAndroidDevice ? 'transform transition-transform duration-300 ease-in-out' : ''} ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } shadow-2xl flex flex-col`}
          style={isAndroidDevice ? {
            height: '100dvh',
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            willChange: 'auto'
          } : {
            height: '100dvh'
          }}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-poker-gold/20 rounded-lg flex items-center justify-center">
                <span className="text-poker-gold text-xl">♠</span>
              </div>
              <span className="text-white font-bold text-lg">Palace Poker</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-white hover:text-poker-accent rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Content */}
          <div 
            className="flex-1 overflow-y-auto py-4" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="px-4 space-y-2">
              {menuItems.map((item, index) => (
                <div key={item.id}>
                  {item.children ? (
                    <div>
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 text-white hover:text-poker-accent hover:bg-white/5 rounded-lg font-medium transition-colors"
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                      >
                        <span>{item.label}</span>
                        <svg className={`w-4 h-4 transform transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {activeDropdown === item.id && (
                        <div className="pl-4 py-2 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href || '#'}
                              className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded text-sm transition-colors"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className="block px-4 py-3 text-white hover:text-poker-accent hover:bg-white/5 rounded-lg font-medium transition-colors"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setActiveDropdown(null);
                      }}
                    >
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