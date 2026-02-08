import { BookOpen, Search, FolderOpen } from 'lucide-react';

export default function EmptyState({ type = 'default', message, subMessage }) {
    const getIcon = () => {
        switch (type) {
            case 'search':
                return <Search size={48} className="text-muted/30" />;
            case 'category':
                return <FolderOpen size={48} className="text-muted/30" />;
            default:
                return <BookOpen size={48} className="text-muted/30" />;
        }
    };

    const getMessage = () => {
        if (message) return message;
        switch (type) {
            case 'search':
                return 'No results found';
            case 'category':
                return 'This category is empty';
            default:
                return 'No bookmarks yet';
        }
    };

    const getSubMessage = () => {
        if (subMessage) return subMessage;
        switch (type) {
            case 'search':
                return 'Try adjusting your search terms';
            case 'category':
                return 'Add a bookmark to this category to get started';
            default:
                return 'Save your first bookmark to build your library';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-6 p-6 rounded-full bg-accent/5 border border-accent/10 shadow-sm">
                {getIcon()}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{getMessage()}</h3>
            <p className="text-muted max-w-sm mx-auto">{getSubMessage()}</p>
        </div>
    );
}
