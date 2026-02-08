import { X, RefreshCw, Download, LogOut, Palette, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import ImportExport from './ImportExport';
import ThemeSelector from './ThemeSelector';

export default function SettingsModal({ isOpen, onClose, onRunCleanupAgent, isProcessing, bookmarks, categories }) {
  const { logout } = useAuth();
  const [themeExpanded, setThemeExpanded] = useState(false);
  const [importExportExpanded, setImportExportExpanded] = useState(false);
  const [categorizationExpanded, setCategorizationExpanded] = useState(false);
  const [accountExpanded, setAccountExpanded] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Failed to log out", error);
      alert("Failed to log out. Please try again.");
    }
  };
  if (!isOpen) return null;

  return isOpen && (
    <>
      <div className="fixed inset-0 bg-transparent z-40" onClick={onClose} />
      <div className="fixed right-4 top-20 z-50 w-80 animate-in slide-in-from-right-5 duration-200">
        <div className="bg-[#161B22] border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/5">
          <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#161B22]/95 backdrop-blur-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
              System
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="group">
              <button
                onClick={() => setCategorizationExpanded(!categorizationExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center mr-4 text-teal-400">
                    <Bot size={18} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-200 text-sm">Cleanup Agent</h4>
                    <p className="text-[10px] text-gray-500">AI-powered organization</p>
                  </div>
                </div>
                {categorizationExpanded ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>

              {categorizationExpanded && (
                <div className="mt-2 p-4 bg-black/20 rounded-xl border border-white/5 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                    The Cleanup Agent analyzes your uncategorized bookmarks and automatically assigns them to relevant categories based on URL patterns and content.
                  </p>
                  <button
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white py-2.5 px-4 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-teal-900/20 text-sm font-medium"
                    onClick={onRunCleanupAgent}
                    disabled={isProcessing || bookmarks.length === 0}
                  >
                    <Bot size={16} className="mr-2" />
                    Run Cleanup Agent
                  </button>
                </div>
              )}
            </div>

            <div className="group">
              <button
                onClick={() => setThemeExpanded(!themeExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mr-4 text-purple-400">
                    <Palette size={18} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-200 text-sm">Interface Theme</h4>
                    <p className="text-[10px] text-gray-500">Visual customization</p>
                  </div>
                </div>
                {themeExpanded ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>

              {themeExpanded && (
                <div className="mt-2 p-4 bg-black/20 rounded-xl border border-white/5 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-gray-400 text-xs mb-4">
                    Select your preferred visual environment.
                  </p>
                  <ThemeSelector />
                </div>
              )}
            </div>

            <div className="group">
              <button
                onClick={() => setImportExportExpanded(!importExportExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4 text-blue-400">
                    <Download size={18} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-200 text-sm">Data Transfer</h4>
                    <p className="text-[10px] text-gray-500">Import / Export</p>
                  </div>
                </div>
                {importExportExpanded ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>

              {importExportExpanded && (
                <div className="mt-2 p-4 bg-black/20 rounded-xl border border-white/5 animate-in slide-in-from-top-2 duration-200">
                  <ImportExport
                    bookmarks={bookmarks}
                    categories={categories}
                    onImportComplete={onClose}
                    inModal={true}
                  />
                </div>
              )}
            </div>

            <div className="group pt-4 border-t border-white/5">
              <button
                onClick={() => setAccountExpanded(!accountExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mr-4 text-red-400">
                    <LogOut size={18} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-200 text-sm">Session Control</h4>
                    <p className="text-[10px] text-gray-500">Account management</p>
                  </div>
                </div>
                {accountExpanded ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>

              {accountExpanded && (
                <div className="mt-2 p-4 bg-black/20 rounded-xl border border-white/5 animate-in slide-in-from-top-2 duration-200">
                  <button
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 py-2.5 px-4 rounded-xl flex items-center justify-center transition-all text-sm font-medium"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Terminate Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
