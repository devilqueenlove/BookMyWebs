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
  
  // Adjust styling based on whether component is in a modal
  const containerClass = inModal ? "flex flex-col gap-4" : "grid grid-cols-1 gap-8 mb-6";
  
  return (
    <div className={containerClass}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Import & Export</h2>
      
      {/* Export Section */}
      <div className="mb-6">
        {!inModal && <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Export Bookmarks</h3>}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
            <select 
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="html">HTML (Browser Compatible)</option>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleExport}
              disabled={isExporting || !bookmarks.length}
              className={`flex items-center justify-center px-4 py-2 rounded-md text-white ${
                bookmarks.length ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              {isExporting ? (
                <Loader className="animate-spin mr-2" size={18} />
              ) : (
                <Download className="mr-2" size={18} />
              )}
              Export {bookmarks.length ? `(${bookmarks.length})` : ''}
            </button>
          </div>
        </div>
        {!bookmarks.length && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You have no bookmarks to export.
          </p>
        )}
      </div>
      
      {/* Import Section */}
      <div>
        {!inModal && <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Import Bookmarks</h3>}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
            <select 
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
              value={importFormat}
              onChange={(e) => setImportFormat(e.target.value)}
            >
              <option value="html">HTML (Browser Export)</option>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className={`flex items-center justify-center px-4 py-2 rounded-md text-white ${
              isImporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 cursor-pointer'
            } transition-colors`}>
              {isImporting ? (
                <Loader className="animate-spin mr-2" size={18} />
              ) : (
                <Upload className="mr-2" size={18} />
              )}
              Import
              <input 
                type="file" 
                accept={`.${importFormat}, ${importFormat === 'html' ? 'text/html' : importFormat === 'json' ? 'application/json' : 'text/csv'}`}
                className="hidden"
                onChange={handleImportFile}
                disabled={isImporting}
              />
            </label>
          </div>
        </div>
        
        <div className="mt-3">
          {importError && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
              {importError}
            </div>
          )}
          
          {importSuccess && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-md text-sm">
              {importSuccess}
            </div>
          )}
          
          <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FileText size={16} className="mr-2" />
            <span>Supported formats: HTML exports from browsers, JSON, and CSV</span>
          </div>
        </div>
      </div>
    </div>
  );
}