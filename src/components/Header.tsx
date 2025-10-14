'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem } from '@/types';

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

  return (
    <header className="bg-gradient-to-r from-poker-dark via-poker-secondary to-poker-dark shadow-2xl sticky top-0 z-50 backdrop-blur-md border-b border-poker-primary/20">
      {/* Info Bar */}
      <div className="bg-gradient-to-r from-poker-primary to-poker-secondary text-white py-3 px-4 animate-slide-down">
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center text-sm space-y-2 lg:space-y-0">
          <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
            <div className="flex items-center space-x-2 animate-fade-in">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse opacity-80"></span>
              <span className="font-medium text-white/95">📍 9700 Szombathely, Semmelweis u. 2.</span>
            </div>
            <div className="flex items-center space-x-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="font-bold text-white text-lg bg-gradient-to-r from-green-200 to-white bg-clip-text text-transparent">
                📞 PALACE POKER: +36 30 971 5832
              </span>
            </div>
            <div className="flex items-center space-x-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <span className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></span>
              <span className="font-medium text-white/95">⚠️ Szerencsejátékban csak 18 éven felüliek vehetnek részt! A túlzásba vitt szerencsejáték ártalmas, függőséget okozhat! Kérje bejegyzését a játékosvédelmi nyilvántartásba! | Játékosvédelem: 
                <Link href="/jatekosvedelm" className="ml-1 text-poker-accent hover:text-white underline transition-colors">
                  36 80 205 352
                </Link>
              </span>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
            <div className="flex items-center space-x-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              <span className="font-medium text-white/95">🕒 Sze, P-Szo: 19:00-04:00</span>
            </div>
            <div className="flex space-x-3 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Link href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-poker-accent transition-all duration-300 transform hover:scale-110 hover:rotate-12">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-poker-accent transition-all duration-300 transform hover:scale-110 hover:-rotate-12">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-poker-accent transition-all duration-300 transform hover:scale-110">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center group animate-fade-in">
            <div className="relative w-20 h-20 bg-gradient-to-br from-poker-primary to-poker-secondary rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-300 animate-glow">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <span className="text-white font-bold text-2xl relative z-10 animate-bounce-subtle">♠</span>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-poker-gold rounded-full flex items-center justify-center">
                <span className="text-poker-dark font-bold text-xs">P</span>
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-white text-3xl font-bold bg-gradient-to-r from-white to-poker-accent bg-clip-text text-transparent group-hover:from-poker-accent group-hover:to-white transition-all duration-300">
                Palace Poker
              </h1>
              <p className="text-poker-accent text-sm font-medium tracking-wider">SZOMBATHELY </p>
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
            className="lg:hidden p-3 text-white hover:text-poker-accent transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm relative overflow-hidden group"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="relative z-10">
              <svg className={`w-6 h-6 transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-poker-primary/20 to-poker-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden glass-effect mb-6 animate-slide-down">
            <div className="p-3">
              {menuItems.map((item, index) => (
                <div key={item.id} className="mb-2">
                  {item.children ? (
                    <div>
                      <button
                        className="w-full flex items-center justify-between px-4 py-4 text-white hover:text-poker-accent hover:bg-white/10 transition-all duration-300 rounded-xl font-medium animate-fade-in"
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-poker-primary rounded-full mr-3"></span>
                          {item.label}
                        </div>
                        <svg className={`w-5 h-5 transform transition-transform duration-300 ${activeDropdown === item.id ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {activeDropdown === item.id && (
                        <div className="ml-6 mt-2 space-y-1 animate-slide-down">
                          {item.children.map((child, childIndex) => (
                            <Link
                              key={child.id}
                              href={child.href || '#'}
                              className="flex items-center px-4 py-3 text-white/80 hover:text-poker-accent hover:bg-white/5 transition-all duration-200 rounded-lg animate-fade-in"
                              onClick={() => setMobileMenuOpen(false)}
                              style={{animationDelay: `${childIndex * 0.1}s`}}
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
                      className="flex items-center px-4 py-4 text-white hover:text-poker-accent hover:bg-white/10 transition-all duration-300 rounded-xl font-medium animate-fade-in"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <span className="w-2 h-2 bg-poker-primary rounded-full mr-3"></span>
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}