import { useState, useEffect } from 'react';
import { Plus, PlusCircle, Search as SearchIcon, BookMarked, ArrowRight, BookOpen, X, MinusCircle } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showHero, setShowHero] = useState(true); // Control hero section visibility

  // Calculate filtered bookmarks based on active category and search query
  const getFilteredBookmarks = () => {
    return bookmarks.filter(bookmark => {
      const matchesCategory = activeCategory === 'All' || bookmark.category === activeCategory;
      
      if (!searchQuery) return matchesCategory;
      
      const query = searchQuery.toLowerCase();
      return matchesCategory && (
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        (bookmark.description && bookmark.description.toLowerCase().includes(query))
      );
    });
  };
  
  const filteredBookmarks = getFilteredBookmarks();

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

  // Add CSS animations
  useEffect(() => {
    // Add animation styles to the document head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col min-h-screen bg-background text-foreground">
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
          
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
            {/* Hero section for category display */}
            {showHero && (
              <div 
                className="hero-section bg-gradient-to-r from-accent to-accent-2 rounded-xl shadow-lg mb-6 p-6 relative overflow-hidden animate-fadeIn" 
                style={{ 
                  animation: showHero ? 'fadeIn 0.5s ease-in-out' : 'fadeOut 0.5s ease-in-out'
                }}
              >
                {/* Dismiss button */}
                <button 
                  className="absolute top-3 right-3 z-30 bg-accent-foreground/20 hover:bg-accent-foreground/30 text-accent-foreground rounded-full p-1.5 transition-all hover:rotate-90 transform duration-300"
                  onClick={() => {
                    // Create the fadeout animation effect
                    const heroElement = document.querySelector('.hero-section');
                    if (heroElement) {
                      heroElement.style.animation = 'fadeOut 0.4s ease-in-out forwards';
                      heroElement.addEventListener('animationend', () => {
                        setShowHero(false);
                      }, { once: true });
                    } else {
                      setShowHero(false);
                    }
                  }}
                  title="Dismiss section"
                >
                  <MinusCircle size={16} />
                </button>

                <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                  <BookMarked size={256} className="text-white" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {activeCategory === 'All' ? 'All Bookmarks' : `${activeCategory} Bookmarks`}
                  </h2>
                  <p className="text-teal-100 text-sm md:text-base max-w-2xl">
                    {activeCategory === 'All' 
                      ? 'All your saved web destinations in one place. Organize, discover, and access them instantly.'
                      : `Your curated ${activeCategory.toLowerCase()} bookmarks. Easily manage and access them whenever you need.`}
                  </p>
                  <div className="flex items-center mt-4">
                    <div className="bg-white/20 rounded-lg py-1 px-3 text-white text-sm">
                      {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              {/* Left side - Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, URL, or description..."
                  className="w-full py-2 pl-10 pr-10 rounded-lg bg-card border border-accent/20 focus:outline-none focus:ring-2 focus:ring-accent text-card-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchIcon size={18} className="absolute left-3 top-2.5 text-accent/60" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-accent/60 hover:text-accent"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <button 
                className="bg-button text-accent-foreground py-2 px-3 md:px-4 rounded-lg flex items-center hover:bg-button-hover transition-colors text-sm md:text-base shadow-sm"
                onClick={() => {
                  if (!currentUser) {
                    setShowAuthModal(true);
                    return;
                  }
                  setIsAddingBookmark(true);
                  setEditingBookmarkId(null);
                }}
              >
                <PlusCircle size={18} className="mr-2" /> Add Bookmark
              </button>
            </div>
            
            {/* Auth Message for Non-Logged-In Users */}
            {!currentUser && bookmarks.length === 0 && (
              <div className="bg-card rounded-xl shadow-md overflow-hidden my-6">
                <div className="md:flex">
                  <div className="md:shrink-0 bg-gradient-to-br from-accent to-accent-2 p-6 md:p-8 flex items-center justify-center">
                    <BookOpen size={80} className="text-accent-foreground opacity-75" />
                  </div>
                  <div className="p-6 md:p-8 text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-card-foreground mb-2">
                      Welcome to WebCity
                    </h3>
                    <p className="text-card-foreground/70 mb-6">
                      Your personal bookmark manager that helps you organize your web adventures.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                      <button 
                        className="px-6 py-3 bg-button text-accent-foreground font-medium rounded-lg hover:bg-button-hover shadow-sm transition-all"
                        onClick={() => setShowAuthModal(true)}
                      >
                        Sign in to Get Started
                      </button>
                      <button 
                        className="px-6 py-3 border border-accent/20 text-card-foreground font-medium rounded-lg hover:bg-accent/5 shadow-sm transition-all"
                        onClick={() => {
                          // Allow non-logged in users to try the app
                          setIsAddingBookmark(true);
                        }}
                      >
                        Try it out
                      </button>
                    </div>
                    <div className="mt-4 text-sm text-card-foreground/60">
                      No account required to try. Your bookmarks will be saved locally.
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats cards - visible when user has bookmarks */}
            {currentUser && bookmarks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card rounded-lg shadow-sm p-4 border-l-4 border-accent">
                  <div className="text-sm text-card-foreground/60">Total Bookmarks</div>
                  <div className="text-2xl font-bold text-card-foreground mt-1">{bookmarks.length}</div>
                </div>
                <div className="bg-card rounded-lg shadow-sm p-4 border-l-4 border-accent-2">
                  <div className="text-sm text-card-foreground/60">Categories</div>
                  <div className="text-2xl font-bold text-card-foreground mt-1">{categories.length}</div>
                </div>
                <div className="bg-card rounded-lg shadow-sm p-4 border-l-4 border-accent-3">
                  <div className="text-sm text-card-foreground/60">In Current Category</div>
                  <div className="text-2xl font-bold text-card-foreground mt-1">{filteredBookmarks.length}</div>
                </div>
                <div className="bg-card rounded-lg shadow-sm p-4 border-l-4 border-accent/80">
                  <div className="text-sm text-card-foreground/60">Recent Activity</div>
                  <div className="text-2xl font-bold text-card-foreground mt-1">Today</div>
                </div>
              </div>
            )}

            {/* Bookmark List */}
            <BookmarkList 
              bookmarks={filteredBookmarks}
              onEdit={handleEditBookmark}
              onDelete={handleDeleteBookmark}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              viewMode={viewMode}
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
        
        {/* Import/Export Dialog removed - now part of Settings Modal */}
        
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