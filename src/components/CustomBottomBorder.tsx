import React, { useState, useEffect, useRef } from 'react';
import {
  getStoredCustomBottomBorder,
  saveCustomBottomBorder,
  clearCustomBottomBorder,
  getStoredBorderMode,
  saveBorderMode,
} from '../services/storage';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  Sliders,
  Check,
  Maximize2,
  Sparkles,
  Layers,
} from 'lucide-react';

// Direct static bundle imports of the generated pill border banner assets
import pillEvidenceBand from '../assets/images/pill_border_band_1791697746010.jpg';
import pillAssortmentBanner from '../assets/images/pills_border_banner_1791697728550.jpg';

interface CustomBottomBorderProps {
  currentTab?: string;
  isLandingOrLogin?: boolean;
}

type BorderHeightMode = 'one_inch' | 'sleek' | 'compact' | 'panoramic' | 'auto';

export const CustomBottomBorder: React.FC<CustomBottomBorderProps> = ({
  currentTab = 'dashboard',
  isLandingOrLogin = false,
}) => {
  // Check localStorage first; if none, default to the official pill evidence band!
  const [borderImage, setBorderImage] = useState<string>(() => {
    const stored = getStoredCustomBottomBorder();
    return stored || pillEvidenceBand;
  });

  const [borderMode, setBorderMode] = useState<'landing_only' | 'all_pages' | 'hidden'>(() =>
    getStoredBorderMode()
  );

  // Default to 1 inch height
  const [heightMode, setHeightMode] = useState<BorderHeightMode>(() => {
    try {
      const saved = localStorage.getItem('dtest360_border_height_mode');
      if (
        saved === 'one_inch' ||
        saved === 'sleek' ||
        saved === 'compact' ||
        saved === 'panoramic' ||
        saved === 'auto'
      ) {
        return saved as BorderHeightMode;
      }
      return 'one_inch';
    } catch {
      return 'one_inch';
    }
  });

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with storage events
  useEffect(() => {
    const handleUpdate = () => {
      const stored = getStoredCustomBottomBorder();
      setBorderImage(stored || pillEvidenceBand);
      setBorderMode(getStoredBorderMode());
    };
    window.addEventListener('dtest360_asset_updated', handleUpdate);
    return () => window.removeEventListener('dtest360_asset_updated', handleUpdate);
  }, []);

  const shouldRender = () => {
    if (borderMode === 'hidden') return false;
    if (borderMode === 'all_pages') return true;
    return isLandingOrLogin || currentTab === 'dashboard';
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, or SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        saveCustomBottomBorder(result);
        setBorderImage(result);
        setIsAssetModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleHeightModeChange = (mode: BorderHeightMode) => {
    setHeightMode(mode);
    try {
      localStorage.setItem('dtest360_border_height_mode', mode);
    } catch {
      // ignore
    }
  };

  const selectPreset = (imgUrl: string) => {
    saveCustomBottomBorder(imgUrl);
    setBorderImage(imgUrl);
  };

  if (!shouldRender()) {
    return null;
  }

  // Determine height classes based on user setting
  const getImageStyle = () => {
    if (heightMode === 'auto') {
      return {
        width: '100%',
        height: 'auto',
        display: 'block' as const,
      };
    }
    return {
      width: '100%',
      display: 'block' as const,
    };
  };

  const getImageClasses = () => {
    if (heightMode === 'auto') {
      return 'w-full h-auto max-h-40 object-cover object-bottom block select-none pointer-events-none';
    }
    if (heightMode === 'compact') {
      // Very slim ribbon (~0.75 - 1 inch: 36px - 44px)
      return 'w-full h-9 sm:h-11 object-cover object-center block select-none pointer-events-none';
    }
    if (heightMode === 'panoramic') {
      // Panoramic band (~3 inches)
      return 'w-full h-32 sm:h-40 object-cover object-center block select-none pointer-events-none';
    }
    if (heightMode === 'sleek') {
      // ~2 inches
      return 'w-full h-20 sm:h-24 md:h-28 object-cover object-center block select-none pointer-events-none';
    }
    // 'one_inch' default: Exactly 1 inch visual height (~48px to 64px, CSS 1in is 96px, 1 inch on screens)
    return 'w-full h-12 sm:h-14 md:h-16 object-cover object-center block select-none pointer-events-none';
  };

  return (
    <div
      className={`w-full relative group select-none m-0 p-0 overflow-hidden bg-[#E4D8CE] border-t border-[#D3C7BD] transition-all ${
        isDragging ? 'ring-4 ring-[#A85F4B] ring-inset' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* BORDER IMAGE CONTAINER (Header bar removed per user request) */}
      <div className="w-full relative bg-[#E4D8CE] overflow-hidden leading-none m-0 p-0">
        <img
          src={borderImage}
          alt="D-Test 360 Field Operations Bottom Pill Border"
          className={getImageClasses()}
          style={getImageStyle()}
          loading="eager"
        />

        {/* Hover Action Floating Bar */}
        <div
          className={`absolute bottom-1 right-2 transition-all duration-200 flex items-center gap-1 bg-[#202124]/90 text-white backdrop-blur-md px-2 py-1 rounded text-[11px] shadow-lg border border-white/10 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-0.5 bg-[#A85F4B] hover:bg-[#965240] rounded text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            title="Upload custom border image"
          >
            <Upload className="w-2.5 h-2.5" />
            <span>Upload</span>
          </button>

          <button
            onClick={() => selectPreset(pillEvidenceBand)}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
              borderImage === pillEvidenceBand
                ? 'bg-white/20 text-white font-semibold'
                : 'bg-white/5 hover:bg-white/15 text-[#C7C0B8]'
            }`}
            title="Preset A: Evidence Pill Band"
          >
            <span>Preset A</span>
          </button>

          <button
            onClick={() => selectPreset(pillAssortmentBanner)}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
              borderImage === pillAssortmentBanner
                ? 'bg-white/20 text-white font-semibold'
                : 'bg-white/5 hover:bg-white/15 text-[#C7C0B8]'
            }`}
            title="Preset B: Colorful Spectrum"
          >
            <span>Preset B</span>
          </button>

          <div className="w-px h-3 bg-white/20 mx-0.5" />

          {/* Quick height toggle */}
          <button
            onClick={() =>
              handleHeightModeChange(
                heightMode === 'one_inch'
                  ? 'sleek'
                  : heightMode === 'sleek'
                  ? 'compact'
                  : heightMode === 'compact'
                  ? 'panoramic'
                  : heightMode === 'panoramic'
                  ? 'auto'
                  : 'one_inch'
              )
            }
            className="p-0.5 hover:text-white text-[#C7C0B8] rounded hover:bg-white/10 transition-colors cursor-pointer"
            title={`Height: ${heightMode} (Click to toggle: 1" / 2" / Slim / Panoramic)`}
          >
            <Maximize2 className="w-2.5 h-2.5" />
          </button>

          <button
            onClick={() => setIsAssetModalOpen(true)}
            className="p-0.5 hover:text-white text-[#C7C0B8] rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Border Settings"
          >
            <Sliders className="w-2.5 h-2.5" />
          </button>

          {borderImage !== pillEvidenceBand && (
            <button
              onClick={() => {
                clearCustomBottomBorder();
                setBorderImage(pillEvidenceBand);
              }}
              className="p-0.5 hover:text-[#FF8A8A] text-[#C7C0B8] rounded hover:bg-white/10 cursor-pointer"
              title="Reset to default pill border"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Asset Configuration Modal */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F5F0EA] border border-[#D3C7BD] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#D3C7BD]">
              <h3 className="font-heading font-bold text-base text-[#30302E] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#A85F4B]" />
                <span>Bottom Border Design Settings</span>
              </h3>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="text-[#77716C] hover:text-[#30302E] text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Presets Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#30302E] uppercase tracking-wider block">
                Select Pill Border Design
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => selectPreset(pillEvidenceBand)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    borderImage === pillEvidenceBand
                      ? 'border-[#A85F4B] bg-[#FAF0ED] ring-2 ring-[#A85F4B]/30'
                      : 'border-[#D3C7BD] bg-white hover:bg-[#FAF7F3]'
                  }`}
                >
                  <img
                    src={pillEvidenceBand}
                    alt="Preset A"
                    className="w-full h-14 object-cover rounded mb-2 border border-[#D3C7BD]"
                  />
                  <div className="font-semibold text-[#30302E] flex items-center justify-between">
                    <span>Evidence Pills Band</span>
                    {borderImage === pillEvidenceBand && (
                      <Check className="w-3.5 h-3.5 text-[#A85F4B]" />
                    )}
                  </div>
                  <div className="text-[10px] text-[#77716C] mt-0.5">
                    Multi-drug panel & evidence packets
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPreset(pillAssortmentBanner)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    borderImage === pillAssortmentBanner
                      ? 'border-[#A85F4B] bg-[#FAF0ED] ring-2 ring-[#A85F4B]/30'
                      : 'border-[#D3C7BD] bg-white hover:bg-[#FAF7F3]'
                  }`}
                >
                  <img
                    src={pillAssortmentBanner}
                    alt="Preset B"
                    className="w-full h-14 object-cover rounded mb-2 border border-[#D3C7BD]"
                  />
                  <div className="font-semibold text-[#30302E] flex items-center justify-between">
                    <span>Pill Spectrum</span>
                    {borderImage === pillAssortmentBanner && (
                      <Check className="w-3.5 h-3.5 text-[#A85F4B]" />
                    )}
                  </div>
                  <div className="text-[10px] text-[#77716C] mt-0.5">
                    Colorful pharmaceutical assortment
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Upload Dropzone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#30302E] uppercase tracking-wider block">
                Or Upload Custom Border Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D3C7BD] hover:border-[#A85F4B] bg-white p-4 rounded-lg text-center cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 mx-auto text-[#A85F4B] mb-1" />
                <div className="text-xs font-semibold text-[#30302E]">
                  Click to select or drag & drop image
                </div>
                <div className="text-[10px] text-[#77716C] mt-0.5">
                  PNG, JPG, WebP or SVG · Full 100% width preserved
                </div>
              </div>
            </div>

            {/* Height Display Sizing */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#30302E] uppercase tracking-wider block">
                Border Display Height
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleHeightModeChange('one_inch')}
                  className={`py-2 px-2 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors text-center ${
                    heightMode === 'one_inch'
                      ? 'border-[#A85F4B] bg-[#FAF0ED] text-[#30302E] font-bold ring-1 ring-[#A85F4B]'
                      : 'border-[#D3C7BD] bg-white text-[#77716C]'
                  }`}
                >
                  1" (Default)
                </button>
                <button
                  type="button"
                  onClick={() => handleHeightModeChange('sleek')}
                  className={`py-2 px-2 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors text-center ${
                    heightMode === 'sleek'
                      ? 'border-[#A85F4B] bg-[#FAF0ED] text-[#30302E] font-bold ring-1 ring-[#A85F4B]'
                      : 'border-[#D3C7BD] bg-white text-[#77716C]'
                  }`}
                >
                  2" Sleek
                </button>
                <button
                  type="button"
                  onClick={() => handleHeightModeChange('compact')}
                  className={`py-2 px-2 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors text-center ${
                    heightMode === 'compact'
                      ? 'border-[#A85F4B] bg-[#FAF0ED] text-[#30302E] font-bold ring-1 ring-[#A85F4B]'
                      : 'border-[#D3C7BD] bg-white text-[#77716C]'
                  }`}
                >
                  Slim Ribbon
                </button>
                <button
                  type="button"
                  onClick={() => handleHeightModeChange('panoramic')}
                  className={`py-2 px-2 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors text-center ${
                    heightMode === 'panoramic'
                      ? 'border-[#A85F4B] bg-[#FAF0ED] text-[#30302E] font-bold ring-1 ring-[#A85F4B]'
                      : 'border-[#D3C7BD] bg-white text-[#77716C]'
                  }`}
                >
                  Panoramic
                </button>
              </div>
              <p className="text-[10px] text-[#77716C]">
                1" Height: Clean, non-intrusive bottom border banner fitting neatly along the bottom edge.
              </p>
            </div>

            {/* Page Scope Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#30302E] uppercase tracking-wider block">
                Active Pages
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    saveBorderMode('all_pages');
                    setBorderMode('all_pages');
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                    borderMode === 'all_pages'
                      ? 'border-[#A85F4B] bg-[#FAF0ED] text-[#30302E] font-semibold'
                      : 'border-[#D3C7BD] bg-white text-[#77716C]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#A85F4B]" />
                    <span>All Pages (Global)</span>
                  </div>
                  <div className="text-[10px] text-[#77716C] mt-1 font-normal">
                    Displays across all views
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    saveBorderMode('landing_only');
                    setBorderMode('landing_only');
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                    borderMode === 'landing_only'
                      ? 'border-[#A85F4B] bg-[#FAF0ED] text-[#30302E] font-semibold'
                      : 'border-[#D3C7BD] bg-white text-[#77716C]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#A85F4B]" />
                    <span>Dashboard & Login</span>
                  </div>
                  <div className="text-[10px] text-[#77716C] mt-1 font-normal">
                    Keeps test forms minimal
                  </div>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#D3C7BD] flex justify-end">
              <button
                type="button"
                onClick={() => setIsAssetModalOpen(false)}
                className="px-4 py-2 bg-[#30302E] hover:bg-[#202124] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
