import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Upload, Maximize, PanelTop, CornerUpRight, Cloud, Sun, SunDim, Twitter, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import ProductHuntBadge from './ProductHuntBadge';

interface EditorState {
  screenshot: string | null;
  background: string;
  padding: number;
  borderRadius: number;
  shadow: number;
  shadowIntensity: number;
  containerWidth: number;
  containerHeight: number;
  activeTab: 'macOS' | 'Gradients' | 'Wallpapers';
  blur: number;
}

const wallpapers: { name: string; background: string }[] = [
  { name: 'Sierra', background: 'url(https://images.unsplash.com/photo-1511300636408-a63a89df3482)' },
  { name: 'Ocean Mist', background: 'url(https://images.unsplash.com/photo-1505144808419-1957a94ca61e)' },
  { name: 'Desert Dunes', background: 'url(https://images.unsplash.com/photo-1547234935-80c7145ec969)' },
  { name: 'Smooth Waves', background: 'url(https://images.unsplash.com/photo-1505820013142-f86a3439c5b2)' },
  { name: 'Cloudy Peaks', background: 'url(https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf)' },
  { name: 'Misty Forest', background: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d)' },
  { name: 'Pastel Sky', background: 'url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6)' },
  { name: 'Gentle Sunrise', background: 'url(https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5)' },
  { name: 'Lush Green', background: 'url(https://images.unsplash.com/photo-1527254436800-a3f74db0f3cf)' },
];

const macOSPresets: { name: string; background: string }[] = [
  { name: 'Big Sur 2', background: 'url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/macos-big-sur-apple-layers-fluidic-colorful-wwdc-stock-3840x2160-1455.jpg)' },
  { name: 'Monterey', background: 'url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/macos-monterey-stock-black-dark-mode-layers-5k-3840x2160-5889.jpg)' },
  { name: 'Monterey 2', background: 'url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/macos-monterey-wwdc-21-stock-5k-3840x2160-5584.jpg)' },
  { name: 'Sequoia Blue Orage', background: 'url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sequoia-blue-orange.jpg)' },
  { name: 'Sequoia Blue', background: 'url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sequoia-blue.jpg)' },
  { name: 'Sonama Clouds', background: 'url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sonoma-clouds.jpg)' },
  { name: 'Sonama Evening', background: 'url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sonoma-evening.jpg)' },
  { name: 'Sonama from above', background: 'url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sonoma-from-above.jpg)' },
  { name: 'Sonama River', background: 'url(https://iqeomzolnxhweqyhrnsg.supabase.co/storage/v1/object/public/sqlilot/abstract/sonoma-river.jpg)' },
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

const CONTAINER_FIXED_HEIGHT = 600;

const App: React.FC = () => {
  const [state, setState] = useState<EditorState>({
    screenshot: null,
    background: gradientPresets[0].background,  // Change this line
    padding: 10,
    borderRadius: 8,
    shadow: 30,
    shadowIntensity: 0.3,
    containerWidth: 100,
    containerHeight: 100,
    activeTab: 'Gradients',
    blur: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLDivElement>(null);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [showModal]);

  const adjustImageSettings = (imgWidth: number, imgHeight: number) => {
    const containerHeight = CONTAINER_FIXED_HEIGHT;
    const containerWidth = (containerHeight * imgWidth) / imgHeight;

    if (containerWidth > 600 || imgHeight > containerHeight) {
      // Image is larger than the container, set border radius to 50% of the slider max
      setState(prev => ({
        ...prev,
        borderRadius: Math.min(25, prev.borderRadius) // 25 is 50% of the max slider value (50)
      }));
    }

    // Add this condition to set padding to 50% when image height is >= container height
    if (imgHeight >= containerHeight) {
      setState(prev => ({
        ...prev,
        padding: 15 // 15 is 50% of the max padding slider value (30)
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          adjustImageSettings(img.width, img.height);
        };
        img.src = e.target?.result as string;
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
          setShowModal(true); // Show the modal after download
        })
        .catch((err) => {
          console.error('Error generating image:', err);
        });
    }
  }, [state]);

  const containerStyle = {
    width: `${state.containerWidth}%`,
    height: `${state.containerHeight}%`,
    maxWidth: '1280px',
    maxHeight: '720px',
    position: 'relative' as const,
    overflow: 'hidden',
  };

  const backgroundWrapperStyle = {
    position: 'absolute' as const,
    top: '-10px',
    left: '-10px',
    right: '-10px',
    bottom: '-10px',
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
    backgroundColor: state.activeTab !== 'Gradients' ? '#000' : 'transparent',
    filter: `blur(${state.blur}px)`,
    transform: 'scale(1.1)', // Slightly scale up the background to cover blur edges
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
    borderRadius: `18px !important`,
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
    adjustImageSettings(img.width, img.height);
  };

  const handleTabChange = (newTab: 'macOS' | 'Gradients' | 'Wallpapers') => {
    setState(prev => ({
      ...prev,
      activeTab: newTab,
      background: newTab === 'macOS' ? macOSPresets[0].background :
        newTab === 'Gradients' ? gradientPresets[0].background :
          wallpapers[0].background
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8 relative">
      <h1 className="text-center mb-8">
        <span className="pacifico-regular text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)] pl-1">prettify.pro</span>
      </h1>
      <div id="mainapp" className="bg-white rounded-lg shadow-lg p-8 w-full max-w-7xl relative">
        {/* Product Hunt badge positioned above mainapp */}
        <div className="absolute -top-16 right-0">
          <ProductHuntBadge />
        </div>
        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-3/4 px-4 mb-4 flex flex-col items-center">
            <div
              ref={screenshotRef}
              className="relative overflow-hidden rounded-lg mb-4"
              style={containerStyle}
            >
              <div style={backgroundWrapperStyle}>
                <div style={backgroundStyle}>
                  {state.activeTab === 'macOS' || state.activeTab === 'Wallpapers' ? (
                    <img src={state.background.replace('url(', '').replace(')', '')} alt="Wallpaper" style={wallpaperStyle} />
                  ) : (
                    <div style={{ ...wallpaperStyle, background: state.background }} />
                  )}
                </div>
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
            <div className="flex space-x-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-1.5 px-3 rounded flex items-center text-sm"
              >
                <Upload className="mr-1.5" size={16} />
                Upload Image
              </button>
              {state.screenshot && (
                <button
                  onClick={downloadImage}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-3 rounded flex items-center text-sm"
                >
                  <Download className="mr-1.5" size={16} />
                  Download Image
                </button>
              )}
            </div>
          </div>
          <div className="w-full lg:w-1/4 px-4">
            <div className="mb-6">
              <div className="flex mb-4 !rounded-sm">
                <button
                  className={`flex-1 py-1 px-2 text-sm text-center ${state.activeTab === 'Gradients' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => handleTabChange('Gradients')}
                >
                  Gradients
                </button>
                <button
                  className={`flex-1 py-1 px-2 text-sm text-center ${state.activeTab === 'macOS' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => handleTabChange('macOS')}
                >
                  macOS
                </button>
                <button
                  className={`flex-1 py-1 px-2 text-sm text-center ${state.activeTab === 'Wallpapers' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => handleTabChange('Wallpapers')}
                >
                  Wallpapers
                </button>
              </div>
              <div className="overflow-x-auto">
                <div className="flex space-x-2 border border-gray-300 rounded-md p-2" style={{ width: state.activeTab === 'Gradients' ? '500px' : '600px' }}>
                  {(state.activeTab === 'macOS' ? macOSPresets :
                    state.activeTab === 'Gradients' ? gradientPresets :
                      wallpapers).map((preset, index) => (
                        <button
                          key={index}
                          className="flex-shrink-0 w-12 h-12 rounded bg-cover bg-center"
                          style={{ backgroundImage: preset.background }}
                          onClick={() => setState((prev) => ({ ...prev, background: preset.background }))}
                        >
                        </button>
                      ))}
                </div>
              </div>
            </div>
            <div className="mb-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Maximize className="mr-2" size={16} />
                    Container Width
                  </label>
                  <input
                    type="range"
                    min="35"
                    max="100"
                    value={state.containerWidth}
                    onChange={(e) => setState((prev) => ({ ...prev, containerWidth: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Maximize className="mr-2" size={16} />
                    Container Height
                  </label>
                  <input
                    type="range"
                    min="35"
                    max="100"
                    value={state.containerHeight}
                    onChange={(e) => setState((prev) => ({ ...prev, containerHeight: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <PanelTop className="mr-2" size={16} />
                    Padding
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={state.padding}
                    onChange={(e) => setState((prev) => ({ ...prev, padding: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <CornerUpRight className="mr-2" size={16} />
                    Border Radius
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Cloud className="mr-2" size={16} />
                    Shadow Size
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Sun className="mr-2" size={16} />
                    Shadow Intensity
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <SunDim className="mr-2" size={16} />
                    Background Blur
                  </label>
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md shadow-lg transform transition-all duration-300 ease-in-out relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <X size={24} />
            </button>
            <img src={"/images/shobhit.png"} alt="Logo" className="mb-4 mx-auto w-[100px] h-[120px]" />
            <h2 className="text-3xl font-bold mb-4 text-center text-purple-600">Thank you!</h2>
            <p className="mb-6 text-gray-700 text-center">I hope you enjoyed using prettify.pro!</p>
            <div className="flex flex-col items-center space-y-4 mb-6">
              <button
                onClick={() => window.open('https://x.com/nullbytes00', '_blank')}
                className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-md flex items-center transition duration-300 ease-in-out transform hover:scale-105"
              >
                <span className="mr-2">Follow me on</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                onClick={() => window.open('https://shipfa.st/?via=shobhit', '_blank')}
                className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-md flex items-center transition duration-300 ease-in-out transform hover:scale-105"
              >
                <span className="mr-2">⚡ Ship Your Startup Fast</span>
              </button>
              <a href="https://www.buymeacoffee.com/shobhit99" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" className='!h-10' /></a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;