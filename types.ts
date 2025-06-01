export enum InteractionMode {
  Attract = 'ATTRACT',
  Repulse = 'REPULSE',
}

export enum ShapeType {
  Circle = 'CIRCLE',
  Square = 'SQUARE',
}

export interface ParticleConfig {
  id: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  rotationAngle: number; // Current rotation angle of the particle in degrees
}

export interface FlowFieldSettings {
  numCirclesPerRow: number;
  interactionMode: InteractionMode;
  interactionStrength: number;
  returnForce: number;
  damping: number;
  circleBaseRadius: number;
  showBasePoints: boolean;
  mouseEffectRadius: number;
  shapeType: ShapeType;
  animateShapeRotation: boolean;
  enableGlowEffect: boolean;
  glowColor: string; // Color for the glow effect
  enableDynamicColors: boolean; // For Perlin noise-based dynamic colors
}

// Removed startRecording and stopRecording from handles
export interface FlowFieldCanvasHandles {
  downloadSVG: () => void;
  downloadImage: (format: 'png' | 'jpeg') => void;
}