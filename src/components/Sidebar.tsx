import React from 'react';
import { LayoutDashboard, Image, MessageSquare, FileText, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: ViewState.PLAYGROUND, label: 'Design Playground', icon: LayoutDashboard },
    { id: ViewState.IMAGE_STUDIO, label: 'Image Studio', icon: Image },
    { id: ViewState.CHAT, label: 'AI Assistant', icon: MessageSquare },
    { id: ViewState.BLUEPRINT, label: 'Project Blueprint', icon: FileText },
  ];

  return (
    <div className="w-64 bg-surface border-r border-slate-700 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          DesignForge AI
        </h1>
        <p className="text-xs text-slate-400 mt-1">Idea to Blueprint</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === item.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 text-slate-500 text-sm px-4">
          <Settings size={16} />
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
