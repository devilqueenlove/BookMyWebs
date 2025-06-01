import { X, RefreshCw, Download, LogOut, Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import ImportExport from './ImportExport';
import ThemeSelector from './ThemeSelector';

export default function SettingsModal({ isOpen, onClose, onAutoCategorize, isProcessing, bookmarks, categories }) {
  const { logout } = useAuth();
  const [themeExpanded, setThemeExpanded] = useState(false);
  const [importExportExpanded, setImportExportExpanded] = useState(false);
  const [categorizationExpanded, setCategorizationExpanded] = useState(false);
  const [accountExpanded, setAccountExpanded] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Failed to log out", error);
      alert("Failed to log out. Please try again.");
    }
  };
  if (!isOpen) return null;
  
  return isOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Settings</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="mb-4">
          <button 
            onClick={() => setCategorizationExpanded(!categorizationExpanded)}
            className="w-full flex items-center justify-between py-2 px-4 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <RefreshCw className="mr-2" size={18} />
              <h4 className="font-medium text-gray-700 dark:text-gray-300">
                Auto-Categorization
              </h4>
            </div>
            {categorizationExpanded ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
          
          {categorizationExpanded && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Automatically categorize your bookmarks based on their content and URL patterns.
                This will categorize all bookmarks, including those that already have categories.
              </p>
              <button 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={onAutoCategorize}
                disabled={isProcessing || bookmarks.length === 0}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={18} />
                    Processing...
                  </>
                ) : (
                  'Auto-Categorize All Bookmarks'
                )}
              </button>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <button 
            onClick={() => setThemeExpanded(!themeExpanded)}
            className="w-full flex items-center justify-between py-2 px-4 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <Palette className="mr-2" size={18} />
              <h4 className="font-medium text-gray-700 dark:text-gray-300">
                Themes & Appearance
              </h4>
            </div>
            {themeExpanded ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
          
          {themeExpanded && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Customize the look and feel of WebCity by choosing a theme that suits your style.
              </p>
              <ThemeSelector />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <button 
            onClick={() => setImportExportExpanded(!importExportExpanded)}
            className="w-full flex items-center justify-between py-2 px-4 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <Download className="mr-2" size={18} />
              <h4 className="font-medium text-gray-700 dark:text-gray-300">
                Import & Export
              </h4>
            </div>
            {importExportExpanded ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
          
          {importExportExpanded && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Import bookmarks from other browsers or export your current bookmarks for backup.
              </p>
              <ImportExport 
                bookmarks={bookmarks}
                categories={categories}
                onImportComplete={onClose}
                inModal={true}
              />
            </div>
          )}
        </div>
        
        <div className="mb-2">
          <button 
            onClick={() => setAccountExpanded(!accountExpanded)}
            className="w-full flex items-center justify-between py-2 px-4 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <LogOut className="mr-2" size={18} />
              <h4 className="font-medium text-gray-700 dark:text-gray-300">
                Account
              </h4>
            </div>
            {accountExpanded ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
          
          {accountExpanded && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <button 
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
