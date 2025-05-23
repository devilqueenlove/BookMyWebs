import { Trash2, Edit, ExternalLink } from 'lucide-react';

export default function BookmarkList({ 
  bookmarks, 
  onEdit, 
  onDelete, 
  searchQuery, 
  activeCategory 
}) {
  // Filter bookmarks based on category and search query
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesCategory = activeCategory === 'All' || bookmark.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bookmark.description && bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Get favicon for a URL
  const getFavicon = (url) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch (e) {
      return `https://www.google.com/s2/favicons?domain=example.com&sz=32`;
    }
  };

  if (filteredBookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-2">No bookmarks found.</p>
        {searchQuery ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search query.</p>
        ) : activeCategory !== 'All' ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">This category is empty.</p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Add your first bookmark to get started.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredBookmarks.map(bookmark => (
        <div 
          key={bookmark.id} 
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow group relative"
        >
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity z-10">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit(bookmark);
              }}
              className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Edit bookmark"
            >
              <Edit size={14} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(bookmark.id);
              }}
              className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              title="Delete bookmark"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          <a 
            href={bookmark.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block"
          >
            <div className="flex items-start mb-2">
              <img 
                src={getFavicon(bookmark.url)} 
                alt=""
                className="w-6 h-6 mt-1 mr-2 rounded-sm flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://www.google.com/s2/favicons?domain=example.com&sz=32';
                }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-800 dark:text-white text-sm sm:text-base truncate">
                  {bookmark.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {bookmark.url}
                </p>
              </div>
            </div>
            
            {bookmark.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2 mb-3">
                {bookmark.description}
              </p>
            )}
            
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs py-1 px-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full truncate max-w-[120px]">
                {bookmark.category || "Uncategorized"}
              </span>
              <span className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center text-xs">
                Visit <ExternalLink size={12} className="ml-1" />
              </span>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}
