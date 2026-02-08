import { Search, LogOut, User, Moon, Sun, Menu, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({
  searchQuery,
  setSearchQuery,
  setShowAuthModal,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  currentUser,
  onSettings
}) {
  const { logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="bg-black/20 backdrop-blur-3xl border-b border-white/5 p-3 md:p-4 sticky top-0 z-40 transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between gap-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={20} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00f5ff] to-[#8b5cf6] flex items-center justify-center p-0.5 shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-transform duration-500 group-hover:rotate-12">
              <div className="w-full h-full bg-[#0E1116] rounded-[9px] flex items-center justify-center">
                <span className="font-black text-xs text-[#00f5ff]">BW</span>
              </div>
            </div>
            <h1 className="text-xl font-black tracking-tighter hidden sm:block">
              <span className="liquid-chrome-text">BookMyWebs</span>
            </h1>
          </div>
        </div>

        {/* Global Search Bar - Redesigned */}
        <div className="flex-1 max-w-xl relative hidden md:block group">
          <div className="absolute inset-0 bg-white/5 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 transition-all duration-300 group-focus-within:border-[#00f5ff]/30 group-focus-within:bg-black/40">
            <Search className="text-gray-500 mr-3" size={18} />
            <input
              type="text"
              placeholder="Search library..."
              className="bg-transparent border-none w-full text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="hidden lg:flex items-center gap-1 border border-white/10 px-1.5 py-0.5 rounded-md bg-white/5 ml-2">
              <span className="text-[10px] text-gray-500 font-mono">⌘</span>
              <span className="text-[10px] text-gray-500 font-mono">K</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Quick Actions Hidden on Mobile */}
          <div className="hidden sm:flex items-center gap-1 border-r border-white/10 pr-3 mr-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              title={isDark ? "Switch to light" : "Switch to dark"}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={onSettings}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              title="System Center"
            >
              <Settings size={20} />
            </button>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3 pl-1">
              <div className="hidden lg:block text-right">
                <p className="text-[11px] font-bold text-white leading-none mb-0.5">Verified User</p>
                <p className="text-[10px] text-gray-500 leading-none truncate max-w-[120px]">{currentUser.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 px-3 py-1.5 rounded-xl transition-all duration-300 text-xs font-bold text-gray-400 hover:text-red-400 group"
              >
                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="relative group overflow-hidden bg-white text-black px-6 py-2 rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            >
              <div className="relative z-10 flex items-center gap-2">
                <User size={16} />
                <span>Initialize</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <div id="mobileSearch" className="mt-3 px-2 hidden md:hidden animate-in slide-in-from-top-2 duration-300">
        <div className="relative bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent border-none text-white focus:outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="text-gray-500" size={18} />
        </div>
      </div>
    </header>
  );
}
