import React, { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Download, Upload } from 'lucide-react';

interface EditorState {
  screenshot: string | null;
  background: string;
  padding: number;
  borderRadius: number;
  shadow: number;
  shadowIntensity: number;
  containerSize: number;
  activeTab: 'macOS' | 'Gradients';
  blur: number;
}

const macOSPresets: { name: string; background: string }[] = [
  { name: 'Sierra', background: 'url(https://images.unsplash.com/photo-1511300636408-a63a89df3482)' },
  { name: 'Ocean Mist', background: 'url(https://images.unsplash.com/photo-1505144808419-1957a94ca61e)' },
  { name: 'Desert Dunes', background: 'url(https://images.unsplash.com/photo-1547234935-80c7145ec969)' },
  { name: 'Smooth Waves', background: 'url(https://images.unsplash.com/photo-1505820013142-f86a3439c5b2)' },
  { name: 'Cloudy Peaks', background: 'url(https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf)' },
  { name: 'Misty Forest', background: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d)' },
  { name: 'Pastel Sky', background: 'url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6)' },
  { name: 'Gentle Sunrise', background: 'url(https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5)' },
];

const gradientPresets: { name: string; background: string }[] = [
  { name: 'Purple Blend', background: 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)' },
  { name: 'Ocean Blue', background: 'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)' },
  { name: 'Lavender Haze', background: 'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)' },
  { name: 'Peach Sunset', background: 'linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%)' },
  { name: 'Lime Light', background: 'linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%)' },
  { name: 'Pink Lemonade', background: 'linear-gradient(45deg, #FBDA61 0%, #FF5ACD 100%)' },
  { name: 'Ocean Blue', background: 'linear-gradient(to right, #2E3192, #1BFFFF)' },
  { name: 'Sanguine', background: 'linear-gradient(to right, #D4145A, #FBB03B)' },
  { name: 'Lusty Lavender', background: 'linear-gradient(to right, #662D8C, #ED1E79)' },
  { name: 'Emerald Water', background: 'linear-gradient(to right, #348F50, #56B4D3)' },
  { name: 'Lemon Twist', background: 'linear-gradient(to right, #3CA55C, #B5AC49)' },
  { name: 'Frozen Berry', background: 'linear-gradient(to right, #5C258D, #4389A2)' },
];

const App: React.FC = () => {
  const [state, setState] = useState<EditorState>({
    screenshot: null,
    background: gradientPresets[0].background,
    padding: 10,  // This value is fine, as it's within the new range
    borderRadius: 8,
    shadow: 30,
    shadowIntensity: 0.3,
    containerSize: 100,
    activeTab: 'Gradients',
    blur: 0,
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
      toPng(screenshotRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        filter: (node) => {
          // Exclude problematic stylesheets
          if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
            return false;
          }
          return true;
        },
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'edited_screenshot.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Error generating image:', err);
        });
    }
  }, [state]);

  const containerStyle = {
    width: `${state.containerSize}%`,
    maxWidth: '1280px',
    height: '500px',
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
    filter: `blur(${state.blur}px)`,
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

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageSize({ width: img.width, height: img.height });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Screenshot Editor</h1>
        
        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-2/3 px-4 mb-4 flex justify-center">
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
                    min="35"
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
                    min="10"
                    max="30"  // Changed from 20 to 50
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Blur</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={state.blur}
                    onChange={(e) => setState((prev) => ({ ...prev, blur: Number(e.target.value) }))}
                    className="w-full"
                  />
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