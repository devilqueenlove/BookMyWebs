import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Save, X, Bookmark } from 'lucide-react';

// Main App Component
export default function BookmarkApp() {
  const [bookmarks, setBookmarks] = useState(() => {
    const savedBookmarks = localStorage.getItem('bookmarks');
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });
  
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
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'Work',
    description: ''
  });

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);
  
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
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure URL has a protocol
    let url = formData.url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    if (editingBookmarkId !== null) {
      // Update existing bookmark
      setBookmarks(bookmarks.map(bookmark => 
        bookmark.id === editingBookmarkId ? 
        { ...bookmark, ...formData, url } : 
        bookmark
      ));
      setEditingBookmarkId(null);
    } else {
      // Add new bookmark
      const newBookmark = {
        id: Date.now(),
        title: formData.title,
        url,
        category: formData.category,
        description: formData.description,
        dateAdded: new Date().toISOString()
      };
      setBookmarks([...bookmarks, newBookmark]);
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
  const handleDelete = (id) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center">
            <Bookmark className="mr-2" />
            SaveMyWebs
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookmarks..."
              className="py-2 px-4 pr-10 rounded-lg text-gray-50 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-gray-500" size={20} />
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md p-4">
          <h2 className="font-semibold text-lg mb-4">Categories</h2>
          <ul>
            <li 
              className={`p-2 cursor-pointer rounded-md mb-1 ${activeCategory === 'All' ? 'bg-gray-300 text-gray-700' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveCategory('All')}
            >
              All Bookmarks
            </li>
            {categories.map(category => (
              <li 
                key={category}
                className={`p-2 cursor-pointer rounded-md mb-1 ${activeCategory === category ? 'bg-gray-300 text-gray-950' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </li>
            ))}
          </ul>
          
          {isAddingCategory ? (
            <div className="mt-4">
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-l-md"
                  placeholder="New category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button 
                  className="bg-gray-500 text-white p-2 rounded-r-md"
                  onClick={handleAddCategory}
                >
                  <Save size={16} />
                </button>
              </div>
              <button 
                className="w-full mt-2 text-red-500 text-sm p-1"
                onClick={() => setIsAddingCategory(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              className="mt-4 flex items-center text-sm text-gray-600 hover:text-gray-800"
              onClick={() => setIsAddingCategory(true)}
            >
              <Plus size={16} className="mr-1" /> Add Category
            </button>
          )}
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {activeCategory === 'All' ? 'All Bookmarks' : `${activeCategory} Bookmarks`}
            </h2>
            <button 
              className="bg-gray-600 text-white py-2 px-4 rounded-md flex items-center hover:bg-gray-700"
              onClick={() => {
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
          
          {/* Bookmark Form */}
          {isAddingBookmark && (
            <div className="absolute top-6 right-6 w-80 bg-gray-200 p-4 rounded-lg shadow-lg z-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">
                  {editingBookmarkId !== null ? 'Edit Bookmark' : 'Add New Bookmark'}
                </h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setIsAddingBookmark(false);
                    setEditingBookmarkId(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    className="w-full p-2 border rounded-md"
                    placeholder="Website Title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
                    URL
                  </label>
                  <input
                    id="url"
                    type="text"
                    name="url"
                    className="w-full p-2 border rounded-md"
                    placeholder="https://example.com"
                    required
                    value={formData.url}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="w-full p-2 border rounded-md"
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
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full p-2 border rounded-md"
                    placeholder="Brief description about this bookmark"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  {editingBookmarkId !== null ? 'Update Bookmark' : 'Add Bookmark'}
                </button>
              </form>
            </div>
          )}
          
          {/* Bookmark List */}
{/* Bookmark List */}
{filteredBookmarks.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
    {filteredBookmarks.map((bookmark) => {
      const domain = new URL(bookmark.url).hostname.replace('www.', '');
      return (
        <div
          key={bookmark.id}
          className="bg-white p-4 rounded-2xl shadow-md transition hover:shadow-lg group cursor-pointer relative"
          onClick={() => window.open(bookmark.url, '_blank')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=32`}
                alt="favicon"
                className="w-5 h-5"
              />
              <h3
                className="text-base font-semibold text-gray-800 truncate max-w-[180px]"
                title={bookmark.title}
              >
                {bookmark.title}
              </h3>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button
                className="text-gray-500 hover:text-gray-700 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(bookmark);
                }}
              >
                <Edit size={16} />
              </button>
              <button
                className="text-red-500 hover:text-red-700 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(bookmark.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <p
            className="text-sm text-gray-500 mt-1 truncate"
            title={bookmark.url}
          >
            {domain}
          </p>

          {bookmark.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {bookmark.description}
            </p>
          )}

          <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
            <span className="bg-gray-100 text-gray-700 py-1 px-2 rounded-full text-xs">
              {bookmark.category}
            </span>
            <span>
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
  <div className="text-center py-10">
    <p className="text-gray-500">No bookmarks found. Add a new bookmark to get started!</p>
  </div>
)}

        </main>
      </div>
    </div>
  );
}