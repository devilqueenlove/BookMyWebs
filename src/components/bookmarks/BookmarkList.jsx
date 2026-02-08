import { Trash2, Edit2, ExternalLink, Clock, Calendar, Link as LinkIcon, Info, Tag, CheckSquare, Square, BookOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import EmptyState from '../common/EmptyState';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

// Wrapper for Sortable Grid Item
function SortableBookmarkCard({ bookmark, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // "Ghost" effect on original
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
      {children}
    </div>
  );
}

export default function BookmarkList({
  bookmarks,
  onEdit,
  onDelete,
  searchQuery,
  activeCategory,
  viewMode = 'grid',
  selectedBookmarks = new Set(),
  onToggleSelection,
  onToggleSelectAll,
  onDragStart,
  onDrop,
  onMoveToTop,
  onMoveToBottom,
  onDragOver,
  linkHealth = new Map() // Map<url, 'online' | 'offline' | 'unknown'>
}) {
  // Get favicon for a URL with higher resolution
  const getFavicon = (url) => {
    try {
      const urlObj = new URL(url);
      // Using sz=128 for higher resolution
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    } catch (e) {
      return `https://www.google.com/s2/favicons?domain=example.com&sz=128`;
    }
  };

  if (bookmarks.length === 0) {
    if (searchQuery) {
      return <EmptyState type="search" />;
    }
    if (activeCategory !== 'All') {
      return <EmptyState type="category" />;
    }
    return <EmptyState />;
  }

  // Date formatter helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';

    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // dnd-kit Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const [activeId, setActiveId] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const mockEvent = {
        preventDefault: () => { },
        dataTransfer: { getData: () => active.id }
      };
      onDrop(mockEvent, null, over.id);
    }
    setActiveId(null);
  };

  // Grid View Rendering
  const renderGridView = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={bookmarks.map(b => b.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {bookmarks.map(bookmark => (
            <SortableBookmarkCard bookmark={bookmark} key={bookmark.id}>
              <div
                className={`group relative aspect-[1.6/1] rounded-2xl overflow-hidden transition-all duration-500 ease-out border cursor-grab active:cursor-grabbing ${selectedBookmarks.has(bookmark.id)
                  ? 'ring-2 ring-[#00f5ff] border-transparent shadow-[0_0_30px_-5px_rgba(0,245,255,0.4)] z-10'
                  : 'border-white/10 bg-[#0E1116] hover:border-white/25 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-1'
                  }`}
              >
                {/* 1. Dynamic Background / Image */}
                <div className="absolute inset-0 z-0">
                  {bookmark.image ? (
                    <img
                      src={bookmark.image}
                      alt={bookmark.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-40 group-hover:opacity-60"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${bookmark.id.charCodeAt(0) % 2 === 0 ? 'mesh-gradient-1' : 'mesh-gradient-2'} opacity-60 group-hover:opacity-80`} />
                  )}

                  {/* Icon Glow / Backdrop */}
                  <div className="absolute inset-x-0 bottom-0 top-1/4 bg-gradient-to-t from-[#0E1116] via-[#0E1116]/90 to-transparent z-10" />
                </div>

                {/* 2. Central Content (Favicon) */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 pb-16">
                  <div className="relative group/icon">
                    {/* Animated Glow Rings */}
                    <div className="absolute inset-0 rounded-2xl bg-[#00f5ff]/20 blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:border-[#00f5ff]/30">
                      <img
                        src={getFavicon(bookmark.url)}
                        alt="Site icon"
                        className="w-10 h-10 object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        onError={(e) => e.target.src = 'https://www.google.com/s2/favicons?domain=example.com&sz=128'}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. HUD Controls */}
                <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="flex justify-between items-start pointer-events-auto">
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.preventDefault(); onToggleSelection(bookmark.id); }}
                      className={`p-2 rounded-xl transition-all duration-300 backdrop-blur-md border ${selectedBookmarks.has(bookmark.id)
                        ? 'bg-[#00f5ff] text-black border-[#00f5ff] shadow-[0_0_15px_rgba(0,245,255,0.5)]'
                        : 'bg-black/40 text-gray-400 border-white/10 hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                        }`}
                    >
                      {selectedBookmarks.has(bookmark.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>

                    <div className="flex bg-black/60 backdrop-blur-xl rounded-xl p-1 border border-white/5 shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75 gap-0.5">
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(bookmark.url); }}
                        className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                        title="Copy URL"
                      >
                        <LinkIcon size={14} />
                      </button>
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.preventDefault(); onEdit(bookmark); }}
                        className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.preventDefault(); onDelete(bookmark.id); }}
                        className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Metadata */}
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto block transition-all duration-300"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[9px] text-[#00f5ff] uppercase tracking-wider bg-[#00f5ff]/10 px-1.5 py-0.5 rounded border border-[#00f5ff]/20">
                          {bookmark.category}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="font-mono text-[9px] text-gray-400 truncate max-w-[100px]">
                          {new URL(bookmark.url).hostname.replace('www.', '')}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm leading-tight line-clamp-1 mb-0.5 group-hover:text-[#00f5ff] transition-colors drop-shadow-lg">
                        {bookmark.title}
                      </h3>
                      <p className="text-[10px] text-gray-500 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {bookmark.description || "No description available."}
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </SortableBookmarkCard>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="aspect-[1.6/1] rounded-2xl overflow-hidden border border-[#00f5ff]/50 shadow-[0_0_40px_-10px_rgba(0,245,255,0.6)] z-50 scale-105 bg-[#0E1116]/90 backdrop-blur-2xl p-4 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#00f5ff]/20 animate-pulse" />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  // List View Rendering
  const renderListView = () => (
    <div className="space-y-2 pb-20">
      {bookmarks.map(bookmark => (
        <div
          key={bookmark.id}
          className={`group relative rounded-lg border transition-all duration-200 ${selectedBookmarks.has(bookmark.id)
            ? 'bg-accent/5 border-accent/30'
            : 'bg-[#161B22]/50 border-white/5 hover:bg-[#161B22] hover:border-white/10'
            }`}
        >
          <div className="flex items-center p-3 gap-4">
            {/* Checkbox */}
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleSelection(bookmark.id);
              }}
              className={`p-1.5 rounded-md transition-colors ${selectedBookmarks.has(bookmark.id)
                ? 'text-accent'
                : 'text-gray-600 group-hover:text-gray-400'
                }`}
            >
              {selectedBookmarks.has(bookmark.id) ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>

            {/* Favicon */}
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
              <img
                src={getFavicon(bookmark.url)}
                className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
                onError={(e) => e.target.src = 'https://www.google.com/s2/favicons?domain=example.com&sz=32'}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5">
                <h3 className="font-medium text-gray-200 truncate group-hover:text-primary transition-colors">{bookmark.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="truncate">{bookmark.url}</span>
                </div>
              </div>

              <div className="hidden md:block md:col-span-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${activeCategory === bookmark.category ? 'bg-primary/10 text-primary' : 'bg-white/5 text-gray-400'}`}>
                  {bookmark.category}
                </span>
              </div>

              <div className="hidden md:block md:col-span-4 text-right text-xs text-gray-500">
                {formatDate(bookmark.createdAt)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
              <button onClick={() => onEdit(bookmark)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Edit2 size={14} /></button>
              <button onClick={() => onDelete(bookmark.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              <a href={bookmark.url} target="_blank" className="p-2 hover:bg-primary/10 rounded-lg text-gray-400 hover:text-primary transition-colors"><ExternalLink size={14} /></a>
            </div>
          </div>
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
