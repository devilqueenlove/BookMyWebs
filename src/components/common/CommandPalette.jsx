import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import {
    Search, Plus, Sun, Moon, LayoutGrid, List,
    Folder, Code, Film, Newspaper, ShoppingBag,
    Heart, Briefcase, Plane, Monitor, Coffee, Zap,
    Globe, Command as CommandIcon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function CommandPalette({
    bookmarks = [],
    categories = [],
    onAddBookmark,
    onSelectCategory,
    onChangeViewMode
}) {
    const [open, setOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    // Toggle with Ctrl+K or Cmd+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
        >
            {/* Backdrop with blur */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={() => setOpen(false)} />

            {/* Bioluminescent Glow Layer */}
            <div className="fixed inset-0 pointer-events-none flex items-start justify-center pt-[15vh]">
                <div className="w-full max-w-2xl h-72 rounded-full bg-primary/10 blur-[100px] opacity-50" />
            </div>

            <div className="relative w-full max-w-2xl bg-charcoal/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5 backdrop-blur-xl">
                <div className="flex items-center border-b border-white/5 px-4">
                    <CommandIcon className="w-4 h-4 text-gray-500 mr-2" />
                    <Command.Input
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent p-4 text-base text-white placeholder-gray-500 focus:outline-none font-medium"
                    />
                    <div className="flex items-center gap-1">
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white/5 rounded border border-white/10">ESC</kbd>
                    </div>
                </div>

                <Command.List className="max-h-[50vh] overflow-y-auto p-2 scroll-py-2">
                    <Command.Empty className="py-6 text-center text-gray-500 text-sm">
                        No results found.
                    </Command.Empty>

                    <Command.Group heading="Actions" className="text-xs font-medium text-liquid-teal mb-2 px-2 uppercase tracking-widest">
                        <Command.Item
                            onSelect={() => runCommand(() => onAddBookmark())}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 rounded-lg aria-selected:bg-primary/20 aria-selected:text-primary cursor-pointer transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Bookmark</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => alert('Clean-up Agent Started... (Simulation)'))}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 rounded-lg aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span>Run Clean-up Agent</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => toggleTheme())}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 rounded-lg aria-selected:bg-white/5 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            <span>Toggle Theme</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => onChangeViewMode('grid'))}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 rounded-lg aria-selected:bg-white/5 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span>Switch to Grid View</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => onChangeViewMode('list'))}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 rounded-lg aria-selected:bg-white/5 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <List className="w-3.5 h-3.5 text-gray-500" />
                            <span>Switch to List View</span>
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Go to Category" className="text-[10px] font-semibold text-gray-500 mb-2 px-2 mt-4 uppercase tracking-widest">
                        <Command.Item
                            onSelect={() => runCommand(() => onSelectCategory('All'))}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 rounded-lg aria-selected:bg-primary/10 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <Globe className="w-3.5 h-3.5 text-gray-500" />
                            <span>All Bookmarks</span>
                        </Command.Item>
                        {categories.map((category) => (
                            <Command.Item
                                key={category}
                                onSelect={() => runCommand(() => onSelectCategory(category))}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 rounded-lg aria-selected:bg-primary/10 aria-selected:text-white cursor-pointer transition-colors"
                            >
                                <Folder className="w-3.5 h-3.5 text-gray-500" />
                                <span>{category}</span>
                            </Command.Item>
                        ))}
                    </Command.Group>

                    {bookmarks.length > 0 && (
                        <Command.Group heading="Open Bookmark" className="text-xs font-medium text-gray-500 mb-2 px-2 mt-4">
                            {bookmarks.slice(0, 10).map((bookmark) => (
                                <Command.Item
                                    key={bookmark.id}
                                    value={bookmark.title + ' ' + bookmark.url}
                                    onSelect={() => runCommand(() => window.open(bookmark.url, '_blank'))}
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 rounded-lg aria-selected:bg-accent/20 aria-selected:text-accent-1 cursor-pointer transition-colors group"
                                >
                                    <img
                                        src={`https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`}
                                        alt=""
                                        className="w-4 h-4 rounded-sm opacity-70 group-aria-selected:opacity-100"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="flex flex-col truncate">
                                        <span className="truncate">{bookmark.title}</span>
                                        <span className="text-[10px] text-gray-500 truncate group-aria-selected:text-accent-3/70">{bookmark.url}</span>
                                    </div>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}
                </Command.List>
                <div className="border-t border-white/5 py-1.5 px-4 flex justify-between items-center bg-white/[0.02]">
                    <span className="text-[10px] text-gray-600">Antigravity OS v2.0</span>
                    <div className="flex gap-2">
                        <span className="text-[10px] text-gray-500">Search by category, name or URL</span>
                    </div>
                </div>
            </div>
        </Command.Dialog>
    );
}
