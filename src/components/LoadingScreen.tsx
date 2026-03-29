'use client';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo / Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Palace Poker
          <span className="text-poker-primary block text-lg mt-1">Szombathely</span>
        </h1>

        {/* Poker Chips Animation */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Chip 1 - Red */}
          <div className="absolute inset-0 animate-spin-slow">
            <div 
              className="w-20 h-20 bg-red-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
              style={{ transform: 'translateX(40px)' }}
            >
              <div className="w-16 h-16 border-2 border-dashed border-white/50 rounded-full"></div>
            </div>
          </div>

          {/* Chip 2 - Blue */}
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '3s' }}>
            <div 
              className="w-20 h-20 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
              style={{ transform: 'rotate(120deg) translateX(40px)' }}
            >
              <div className="w-16 h-16 border-2 border-dashed border-white/50 rounded-full"></div>
            </div>
          </div>

          {/* Chip 3 - Green */}
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '4s' }}>
            <div 
              className="w-20 h-20 bg-green-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
              style={{ transform: 'rotate(240deg) translateX(40px)' }}
            >
              <div className="w-16 h-16 border-2 border-dashed border-white/50 rounded-full"></div>
            </div>
          </div>

          {/* Center Chip */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-poker-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-xs">PP</span>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-400 text-sm animate-pulse">
          Betöltés...
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-poker-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-poker-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-poker-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
