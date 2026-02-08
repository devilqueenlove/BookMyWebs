import { useState, useEffect } from 'react';
import { X, Bot, Loader, CheckCircle, FolderOpen, Sparkles, Zap, ArrowRight } from 'lucide-react';

/**
 * CleanupAgentModal - Simulates an AI agent categorizing bookmarks
 * Shows progressive feedback as each bookmark is analyzed
 */
export default function CleanupAgentModal({
    isOpen,
    onClose,
    bookmarks = [],
    categories = [],
    onCategorize
}) {
    const [phase, setPhase] = useState('idle'); // idle, scanning, analyzing, categorizing, complete
    const [progress, setProgress] = useState(0);
    const [currentBookmark, setCurrentBookmark] = useState(null);
    const [results, setResults] = useState([]);
    const [logs, setLogs] = useState([]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPhase('idle');
            setProgress(0);
            setCurrentBookmark(null);
            setResults([]);
            setLogs([]);
        }
    }, [isOpen]);

    // Add log message
    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, timestamp: Date.now() }]);
    };

    // Run the cleanup agent simulation
    const runAgent = async () => {
        // Filter uncategorized bookmarks
        const uncategorized = bookmarks.filter(b => !b.category || b.category === 'Uncategorized');

        if (uncategorized.length === 0) {
            addLog('No uncategorized bookmarks found.', 'warning');
            setPhase('complete');
            return;
        }

        // Phase 1: Scanning
        setPhase('scanning');
        addLog(`🔍 Scanning ${bookmarks.length} bookmarks...`);
        await delay(800);
        addLog(`Found ${uncategorized.length} uncategorized items.`);
        await delay(500);

        // Phase 2: Analyzing
        setPhase('analyzing');
        addLog('🧠 Loading categorization model...');
        await delay(600);
        addLog('✓ Model ready. Starting analysis...');
        await delay(400);

        // Import categorization utility
        const { categorizeUrl } = await import('../../utils/categorizeUrl');

        const categorizedResults = [];

        // Phase 3: Categorizing each bookmark
        setPhase('categorizing');

        for (let i = 0; i < uncategorized.length; i++) {
            const bookmark = uncategorized[i];
            setCurrentBookmark(bookmark);
            setProgress(Math.round(((i + 1) / uncategorized.length) * 100));

            // Extract domain for display
            let domain = '';
            try {
                domain = new URL(bookmark.url).hostname.replace('www.', '');
            } catch (e) {
                domain = bookmark.url;
            }

            addLog(`→ Analyzing: ${domain}`);
            await delay(300 + Math.random() * 400); // Variable delay for realism

            // Get category suggestion
            const suggestedCategory = categorizeUrl(
                bookmark.url,
                bookmark.title,
                bookmark.description || ''
            );

            if (suggestedCategory && suggestedCategory !== 'Uncategorized') {
                categorizedResults.push({
                    id: bookmark.id,
                    title: bookmark.title,
                    url: bookmark.url,
                    oldCategory: 'Uncategorized',
                    newCategory: suggestedCategory
                });
                addLog(`  ✓ ${bookmark.title.substring(0, 30)}... → ${suggestedCategory}`, 'success');
            } else {
                addLog(`  ○ ${bookmark.title.substring(0, 30)}... → Skipped (no match)`, 'dim');
            }
        }

        setResults(categorizedResults);
        setCurrentBookmark(null);

        // Phase 4: Complete
        setPhase('complete');
        addLog('');
        addLog(`✨ Analysis complete! ${categorizedResults.length} bookmarks categorized.`, 'success');
    };

    // Apply the categorization changes
    const applyChanges = async () => {
        if (results.length === 0) {
            onClose();
            return;
        }

        addLog('💾 Saving changes to database...');

        try {
            await onCategorize(results);
            addLog('✓ All changes saved successfully!', 'success');
            await delay(1000);
            onClose();
        } catch (error) {
            addLog('✗ Error saving changes. Please try again.', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0d10] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Cleanup Agent</h2>
                            <p className="text-xs text-gray-500">AI-powered bookmark categorization</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Idle State */}
                    {phase === 'idle' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center border border-primary/30">
                                <Sparkles size={32} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Ready to Clean Up</h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                The Cleanup Agent will analyze your uncategorized bookmarks and
                                automatically assign them to relevant categories based on their content.
                            </p>
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-8">
                                <div className="flex items-center gap-2">
                                    <FolderOpen size={16} className="text-primary" />
                                    <span>{bookmarks.filter(b => !b.category || b.category === 'Uncategorized').length} uncategorized</span>
                                </div>
                                <div className="w-px h-4 bg-white/10"></div>
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className="text-amber-500" />
                                    <span>{categories.length} categories</span>
                                </div>
                            </div>
                            <button
                                onClick={runAgent}
                                className="px-6 py-3 bg-gradient-to-r from-primary to-cyan-500 text-white font-medium rounded-xl hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
                            >
                                <Bot size={18} />
                                Run Cleanup Agent
                            </button>
                        </div>
                    )}

                    {/* Progress States */}
                    {(phase === 'scanning' || phase === 'analyzing' || phase === 'categorizing') && (
                        <div>
                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-400">
                                        {phase === 'scanning' && 'Scanning bookmarks...'}
                                        {phase === 'analyzing' && 'Loading AI model...'}
                                        {phase === 'categorizing' && `Categorizing (${progress}%)`}
                                    </span>
                                    {currentBookmark && (
                                        <span className="text-primary truncate max-w-[200px]">
                                            {currentBookmark.title}
                                        </span>
                                    )}
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-300 ease-out"
                                        style={{ width: `${phase === 'categorizing' ? progress : (phase === 'analyzing' ? 30 : 10)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Live Logs */}
                            <div className="bg-[#0E1116] border border-white/5 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs">
                                {logs.map((log, i) => (
                                    <div
                                        key={i}
                                        className={`py-0.5 ${log.type === 'success' ? 'text-green-400' :
                                            log.type === 'error' ? 'text-red-400' :
                                                log.type === 'warning' ? 'text-amber-400' :
                                                    log.type === 'dim' ? 'text-gray-600' :
                                                        'text-gray-400'
                                            }`}
                                    >
                                        {log.message}
                                    </div>
                                ))}
                                <div className="animate-pulse text-primary">▌</div>
                            </div>
                        </div>
                    )}

                    {/* Complete State */}
                    {phase === 'complete' && (
                        <div>
                            {/* Summary */}
                            <div className="text-center py-4 mb-4">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle size={32} className="text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">Analysis Complete</h3>
                                <p className="text-gray-400">
                                    {results.length > 0
                                        ? `${results.length} bookmarks ready to be categorized`
                                        : 'No bookmarks could be automatically categorized'
                                    }
                                </p>
                            </div>

                            {/* Results List */}
                            {results.length > 0 && (
                                <div className="bg-[#0E1116] border border-white/5 rounded-xl max-h-48 overflow-y-auto mb-4">
                                    {results.map((result, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between px-4 py-2 border-b border-white/5 last:border-0"
                                        >
                                            <span className="text-sm text-gray-300 truncate max-w-[300px]">
                                                {result.title}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-gray-600">Uncategorized</span>
                                                <ArrowRight size={12} className="text-gray-600" />
                                                <span className="text-primary font-medium">{result.newCategory}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyChanges}
                                    disabled={results.length === 0}
                                    className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Apply Changes ({results.length})
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Utility delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
