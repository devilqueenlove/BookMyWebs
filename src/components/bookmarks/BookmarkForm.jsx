import { useState, useEffect } from 'react';
import { Save, X, Loader } from 'lucide-react';
import { fetchUrlMetadata, extractTitleFromUrl } from '../../utils/urlMetadata';

export default function BookmarkForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingBookmark = null, 
  categories
}) {
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: categories[0] || 'Uncategorized',
    description: ''
  });

  // If editing a bookmark, populate form with existing data
  useEffect(() => {
    if (editingBookmark) {
      setFormData(editingBookmark);
    } else {
      setFormData({
        title: '',
        url: '',
        category: categories[0] || 'Uncategorized',
        description: ''
      });
    }
  }, [editingBookmark, categories]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If URL field is changed and has reasonable length, fetch metadata
    if (name === 'url' && value.length > 5) {
      fetchMetadata(value);
    }
  };
  
  // Fetch metadata from URL
  const fetchMetadata = async (url) => {
    // Don't fetch if URL is too short or already fetching
    if (url.length < 5 || isFetchingMetadata) return;
    
    setIsFetchingMetadata(true);
    
    try {
      const metadata = await fetchUrlMetadata(url);
      
      // Only update title and description if they're empty or match domain name
      const currentTitle = formData.title;
      const currentDesc = formData.description;
      const domainTitle = extractTitleFromUrl(url);
      
      // Update form data with fetched metadata if fields are empty or contain default values
      setFormData(prev => ({
        ...prev,
        title: (!currentTitle || currentTitle === domainTitle) && metadata.title ? metadata.title : prev.title,
        description: (!currentDesc || currentDesc === '') && metadata.description ? metadata.description : prev.description
      }));
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, editingBookmark ? true : false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
            {editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
          </h3>
          <button 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="url">
                URL
              </label>
              <div className="relative">
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
                {isFetchingMetadata && (
                  <div className="absolute right-2 top-2 text-gray-500 dark:text-gray-400 animate-spin">
                    <Loader size={20} />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Title and description will be automatically fetched when possible
              </p>
            </div>
            
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
                  <option key={category} value={category}>{category}</option>
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
                rows="3"
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Brief description of the website"
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              <Save size={18} className="mr-1" />
              {editingBookmark ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
