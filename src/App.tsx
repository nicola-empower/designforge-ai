import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Playground } from './components/Playground';
import { ImageStudio } from './components/ImageStudio';
import { ChatBot } from './components/ChatBot';
import { Blueprint } from './components/Blueprint';
import { ViewState, DesignSystem } from './types';

const STORAGE_KEY = 'design-forge-storage-v1';

const DEFAULT_DESIGN: DesignSystem = {
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  fontFamily: 'sans',
  borderRadius: 'md',
  layoutMode: 'landing',
  darkMode: true,
  baseFontSize: 16,
  headingText: "Build Your **Next Idea**",
  subheadingText: "A visual playground for developers and designers to conceptualize interfaces instantly.",
  bodyText: "Automated styling and layout generation for rapid prototyping.",
  gridColumns: 3,
  gridGap: 24
};

// Custom hook for state history management
function useHistoryState<T>(initialValue: T, key: string) {
  const [history, setHistory] = useState<{
    past: T[];
    present: T;
    future: T[];
  }>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // Merge with default to ensure new fields are present
        return {
          past: [],
          present: { ...initialValue, ...JSON.parse(item) },
          future: [],
        };
      }
    } catch (error) {
      console.warn(error);
    }
    return {
      past: [],
      present: initialValue,
      future: [],
    };
  });

  const { present } = history;

  const setState = useCallback((newState: T | ((prevState: T) => T)) => {
    setHistory((curr) => {
      const value = typeof newState === 'function'
        ? (newState as (prevState: T) => T)(curr.present)
        : newState;

      if (JSON.stringify(value) === JSON.stringify(curr.present)) {
        return curr;
      }

      return {
        past: [...curr.past, curr.present],
        present: value,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Sync present state to local storage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(present));
    } catch (e) {
      console.error(e);
    }
  }, [present, key]);

  return {
    state: present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0
  };
}

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.PLAYGROUND);

  const {
    state: design,
    setState: setDesign,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistoryState<DesignSystem>(DEFAULT_DESIGN, STORAGE_KEY);

  return (
    <div className="flex h-screen bg-dark text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />

      <main className="flex-1 overflow-hidden relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>

        <div className="h-full relative z-10">
          {currentView === ViewState.PLAYGROUND && (
            <Playground
              design={design}
              setDesign={setDesign}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          )}
          {currentView === ViewState.IMAGE_STUDIO && (
            <ImageStudio />
          )}
          {currentView === ViewState.CHAT && (
            <ChatBot design={design} setDesign={setDesign} />
          )}
          {currentView === ViewState.BLUEPRINT && (
            <Blueprint design={design} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;