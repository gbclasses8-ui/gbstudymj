import React from 'react';
import { Search, Send, Heart } from 'lucide-react';
import { APP_LOGO } from '../services/api';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  enrolledCount: number;
  onOpenSearch: () => void;
  onOpenTelegramModal: () => void;
  isHome: boolean;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  enrolledCount,
  onOpenSearch,
  onOpenTelegramModal,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full pink-glass-nav border-b border-pink-500/20 px-3.5 sm:px-6">
      <div className="max-w-7xl mx-auto h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo and Brand (Matches Screenshot 2) */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0 select-none group"
          onClick={onGoHome}
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-pink-500/40 p-0.5 bg-black shadow-[0_0_15px_rgba(236,72,153,0.35)] shrink-0 group-hover:scale-105 transition-transform">
            <img src={APP_LOGO} alt="GB STUDY" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-xl tracking-tight text-white leading-none">
                GB <span className="text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">STUDY</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-pink-300/80 font-medium tracking-tight mt-0.5 hidden xs:block">
              Free Batches, Lectures &amp; Notes
            </p>
          </div>
        </div>

        {/* Center Search Bar (Desktop / Laptop only) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full bg-[#160c1d] hover:bg-[#20102b] border border-pink-500/25 hover:border-pink-500/50 rounded-2xl px-4 py-2.5 text-sm text-gray-400 flex items-center justify-between transition-all group shadow-inner cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-pink-400 group-hover:text-pink-300 transition-colors shrink-0" />
              <span className="truncate">Search batches, subjects, lectures &amp; notes...</span>
            </div>
            <kbd className="hidden lg:inline-block text-[10px] font-semibold text-pink-300 bg-pink-950/60 border border-pink-500/30 px-1.5 py-0.5 rounded shrink-0">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Navigation Icons (Matches Mobile Screenshot 2: Search, Heart, Live Dot, Telegram) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Search Button (Mobile/Tablet) */}
          <button
            onClick={onOpenSearch}
            className="w-10 h-10 rounded-full bg-[#180a20] border border-pink-500/25 text-pink-300 hover:text-white hover:border-pink-500/50 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            aria-label="Search"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Saved / Favorites Heart Button (Matches Screenshot 2) */}
          <button
            onClick={() => onTabChange('enrolled')}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer relative active:scale-95 ${
              currentTab === 'enrolled'
                ? 'bg-pink-500/25 border-pink-500 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                : 'bg-[#180a20] border-pink-500/25 text-pink-300 hover:text-white hover:border-pink-500/50'
            }`}
            aria-label="Saved Batches"
            title="Saved Batches"
          >
            <Heart
              className={`w-4 h-4 ${
                currentTab === 'enrolled' ? 'fill-pink-500 text-pink-500' : 'text-pink-300'
              }`}
            />
            {enrolledCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-pink-500 text-white text-[9px] font-black flex items-center justify-center shadow-md">
                {enrolledCount}
              </span>
            )}
          </button>

          {/* Live indicator dot (Matches Screenshot 2) */}
          <div
            className="w-10 h-10 rounded-full bg-[#180a20] border border-pink-500/25 flex items-center justify-center relative cursor-pointer"
            title="Live Sessions Available"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
            <span className="absolute w-2.5 h-2.5 rounded-full bg-pink-500" />
          </div>

          {/* Telegram Pill Button (Matches Screenshot 2: [ ✈ Telegram ]) */}
          <button
            onClick={onOpenTelegramModal}
            className="btn-pink-primary min-h-[40px] py-2 px-3 sm:px-4 rounded-full text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.4)] cursor-pointer shrink-0 active:scale-95"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Telegram</span>
          </button>
        </div>
      </div>
    </header>
  );
};
