import { X, RefreshCw, Download, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ImportExport from './ImportExport';

export default function SettingsModal({ isOpen, onClose, onAutoCategorize, isProcessing, bookmarks, categories }) {
  const { logout } = useAuth();
  
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
            Settings
          </h3>
          <button 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Auto-Categorization
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Automatically categorize your bookmarks based on their content and URL patterns. This will categorize all bookmarks, including those that already have categories.
          </p>
          <button 
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed mb-4"
            onClick={onAutoCategorize}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Auto-Categorize All Bookmarks"
            )}
          </button>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Import & Export
          </h4>
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
        
        <div className="mb-2">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Account
          </h4>
          <button 
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
