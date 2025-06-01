import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { FlowFieldSettings, ParticleConfig, InteractionMode, ShapeType } from '../types';

interface FlowFieldCanvasProps {
  settings: FlowFieldSettings;
}

export interface FlowFieldCanvasHandles {
  downloadSVG: () => void;
  downloadImage: (format: 'png' | 'jpeg') => void;
}

const CANVAS_STATIC_BACKGROUND_COLOR = '#262626'; // neutral-800 equivalent
const PARTICLE_ROTATION_SPEED = 1; // Degrees per frame for animated rotation
const DEFAULT_PARTICLE_COLOR_HEX = '#E5E7EB'; // neutral-200

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1).toUpperCase();
};


const FlowFieldCanvas = forwardRef<FlowFieldCanvasHandles, FlowFieldCanvasProps>(({ settings }, ref) => {
  const [particles, setParticles] = useState<ParticleConfig[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [interactionPos, setInteractionPos] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [currentSvgBgColor, setCurrentSvgBgColor] = useState<string>(CANVAS_STATIC_BACKGROUND_COLOR);
  
  const dynamicColorTimeRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    downloadSVG,
    downloadImage,
  }));

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getSVGString = (): string => {
    if (!svgRef.current) return '';
    return new XMLSerializer().serializeToString(svgRef.current);
  };

  const downloadSVG = () => {
    const svgString = getSVGString();
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    downloadFile(blob, `flow-field-${Date.now()}.svg`);
  };

  const drawSVGToCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, svgString: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = (e) => {
        console.error("Error loading SVG image for canvas drawing:", e);
        reject(e);
      };
      img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    });
  };
  
  const downloadImage = async (format: 'png' | 'jpeg') => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svgString = getSVGString();
    if (!svgString) return;

    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error("Could not get 2D context for image export");
        return;
    }

    try {
      await drawSVGToCanvas(canvas, ctx, svgString);
      const dataUrl = canvas.toDataURL(format === 'png' ? 'image/png' : `image/jpeg`, 0.9);
      downloadDataUrl(dataUrl, `flow-field-${Date.now()}.${format}`);
    } catch (error) {
      console.error("Error exporting image:", error);
    }
  };

  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    if (containerRef.current) {
        updateDims();
    }
    const resizeObserver = new ResizeObserver(updateDims);
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    
    return () => {
        if (containerRef.current) {
            resizeObserver.unobserve(containerRef.current);
        }
    };
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const newParticles: ParticleConfig[] = [];
    const numRows = settings.numCirclesPerRow;
    const numCols = settings.numCirclesPerRow;

    const spacingX = dimensions.width / (numCols + 1);
    const spacingY = dimensions.height / (numRows + 1);

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const id = `particle-${r}-${c}`;
        const baseX = (c + 1) * spacingX;
        const baseY = (r + 1) * spacingY;
        newParticles.push({
          id,
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          vx: 0,
          vy: 0,
          radius: settings.circleBaseRadius,
          color: DEFAULT_PARTICLE_COLOR_HEX,
          rotationAngle: 0,
        });
      }
    }
    setParticles(newParticles);
  }, [dimensions, settings.numCirclesPerRow, settings.circleBaseRadius]);

  useEffect(() => {
    const currentSvg = svgRef.current;
    if (!currentSvg) return;

    const getRelativeCoords = (clientX: number, clientY: number) => {
      const rect = currentSvg.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      setInteractionPos(getRelativeCoords(event.clientX, event.clientY));
    };
    const handleMouseLeave = () => {
      setInteractionPos({ x: null, y: null });
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault(); // Prevents page scroll/zoom on canvas interaction
      if (event.touches.length > 0) {
        setInteractionPos(getRelativeCoords(event.touches[0].clientX, event.touches[0].clientY));
      }
    };
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length > 0) {
        setInteractionPos(getRelativeCoords(event.touches[0].clientX, event.touches[0].clientY));
      }
    };
    const handleTouchEnd = () => {
      setInteractionPos({ x: null, y: null });
    };

    currentSvg.addEventListener('mousemove', handleMouseMove);
    currentSvg.addEventListener('mouseleave', handleMouseLeave);
    currentSvg.addEventListener('touchstart', handleTouchStart, { passive: false });
    currentSvg.addEventListener('touchmove', handleTouchMove, { passive: false });
    currentSvg.addEventListener('touchend', handleTouchEnd);
    currentSvg.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      currentSvg.removeEventListener('mousemove', handleMouseMove);
      currentSvg.removeEventListener('mouseleave', handleMouseLeave);
      currentSvg.removeEventListener('touchstart', handleTouchStart);
      currentSvg.removeEventListener('touchmove', handleTouchMove);
      currentSvg.removeEventListener('touchend', handleTouchEnd);
      currentSvg.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  const animate = useCallback(async () => {
    let particleBaseColorHex = DEFAULT_PARTICLE_COLOR_HEX;

    if (settings.enableDynamicColors) {
        dynamicColorTimeRef.current += 0.002; 
        const noiseVal = (Math.sin(dynamicColorTimeRef.current) + 1) / 2; 
        const hue = Math.floor(noiseVal * 360);
        
        const bgRgb = hslToRgb(hue, 70, 15); 
        setCurrentSvgBgColor(rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b));

        const particleRgb = hslToRgb(hue, 85, 65); 
        particleBaseColorHex = rgbToHex(particleRgb.r, particleRgb.g, particleRgb.b);
    } else {
        setCurrentSvgBgColor(CANVAS_STATIC_BACKGROUND_COLOR); 
    }

    const particleBaseRgb = hexToRgb(particleBaseColorHex);
    const currentGlowRgb = settings.enableGlowEffect ? hexToRgb(settings.glowColor) : null;

    setParticles(prevParticles =>
      prevParticles.map(particle => {
        let { x, y, vx, vy, baseX, baseY, radius, rotationAngle } = particle;
        // In this version, particle.radius is not dynamically scaled by interaction.
        // If scaling were re-introduced, radius would be calculated here.
        const currentParticleRadius = settings.circleBaseRadius; 
        let finalColor = particleBaseColorHex;

        if (interactionPos.x !== null && interactionPos.y !== null) {
          const dxMouse = interactionPos.x - x;
          const dyMouse = interactionPos.y - y;
          let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          
          if (distMouse < settings.mouseEffectRadius && distMouse > 0.01 && settings.interactionStrength > 0) {
            const angleMouse = Math.atan2(dyMouse, dxMouse);
            let forceMagnitude = (1 - distMouse / settings.mouseEffectRadius) * settings.interactionStrength * 5; 

            if (settings.interactionMode === InteractionMode.Repulse) {
              forceMagnitude *= -1;
            }
            
            vx += Math.cos(angleMouse) * forceMagnitude;
            vy += Math.sin(angleMouse) * forceMagnitude;
          }

          if (settings.enableGlowEffect && particleBaseRgb && currentGlowRgb) {
            if (distMouse < settings.mouseEffectRadius) {
              const glowIntensity = Math.max(0, 1 - (distMouse / settings.mouseEffectRadius));
              
              const r = particleBaseRgb.r + (currentGlowRgb.r - particleBaseRgb.r) * glowIntensity;
              const g = particleBaseRgb.g + (currentGlowRgb.g - particleBaseRgb.g) * glowIntensity;
              const b = particleBaseRgb.b + (currentGlowRgb.b - particleBaseRgb.b) * glowIntensity;
              finalColor = rgbToHex(r,g,b);
            }
          }
        }

        const dxBase = baseX - x;
        const dyBase = baseY - y;
        vx += dxBase * settings.returnForce;
        vy += dyBase * settings.returnForce;
        
        vx *= settings.damping;
        vy *= settings.damping;

        x += vx;
        y += vy;
        
        if (dimensions.width > 0 && dimensions.height > 0) {
            if (x - currentParticleRadius < 0) { x = currentParticleRadius; vx *= -0.3; }
            if (x + currentParticleRadius > dimensions.width) { x = dimensions.width - currentParticleRadius; vx *= -0.3; }
            if (y - currentParticleRadius < 0) { y = currentParticleRadius; vy *= -0.3; }
            if (y + currentParticleRadius > dimensions.height) { y = dimensions.height - currentParticleRadius; vy *= -0.3; }
        }

        if (settings.animateShapeRotation) {
            rotationAngle = (rotationAngle + PARTICLE_ROTATION_SPEED) % 360;
        }
        
        // Ensure particle.radius is updated if it were dynamic. Here it's fixed.
        return { ...particle, x, y, vx, vy, radius: currentParticleRadius, rotationAngle, color: finalColor };
      })
    );

    animationFrameId.current = requestAnimationFrame(animate);
  }, [interactionPos, settings, dimensions]); // interactionPos replaces mousePos

  useEffect(() => {
    if(particles.length > 0 && dimensions.width > 0 && dimensions.height > 0) {
        animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animate, particles, dimensions]);

  const renderParticle = (particle: ParticleConfig) => {
    const { x, y, radius, color, id, rotationAngle } = particle;
    const transform = settings.animateShapeRotation ? `rotate(${rotationAngle} ${x} ${y})` : undefined;

    if (settings.shapeType === ShapeType.Square) {
      return (
        <rect
          key={id}
          x={x - radius}
          y={y - radius}
          width={radius * 2}
          height={radius * 2}
          fill={color}
          transform={transform}
        />
      );
    }
    return (
      <circle
        key={id}
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        transform={transform}
      />
    );
  };

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden relative">
      <svg ref={svgRef} width="100%" height="100%" style={{ touchAction: 'none' }}> {/* Prevent default touch actions like pan/zoom on the SVG itself */}
        <rect width="100%" height="100%" fill={currentSvgBgColor} />
        {settings.showBasePoints && particles.map(particle => (
          <circle
            key={`${particle.id}-base`}
            cx={particle.baseX}
            cy={particle.baseY}
            r={Math.max(1, settings.circleBaseRadius / 3)}
            fill={settings.enableDynamicColors ? "rgba(255, 255, 255, 0.2)" : "rgba(229, 231, 235, 0.3)"} 
            opacity={0.4}
          />
        ))}
        {particles.map(particle => renderParticle(particle))}
      </svg>
    </div>
  );
});

export default FlowFieldCanvas;