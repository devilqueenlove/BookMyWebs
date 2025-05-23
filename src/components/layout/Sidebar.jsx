import { useState } from 'react';
import { Plus, Trash2, Save, Folder, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ 
  categories, 
  activeCategory, 
  setActiveCategory, 
  setCategories,
  bookmarks,
  handleDeleteCategory
}) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Add new category
  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  // Get first letter or icon for minimized view
  const getCategoryInitial = (category) => {
    return category.charAt(0).toUpperCase();
  };

  return (
    <aside 
      className={`${isMinimized ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 shadow-md overflow-y-auto transition-all duration-300 flex-shrink-0 relative`}
    >
      <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        {!isMinimized && (
          <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Categories</h2>
        )}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          title={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div className="p-3">
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
              {!isMinimized && "All Bookmarks"}
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
                {isMinimized ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 font-medium">
                    {getCategoryInitial(category)}
                  </div>
                ) : (
                  <>
                    <Folder size={16} className="mr-2" />
                    {category}
                  </>
                )}
              </div>
              {!isMinimized && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition-opacity"
                  title={`Delete ${category} category`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
        
        {!isMinimized && (
          <>
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
          </>
        )}
        
        {isMinimized && (
          <button 
            className="mt-4 flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            onClick={() => {
              setIsMinimized(false);
              setIsAddingCategory(true);
            }}
            title="Add Category"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
