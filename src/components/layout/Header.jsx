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
    <header className="bg-primary text-accent-foreground p-3 md:p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="md:hidden mr-2 p-2 rounded-full hover:bg-primary-dark transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold flex items-center">
            <div className="mr-2">
              <img src="/logo.svg" alt="WebCity Logo" className="w-8 h-8" />
            </div>
            <span className="hidden sm:inline">WebCity</span>
            <span className="sm:hidden">WC</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search bookmarks..."
              className="py-2 px-4 pr-10 rounded-lg text-card-foreground bg-card border border-accent/20 w-64 focus:outline-none focus:ring-2 focus:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-accent/60" size={20} />
          </div>
          
          {/* Mobile search button */}
          <div className="md:hidden">
            <button 
              onClick={() => document.getElementById('mobileSearch').classList.toggle('hidden')}
              className="p-2 rounded-full hover:bg-accent/20 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-accent/20 transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={20} className="text-accent-3" /> : <Moon size={20} className="text-accent-3" />}
          </button>
          
          <button 
            onClick={onSettings}
            className="p-2 rounded-full hover:bg-accent/20 transition-colors"
            title="Settings"
          >
            <Settings size={20} className="text-accent-3" />
          </button>
          
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-sm hidden md:inline">
                {currentUser.email}
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center p-2 text-accent-foreground hover:bg-accent/20 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={18} className="mr-1" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="flex items-center bg-accent hover:bg-accent-dark px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-lg transition-colors"
            >
              <User size={16} className="mr-1 md:mr-2" />
              <span className="hidden xs:inline">Log In</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile search bar */}
      <div id="mobileSearch" className="mt-3 px-2 hidden md:hidden">
        <div className="relative">
          <input
            type="text"
            placeholder="Search bookmarks..."
            className="py-2 px-4 pr-10 rounded-lg text-card-foreground bg-card border border-accent/20 w-full focus:outline-none focus:ring-2 focus:ring-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-2.5 text-accent/60" size={20} />
        </div>
      </div>
    </header>
  );
}
