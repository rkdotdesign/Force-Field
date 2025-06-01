import React, { useState, useEffect, useRef } from 'react';
import { FlowFieldSettings, InteractionMode, ShapeType } from '../types';
import Slider from './Slider';
import ToggleSwitch from './ToggleSwitch';

interface ControlsPanelProps {
  settings: FlowFieldSettings;
  onSettingChange: <K extends keyof FlowFieldSettings>(key: K, value: FlowFieldSettings[K]) => void;
  onDownloadSVG: () => void;
  onDownloadImage: (format: 'png' | 'jpeg') => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onSettingChange,
  onDownloadSVG,
  onDownloadImage,
}) => {
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const interactionModeOptions = [
    { value: InteractionMode.Attract, label: 'Attract' },
    { value: InteractionMode.Repulse, label: 'Repulse' },
  ];

  const shapeTypeOptions = [
    { value: ShapeType.Circle, label: 'Circle' },
    { value: ShapeType.Square, label: 'Square' },
  ];

  const booleanToggleOptions = [
    { value: 'true', label: 'On' },
    { value: 'false', label: 'Off' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDownloadDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadOptionClick = (format: 'svg' | 'png' | 'jpeg') => {
    if (format === 'svg') {
      onDownloadSVG();
    } else {
      onDownloadImage(format);
    }
    setIsDownloadDropdownOpen(false);
  };
  
  const glowColorInputId = React.useId();

  return (
    <div className="flex flex-col h-full text-sm">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3">Force Field</h1>
      <hr className="border-neutral-700 mb-4 md:mb-6" />
      
      <ToggleSwitch<InteractionMode>
        label="Interaction Mode"
        options={interactionModeOptions}
        currentValue={settings.interactionMode}
        onChange={(val) => onSettingChange('interactionMode', val)}
      />

      <Slider
        label="Grid Density"
        min={5} max={50} step={1}
        value={settings.numCirclesPerRow}
        onChange={(val) => onSettingChange('numCirclesPerRow', val)}
      />
      <div className="text-xs text-neutral-400 -mt-3 mb-4">
        Total shapes: {settings.numCirclesPerRow * settings.numCirclesPerRow}
      </div>

      <ToggleSwitch<ShapeType>
        label="Shape Type"
        options={shapeTypeOptions}
        currentValue={settings.shapeType}
        onChange={(val) => onSettingChange('shapeType', val)}
      />
      
      <ToggleSwitch<string>
        label="Animate Shape Rotation"
        options={booleanToggleOptions}
        currentValue={String(settings.animateShapeRotation)}
        onChange={(val) => onSettingChange('animateShapeRotation', val === 'true')}
        className="mt-1"
      />

      <Slider
        label="Interaction Strength"
        min={0.00} max={0.5} step={0.01}
        value={settings.interactionStrength}
        onChange={(val) => onSettingChange('interactionStrength', val)}
      />

      <Slider
        label="Mouse Effect Radius"
        min={50} max={500} step={10}
        value={settings.mouseEffectRadius}
        onChange={(val) => onSettingChange('mouseEffectRadius', val)}
      />

      <ToggleSwitch<string>
        label="Enable Glow Effect"
        options={booleanToggleOptions}
        currentValue={String(settings.enableGlowEffect)}
        onChange={(val) => onSettingChange('enableGlowEffect', val === 'true')}
        className="mt-1"
      />
      {settings.enableGlowEffect && (
        <div className="mb-4 mt-2">
            <label htmlFor={glowColorInputId} className="block text-sm font-medium text-neutral-300 mb-1.5">
                Glow Color
            </label>
            <input
                id={glowColorInputId}
                type="color"
                value={settings.glowColor}
                onChange={(e) => onSettingChange('glowColor', e.target.value)}
                className="w-full h-10 p-1 bg-neutral-700 border border-neutral-600 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
            />
        </div>
      )}

      <ToggleSwitch<string>
        label="Enable Dynamic Colors"
        options={booleanToggleOptions}
        currentValue={String(settings.enableDynamicColors)}
        onChange={(val) => onSettingChange('enableDynamicColors', val === 'true')}
        className="mt-1"
      />

      <Slider
        label="Return Force"
        min={0.005} max={0.2} step={0.005}
        value={settings.returnForce}
        onChange={(val) => onSettingChange('returnForce', val)}
      />

      <Slider
        label="Damping"
        min={0.80} max={0.99} step={0.01}
        value={settings.damping}
        onChange={(val) => onSettingChange('damping', val)}
      />
      
      <Slider
        label="Shape Base Size"
        min={1} max={10} step={0.5}
        value={settings.circleBaseRadius}
        onChange={(val) => onSettingChange('circleBaseRadius', val)}
      />

      <ToggleSwitch<string>
        label="Show Base Points"
        options={booleanToggleOptions}
        currentValue={String(settings.showBasePoints)}
        onChange={(val) => onSettingChange('showBasePoints', val === 'true')}
        className="mt-2"
      />

      <div className="mt-6 pt-6 border-t border-neutral-700">
        <h3 className="text-lg font-medium text-white mb-3">Export</h3>
        <div className="relative mb-3" ref={dropdownRef}>
          <button
            onClick={() => setIsDownloadDropdownOpen(prev => !prev)}
            className="w-full py-2 px-3 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-md text-xs sm:text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-1 focus:ring-offset-neutral-900 flex justify-between items-center"
            aria-haspopup="true"
            aria-expanded={isDownloadDropdownOpen}
          >
            Download
            <svg className={`w-4 h-4 transition-transform duration-150 ${isDownloadDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {isDownloadDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-neutral-700 border border-neutral-600 rounded-md shadow-lg py-1">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleDownloadOptionClick('svg'); }}
                className="block px-3 py-1.5 text-xs sm:text-sm text-neutral-200 hover:bg-neutral-600"
              >
                SVG
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleDownloadOptionClick('png'); }}
                className="block px-3 py-1.5 text-xs sm:text-sm text-neutral-200 hover:bg-neutral-600"
              >
                PNG
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleDownloadOptionClick('jpeg'); }}
                className="block px-3 py-1.5 text-xs sm:text-sm text-neutral-200 hover:bg-neutral-600"
              >
                JPEG
              </a>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ControlsPanel;