/**
 * Global type definitions for the application
 */

export interface SceneConfig {
  backgroundColor: number;
  cameraPosition: [number, number, number];
  cameraFov: number;
}

export interface AppConfig {
  appName: string;
  appVersion: string;
  environment: 'development' | 'production';
}

export interface Vector3Type {
  x: number;
  y: number;
  z: number;
}
