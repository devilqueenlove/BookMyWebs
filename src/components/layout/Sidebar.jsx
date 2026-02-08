import { useState } from 'react';
import {
  Plus, Trash2, Save, Folder, Star, ChevronLeft, ChevronRight,
  Code, Film, Newspaper, ShoppingBag, Heart, Briefcase, Plane,
  Monitor, Coffee, Globe, BookOpen, Music, Zap
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper Component for Sortable Item
function SortableCategoryItem({ category, activeCategory, isMinimized, setActiveCategory, handleDeleteCategory, getCategoryIcon, onDrop }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setActiveCategory(category)}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.background = '';
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.style.background = '';
        if (onDrop) onDrop(e, category);
      }}
      className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm transition-all duration-300 cursor-pointer touch-none ${activeCategory === category
        ? 'bg-white/10 text-white shadow-lg'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
        }`}
    >
      <div className="flex items-center w-full relative z-10">
        {!isMinimized && (
          <div className="mr-3 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing">
            <div className="grid grid-cols-1 gap-0.5 w-1">
              {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 bg-white rounded-full" />)}
            </div>
          </div>
        )}

        {isMinimized ? (
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00f5ff] group-hover:bg-[#00f5ff] group-hover:text-black transition-all duration-300 mx-auto border border-white/5">
            {getCategoryIcon(category)}
          </div>
        ) : (
          <>
            <span className={`transition-colors duration-300 ${activeCategory === category ? 'text-[#00f5ff]' : 'group-hover:text-[#00f5ff]'}`}>
              {getCategoryIcon(category)}
            </span>
            <span className="font-bold tracking-tight">{category}</span>
          </>
        )}
      </div>

      {!isMinimized && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteCategory(category);
          }}
          className="relative z-20 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-600 transition-all duration-300 ml-2"
          title={`Delete ${category}`}
        >
          <Trash2 size={14} />
        </button>
      )}

      {activeCategory === category && (
        <div className="absolute inset-0 border border-white/10 rounded-2xl z-0" />
      )}
    </li>
  );
}

export default function Sidebar({
  categories,
  activeCategory,
  setActiveCategory,
  setCategories,
  bookmarks,
  handleDeleteCategory,
  onDrop,
  onDragOver
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

  // dnd-kit Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags on click)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      // TODO: Persist new category order to Firestore in App.jsx or here if Categories is a prop
    }
  };

  // Get first letter or icon for minimized view
  const getCategoryInitial = (category) => {
    return category.charAt(0).toUpperCase();
  };

  const getCategoryIcon = (category) => {
    const iconProps = { size: 18, className: isMinimized ? "text-accent" : "mr-3" };

    switch (category.toLowerCase()) {
      case 'code':
      case 'development':
        return <Code {...iconProps} />;
      case 'video':
      case 'entertainment':
      case 'movies':
        return <Film {...iconProps} />;
      case 'news':
      case 'reading':
      case 'articles':
        return <Newspaper {...iconProps} />;
      case 'shopping':
        return <ShoppingBag {...iconProps} />;
      case 'health':
      case 'fitness':
        return <Heart {...iconProps} />;
      case 'work':
      case 'office':
      case 'business':
        return <Briefcase {...iconProps} />;
      case 'travel':
        return <Plane {...iconProps} />;
      case 'technology':
      case 'tech':
        return <Monitor {...iconProps} />;
      case 'lifestyle':
      case 'social':
        return <Coffee {...iconProps} />;
      case 'music':
        return <Music {...iconProps} />;
      case 'productivity':
        return <Zap {...iconProps} />;
      case 'education':
      case 'learning':
        return <BookOpen {...iconProps} />;
      default:
        return <Folder {...iconProps} />;
    }
  };

  return (
    <aside
      className={`${isMinimized ? 'w-20' : 'w-64'} bg-black/20 backdrop-blur-3xl border-r border-white/5 overflow-y-auto transition-all duration-500 ease-in-out flex-shrink-0 relative h-[calc(100vh-64px)]`}
    >
      <div className="sticky top-0 z-10 p-5 flex justify-between items-center bg-transparent">
        {!isMinimized && (
          <h2 className="font-black text-xs text-white/40 uppercase tracking-[0.2em]">Storage Units</h2>
        )}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all duration-300"
          title={isMinimized ? "Expand" : "Collapse"}
        >
          {isMinimized ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="px-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-1.5">
              <li
                className={`group relative p-3 cursor-pointer rounded-2xl flex items-center justify-between transition-all duration-300 ${activeCategory === 'All'
                  ? 'bg-white/10 text-white shadow-[0_10px_20px_-10px_rgba(255,255,255,0.1)]'
                  : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                  }`}
                onClick={() => setActiveCategory('All')}
              >
                <div className="flex items-center relative z-10">
                  <Star size={18} className={`mr-3 transition-transform duration-500 group-hover:scale-110 ${activeCategory === 'All' ? 'text-[#00f5ff] fill-[#00f5ff]/20' : 'text-gray-500'}`} />
                  {!isMinimized && <span className="text-sm font-bold tracking-tight">All Files</span>}
                </div>
                {activeCategory === 'All' && (
                  <div className="absolute inset-0 border border-white/10 rounded-2xl z-0" />
                )}
              </li>

              <div className="my-4 h-px bg-white/5 mx-2" />

              {categories.map(category => (
                <SortableCategoryItem
                  key={category}
                  category={category}
                  activeCategory={activeCategory}
                  isMinimized={isMinimized}
                  setActiveCategory={setActiveCategory}
                  handleDeleteCategory={handleDeleteCategory}
                  getCategoryIcon={getCategoryIcon}
                  onDrop={onDrop}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {!isMinimized && (
          <div className="mt-8 px-2 pb-6">
            {isAddingCategory ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1 mb-2">
                  <input
                    type="text"
                    autoFocus
                    className="flex-1 bg-transparent border-none text-white text-xs focus:outline-none focus:ring-0 py-2"
                    placeholder="Sector name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button
                    className="text-[#00f5ff] hover:text-white transition-colors"
                    onClick={handleAddCategory}
                  >
                    <Save size={16} />
                  </button>
                </div>
                <button
                  className="w-full text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors py-1"
                  onClick={() => setIsAddingCategory(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="group w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-white/10 text-gray-500 hover:border-white/20 hover:text-white transition-all duration-300"
                onClick={() => setIsAddingCategory(true)}
              >
                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                <span className="text-xs font-bold uppercase tracking-widest">New Sector</span>
              </button>
            )}
          </div>
        )}

        {isMinimized && (
          <button
            className="mt-6 w-12 h-12 mx-auto rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-gray-500 hover:border-[#00f5ff]/30 hover:text-[#00f5ff] transition-all duration-300"
            onClick={() => {
              setIsMinimized(false);
              setIsAddingCategory(true);
            }}
            title="New Sector"
          >
            <Plus size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
