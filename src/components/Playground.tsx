import React, { useState, useEffect, useDeferredValue, useRef } from 'react';
import { DesignSystem } from '../types';
import { Palette, Type, Layout, MousePointerClick, ShoppingBag, Search, Menu, ArrowRight, Undo2, Redo2, FileText, AlignLeft, Grid, Layers, X, Check, Bell, User, Loader2, Cloud, Monitor, LayoutDashboard, Briefcase, LayoutTemplate } from 'lucide-react';

interface PlaygroundProps {
  design: DesignSystem;
  setDesign: React.Dispatch<React.SetStateAction<DesignSystem>>;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// Helper to parse simple markdown (**bold**, *italic*)
const renderFormattedText = (text: string, primaryColor: string, secondaryColor: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} style={{ color: primaryColor }} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} style={{ color: secondaryColor }} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

// Reusable Color Input Component with Live Swatch
// Defined outside to prevent re-mounting and focus loss on render
const ColorInput = React.memo(({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div>
    <label className="block text-sm text-slate-400 mb-2">{label}</label>
    <div className="flex items-center gap-3">
      <div className="relative group cursor-pointer">
        <div 
          className="w-10 h-10 rounded-lg border border-slate-600 shadow-sm flex-shrink-0 transition-transform group-hover:scale-105" 
          style={{ backgroundColor: value }}
          title="Click to pick color"
        ></div>
        <input 
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <div className="relative flex-1">
         <div 
           className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-500 shadow-inner"
           style={{ backgroundColor: value }}
           title="Live preview swatch"
         ></div>
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-3 pr-9 text-sm text-white focus:outline-none focus:border-blue-500 font-mono uppercase"
        />
      </div>
    </div>
  </div>
));

export const Playground: React.FC<PlaygroundProps> = ({ 
  design, 
  setDesign,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const isFirstRender = useRef(true);
  
  // Use deferred value for the preview rendering to keep inputs responsive
  // This separates the "heavy" preview render from the lightweight input state
  const deferredDesign = useDeferredValue(design);
  const isStale = design !== deferredDesign;
  
  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Meta (Mac) key
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            if (canRedo) onRedo();
          } else {
            if (canUndo) onUndo();
          }
        } else if (e.key === 'y') { // Common Redo shortcut on Windows
          e.preventDefault();
          if (canRedo) onRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, canUndo, canRedo]);

  // Auto-save indicator logic
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Hide immediately when changes start
    setIsSaved(false);

    // Show "Saved" after 1 second of inactivity (debounce)
    const timer = setTimeout(() => {
      setIsSaved(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [design]);

  // Auto-hide the "Saved" message after 2 seconds
  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => {
        setIsSaved(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  // Helper to dynamically inject styles for preview
  const getPreviewStyles = () => {
    const radiusMap = {
      'none': '0px',
      'sm': '0.125rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'full': '9999px'
    };

    const fontMap: Record<string, string> = {
      'sans': 'ui-sans-serif, system-ui, sans-serif',
      'serif': 'ui-serif, Georgia, serif',
      'mono': 'ui-monospace, SFMono-Regular, monospace',
      'Inter': '"Inter", sans-serif',
      'Playfair Display': '"Playfair Display", serif',
      'Roboto': '"Roboto", sans-serif',
      'Lato': '"Lato", sans-serif',
    };
    
    // Use deferredDesign for styles to prevent lag while typing
    return {
      '--primary': deferredDesign.primaryColor,
      '--secondary': deferredDesign.secondaryColor,
      '--font-family': fontMap[deferredDesign.fontFamily] || fontMap['sans'],
      '--radius': radiusMap[deferredDesign.borderRadius],
      fontSize: `${deferredDesign.baseFontSize}px`,
    } as React.CSSProperties;
  };

  const fontOptions = ['sans', 'serif', 'mono', 'Inter', 'Playfair Display', 'Roboto', 'Lato'];

  return (
    <div className="flex h-full gap-6 p-6 relative">
      {/* Controls */}
      <div className="w-80 flex-shrink-0 space-y-8 overflow-y-auto pr-2 custom-scrollbar flex flex-col pb-20 relative">
        
        {/* History Controls */}
        <div className="flex gap-2 mb-2 sticky top-0 bg-dark z-10 py-2">
           <button
             onClick={onUndo}
             disabled={!canUndo}
             className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-slate-700 transition-colors text-sm text-slate-300"
             title="Undo (Ctrl+Z)"
           >
             <Undo2 size={16} /> Undo
           </button>
           <button
             onClick={onRedo}
             disabled={!canRedo}
             className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-slate-700 transition-colors text-sm text-slate-300"
             title="Redo (Ctrl+Shift+Z)"
           >
             <Redo2 size={16} /> Redo
           </button>
        </div>

        {/* Project Context Switcher - Prominent */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <LayoutTemplate size={14} /> Project Context
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'landing', label: 'Landing Page', icon: Monitor },
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingBag },
              { id: 'blog', label: 'Content Blog', icon: FileText },
              { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setDesign(p => ({ ...p, layoutMode: type.id as any }))}
                className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-xs font-medium transition-all ${
                  design.layoutMode === type.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                } ${type.id === 'portfolio' ? 'col-span-2 justify-center' : ''}`}
              >
                <type.icon size={16} />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 px-1">
            Select a context to visualize how your design system adapts to different use cases.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layout size={18} className="text-emerald-400"/> Component Styling
          </h2>
          <div className="space-y-4">
             <div>
              <label className="block text-sm text-slate-400 mb-2">Border Radius</label>
              <select 
                value={design.borderRadius}
                onChange={(e) => setDesign(p => ({...p, borderRadius: e.target.value as any}))}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="none">Sharp (None)</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="full">Pill / Full</option>
              </select>
            </div>
            
            <button 
              onClick={() => setShowLibrary(true)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors text-sm text-blue-400 hover:text-blue-300 font-medium mt-2"
            >
              <Layers size={16} /> View Component Library
            </button>
          </div>
        </div>
        
        {/* Grid System */}
        <div>
           <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Grid size={18} className="text-pink-400"/> Grid System
           </h2>
           <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                   <label className="text-sm text-slate-400">Columns (Desktop)</label>
                   <span className="text-xs text-slate-500 font-mono">{design.gridColumns}</span>
                </div>
                <input
                   type="range"
                   min="1"
                   max="4"
                   step="1"
                   value={design.gridColumns}
                   onChange={(e) => setDesign(p => ({...p, gridColumns: parseInt(e.target.value)}))}
                   className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
               <div>
                <div className="flex justify-between items-center mb-2">
                   <label className="text-sm text-slate-400">Gutter Size</label>
                   <span className="text-xs text-slate-500 font-mono">{design.gridGap}px</span>
                </div>
                <input
                   type="range"
                   min="8"
                   max="64"
                   step="8"
                   value={design.gridGap}
                   onChange={(e) => setDesign(p => ({...p, gridGap: parseInt(e.target.value)}))}
                   className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
           </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Palette size={18} className="text-blue-400"/> Color Palette
          </h2>
          <div className="space-y-4">
            <ColorInput 
              label="Primary Color" 
              value={design.primaryColor} 
              onChange={(val) => setDesign(p => ({...p, primaryColor: val}))} 
            />
            <ColorInput 
              label="Secondary Color" 
              value={design.secondaryColor} 
              onChange={(val) => setDesign(p => ({...p, secondaryColor: val}))} 
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlignLeft size={18} className="text-orange-400"/> Content
          </h2>
          <div className="space-y-4">
            <p className="text-xs text-slate-500 bg-slate-800 p-2 rounded">
              Tip: Use <code>**bold**</code> and <code>*italic*</code> to style your text.
            </p>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Heading</label>
              <textarea
                rows={2}
                value={design.headingText}
                onChange={(e) => setDesign(p => ({...p, headingText: e.target.value}))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
             <div>
              <label className="block text-sm text-slate-400 mb-2">Subheader</label>
              <textarea
                rows={3}
                value={design.subheadingText}
                onChange={(e) => setDesign(p => ({...p, subheadingText: e.target.value}))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
             <div>
              <label className="block text-sm text-slate-400 mb-2">Body Text</label>
              <textarea
                rows={3}
                value={design.bodyText}
                onChange={(e) => setDesign(p => ({...p, bodyText: e.target.value}))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Type size={18} className="text-purple-400"/> Typography
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {fontOptions.map((font) => (
                <button
                  key={font}
                  onClick={() => setDesign(p => ({...p, fontFamily: font as any}))}
                  className={`px-3 py-2 rounded border text-xs capitalize transition-colors ${design.fontFamily === font ? 'border-blue-500 bg-blue-500/20 text-white shadow-sm' : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  {font}
                </button>
              ))}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-slate-400">Base Font Size</label>
                <span className="text-xs text-slate-500 font-mono">{design.baseFontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={design.baseFontSize}
                onChange={(e) => setDesign(p => ({...p, baseFontSize: parseInt(e.target.value)}))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Auto-save Indicator */}
      <div 
        className={`absolute bottom-6 left-6 z-50 transition-all duration-500 ease-in-out pointer-events-none transform ${
          isSaved ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="bg-slate-800/90 backdrop-blur border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-medium">
          <Cloud size={14} className="text-emerald-500" />
          <span>Changes saved</span>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 bg-black rounded-xl border border-slate-800 overflow-hidden relative shadow-2xl">
         {/* Preview Header */}
         <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2 z-20">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            <div className="mx-auto text-xs text-slate-500 font-mono">localhost:3000</div>
         </div>
         
         {/* Loading Overlay */}
         {isStale && (
            <div className="absolute top-10 right-4 z-50">
                <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                    <Loader2 className="animate-spin text-blue-500" size={12} />
                    <p className="text-[10px] text-slate-300 font-medium">Rendering...</p>
                </div>
            </div>
         )}
         
         <div 
            className="w-full h-full pt-8 overflow-y-auto transition-opacity duration-200"
            style={{ 
              ...getPreviewStyles(),
              opacity: isStale ? 0.9 : 1
            }}
         >
            <div className="h-full" style={{ fontFamily: 'var(--font-family)' }}>
              
              {/* Landing Page Preview */}
              {deferredDesign.layoutMode === 'landing' && (
                <div className="p-8">
                  <div className="max-w-3xl mx-auto text-center space-y-8 mt-12">
                     <h1 className="text-5xl font-bold text-white tracking-tight">
                       {renderFormattedText(deferredDesign.headingText, deferredDesign.primaryColor, deferredDesign.secondaryColor)}
                     </h1>
                     <p className="text-xl text-slate-400 leading-relaxed">
                       {renderFormattedText(deferredDesign.subheadingText, deferredDesign.primaryColor, deferredDesign.secondaryColor)}
                     </p>
                     <div className="flex gap-4 justify-center">
                        <button 
                          style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' }}
                          className="px-8 py-3 text-white font-medium hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 duration-200"
                        >
                          Get Started
                        </button>
                        <button 
                          style={{ color: 'var(--primary)', borderColor: 'var(--primary)', borderRadius: 'var(--radius)' }}
                          className="px-8 py-3 bg-transparent border font-medium hover:bg-slate-900 transition-colors transform hover:scale-105 active:scale-95 duration-200"
                        >
                          Learn More
                        </button>
                     </div>
                     
                     <div 
                        className="grid mt-16 text-left"
                        style={{ 
                            gridTemplateColumns: `repeat(${deferredDesign.gridColumns}, minmax(0, 1fr))`,
                            gap: `${deferredDesign.gridGap}px`
                        }}
                     >
                        {[1,2,3,4].slice(0, Math.max(3, deferredDesign.gridColumns)).map(i => (
                          <div key={i} style={{ borderRadius: 'var(--radius)' }} className="p-6 bg-slate-900/50 border border-slate-800 hover:border-[var(--primary)] hover:-translate-y-1 transition-all duration-300">
                             <div className="w-10 h-10 mb-4 flex items-center justify-center rounded bg-slate-800 text-slate-300">
                               <MousePointerClick size={20}/>
                             </div>
                             <h3 className="text-lg font-semibold text-white mb-2">Feature {i}</h3>
                             <p className="text-slate-400 text-sm">{renderFormattedText(deferredDesign.bodyText, deferredDesign.primaryColor, deferredDesign.secondaryColor)}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              )}

              {/* Dashboard Preview */}
              {deferredDesign.layoutMode === 'dashboard' && (
                <div className="flex gap-6 h-full p-6">
                   <div style={{ borderRadius: 'var(--radius)' }} className="w-64 bg-slate-900 border border-slate-800 p-4 space-y-4">
                      <div className="h-8 w-24 bg-slate-800 rounded mb-8"></div>
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-10 w-full rounded hover:bg-slate-800 flex items-center px-2 cursor-pointer transition-colors">
                           <span className="w-20 h-2 bg-slate-700 rounded-full"></span>
                        </div>
                      ))}
                   </div>
                   <div className="flex-1 space-y-6 overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                         <h2 className="text-2xl font-bold text-white">{renderFormattedText(deferredDesign.headingText, deferredDesign.primaryColor, deferredDesign.secondaryColor) || "Dashboard Overview"}</h2>
                         <button style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' }} className="px-4 py-2 text-sm text-white hover:opacity-90 transform hover:scale-105 active:scale-95 transition-all">Create New</button>
                      </div>
                      <div className="flex gap-6">
                         {[1,2,3].map(i => (
                            <div key={i} style={{ borderRadius: 'var(--radius)' }} className="flex-1 p-6 bg-slate-900 border border-slate-800 hover:border-[var(--secondary)] transition-colors duration-300 cursor-default">
                               <div style={{ color: 'var(--secondary)' }} className="text-2xl font-bold mb-1">$24,500</div>
                               <div className="text-xs text-slate-500 uppercase tracking-wider">Total Revenue</div>
                            </div>
                         ))}
                      </div>
                      <div style={{ borderRadius: 'var(--radius)' }} className="h-64 bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                         {renderFormattedText(deferredDesign.subheadingText, deferredDesign.primaryColor, deferredDesign.secondaryColor) || "Analytics Visualization"}
                      </div>
                      <div style={{ borderRadius: 'var(--radius)' }} className="h-48 bg-slate-900 border border-slate-800 p-6">
                         <div style={{ backgroundColor: 'var(--primary)' }} className="h-2 w-1/3 rounded mb-4"></div>
                         <div className="h-2 w-2/3 bg-slate-800 rounded mb-2"></div>
                         <div className="h-2 w-1/2 bg-slate-800 rounded"></div>
                      </div>
                   </div>
                </div>
              )}

              {/* Ecommerce Preview */}
              {deferredDesign.layoutMode === 'ecommerce' && (
                <div className="flex flex-col h-full bg-black">
                   {/* Navbar */}
                   <nav className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                      <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]"></div>
                        STORE
                      </div>
                      <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
                         <span className="text-white">Shop</span>
                         <span className="hover:text-white cursor-pointer">Collections</span>
                         <span className="hover:text-white cursor-pointer">About</span>
                      </div>
                      <div className="flex gap-4 text-slate-400">
                         <Search size={20} className="hover:text-white cursor-pointer"/>
                         <div className="relative">
                            <ShoppingBag size={20} className="hover:text-white cursor-pointer"/>
                            <span style={{ backgroundColor: 'var(--primary)' }} className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-black"></span>
                         </div>
                      </div>
                   </nav>
                   
                   <div className="flex-1 overflow-y-auto p-6 space-y-8">
                      {/* Hero */}
                      <div style={{ borderRadius: 'var(--radius)' }} className="bg-slate-900 border border-slate-800 p-8 md:p-12 flex items-center justify-between relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] opacity-5 blur-[80px] rounded-full pointer-events-none"></div>
                         <div className="space-y-6 relative z-10">
                            <span style={{ color: 'var(--secondary)' }} className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                              <span className="w-8 h-[1px] bg-[var(--secondary)]"></span> New Season
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                              {renderFormattedText(deferredDesign.headingText, deferredDesign.primaryColor, deferredDesign.secondaryColor) || "Summer Collection"}
                            </h2>
                            <p className="text-slate-400 max-w-xs">
                              {renderFormattedText(deferredDesign.subheadingText, deferredDesign.primaryColor, deferredDesign.secondaryColor) || "Discover the latest trends in our exclusive summer drop."}
                            </p>
                            <button style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' }} className="px-8 py-3 text-white text-sm font-medium hover:opacity-90 hover:scale-105 active:scale-95 transition-all">
                              Shop Now
                            </button>
                         </div>
                         <div className="hidden md:block w-48 h-48 bg-slate-800 rounded-full border-2 border-slate-700/50"></div>
                      </div>
                      
                      {/* Product Grid */}
                      <div>
                         <div className="flex justify-between items-end mb-6">
                            <h3 className="text-xl font-bold text-white">Trending Now</h3>
                            <button style={{ color: 'var(--primary)' }} className="text-sm font-medium hover:underline flex items-center gap-1">
                              View All <ArrowRight size={14}/>
                            </button>
                         </div>
                         <div 
                            className="grid"
                            style={{ 
                                gridTemplateColumns: `repeat(${deferredDesign.gridColumns}, minmax(0, 1fr))`,
                                gap: `${deferredDesign.gridGap}px`
                            }}
                         >
                            {[1,2,3,4,5,6,7,8].slice(0, deferredDesign.gridColumns * 2).map(i => (
                               <div key={i} className="group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                  <div style={{ borderRadius: 'var(--radius)' }} className="bg-slate-900 aspect-[4/5] mb-4 relative overflow-hidden border border-slate-800/50 group-hover:border-[var(--primary)] transition-colors">
                                     <div className="absolute inset-0 bg-slate-800/50 group-hover:bg-transparent transition-all duration-500"></div>
                                     {i === 1 && <span style={{ backgroundColor: 'var(--secondary)' }} className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 text-black rounded-sm uppercase">New</span>}
                                  </div>
                                  <h4 className="text-slate-200 font-medium text-sm group-hover:text-[var(--primary)] transition-colors">Minimalist Item {i}</h4>
                                  <div className="flex justify-between items-center mt-2">
                                     <span className="text-slate-400 text-sm">$49.00</span>
                                     <button style={{ borderColor: 'var(--primary)', color: 'var(--primary)', borderRadius: 'var(--radius)' }} className="border px-3 py-1 text-[10px] font-bold uppercase tracking-wide hover:bg-[var(--primary)] hover:text-white hover:scale-105 active:scale-95 transition-all">
                                       Add
                                     </button>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Blog Preview */}
              {deferredDesign.layoutMode === 'blog' && (
                <div className="h-full bg-black flex flex-col">
                  <header className="border-b border-slate-800 bg-slate-900/50 p-6 text-center">
                    <div style={{ fontFamily: 'serif' }} className="text-2xl font-bold italic text-white">The Daily Design</div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-sans">Insights & Stories</div>
                  </header>
                  
                  <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto flex gap-12">
                      <div className="flex-1 space-y-12">
                        {[1, 2].map(i => (
                          <article key={i} className="space-y-4 group">
                            <div style={{ borderRadius: 'var(--radius)' }} className="w-full h-48 bg-slate-900 border border-slate-800 group-hover:border-[var(--primary)] transition-colors duration-300"></div>
                            <div className="space-y-2">
                              <span style={{ color: 'var(--primary)' }} className="text-xs font-bold uppercase tracking-wider">Technology</span>
                              <h2 className="text-2xl font-bold text-white group-hover:text-[var(--secondary)] transition-colors cursor-pointer">
                                {i === 1 ? (renderFormattedText(deferredDesign.headingText, deferredDesign.primaryColor, deferredDesign.secondaryColor) || "The Future of Web Development") : "Design Systems Scaling"}
                              </h2>
                              <p className="text-slate-400 text-sm leading-relaxed">
                                {i === 1 ? (renderFormattedText(deferredDesign.subheadingText, deferredDesign.primaryColor, deferredDesign.secondaryColor) || "Lorem ipsum dolor sit amet...") : "Sed do eiusmod tempor incididunt ut labore..."}
                              </p>
                              <a href="#" style={{ color: 'var(--secondary)' }} className="text-sm font-medium hover:underline inline-block mt-2">Read Article →</a>
                            </div>
                          </article>
                        ))}
                      </div>
                      
                      <aside className="w-64 hidden md:block space-y-8">
                        <div style={{ borderRadius: 'var(--radius)' }} className="p-6 bg-slate-900 border border-slate-800">
                          <h3 className="font-bold text-white mb-4 text-sm uppercase">About</h3>
                          <div className="w-16 h-16 bg-slate-800 rounded-full mb-4 mx-auto border border-slate-700"></div>
                          <p className="text-xs text-slate-400 text-center">{renderFormattedText(deferredDesign.bodyText, deferredDesign.primaryColor, deferredDesign.secondaryColor) || "We share thoughts on design, code, and everything in between."}</p>
                        </div>
                        
                        <div>
                           <h3 className="font-bold text-white mb-4 text-sm uppercase border-b border-slate-800 pb-2">Categories</h3>
                           <ul className="space-y-2 text-sm text-slate-400">
                              {['Design', 'Development', 'Tutorials', 'Lifestyle'].map(cat => (
                                <li key={cat} className="flex justify-between hover:text-[var(--primary)] cursor-pointer">
                                  <span>{cat}</span>
                                  <span className="text-slate-600">4</span>
                                </li>
                              ))}
                           </ul>
                        </div>
                      </aside>
                    </div>
                  </div>
                </div>
              )}

              {/* Portfolio Preview */}
              {deferredDesign.layoutMode === 'portfolio' && (
                <div className="h-full bg-black overflow-y-auto">
                   <div className="max-w-5xl mx-auto p-8 md:p-16">
                      <header className="flex justify-between items-center mb-24">
                         <div className="font-bold text-xl">PORTFOLIO<span style={{color: 'var(--primary)'}}>.</span></div>
                         <button style={{ borderRadius: 'var(--radius)' }} className="px-6 py-2 border border-slate-700 text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] hover:scale-105 active:scale-95 transition-all">Contact Me</button>
                      </header>
                      
                      <div className="mb-32">
                         <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                            {renderFormattedText(deferredDesign.headingText, deferredDesign.primaryColor, deferredDesign.secondaryColor) || <>I create <span style={{ color: 'var(--secondary)' }}>digital experiences</span> that matter.</>}
                         </h1>
                         <p className="text-xl text-slate-400 max-w-2xl">
                            {renderFormattedText(deferredDesign.subheadingText, deferredDesign.primaryColor, deferredDesign.secondaryColor) || "Senior Product Designer & Developer specializing in clean UI, robust design systems, and modern web technologies."}
                         </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {[1, 2, 3, 4].map(i => (
                            <div key={i} className="group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
                               <div style={{ borderRadius: 'var(--radius)' }} className="aspect-video bg-slate-900 border border-slate-800 mb-6 overflow-hidden relative">
                                  <div className="absolute inset-0 bg-slate-800/20 group-hover:bg-transparent transition-all"></div>
                                  <div className="absolute bottom-4 left-4 flex gap-2">
                                     <span className="bg-black/50 backdrop-blur px-2 py-1 text-[10px] uppercase text-white rounded border border-white/10">React</span>
                                     <span className="bg-black/50 backdrop-blur px-2 py-1 text-[10px] uppercase text-white rounded border border-white/10">Astro</span>
                                  </div>
                               </div>
                               <h3 className="text-2xl font-bold text-white group-hover:text-[var(--primary)] transition-colors">Project Name {i}</h3>
                               <p className="text-slate-500 mt-2">Web Design • Development</p>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

            </div>
         </div>
      </div>
      
      {/* Component Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
             {/* Header */}
             <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
               <div>
                 <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                   <Layers className="text-blue-500" /> Component Library
                 </h2>
                 <p className="text-sm text-slate-400 mt-1">Common React components styled with your current theme.</p>
               </div>
               <button onClick={() => setShowLibrary(false)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">
                 <X size={24} />
               </button>
             </div>
             {/* Body */}
             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8" style={getPreviewStyles()}>
                
                {/* Component 1: Buttons */}
                <div className="space-y-4 p-6 border border-slate-800 rounded-lg bg-black/20 group hover:border-slate-700 transition-colors">
                   <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-4">1. Button Variants</h3>
                   <div className="flex flex-wrap gap-4 items-center">
                      <button style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' }} className="px-6 py-2.5 text-white font-medium hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all">
                        Primary Action
                      </button>
                      <button style={{ backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius)' }} className="px-6 py-2.5 text-white font-medium hover:opacity-90 shadow-lg shadow-emerald-500/20 transition-all">
                        Secondary
                      </button>
                      <button style={{ borderColor: 'var(--primary)', color: 'var(--primary)', borderRadius: 'var(--radius)' }} className="px-6 py-2.5 border font-medium hover:bg-slate-800 transition-all">
                        Outline
                      </button>
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-800/50">
                     <code className="text-[10px] text-slate-500 font-mono">
                       &lt;Button variant="primary"&gt;Action&lt;/Button&gt;
                     </code>
                   </div>
                </div>

                {/* Component 2: Form Elements */}
                <div className="space-y-4 p-6 border border-slate-800 rounded-lg bg-black/20 group hover:border-slate-700 transition-colors">
                   <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-4">2. Input Fields</h3>
                   <div className="space-y-4">
                      <div>
                         <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                         <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                              type="text" 
                              placeholder="john@example.com" 
                              style={{ borderRadius: 'var(--radius)', borderColor: 'var(--primary)' }}
                              className="w-full bg-slate-800 border pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] placeholder:text-slate-600 transition-all" 
                            />
                         </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded border border-slate-700/50">
                         <div className="relative flex items-center justify-center w-5 h-5">
                           <input type="checkbox" className="peer appearance-none w-5 h-5 border border-slate-500 rounded bg-slate-800 checked:bg-[var(--primary)] checked:border-[var(--primary)] transition-all cursor-pointer" defaultChecked />
                           <Check size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                         </div>
                         <span className="text-sm text-slate-300">Subscribe to newsletter updates</span>
                      </div>
                   </div>
                </div>

                {/* Component 3: Card */}
                <div className="space-y-4 p-6 border border-slate-800 rounded-lg bg-black/20 group hover:border-slate-700 transition-colors row-span-2">
                   <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-4">3. Content Card</h3>
                   <div style={{ borderRadius: 'var(--radius)' }} className="bg-slate-800 border border-slate-700 overflow-hidden max-w-sm mx-auto shadow-xl hover:shadow-2xl hover:border-[var(--primary)] transition-all duration-300 cursor-pointer">
                      <div className="h-40 bg-slate-700 w-full relative group-hover:opacity-90 transition-opacity overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                         <div className="absolute bottom-3 left-4">
                            <span style={{ backgroundColor: 'var(--primary)' }} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white shadow-sm">Featured</span>
                         </div>
                      </div>
                      <div className="p-5 space-y-3">
                         <div className="flex justify-between items-start">
                           <h4 className="text-lg font-bold text-white leading-tight">Modern Interface Design</h4>
                           <span className="text-xs text-slate-500 font-mono">Oct 24</span>
                         </div>
                         <p className="text-sm text-slate-400 leading-relaxed">
                           Explore how atomic design principles can revolutionize your component library structure and improve team velocity.
                         </p>
                         <div className="pt-3 flex items-center justify-between border-t border-slate-700/50">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-slate-600"></div>
                               <span className="text-xs text-slate-400">Alex Designer</span>
                            </div>
                            <button style={{ color: 'var(--secondary)' }} className="text-xs font-bold hover:underline flex items-center gap-1">
                              Read Article <ArrowRight size={12} />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Component 4: Alerts */}
                <div className="space-y-4 p-6 border border-slate-800 rounded-lg bg-black/20 group hover:border-slate-700 transition-colors">
                   <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-4">4. Alerts & Notifications</h3>
                   <div className="space-y-3">
                     <div style={{ borderRadius: 'var(--radius)', borderLeftColor: 'var(--primary)' }} className="bg-blue-500/5 border-l-4 p-4 flex gap-3 items-start">
                        <Bell size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-blue-200 text-sm font-bold">System Update</h5>
                          <p className="text-blue-300/70 text-xs mt-1">Your design system has been successfully synced.</p>
                        </div>
                     </div>
                     <div style={{ borderRadius: 'var(--radius)', borderLeftColor: 'var(--secondary)' }} className="bg-emerald-500/5 border-l-4 p-4 flex gap-3 items-start">
                        <Check size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-emerald-200 text-sm font-bold">Deployment Complete</h5>
                          <p className="text-emerald-300/70 text-xs mt-1">Production build finished in 45s.</p>
                        </div>
                     </div>
                   </div>
                </div>

                {/* Component 5: Badges/Stats */}
                <div className="space-y-4 p-6 border border-slate-800 rounded-lg bg-black/20 md:col-span-1 group hover:border-slate-700 transition-colors">
                   <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-4">5. Badges & Indicators</h3>
                   <div className="flex flex-wrap gap-3 items-center">
                      <span style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' }} className="px-2.5 py-1 text-xs font-bold text-white shadow-sm">New</span>
                      <span style={{ backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius)' }} className="px-2.5 py-1 text-xs font-bold text-white shadow-sm">Completed</span>
                      <span style={{ borderColor: 'var(--primary)', color: 'var(--primary)', borderRadius: 'var(--radius)' }} className="px-2.5 py-1 text-xs font-bold border">In Progress</span>
                      <span className="px-2.5 py-1 text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded-full">Archived</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 mt-4">
                      <div style={{ borderRadius: 'var(--radius)' }} className="bg-slate-800 p-3 border border-slate-700 flex flex-col items-center justify-center text-center">
                         <span className="text-2xl font-bold text-white mb-1">98%</span>
                         <span className="text-[10px] text-slate-500 uppercase tracking-wide">Uptime</span>
                      </div>
                      <div style={{ borderRadius: 'var(--radius)' }} className="bg-slate-800 p-3 border border-slate-700 flex flex-col items-center justify-center text-center">
                         <span style={{ color: 'var(--secondary)' }} className="text-2xl font-bold mb-1">2.4k</span>
                         <span className="text-[10px] text-slate-500 uppercase tracking-wide">Users</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};