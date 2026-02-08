import { useState, useEffect } from 'react';
import { Save, X, Loader, Sparkles } from 'lucide-react';
import { fetchUrlMetadata, extractTitleFromUrl } from '../../utils/urlMetadata';
import { categorizeUrl } from '../../utils/categorizeUrl';

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
    category: categories[0] || 'Uncategorized',
    description: '',
    tags: [],
    image: ''
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
        category: categories[0] || 'Uncategorized',
        description: '',
        tags: [],
        image: ''
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

      // Auto-categorize based on improved metadata
      const suggestedCategory = categorizeUrl(url, metadata.title, metadata.description, metadata);

      setFormData(prev => ({
        ...prev,
        title: (!currentTitle || currentTitle === domainTitle) && metadata.title ? metadata.title : prev.title,
        description: (!currentDesc || currentDesc === '') && metadata.description ? metadata.description : prev.description,
        category: categories.includes(suggestedCategory) ? suggestedCategory : prev.category,
        image: metadata.image || prev.image
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#161B22] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
            {editingBookmark ? 'Edit Agent' : 'New Agent'}
          </h3>
          <button
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="url">
                Target URL
              </label>
              <div className="relative group flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="url"
                    type="text"
                    name="url"
                    className="w-full p-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:bg-white/5 transition-all"
                    placeholder="https://example.com"
                    required
                    value={formData.url}
                    onChange={handleInputChange}
                  />
                  {isFetchingMetadata && (
                    <div className="absolute right-3 top-3 text-teal-500 animate-spin">
                      <Loader size={18} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fetchMetadata(formData.url)}
                  disabled={isFetchingMetadata || formData.url.length < 5}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-teal-400 hover:bg-teal-500/10 hover:text-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Auto-Detect Metadata"
                >
                  <Sparkles size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                className="w-full p-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:bg-white/5 transition-all"
                placeholder="Agent Name / Title"
                required
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="category">
                  Sector
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    className="w-full p-3 border border-white/10 rounded-xl bg-black/20 text-white appearance-none focus:outline-none focus:border-teal-500/50 focus:bg-white/5 transition-all cursor-pointer"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-[#161B22] text-white">
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="tags">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  name="tags"
                  className="w-full p-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:bg-white/5 transition-all"
                  placeholder="react, ai..."
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                    setFormData(prev => ({ ...prev, tags }));
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="description">
                Protocol / Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="w-full p-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:bg-white/5 transition-all resize-none"
                placeholder="Operational details..."
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium shadow-lg shadow-teal-900/20 transition-all hover:scale-105 active:scale-95 text-sm"
            >
              <Save size={18} className="mr-2" />
              {editingBookmark ? 'Update Agent' : 'Deploy Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
