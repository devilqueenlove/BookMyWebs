import { Search, LogOut, User, Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  setShowAuthModal, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  currentUser 
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
    <header className="bg-gray-800 dark:bg-gray-900 text-white p-3 md:p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold flex items-center">
            <div className="mr-2 text-teal-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </div>
            <span className="hidden sm:inline">SaveMyWebs</span>
            <span className="sm:hidden">SMW</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search bookmarks..."
              className="py-2 px-4 pr-10 rounded-lg text-gray-800 dark:text-white dark:bg-gray-700 dark:border-gray-600 w-64 focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400" size={20} />
          </div>
          
          {/* Mobile search button */}
          <div className="md:hidden">
            <button 
              onClick={() => document.getElementById('mobileSearch').classList.toggle('hidden')}
              className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} />}
          </button>
          
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-sm hidden md:inline">
                {currentUser.email}
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="flex items-center bg-teal-600 hover:bg-teal-700 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-lg transition-colors"
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
            className="py-2 px-4 pr-10 rounded-lg text-gray-800 dark:text-white dark:bg-gray-700 dark:border-gray-600 w-full focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400" size={20} />
        </div>
      </div>
    </header>
  );
}
