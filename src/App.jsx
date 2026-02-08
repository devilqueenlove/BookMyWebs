import { useState, useEffect, useMemo } from 'react';
import { Plus, PlusCircle, Search as SearchIcon, BookMarked, ArrowRight, BookOpen, X, MinusCircle, CheckSquare, Trash2, FolderInput, Globe, Folder, LayoutGrid, List, Sun, Moon } from 'lucide-react';
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
import CommandPalette from './components/common/CommandPalette';
import CleanupAgentModal from './components/modals/CleanupAgentModal';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

// Main App Component
export default function BookmarkApp() {
  const { currentUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

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
  const [selectedBookmarks, setSelectedBookmarks] = useState(new Set());
  const [showCleanupAgent, setShowCleanupAgent] = useState(false);

  // Calculate filtered bookmarks based on active category and search query
  const getFilteredBookmarks = () => {
    const filtered = bookmarks.filter(bookmark => {
      const matchesCategory = activeCategory === 'All' || bookmark.category === activeCategory;

      if (!searchQuery) return matchesCategory;

      const query = searchQuery.toLowerCase();
      return matchesCategory && (
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        (bookmark.description && bookmark.description.toLowerCase().includes(query)) ||
        (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    });

    // Sort by order (ascending)
    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
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
        const maxOrder = Math.max(...bookmarks.map(b => b.order || 0), 0);
        await addDoc(collection(db, 'bookmarks'), {
          ...formData,
          userId: currentUser.uid,
          dateAdded: new Date().toISOString(),
          order: maxOrder + 1
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
    try {
      await deleteDoc(doc(db, 'bookmarks', id));
      setSelectedBookmarks(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert("Error deleting bookmark. Please try again.");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedBookmarks.size} bookmarks?`)) return;

    setIsProcessing(true);
    try {
      const deletePromises = Array.from(selectedBookmarks).map(id =>
        deleteDoc(doc(db, 'bookmarks', id))
      );
      await Promise.all(deletePromises);
      setSelectedBookmarks(new Set());
    } catch (error) {
      console.error("Error deleting bookmarks:", error);
      alert("Error deleting bookmarks.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk Move (Simplification: just move to 'Uncategorized' or prompting - for now, let's just implement delete as proof of concept or move to active category if different)
  // For better UX, we'd need a modal to select target category. For now, let's just do Bulk Delete to save complexity.

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
    setSelectedBookmarks(new Set()); // Clear selection on category change
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  // Toggle selection of a bookmark
  const toggleSelection = (id) => {
    setSelectedBookmarks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select/Deselect all in current view
  const toggleSelectAll = () => {
    if (selectedBookmarks.size === filteredBookmarks.length && filteredBookmarks.length > 0) {
      setSelectedBookmarks(new Set());
    } else {
      setSelectedBookmarks(new Set(filteredBookmarks.map(b => b.id)));
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

  // Handle cleanup agent results - apply the categorization changes
  const handleCleanupCategorize = async (results) => {
    if (!currentUser || results.length === 0) return;

    setIsProcessing(true);
    try {
      // Collect all new categories that need to be added
      const newCategories = [...categories];
      results.forEach(result => {
        if (!newCategories.includes(result.newCategory)) {
          newCategories.push(result.newCategory);
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
          await addDoc(userCategoriesRef, {
            userId: currentUser.uid,
            categories: newCategories
          });
        } else {
          await updateDoc(categoriesSnapshot.docs[0].ref, {
            categories: newCategories
          });
        }
      }

      // Update each bookmark with its new category
      for (const result of results) {
        const bookmarkRef = doc(db, "bookmarks", result.id);
        await updateDoc(bookmarkRef, { category: result.newCategory });
      }
    } catch (error) {
      console.error('Error applying cleanup changes:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, bookmarkId) => {
    e.dataTransfer.setData('text/plain', bookmarkId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Reorder Logic
  const reorderBookmarks = async (draggedId, targetId) => {
    if (draggedId === targetId) return;

    const draggedIndex = bookmarks.findIndex(b => b.id === draggedId);
    const targetIndex = bookmarks.findIndex(b => b.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create a new array with the reordered items
    const newBookmarks = [...bookmarks];
    const [draggedItem] = newBookmarks.splice(draggedIndex, 1);
    newBookmarks.splice(targetIndex, 0, draggedItem);

    // Update 'order' field for all affected items
    // Simple strategy: re-index everything (or just the range) to ensure gaps
    // For simplicity with Firestore, we'll re-index the local state and batch update Firestore
    const updatedBookmarks = newBookmarks.map((b, index) => ({ ...b, order: index }));

    // Optimistic Update
    setBookmarks(updatedBookmarks);

    // Background Update to Firestore
    try {
      // In a real app, use a batch write. Here we'll update sequentially or use a smarter sparse ordering.
      // For now, simpler is better for stability.
      updatedBookmarks.forEach(async (b) => {
        if (b.order !== bookmarks.find(old => old.id === b.id)?.order) {
          const ref = doc(db, 'bookmarks', b.id);
          await updateDoc(ref, { order: b.order });
        }
      });
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const handleDrop = async (e, targetCategory, targetBookmarkId = null, targetStatus = null) => {
    e.preventDefault();
    const bookmarkId = e.dataTransfer.getData('text/plain');

    if (!bookmarkId) return;

    // Case 1: Kanban Status Change
    if (targetStatus) {
      setBookmarks(prev => prev.map(b =>
        b.id === bookmarkId ? { ...b, status: targetStatus } : b
      ));
      const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
      await updateDoc(bookmarkRef, { status: targetStatus });
      return;
    }

    // Case 2: Reordering (Dropped on another bookmark)
    if (targetBookmarkId) {
      await reorderBookmarks(bookmarkId, targetBookmarkId);
      return;
    }

    // Case 3: Categorization (Dropped on Sidebar Category)
    if (targetCategory) {
      try {
        setBookmarks(prev => prev.map(b =>
          b.id === bookmarkId ? { ...b, category: targetCategory } : b
        ));
        const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
        await updateDoc(bookmarkRef, { category: targetCategory });
      } catch (error) {
        console.error('Error moving bookmark:', error);
        alert('Failed to move bookmark. Please try again.');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleMoveToTop = async (id) => {
    const minOrder = Math.min(...bookmarks.map(b => b.order || 0), 0) - 1;
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, order: minOrder } : b));
    await updateDoc(doc(db, 'bookmarks', id), { order: minOrder });
  };

  const handleMoveToBottom = async (id) => {
    const maxOrder = Math.max(...bookmarks.map(b => b.order || 0), 0) + 1;
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, order: maxOrder } : b));
    await updateDoc(doc(db, 'bookmarks', id), { order: maxOrder });
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onChangeViewMode: setViewMode,
    onOpenCommandPalette: () => { }, // Handled internally by CommandPalette for now
    onNewBookmark: () => { setIsAddingBookmark(true); setEditingBookmarkId(null); }
  });

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
    <div className="flex h-screen bg-[#0E1116] text-[#EDEDED] overflow-hidden font-sans selection:bg-primary/30 selection:text-white">
      {/* Global Command Palette */}
      <CommandPalette
        bookmarks={bookmarks}
        categories={categories}
        onAddBookmark={() => { setIsAddingBookmark(true); setEditingBookmarkId(null); }}
        onSelectCategory={setActiveCategory}
        onChangeViewMode={setViewMode}
      />

      {/* Left Pane - Navigation Tree */}
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        setCategories={setCategories}
        bookmarks={bookmarks}
        handleDeleteCategory={handleDeleteCategory}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />

      {/* Right Pane - Agent Workspace */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* HUD Header */}
        <header className="flex-shrink-0 h-14 border-b border-white/5 bg-[#0E1116]/90 backdrop-blur-md px-6 flex items-center justify-between z-20">
          {/* Breadcrumbs / Context */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {activeCategory === 'All' ? <Globe size={18} className="text-primary" /> : <Folder size={18} className="text-accent" />}
              {activeCategory === 'All' ? 'All Bookmarks' : activeCategory}
            </h1>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full font-mono">{filteredBookmarks.length}</span>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:text-white'}`}
                title="List View"
              >
                <List size={14} />
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <div className="h-5 w-px bg-white/10 mx-1"></div>

            <div className="relative hidden md:block group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={14} className="text-gray-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Filter view..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/10 w-64 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] text-gray-600 bg-white/5 px-1 rounded border border-white/5">⌘</span>
                  <span className="text-[10px] text-gray-600 bg-white/5 px-1 rounded border border-white/5">K</span>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 mx-2"></div>

            <button
              onClick={() => { setIsAddingBookmark(true); setEditingBookmarkId(null); }}
              className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} /> <span>New</span>
            </button>

            {currentUser ? (
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10 flex items-center justify-center text-xs font-medium text-white cursor-pointer hover:ring-2 hover:ring-white/20 transition-all"
                title={currentUser.email}
                onClick={() => setShowSettings(true)}
              >
                {currentUser.email[0].toUpperCase()}
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Login
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {/* Contextual Action Bar (Selection) */}
          {selectedBookmarks.size > 0 && (
            <div className="sticky top-0 z-30 mb-6 -mt-2">
              <div className="bg-accent/10 backdrop-blur-xl border border-accent/20 rounded-xl p-3 flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center text-accent">
                    <CheckSquare size={14} />
                  </div>
                  <span className="text-sm font-medium text-white"><span className="text-accent">{selectedBookmarks.size}</span> Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleBulkDelete}
                    className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                  <div className="h-4 w-px bg-white/10 mx-1"></div>
                  <button
                    onClick={() => setSelectedBookmarks(new Set())}
                    className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats / Welcome (Simpler now) */}
          {!currentUser && bookmarks.length === 0 && (
            <div className="glass-panel p-8 rounded-2xl text-center max-w-2xl mx-auto mt-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-primary/30">
                <BookOpen size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to WebCity</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Your intelligence hub for the web. Organize, tag, and recall anything.</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setIsAddingBookmark(true)} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all">Try Demo</button>
                <button onClick={() => setShowAuthModal(true)} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all">Sync Account</button>
              </div>
            </div>
          )}

          <BookmarkList
            bookmarks={filteredBookmarks}
            onEdit={handleEditBookmark}
            onDelete={handleDeleteBookmark}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            viewMode={viewMode}
            selectedBookmarks={selectedBookmarks}
            onToggleSelection={toggleSelection}
            onToggleSelectAll={toggleSelectAll}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onMoveToTop={handleMoveToTop}
            onMoveToBottom={handleMoveToBottom}
            onDragOver={handleDragOver}
          />

          <div className="h-20"></div> {/* Bottom spacer */}
        </div>
      </main>

      {/* Modals */}
      <BookmarkForm
        isOpen={isAddingBookmark}
        onClose={() => { setIsAddingBookmark(false); setEditingBookmarkId(null); }}
        onSave={handleSaveBookmark}
        editingBookmark={editingBookmarkId ? bookmarks.find(b => b.id === editingBookmarkId) : null}
        categories={categories}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onRunCleanupAgent={() => { setShowSettings(false); setShowCleanupAgent(true); }}
        isProcessing={isProcessing}
        bookmarks={bookmarks}
        categories={categories}
      />

      <CleanupAgentModal
        isOpen={showCleanupAgent}
        onClose={() => setShowCleanupAgent(false)}
        bookmarks={bookmarks}
        categories={categories}
        onCategorize={handleCleanupCategorize}
      />
    </div>
  );
}