import { useState, useEffect } from 'react';
import { Plus, Download, X } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { db } from './firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot 
} from 'firebase/firestore';

// Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import BookmarkList from './components/bookmarks/BookmarkList';
import BookmarkForm from './components/bookmarks/BookmarkForm';
import AuthModal from './components/auth/AuthModal';
import ImportExport from './components/ImportExport';
import SettingsModal from './components/SettingsModal';

// Main App Component
export default function BookmarkApp() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  // State
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState(['Work', 'Personal', 'Learning']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch bookmarks from Firestore when user logs in
  useEffect(() => {
    if (!currentUser) {
      setBookmarks([]);
      return;
    }

    const userBookmarksRef = collection(db, 'bookmarks');
    const q = query(userBookmarksRef, where("userId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookmarksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookmarks(bookmarksData);
    });

    // Fetch categories
    const fetchCategories = async () => {
      const userCategoriesRef = collection(db, 'categories');
      const categoriesQuery = query(userCategoriesRef, where("userId", "==", currentUser.uid));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      if (!categoriesSnapshot.empty) {
        setCategories(categoriesSnapshot.docs[0].data().categories);
      }
    };

    fetchCategories();

    return () => unsubscribe();
  }, [currentUser]);

  // Add or update bookmark
  const handleSaveBookmark = async (formData, isEditing) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (isEditing && editingBookmarkId) {
        // Update existing bookmark
        const bookmarkRef = doc(db, 'bookmarks', editingBookmarkId);
        await updateDoc(bookmarkRef, formData);
      } else {
        // Add new bookmark
        await addDoc(collection(db, 'bookmarks'), {
          ...formData,
          userId: currentUser.uid,
          dateAdded: new Date().toISOString()
        });

        // Update categories if new one was added
        if (!categories.includes(formData.category)) {
          const newCategories = [...categories, formData.category];
          setCategories(newCategories);
          
          // Update in Firestore
          const userCategoriesRef = collection(db, 'categories');
          const categoriesQuery = query(userCategoriesRef, where("userId", "==", currentUser.uid));
          const categoriesSnapshot = await getDocs(categoriesQuery);
          
          if (categoriesSnapshot.empty) {
            // If user has no categories collection yet, create one
            await addDoc(userCategoriesRef, {
              userId: currentUser.uid,
              categories: newCategories
            });
          } else {
            // Update existing categories
            await updateDoc(categoriesSnapshot.docs[0].ref, {
              categories: newCategories
            });
          }
        }
      }

      // Reset form
      setIsAddingBookmark(false);
      setEditingBookmarkId(null);
    } catch (error) {
      console.error('Error saving bookmark:', error);
      alert("Error saving bookmark. Please try again.");
    }
  };

  // Delete bookmark
  const handleDeleteBookmark = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bookmark?')) return;
    
    try {
      await deleteDoc(doc(db, 'bookmarks', id));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert("Error deleting bookmark. Please try again.");
    }
  };

  // Edit bookmark
  const handleEditBookmark = (bookmark) => {
    setEditingBookmarkId(bookmark.id);
    setIsAddingBookmark(true);
  };

  // Delete category
  const handleDeleteCategory = async (categoryToDelete) => {
    if (!window.confirm(`Are you sure you want to delete the "${categoryToDelete}" category? All bookmarks in this category will be moved to "Uncategorized".`)) return;
    
    try {
      // First, update all bookmarks in this category to "Uncategorized"
      const bookmarksToUpdate = bookmarks.filter(b => b.category === categoryToDelete);
      
      for (const bookmark of bookmarksToUpdate) {
        const bookmarkRef = doc(db, "bookmarks", bookmark.id);
        await updateDoc(bookmarkRef, { category: "Uncategorized" });
      }
      
      // Then, update the categories list
      const updatedCategories = categories.filter(c => c !== categoryToDelete);
      setCategories(updatedCategories);
      
      // Update in Firestore
      if (currentUser) {
        const userCategoriesRef = collection(db, 'categories');
        const categoriesQuery = query(userCategoriesRef, where("userId", "==", currentUser.uid));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        
        if (!categoriesSnapshot.empty) {
          await updateDoc(categoriesSnapshot.docs[0].ref, {
            categories: updatedCategories
          });
        }
      }
      
      // If the deleted category was active, switch to "All"
      if (activeCategory === categoryToDelete) {
        setActiveCategory("All");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error deleting category. Please try again.");
    }
  };

  // Close sidebar when category is selected on mobile
  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  // Auto-categorize bookmarks based on their URLs
  const autoCategorize = async () => {
    if (!currentUser || bookmarks.length === 0) return;
    
    setIsProcessing(true);
    try {
      // Import the categorization utility
      const { categorizeUrl } = await import('./utils/categorizeUrl');
      
      // Track which bookmarks need updating
      const bookmarksToUpdate = [];
      
      // Process each bookmark
      bookmarks.forEach(bookmark => {
        // Skip bookmarks with user-defined categories (not 'Uncategorized')
        if (bookmark.category && bookmark.category !== 'Uncategorized') return;
        
        // Get suggested category
        const suggestedCategory = categorizeUrl(bookmark.url, bookmark.title, bookmark.description);
        
        // Add to update list if a category was suggested
        if (suggestedCategory && suggestedCategory !== 'Uncategorized') {
          bookmarksToUpdate.push({
            id: bookmark.id,
            suggestedCategory
          });
        }
      });
      
      // Update categories in Firestore
      if (bookmarksToUpdate.length > 0) {
        // Add any new categories to the categories list
        const newCategories = [...categories];
        bookmarksToUpdate.forEach(bookmark => {
          if (!newCategories.includes(bookmark.suggestedCategory)) {
            newCategories.push(bookmark.suggestedCategory);
          }
        });
        
        // Update categories in state if new ones were added
        if (newCategories.length > categories.length) {
          setCategories(newCategories);
          
          // Update categories in Firestore
          const userCategoriesRef = collection(db, 'categories');
          const categoriesQuery = query(userCategoriesRef, where("userId", "==", currentUser.uid));
          const categoriesSnapshot = await getDocs(categoriesQuery);
          
          if (categoriesSnapshot.empty) {
            // Create new categories document
            await addDoc(userCategoriesRef, {
              userId: currentUser.uid,
              categories: newCategories
            });
          } else {
            // Update existing categories
            await updateDoc(categoriesSnapshot.docs[0].ref, {
              categories: newCategories
            });
          }
        }
        
        // Update each bookmark with its new category
        for (const bookmark of bookmarksToUpdate) {
          const bookmarkRef = doc(db, "bookmarks", bookmark.id);
          await updateDoc(bookmarkRef, { category: bookmark.suggestedCategory });
        }
      }
      
      alert(`Auto-categorization complete! ${bookmarksToUpdate.length} bookmarks were categorized.`);
    } catch (error) {
      console.error('Error during auto-categorization:', error);
      alert('An error occurred during auto-categorization. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowSettings(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          setShowAuthModal={setShowAuthModal}
          currentUser={currentUser}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onSettings={() => setShowSettings(true)}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <div className={`md:block ${isMobileMenuOpen ? 'block' : 'hidden'} z-20 md:z-auto transition-all duration-300`}>
            <Sidebar 
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={handleCategorySelect}
              setCategories={setCategories}
              bookmarks={bookmarks}
              handleDeleteCategory={handleDeleteCategory}
            />
          </div>
          
          <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {activeCategory === 'All' ? 'All Bookmarks' : `${activeCategory} Bookmarks`}
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {currentUser && (
                  <button 
                    className="bg-blue-600 text-white py-2 px-3 md:px-4 rounded-md flex items-center hover:bg-blue-700 transition-colors text-sm md:text-base"
                    onClick={() => setShowImportExport(true)}
                  >
                    <Download size={16} className="mr-1" /> <span className="hidden sm:inline">Import/Export</span>
                  </button>
                )}
                <button 
                  className="bg-teal-600 text-white py-2 px-3 md:px-4 rounded-md flex items-center hover:bg-teal-700 transition-colors text-sm md:text-base"
                  onClick={() => {
                    if (!currentUser) {
                      setShowAuthModal(true);
                      return;
                    }
                    setIsAddingBookmark(true);
                    setEditingBookmarkId(null);
                  }}
                >
                  <Plus size={16} className="mr-1" /> <span className="hidden sm:inline">Add</span> Bookmark
                </button>
              </div>
            </div>
            
            {/* Auth Message for Non-Logged-In Users */}
            {!currentUser && bookmarks.length === 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-6 rounded-lg text-center my-4 md:my-8">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Welcome to SaveMyWebs!
                </h3>
                <p className="text-blue-600 dark:text-blue-400 mb-4">
                  Sign in to save and manage your bookmarks securely across all your devices.
                </p>
                <button 
                  className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-700 transition-colors"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign in to Get Started
                </button>
              </div>
            )}
            
            {/* Bookmark List */}
            <BookmarkList 
              bookmarks={bookmarks}
              onEdit={handleEditBookmark}
              onDelete={handleDeleteBookmark}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
            />
          </main>
        </div>

        {/* Bookmark Form Modal */}
        <BookmarkForm 
          isOpen={isAddingBookmark}
          onClose={() => {
            setIsAddingBookmark(false);
            setEditingBookmarkId(null);
          }}
          onSave={handleSaveBookmark}
          editingBookmark={editingBookmarkId ? bookmarks.find(b => b.id === editingBookmarkId) : null}
          categories={categories}
        />
        
        {/* Import/Export Dialog */}
        {showImportExport && currentUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                  Import & Export Bookmarks
                </h3>
                <button 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setShowImportExport(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <ImportExport 
                bookmarks={bookmarks}
                categories={categories}
                onImportComplete={() => {
                  // Could refresh bookmarks if needed
                  setShowImportExport(false);
                }}
              />
            </div>
          </div>
        )}
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
        
        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onAutoCategorize={autoCategorize}
          isProcessing={isProcessing}
          bookmarks={bookmarks}
          categories={categories}
        />
      </div>
    </div>
  );
}