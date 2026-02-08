import { useEffect } from 'react';

export default function useKeyboardShortcuts({
    onChangeViewMode,
    onOpenCommandPalette,
    onNewBookmark,
    bookmarks,
    selectedBookmarks,
    onToggleSelection,
    onOpenSelected,
    onDeleteSelected
}) {
    useEffect(() => {
        let lastKeyTime = 0;
        let lastKey = null;

        const handleKeyDown = (e) => {
            // Ignore if typing in an input
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            const now = Date.now();
            const isSequence = now - lastKeyTime < 500;

            // Global Shortcuts
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onOpenCommandPalette();
                return;
            }

            if (e.key === 'n') {
                e.preventDefault();
                onNewBookmark();
                return;
            }

            // View Switching Sequences (G then ...)
            if (isSequence && lastKey === 'g') {
                if (e.key === 'l') {
                    onChangeViewMode('list');
                    lastKey = null;
                    return;
                }
                if (e.key === 'g') {
                    onChangeViewMode('grid'); // g then g
                    lastKey = null;
                    return;
                }
            }

            // Store key for sequence detection
            if (e.key === 'g') {
                lastKey = 'g';
                lastKeyTime = now;
            }

            // Navigation (J/K) - Simplistic implementation (selects next/prev visual item)
            // This is complex because "next" depends on view mode and sorting. 
            // For now, let's implement basic selection cycling if any item is selected.
            if (e.key === 'j' || e.key === 'k') {
                // Logic to select next/prev item
                // Requires knowledge of current filtered list. 
                // For Phase 10 MVP, we'll skip detailed J/K navigation implementation 
                // as it requires passing the full sorted list and current index state.
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onChangeViewMode, onOpenCommandPalette, onNewBookmark]);
}
