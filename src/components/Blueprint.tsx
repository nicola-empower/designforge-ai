import React, { useState } from 'react';
import { DesignSystem, BlueprintData } from '../types';
import { generateProjectBlueprint } from '../services/geminiService';
import { FileCode, Loader2, CheckCircle2, Copy, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface BlueprintProps {
  design: DesignSystem;
}

export const Blueprint: React.FC<BlueprintProps> = ({ design }) => {
  const [data, setData] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateProjectBlueprint(design);
      setData(result);
    } catch (e) {
      alert("Failed to generate blueprint");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    if (!data) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // --- Header ---
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Primary blue (approximate)
    doc.text("Project Blueprint", margin, margin);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generated via DesignForge AI • ${new Date().toLocaleString()}`, margin, margin + 6);

    // --- Top Half: Desired Outcome ---
    const topHalfStart = margin + 20;
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Desired Outcome", margin, topHalfStart);
    
    doc.setFontSize(12);
    doc.setTextColor(60);
    const splitOverview = doc.splitTextToSize(data.overview, contentWidth);
    doc.text(splitOverview, margin, topHalfStart + 8);

    // --- Divider ---
    const midY = pageHeight / 2;
    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(margin, midY - 10, pageWidth - margin, midY - 10);

    // --- Bottom Half: Elements & Choices ---
    const bottomHalfStart = midY;
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Elements & Choices", margin, bottomHalfStart);

    const colGap = 10;
    const colWidth = (contentWidth - (colGap * 2)) / 3;
    
    // Column 1: Design Specs
    let currentY = bottomHalfStart + 10;
    const col1X = margin;
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Design Specification", col1X, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(80);
    
    const specs = [
      `Layout Mode: ${design.layoutMode}`,
      `Font Family: ${design.fontFamily}`,
      `Primary Color: ${design.primaryColor}`,
      `Secondary Color: ${design.secondaryColor}`,
      `Border Radius: ${design.borderRadius}`,
      `Base Font Size: ${design.baseFontSize}px`,
      `Grid System: ${design.gridColumns} cols, ${design.gridGap}px gap`
    ];
    
    specs.forEach(spec => {
      doc.text(`• ${spec}`, col1X, currentY);
      currentY += 6;
    });

    // Column 2: Tech Stack
    currentY = bottomHalfStart + 10;
    const col2X = margin + colWidth + colGap;
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Technical Stack", col2X, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(80);
    
    data.technicalStack.forEach(item => {
      doc.text(`• ${item}`, col2X, currentY);
      currentY += 6;
    });
    
    currentY += 6;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Estimated Effort", col2X, currentY);
    currentY += 8;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(data.estimatedEffort, col2X, currentY);

    // Column 3: Components
    currentY = bottomHalfStart + 10;
    const col3X = margin + ((colWidth + colGap) * 2);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Core Components", col3X, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(80);
    
    data.components.slice(0, 15).forEach(item => {
      doc.text(`• ${item}`, col3X, currentY);
      currentY += 6;
    });

    doc.save(`design-forge-blueprint-${Date.now()}.pdf`);
  };

  return (
    <div className="h-full p-8 max-w-5xl mx-auto overflow-y-auto custom-scrollbar">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Project Blueprint</h1>
          <p className="text-slate-400">
            Generate a technical spec based on your Playground configuration ({design.layoutMode} layout, {design.primaryColor}).
          </p>
        </div>
        <div className="flex gap-3">
          {data && (
            <button
              onClick={handleExportPdf}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <Download size={18} />
              Export PDF
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={18}/> : <FileCode size={18} />}
            {data ? 'Regenerate Blueprint' : 'Generate Blueprint'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
          <Loader2 className="animate-spin text-blue-500 w-10 h-10 mb-4" />
          <p className="text-slate-400">Analyzing design patterns and generating stack...</p>
        </div>
      ) : data ? (
        <div className="space-y-6 animate-fade-in">
          {/* Overview Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Executive Summary</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              {data.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tech Stack */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-medium text-blue-400 mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} /> Recommended Stack
              </h3>
              <ul className="space-y-3">
                {data.technicalStack.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-2 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Components */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-medium text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} /> Core Components
              </h3>
              <ul className="space-y-3">
                {data.components.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-2 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Effort & Code Snippet */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Estimated Effort</h3>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30">
                {data.estimatedEffort}
              </span>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700">
               <h4 className="text-sm text-slate-500 uppercase tracking-wider mb-3">Tailwind Config Preset</h4>
               <div className="bg-black rounded-lg p-4 font-mono text-sm text-slate-400 overflow-x-auto relative group">
                  <button className="absolute top-2 right-2 p-2 bg-slate-800 rounded text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white" title="Copy">
                    <Copy size={14} />
                  </button>
<pre>{`module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${design.primaryColor}',
        secondary: '${design.secondaryColor}',
      },
      fontFamily: {
        main: ['${design.fontFamily}', 'sans-serif'],
      },
      fontSize: {
        base: '${design.baseFontSize}px',
      },
      borderRadius: {
        DEFAULT: '${design.borderRadius === 'full' ? '9999px' : design.borderRadius === 'none' ? '0px' : '0.375rem'}',
      }
    }
  }
}`}</pre>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
          <FileCode size={48} className="mb-4 opacity-50"/>
          <p>Configure your design in the Playground, then generate your blueprint here.</p>
        </div>
      )}
    </div>
  );
};