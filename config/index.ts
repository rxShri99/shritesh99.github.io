/**
 * Application configuration
 */

import { SCENE_CONFIG, APP_NAME, APP_VERSION } from '@/constants';

export const appConfig = {
  name: APP_NAME,
  version: APP_VERSION,
  environment: (process.env.NEXT_PUBLIC_APP_ENV || 'development') as 'development' | 'production',
  production: process.env.NODE_ENV === 'production',
};

export const sceneConfig = {
  ...SCENE_CONFIG,
  enableStats: appConfig.environment === 'development',
  enableControls: true,
};
