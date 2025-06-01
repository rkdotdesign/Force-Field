import React, { useState, useCallback, useRef } from 'react';
import FlowFieldCanvas, { FlowFieldCanvasHandles } from './components/FlowFieldCanvas';
import ControlsPanel from './components/ControlsPanel';
import { FlowFieldSettings, InteractionMode, ShapeType } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<FlowFieldSettings>({
    numCirclesPerRow: 30, // Updated default
    interactionMode: InteractionMode.Attract,
    interactionStrength: 0.25, // Updated default
    returnForce: 0.02,
    damping: 0.92,
    circleBaseRadius: 3.5, // Updated default
    showBasePoints: true,
    mouseEffectRadius: 200,
    shapeType: ShapeType.Circle,
    animateShapeRotation: false,
    enableGlowEffect: false,
    glowColor: '#FFFF00', // Default glow color
    enableDynamicColors: false, // Default for dynamic colors
  });

  const canvasRef = useRef<FlowFieldCanvasHandles>(null);

  const updateSetting = useCallback(<K extends keyof FlowFieldSettings>(key: K, value: FlowFieldSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleDownloadSVG = () => {
    canvasRef.current?.downloadSVG();
  };

  const handleDownloadImage = (format: 'png' | 'jpeg') => {
    canvasRef.current?.downloadImage(format);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row text-white overflow-hidden">
      <div className="flex-grow relative bg-neutral-800 w-full md:w-auto h-[60vh] md:h-full"> {/* Canvas container */}
        <FlowFieldCanvas ref={canvasRef} settings={settings} />
      </div>
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-neutral-900 p-4 md:p-6 shadow-lg overflow-y-auto md:border-l md:border-neutral-700 h-[40vh] md:h-screen">
        <ControlsPanel
          settings={settings}
          onSettingChange={updateSetting}
          onDownloadSVG={handleDownloadSVG}
          onDownloadImage={handleDownloadImage}
        />
      </div>
    </div>
  );
};

export default App;