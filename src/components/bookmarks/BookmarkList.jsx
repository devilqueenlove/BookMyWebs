import { Trash2, Edit, ExternalLink, Clock, Calendar, Link as LinkIcon, Info } from 'lucide-react';

// Helper component for the icons
const SearchIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FolderIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const BookmarkIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
  </svg>
);

export default function BookmarkList({ 
  bookmarks, 
  onEdit, 
  onDelete, 
  searchQuery, 
  activeCategory,
  viewMode = 'grid' // grid or list view mode
}) {
  // Get favicon for a URL
  const getFavicon = (url) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch (e) {
      return `https://www.google.com/s2/favicons?domain=example.com&sz=32`;
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-10 text-center max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          {searchQuery ? (
            <SearchIcon size={40} className="text-gray-300 dark:text-gray-600" />
          ) : activeCategory !== 'All' ? (
            <FolderIcon size={40} className="text-gray-300 dark:text-gray-600" />
          ) : (
            <BookmarkIcon size={40} className="text-gray-300 dark:text-gray-600" />
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No bookmarks found</h3>
        {searchQuery ? (
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search query or try another category.</p>
        ) : activeCategory !== 'All' ? (
          <p className="text-gray-500 dark:text-gray-400">This category is empty. Add a bookmark or select another category.</p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Add your first bookmark to get started with WebCity.</p>
        )}
      </div>
    );
  }
  
  // Date formatter helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Grid View Rendering
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {bookmarks.map(bookmark => (
        <div 
          key={bookmark.id} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all group relative border border-transparent hover:border-gray-200 dark:hover:border-gray-700 overflow-hidden"
        >
          {/* Top decorative bar - different color based on category */}
          <div className={`h-1.5 w-full ${getCategoryColor(bookmark.category)}`}></div>
          
          <div className="p-4">
            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onEdit(bookmark);
                }}
                className="p-1.5 rounded-full bg-white dark:bg-gray-700 text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 shadow-sm"
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
                className="p-1.5 rounded-full bg-white dark:bg-gray-700 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 shadow-sm"
                title="Delete bookmark"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block h-full"
            >
              {/* Header with favicon and title */}
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <div className="w-8 h-8 flex items-center justify-center rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={getFavicon(bookmark.url)} 
                      alt=""
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://www.google.com/s2/favicons?domain=example.com&sz=32';
                      }}
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-white text-base truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {bookmark.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center mt-0.5">
                    <LinkIcon size={12} className="inline mr-1 flex-shrink-0" />
                    {bookmark.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                  </p>
                </div>
              </div>
              
              {/* Description with fade-out effect */}
              {bookmark.description && (
                <div className="mt-3 relative">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {bookmark.description}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
                </div>
              )}
              
              {/* Footer */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs py-1 px-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full truncate max-w-[130px] font-medium">
                  {bookmark.category || "Uncategorized"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock size={12} className="mr-1" />
                  {formatDate(bookmark.createdAt || new Date())}
                </span>
              </div>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
  
  // List View Rendering
  const renderListView = () => (
    <div className="space-y-2">
      {bookmarks.map(bookmark => (
        <div 
          key={bookmark.id} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all group relative border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
        >
          <a 
            href={bookmark.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center p-3 sm:p-4"
          >
            {/* Left: Favicon */}
            <div className="mr-3 flex-shrink-0">
              <div className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img 
                  src={getFavicon(bookmark.url)} 
                  alt=""
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://www.google.com/s2/favicons?domain=example.com&sz=32';
                  }}
                />
              </div>
            </div>
            
            {/* Middle: Title and URL */}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-800 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {bookmark.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center">
                  <LinkIcon size={12} className="inline mr-1 flex-shrink-0" />
                  {bookmark.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar size={12} className="mr-1" />
                  {formatDate(bookmark.createdAt || new Date())}
                </p>
                <span className="text-xs py-0.5 px-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full truncate max-w-[120px]">
                  {bookmark.category || "Uncategorized"}
                </span>
              </div>
            </div>
            
            {/* Description tooltip on hover */}
            {bookmark.description && (
              <div className="relative ml-2 group hidden sm:block">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full bg-gray-100 dark:bg-gray-700">
                  <Info size={14} />
                </button>
                <div className="absolute right-0 top-0 w-64 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 transform translate-y-[-100%] text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  {bookmark.description}
                </div>
              </div>
            )}
            
            {/* Right: Action buttons */}
            <div className="ml-4 flex space-x-1 flex-shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onEdit(bookmark);
                }}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400"
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
              <button 
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                title="Open link"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
  
  // Helper function to get color based on category
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Work': 'bg-blue-500',
      'Personal': 'bg-purple-500',
      'Learning': 'bg-green-500',
      'Finance': 'bg-amber-500',
      'Travel': 'bg-pink-500',
      'Social': 'bg-red-500',
      'Entertainment': 'bg-indigo-500',
      'Health': 'bg-emerald-500',
      'Shopping': 'bg-orange-500',
      'Productivity': 'bg-cyan-500',
      'News': 'bg-yellow-500',
      'Code': 'bg-slate-500',
      'Video': 'bg-rose-500'
    };
    
    return categoryColors[category] || 'bg-gray-500';
  };
  
  return viewMode === 'grid' ? renderGridView() : renderListView();
}
