import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Bookmark, 
  LogOut, 
  User, 
  Moon, 
  Sun,
  Folder,
  Star,
  ExternalLink,
  Download
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { db } from './firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import AuthModal from './components/auth/AuthModal';
import ImportExport from './components/ImportExport';

// Main App Component
export default function BookmarkApp() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [bookmarks, setBookmarks] = useState([]);
  
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : ['Work', 'Personal', 'Learning', 'Entertainment'];
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'Work',
    description: ''
  });

  // Fetch bookmarks from Firestore when user logs in
  useEffect(() => {
    if (currentUser) {
      const userBookmarksRef = collection(db, 'bookmarks');
      const q = query(userBookmarksRef, where("userId", "==", currentUser.uid));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookmarksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookmarks(bookmarksData);
      });
      
      return () => unsubscribe();
    } else {
      // If not logged in, reset bookmarks to empty array
      setBookmarks([]);
    }
  }, [currentUser]);
  
  // Save categories to localStorage (we'll move this to Firestore in a future enhancement)
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Filter bookmarks based on active category and search query
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesCategory = activeCategory === 'All' || bookmark.category === activeCategory;
    const matchesSearch = 
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add or update bookmark
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    
    // Ensure URL has a protocol
    let url = formData.url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    if (editingBookmarkId !== null) {
      // Update existing bookmark in Firestore
      try {
        const bookmarkRef = doc(db, 'bookmarks', editingBookmarkId);
        await updateDoc(bookmarkRef, {
          title: formData.title,
          url,
          category: formData.category,
          description: formData.description,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error updating bookmark: ", error);
      }
      setEditingBookmarkId(null);
    } else {
      // Add new bookmark to Firestore
      try {
        await addDoc(collection(db, 'bookmarks'), {
          userId: currentUser.uid,
          title: formData.title,
          url,
          category: formData.category,
          description: formData.description,
          dateAdded: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error adding bookmark: ", error);
      }
    }
    
    // Reset form
    setFormData({
      title: '',
      url: '',
      category: categories[0],
      description: ''
    });
    setIsAddingBookmark(false);
  };

  // Delete bookmark
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'bookmarks', id));
    } catch (error) {
      console.error("Error deleting bookmark: ", error);
    }
  };

  // Edit bookmark
  const handleEdit = (bookmark) => {
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      category: bookmark.category,
      description: bookmark.description
    });
    setEditingBookmarkId(bookmark.id);
    setIsAddingBookmark(true);
  };

  // Add new category
  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  // Delete category
  const handleDeleteCategory = (categoryToDelete) => {
    // Don't delete if there are bookmarks with this category
    const hasBookmarks = bookmarks.some(bookmark => bookmark.category === categoryToDelete);
    
    if (hasBookmarks) {
      alert(`Cannot delete category '${categoryToDelete}' because it contains bookmarks. Please reassign or delete these bookmarks first.`);
      return;
    }
    
    setCategories(categories.filter(category => category !== categoryToDelete));
    
    // If the active category is deleted, switch to 'All'
    if (activeCategory === categoryToDelete) {
      setActiveCategory('All');
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'dark' : ''}`}>
      <header className="bg-gray-800 dark:bg-gray-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center">
            <Bookmark className="mr-2 text-teal-400" />
            SaveMyWebs
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookmarks..."
                className="py-2 px-4 pr-10 rounded-lg text-gray-800 dark:text-white dark:bg-gray-700 dark:border-gray-600 w-64 focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400" size={20} />
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
                className="flex items-center bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition-colors"
              >
                <User size={18} className="mr-2" />
                Log In
              </button>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 overflow-y-auto">
          <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">Categories</h2>
          <ul>
            <li 
              className={`p-2 cursor-pointer rounded-md mb-1 flex items-center justify-between ${
                activeCategory === 'All' 
                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
              onClick={() => setActiveCategory('All')}
            >
              <div className="flex items-center">
                <Star size={16} className="mr-2" />
                All Bookmarks
              </div>
            </li>
            {categories.map(category => (
              <li 
                key={category}
                className={`p-2 cursor-pointer rounded-md mb-1 flex items-center justify-between ${
                  activeCategory === category 
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                <div className="flex items-center">
                  <Folder size={16} className="mr-2" />
                  {category}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category);
                  }}
                  className="group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition-opacity"
                  title={`Delete ${category} category`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
          
          {isAddingCategory ? (
            <div className="mt-4">
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="New category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button 
                  className="bg-teal-600 text-white p-2 rounded-r-md hover:bg-teal-700 transition-colors"
                  onClick={handleAddCategory}
                >
                  <Save size={16} />
                </button>
              </div>
              <button 
                className="w-full mt-2 text-red-500 dark:text-red-400 text-sm p-1 hover:underline"
                onClick={() => setIsAddingCategory(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              className="mt-4 flex items-center text-sm text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
              onClick={() => setIsAddingCategory(true)}
            >
              <Plus size={16} className="mr-1" /> Add Category
            </button>
          )}
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-100 dark:bg-gray-900">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {activeCategory === 'All' ? 'All Bookmarks' : `${activeCategory} Bookmarks`}
            </h2>
            
            <div className="flex gap-2">
              {currentUser && (
                <button 
                  className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center hover:bg-blue-700 transition-colors"
                  onClick={() => setShowImportExport(true)}
                >
                  <Download size={18} className="mr-1" /> Import/Export
                </button>
              )}
              <button 
                className="bg-teal-600 text-white py-2 px-4 rounded-md flex items-center hover:bg-teal-700 transition-colors"
                onClick={() => {
                  if (!currentUser) {
                    setShowAuthModal(true);
                    return;
                  }
                  setIsAddingBookmark(true);
                  setEditingBookmarkId(null);
                  setFormData({
                    title: '',
                    url: '',
                    category: categories[0],
                    description: ''
                  });
                }}
              >
                <Plus size={18} className="mr-1" /> Add Bookmark
              </button>
            </div>
          </div>
          
          {/* Auth Message for Non-Logged-In Users */}
          {!currentUser && (
            <div className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 p-4 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
              <p className="font-medium">Sign in to save your bookmarks across devices</p>
              <p className="text-sm mt-1">Your bookmarks will be securely stored in the cloud and accessible anywhere.</p>
              <button 
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In / Create Account
              </button>
            </div>
          )}
          
          {/* Bookmark Form */}
          {isAddingBookmark && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                    {editingBookmarkId !== null ? 'Edit Bookmark' : 'Add New Bookmark'}
                  </h3>
                  <button 
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => {
                      setIsAddingBookmark(false);
                      setEditingBookmarkId(null);
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="title">
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Website Title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="url">
                      URL
                    </label>
                    <input
                      id="url"
                      type="text"
                      name="url"
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="https://example.com"
                      required
                      value={formData.url}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="category">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="description">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Brief description about this bookmark"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center"
                  >
                    <Save className="mr-2" size={18} />
                    {editingBookmarkId !== null ? 'Update Bookmark' : 'Add Bookmark'}
                  </button>
                </form>
              </div>
            </div>
          )}
          
          {/* Bookmark List */}
          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBookmarks.map((bookmark) => {
                const domain = new URL(bookmark.url).hostname.replace('www.', '');
                return (
                  <div
                    key={bookmark.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all group cursor-pointer relative"
                    onClick={() => window.open(bookmark.url, '_blank')}
                  >
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(bookmark);
                        }}
                        title="Edit bookmark"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(bookmark.id);
                        }}
                        title="Delete bookmark"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=32`}
                        alt="favicon"
                        className="w-8 h-8 rounded-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWdsb2JlIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxsaW5lIHgxPSIyIiB5MT0iMTIiIHgyPSIyMiIgeTI9IjEyIi8+PHBhdGggZD0iTTEyIDJhMTUuMyAxNS4zIDAgMCAxIDQgMTAgMTUuMyAxNS4zIDAgMCAxLTQgMTAgMTUuMyAxNS4zIDAgMCAxLTQtMTAgMTUuMyAxNS4zIDAgMCAxIDQtMTB6Ii8+PC9zdmc+';
                        }}
                      />
                      <div>
                        <h3
                          className="text-base font-semibold text-gray-800 dark:text-white truncate max-w-[230px]"
                          title={bookmark.title}
                        >
                          {bookmark.title}
                        </h3>
                        <p
                          className="text-sm text-gray-500 dark:text-gray-400 truncate"
                          title={bookmark.url}
                        >
                          {domain}
                        </p>
                      </div>
                    </div>

                    {bookmark.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 mb-3">
                        {bookmark.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded-full">
                        {bookmark.category}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 flex items-center">
                        <ExternalLink size={12} className="mr-1" />
                        {new Date(bookmark.dateAdded).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <Bookmark size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {currentUser 
                  ? "No bookmarks found. Add a new bookmark to get started!" 
                  : "Sign in to see your bookmarks or add new ones."}
              </p>
              {currentUser && (
                <button 
                  className="mt-4 bg-teal-600 text-white py-2 px-6 rounded-md flex items-center mx-auto hover:bg-teal-700 transition-colors"
                  onClick={() => setIsAddingBookmark(true)}
                >
                  <Plus size={18} className="mr-1" /> Add Your First Bookmark
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Import/Export Dialog */}
      {showImportExport && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl w-full">
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
        onAuthSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}