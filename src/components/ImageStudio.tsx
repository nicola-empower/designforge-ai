import React, { useState } from 'react';
import { ImageSize } from '../types';
import { generateImageAssets, editImage } from '../services/geminiService';
import { Wand2, Image as ImageIcon, Loader2, Download, Upload } from 'lucide-react';

export const ImageStudio: React.FC = () => {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Edit mode state
  const [uploadImage, setUploadImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const result = await generateImageAssets(prompt, selectedSize);
      setResultImage(result);
    } catch (e) {
      alert("Failed to generate image. Please check API key/quota.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !uploadImage) return;
    setLoading(true);
    try {
      const result = await editImage(uploadImage, prompt);
      setResultImage(result);
    } catch (e) {
      alert("Failed to edit image. Ensure using a valid image.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadImage(reader.result as string);
        setResultImage(null); // Reset result when new source uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-full p-6 gap-6">
      <div className="w-80 flex-shrink-0 flex flex-col gap-6">
        {/* Mode Switcher */}
        <div className="flex p-1 bg-slate-800 rounded-lg">
          <button
            onClick={() => { setMode('generate'); setResultImage(null); }}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${mode === 'generate' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Generate
          </button>
          <button
            onClick={() => { setMode('edit'); setResultImage(null); }}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${mode === 'edit' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Edit
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {mode === 'generate' ? (
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                   <ImageIcon size={16} /> Size Configuration
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ImageSize).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`text-xs py-2 rounded border ${selectedSize === size ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="space-y-4">
               <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                 <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Upload size={16} /> Source Image
                 </h3>
                 <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${uploadImage ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800'}`}>
                       {uploadImage ? (
                         <div className="relative h-20 w-full">
                           <img src={uploadImage} alt="Preview" className="h-full mx-auto object-contain rounded"/>
                           <p className="text-xs text-blue-300 mt-2">Click to replace</p>
                         </div>
                       ) : (
                         <div className="text-slate-400">
                           <Upload size={24} className="mx-auto mb-2 opacity-50"/>
                           <p className="text-xs">Upload source image</p>
                         </div>
                       )}
                    </div>
                 </div>
               </div>
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {mode === 'generate' ? 'Describe the image' : 'Instructions (e.g., "Add a retro filter")'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'generate' ? "A futuristic dashboard with neon accents..." : "Make it look like a sketch..."}
              className="w-full h-32 bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            onClick={mode === 'generate' ? handleGenerate : handleEdit}
            disabled={loading || !prompt || (mode === 'edit' && !uploadImage)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            {mode === 'generate' ? 'Generate Assets' : 'Edit Image'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-black rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden relative">
         {loading ? (
           <div className="text-center">
              <Loader2 className="animate-spin text-blue-500 w-12 h-12 mx-auto mb-4" />
              <p className="text-slate-400 animate-pulse">Gemini is working magic...</p>
           </div>
         ) : resultImage ? (
           <div className="relative w-full h-full p-4 flex items-center justify-center">
             <img src={resultImage} alt="Result" className="max-w-full max-h-full rounded shadow-2xl" />
             <a 
               href={resultImage} 
               download={`design-forge-${Date.now()}.png`}
               className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
               title="Download"
             >
               <Download size={20} />
             </a>
           </div>
         ) : (
           <div className="text-center text-slate-600">
             <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
               <ImageIcon size={32} />
             </div>
             <p className="max-w-xs mx-auto">
               {mode === 'generate' 
                 ? "Configure size and enter a prompt to create high-fidelity assets using Nano Banana Pro." 
                 : "Upload an image and use text to apply edits with Nano Banana."}
             </p>
           </div>
         )}
      </div>
    </div>
  );
};
