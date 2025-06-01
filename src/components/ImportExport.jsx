// src/components/ImportExport.jsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { 
  convertToHTML, 
  convertToJSON, 
  convertToCSV,
  parseHTMLBookmarks,
  parseJSONBookmarks,
  parseCSVBookmarks
} from '../utils/bookmarkConverter';
import { Download, Upload, FileText, Loader } from 'lucide-react';

export default function ImportExport({ bookmarks, categories, onImportComplete, inModal = false }) {
  const { currentUser } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importFormat, setImportFormat] = useState('html');
  const [exportFormat, setExportFormat] = useState('html');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('export'); // Default to export tab
  
  // Handle export
  const handleExport = () => {
    if (!bookmarks.length) {
      return alert('You have no bookmarks to export');
    }
    
    setIsExporting(true);
    
    let data;
    let filename;
    let mimeType;
    
    try {
      switch(exportFormat) {
        case 'html':
          data = convertToHTML(bookmarks, categories);
          filename = 'savemywebs-bookmarks.html';
          mimeType = 'text/html';
          break;
        case 'json':
          data = convertToJSON(bookmarks);
          filename = 'savemywebs-bookmarks.json';
          mimeType = 'application/json';
          break;
        case 'csv':
          data = convertToCSV(bookmarks);
          filename = 'savemywebs-bookmarks.csv';
          mimeType = 'text/csv';
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      // Create a download link
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export bookmarks: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle import file selection
  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Reset status
    setImportError('');
    setImportSuccess('');
    setIsImporting(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          let importedBookmarks = [];
          
          // Parse based on format
          if (importFormat === 'html' || file.name.endsWith('.html')) {
            importedBookmarks = parseHTMLBookmarks(content);
          } else if (importFormat === 'json' || file.name.endsWith('.json')) {
            importedBookmarks = parseJSONBookmarks(content);
          } else if (importFormat === 'csv' || file.name.endsWith('.csv')) {
            importedBookmarks = parseCSVBookmarks(content);
          } else {
            throw new Error('Unsupported file format');
          }
          
          if (importedBookmarks.length === 0) {
            throw new Error('No valid bookmarks found in the file');
          }
          
          // Check for duplicates before importing
          const userBookmarksRef = collection(db, 'bookmarks');
          const q = query(userBookmarksRef, where("userId", "==", currentUser.uid));
          const snapshot = await getDocs(q);
          const existingUrls = new Set(snapshot.docs.map(doc => doc.data().url));
          
          // Filter out duplicates
          const newBookmarks = importedBookmarks.filter(b => !existingUrls.has(b.url));
          const duplicates = importedBookmarks.length - newBookmarks.length;
          
          // Add new categories to user's categories
          const newCategories = new Set(newBookmarks.map(b => b.category));
          const userCategoriesRef = collection(db, 'categories');
          const categoriesQuery = query(userCategoriesRef, where("userId", "==", currentUser.uid));
          const categoriesSnapshot = await getDocs(categoriesQuery);
          
          if (categoriesSnapshot.empty) {
            // If user has no categories collection yet, create one
            await addDoc(userCategoriesRef, {
              userId: currentUser.uid,
              categories: Array.from(newCategories)
            });
          } else {
            // Update existing categories
            const existingCategories = categoriesSnapshot.docs[0].data().categories;
            const combinedCategories = [...new Set([...existingCategories, ...newCategories])];
            
            // Only update if there are new categories
            if (combinedCategories.length > existingCategories.length) {
              await updateDoc(categoriesSnapshot.docs[0].ref, {
                categories: combinedCategories
              });
            }
          }
          
          // Add bookmarks to Firestore
          let addedCount = 0;
          for (const bookmark of newBookmarks) {
            await addDoc(userBookmarksRef, {
              ...bookmark,
              userId: currentUser.uid,
              dateAdded: bookmark.dateAdded || new Date().toISOString()
            });
            addedCount++;
          }
          
          // Update success message
          setImportSuccess(`Successfully imported ${addedCount} bookmarks. ${duplicates > 0 ? `${duplicates} duplicates were skipped.` : ''}`);
          
          // Notify parent component to refresh bookmarks
          if (addedCount > 0 && onImportComplete) {
            onImportComplete();
          }
        } catch (error) {
          console.error('Import parsing error:', error);
          setImportError(`Failed to import bookmarks: ${error.message}`);
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.onerror = () => {
        setImportError('Error reading file');
        setIsImporting(false);
      };
      
      // Read the file
      if (importFormat === 'html' || file.name.endsWith('.html')) {
        reader.readAsText(file);
      } else if (importFormat === 'json' || file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else if (importFormat === 'csv' || file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        throw new Error('Unsupported file format');
      }
    } catch (error) {
      console.error('Import file error:', error);
      setImportError(`Failed to import: ${error.message}`);
      setIsImporting(false);
    }
    
    // Reset the file input
    event.target.value = null;
  };
  
  if (!currentUser) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-300">Please log in to import or export bookmarks.</p>
      </div>
    );
  }
  
  // Use a tabbed interface for a cleaner UX in the modal
  return (
    <div className="w-full">
      {!inModal && <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Import & Export</h2>}
      
      {/* Tab Navigation */}
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'export' 
            ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400' 
            : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'}`}
          onClick={() => setActiveTab('export')}
        >
          <Download size={16} className="inline mr-2" />
          Export
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'import' 
            ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400' 
            : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'}`}
          onClick={() => setActiveTab('import')}
        >
          <Upload size={16} className="inline mr-2" />
          Import
        </button>
      </div>
      
      {/* Export Tab Content */}
      {activeTab === 'export' && (
        <div className="py-2">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
            <div className="flex gap-3">
              {['html', 'json', 'csv'].map((format) => (
                <label key={format} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
                    checked={exportFormat === format}
                    onChange={() => setExportFormat(format)}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {format.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {exportFormat === 'html' ? 'Compatible with most web browsers' : 
               exportFormat === 'json' ? 'For developers or advanced users' : 
               'Compatible with spreadsheet applications'}
            </p>
          </div>
          
          <button 
            onClick={handleExport}
            disabled={isExporting || !bookmarks.length}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-md text-white ${
              bookmarks.length ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-400 cursor-not-allowed'
            } transition-colors shadow-sm`}
          >
            {isExporting ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2" size={18} />
                Export {bookmarks.length ? `${bookmarks.length} Bookmarks` : ''}
              </>
            )}
          </button>
          
          {!bookmarks.length && (
            <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              You have no bookmarks to export
            </p>
          )}
        </div>
      )}
      
      {/* Import Tab Content */}
      {activeTab === 'import' && (
        <div className="py-2">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
            <div className="flex gap-3">
              {['html', 'json', 'csv'].map((format) => (
                <label key={format} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
                    checked={importFormat === format}
                    onChange={() => setImportFormat(format)}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {format.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {importFormat === 'html' ? 'Import from browser bookmarks export' : 
               importFormat === 'json' ? 'Import from JSON format' : 
               'Import from CSV spreadsheet format'}
            </p>
          </div>
          
          <label 
            className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed 
              ${isImporting ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed' : 
              'border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/30'} 
              rounded-lg transition-colors`}
          >
            {isImporting ? (
              <>
                <Loader className="animate-spin mb-2" size={24} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Importing...</span>
              </>
            ) : (
              <>
                <Upload size={24} className="mb-2 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Drag & drop your file here or click to browse</span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Accepts {importFormat.toUpperCase()} files
                </span>
              </>
            )}
            <input 
              type="file" 
              accept={`.${importFormat}, ${importFormat === 'html' ? 'text/html' : importFormat === 'json' ? 'application/json' : 'text/csv'}`}
              className="hidden"
              onChange={handleImportFile}
              disabled={isImporting}
            />
          </label>
          
          {/* Status Messages */}
          <div className="mt-4">
          {importError && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-md text-sm animate-fade-in">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{importError}</span>
              </div>
            </div>
          )}
          
          {importSuccess && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-md text-sm animate-fade-in">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{importSuccess}</span>
              </div>
            </div>
          )}
          </div>
          
          {/* Help Text */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <FileText size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
            Tips for importing
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-6 list-disc">
            <li>HTML: Export bookmarks from your browser first</li>
            <li>JSON: Use for transferring between WebCity accounts</li>
            <li>CSV: Use comma-separated values with URL, title, and description columns</li>
            <li>Duplicate bookmarks will be automatically skipped</li>
          </ul>
          </div>
        </div>
      )}
    </div>
  );
}