import { useState, useEffect } from 'react';

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
    
    // When URL is changed, try to fetch the title of the website
    if (name === 'url' && value.trim() !== '') {
      fetchWebsiteTitle(value);
    }
  };
  
  // Function to fetch website title from URL
  const fetchWebsiteTitle = async (url) => {
    // Ensure URL has a protocol
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    try {
      // Note: For a real production app, you would need a backend service or API
      // to handle this request to avoid CORS issues. For demo purposes, we'll use
      // a public CORS proxy service, but this is not recommended for production.
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      
      // Show loading state
      setFormData(prev => ({ ...prev, title: 'Fetching title...' }));
      
      // For real production code, use your own backend endpoint
      // This will often fail due to CORS restrictions and proxy limitations
      fetch(proxyUrl + formattedUrl)
        .then(response => response.text())
        .then(html => {
          // Extract title from the HTML
          const titleMatch = html.match(/<title>(.*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : '';
          
          if (title) {
            setFormData(prev => ({ ...prev, title }));
          } else {
            setFormData(prev => ({ ...prev, title: '' }));
          }
        })
        .catch(error => {
          console.error('Error fetching title:', error);
          setFormData(prev => ({ ...prev, title: '' }));
        });
    } catch (error) {
      console.error('Error fetching website title:', error);
      setFormData(prev => ({ ...prev, title: '' }));
    }
  };

  // Add or update bookmark
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.url) {
      alert('Title and URL are required!');
      return;
    }
    
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
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center">
            📚 Bookmark Manager
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookmarks..."
              className="py-2 px-4 pr-10 rounded-lg text-gray-800 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute right-3 top-2.5 text-gray-500">🔍</span>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md p-4">
          <h2 className="font-semibold text-lg mb-4">Categories</h2>
          <ul>
            <li 
              className={`p-2 cursor-pointer rounded-md mb-1 ${activeCategory === 'All' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveCategory('All')}
            >
              All Bookmarks
            </li>
            {categories.map(category => (
              <li 
                key={category}
                className={`p-2 cursor-pointer rounded-md mb-1 ${activeCategory === category ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
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
                  className="bg-green-500 text-white p-2 rounded-r-md"
                  onClick={handleAddCategory}
                >
                  💾
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
              className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setIsAddingCategory(true)}
            >
              ➕ Add Category
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
              className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center hover:bg-blue-700"
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
              ➕ Add Bookmark
            </button>
          </div>
          
          {/* Bookmark Form */}
          {isAddingBookmark && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
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
                  ❌
                </button>
              </div>
              
              <div>
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
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  {editingBookmarkId !== null ? 'Update Bookmark' : 'Add Bookmark'}
                </button>
              </div>
            </div>
          )}
          
          {/* Bookmark List */}
          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookmarks.map(bookmark => (
                <div key={bookmark.id} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg mb-2">{bookmark.title}</h3>
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEdit(bookmark)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(bookmark.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <a 
                    href={bookmark.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 mb-2 block truncate text-sm"
                  >
                    {bookmark.url}
                  </a>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full">
                      {bookmark.category}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(bookmark.dateAdded).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {bookmark.description && (
                    <p className="text-gray-600 text-sm mt-2">{bookmark.description}</p>
                  )}
                </div>
              ))}
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