import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Download, Upload } from 'lucide-react';

interface EditorState {
  screenshot: string | null;
  background: string;
  padding: number;
  borderRadius: number;
  shadow: number;
  shadowIntensity: number;
  showMacOSMockup: boolean;
  containerSize: number;
  activeTab: 'macOS' | 'Gradients';
}

const macOSPresets: { name: string; background: string }[] = [
  { name: 'Big Sur', background: 'url(https://images.unsplash.com/photo-1603649304824-2e8aa3b2b7e4)' },
  { name: 'Catalina', background: 'url(https://images.unsplash.com/photo-1568345889086-3d8f1a74a2e3)' },
  { name: 'Mojave', background: 'url(https://images.unsplash.com/photo-1541280910158-c4e14f9c94a3)' },
  { name: 'High Sierra', background: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb)' },
  { name: 'Sierra', background: 'url(https://images.unsplash.com/photo-1511300636408-a63a89df3482)' },
  { name: 'El Capitan', background: 'url(https://images.unsplash.com/photo-1469474968028-56623834b3fe)' },
  { name: 'Yosemite', background: 'url(https://images.unsplash.com/photo-1426604966848-d7adac402bff)' },
  { name: 'Mavericks', background: 'url(https://images.unsplash.com/photo-1472214103451-9374bd1c798e)' },
];

const gradientPresets: { name: string; background: string }[] = [
  { name: 'Sunset', background: 'linear-gradient(to right, #FF512F, #F4D03F, #DD2476)' },
  { name: 'Ocean', background: 'linear-gradient(to right, #1A2980, #26D0CE, #2C3E50)' },
  { name: 'Meadow', background: 'linear-gradient(to right, #16A085, #F4D03F, #4CAF50)' },
  { name: 'Lavender', background: 'linear-gradient(to right, #834d9b, #D04ED6, #9A48D0)' },
  { name: 'Cherry', background: 'linear-gradient(to right, #EB3349, #F45C43, #FF8C00)' },
  { name: 'Horizon', background: 'linear-gradient(to right, #003973, #E5E5BE, #FF6B6B)' },
  { name: 'Stellar', background: 'linear-gradient(to right, #7474BF, #348AC7, #E100FF)' },
  { name: 'Aurora', background: 'linear-gradient(to right, #1FE4F5, #3FBAFE, #2BC0E4)' },
];

const App: React.FC = () => {
  const [state, setState] = useState<EditorState>({
    screenshot: null,
    background: gradientPresets[0].background, // Set a default gradient
    padding: 0,
    borderRadius: 10,
    shadow: 20,
    shadowIntensity: 0.1,
    showMacOSMockup: false,
    containerSize: 100,
    activeTab: 'Gradients', // Set the default tab to Gradients
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLDivElement>(null);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setState((prev) => ({ ...prev, screenshot: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = useCallback(() => {
    if (screenshotRef.current) {
      const scale = 2;
      html2canvas(screenshotRef.current, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      }).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'edited_screenshot.png';
        link.click();
      });
    }
  }, [state]);

  const containerStyle = {
    width: `${state.containerSize}%`,
    maxWidth: '1280px',
    height: '600px',
    position: 'relative' as const,
    overflow: 'hidden',
  };

  const backgroundStyle = {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: state.activeTab === 'macOS' ? '#000' : 'transparent',
  };

  const wallpaperStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  };

  const contentStyle = {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    padding: `${state.padding}%`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const imageContainerStyle = {
    position: 'relative' as const,
    display: 'inline-block',
    borderRadius: `${state.borderRadius}px`,
    overflow: 'hidden',
    boxShadow: `0 ${state.shadow}px ${state.shadow * 2}px rgba(0,0,0,${state.shadowIntensity})`,
  };

  const imageStyle = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const,
  };

  const MacOSMockup: React.FC<{ width: number }> = ({ width }) => (
    <div 
      className="absolute top-0 left-0 right-0 bg-gray-200 rounded-t-lg p-2 flex items-center space-x-2"
      style={{ width: `${width}px` }}
    >
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
    </div>
  );

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageSize({ width: img.width, height: img.height });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Screenshot Editor</h1>
        
        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-2/3 px-4 mb-4">
            <div
              ref={screenshotRef}
              className="relative overflow-hidden"
              style={containerStyle}
            >
              <div style={backgroundStyle}>
                {state.activeTab === 'macOS' ? (
                  <img src={state.background.replace('url(', '').replace(')', '')} alt="Wallpaper" style={wallpaperStyle} />
                ) : (
                  <div style={{ ...wallpaperStyle, background: state.background }} />
                )}
              </div>
              <div style={contentStyle}>
                {state.screenshot ? (
                  <div className="relative flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
                    <div style={imageContainerStyle}>
                      <img
                        src={state.screenshot}
                        alt="Screenshot"
                        style={imageStyle}
                        onLoad={handleImageLoad}
                      />
                      {state.showMacOSMockup && <MacOSMockup width={imageSize.width} />}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">Your screenshot will appear here</p>
                )}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/3 px-4">
            <div className="mb-6">
              <div className="flex mb-4">
                <button
                  className={`flex-1 py-2 px-4 text-center ${state.activeTab === 'macOS' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setState(prev => ({ ...prev, activeTab: 'macOS' }))}
                >
                  macOS
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-center ${state.activeTab === 'Gradients' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setState(prev => ({ ...prev, activeTab: 'Gradients' }))}
                >
                  Gradients
                </button>
              </div>
              <div className="overflow-x-auto">
                <div className="flex space-x-2" style={{ width: state.activeTab === 'macOS' ? '800px' : '1100px' }}>
                  {(state.activeTab === 'macOS' ? macOSPresets : gradientPresets).map((preset, index) => (
                    <button
                      key={index}
                      className="flex-shrink-0 w-24 h-24 rounded bg-cover bg-center"
                      style={{ backgroundImage: preset.background }}
                      onClick={() => setState((prev) => ({ ...prev, background: preset.background }))}
                    >
                      <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Customization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Container Size</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={state.containerSize}
                    onChange={(e) => setState((prev) => ({ ...prev, containerSize: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={state.padding}
                    onChange={(e) => setState((prev) => ({ ...prev, padding: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={state.borderRadius}
                    onChange={(e) => setState((prev) => ({ ...prev, borderRadius: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shadow Size</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={state.shadow}
                    onChange={(e) => setState((prev) => ({ ...prev, shadow: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shadow Intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={state.shadowIntensity}
                    onChange={(e) => setState((prev) => ({ ...prev, shadowIntensity: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="macOSMockup"
                    checked={state.showMacOSMockup}
                    onChange={(e) => setState((prev) => ({ ...prev, showMacOSMockup: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="macOSMockup" className="text-sm font-medium text-gray-700">
                    Show macOS Mockup
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <Upload className="mr-2" size={20} />
            Upload Image
          </button>
          <button
            onClick={downloadImage}
            disabled={!state.screenshot}
            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center ${
              !state.screenshot && 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Download className="mr-2" size={20} />
            Download Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;