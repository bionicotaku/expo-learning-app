/* eslint-disable import/first */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPlatform = vi.hoisted<{
  OS: 'android' | 'ios' | 'web';
}>(() => ({
  OS: 'ios',
}));

const mockConstants = vi.hoisted<{
  executionEnvironment: string | null;
  expoConfig: {
    android?: {
      package?: string | null;
    };
    ios?: {
      bundleIdentifier?: string | null;
    };
    name?: string | null;
    slug?: string | null;
    version?: string | null;
  } | null;
}>(() => ({
  executionEnvironment: 'standalone',
  expoConfig: {
    android: {
      package: 'com.example.android',
    },
    ios: {
      bundleIdentifier: 'com.example.ios',
    },
    name: 'Learning App',
    slug: 'learning-app',
    version: '1.2.3',
  },
}));

const mockDevice = vi.hoisted<{
  brand: string | null;
  deviceType: number | null;
  isDevice: boolean;
  manufacturer: string | null;
  modelId: string | null;
  modelName: string | null;
  osName: string | null;
  osVersion: string | null;
}>(() => ({
  brand: 'Apple',
  deviceType: 1,
  isDevice: true,
  manufacturer: 'Apple',
  modelId: 'iPhone16,2',
  modelName: 'iPhone 15 Pro Max',
  osName: 'iOS',
  osVersion: '18.5',
}));

vi.mock('react-native', () => ({
  Platform: mockPlatform,
}));

vi.mock('expo-constants', () => ({
  default: mockConstants,
}));

vi.mock('expo-device', () => ({
  DeviceType: {
    UNKNOWN: 0,
    PHONE: 1,
    TABLET: 2,
    DESKTOP: 3,
    TV: 4,
  },
  get brand() {
    return mockDevice.brand;
  },
  get deviceType() {
    return mockDevice.deviceType;
  },
  get isDevice() {
    return mockDevice.isDevice;
  },
  get manufacturer() {
    return mockDevice.manufacturer;
  },
  get modelId() {
    return mockDevice.modelId;
  },
  get modelName() {
    return mockDevice.modelName;
  },
  get osName() {
    return mockDevice.osName;
  },
  get osVersion() {
    return mockDevice.osVersion;
  },
}));

import { toAnalyticsClientContext } from './analytics-client-context';
import {
  createClientEnvironmentSnapshot,
  getClientEnvironment,
  resetClientEnvironmentCacheForTest,
} from './client-environment';

describe('client environment', () => {
  beforeEach(() => {
    mockPlatform.OS = 'ios';
    mockConstants.executionEnvironment = 'standalone';
    mockConstants.expoConfig = {
      android: {
        package: 'com.example.android',
      },
      ios: {
        bundleIdentifier: 'com.example.ios',
      },
      name: 'Learning App',
      slug: 'learning-app',
      version: '1.2.3',
    };
    mockDevice.brand = 'Apple';
    mockDevice.deviceType = 1;
    mockDevice.isDevice = true;
    mockDevice.manufacturer = 'Apple';
    mockDevice.modelId = 'iPhone16,2';
    mockDevice.modelName = 'iPhone 15 Pro Max';
    mockDevice.osName = 'iOS';
    mockDevice.osVersion = '18.5';
    resetClientEnvironmentCacheForTest();
  });

  it('creates an iOS snapshot from Expo constants and device fields', () => {
    expect(createClientEnvironmentSnapshot()).toEqual({
      appName: 'Learning App',
      appSlug: 'learning-app',
      appVersion: '1.2.3',
      applicationId: 'com.example.ios',
      deviceBrand: 'Apple',
      deviceManufacturer: 'Apple',
      deviceModelId: 'iPhone16,2',
      deviceModelName: 'iPhone 15 Pro Max',
      deviceType: 'phone',
      executionEnvironment: 'standalone',
      isPhysicalDevice: true,
      osName: 'iOS',
      osVersion: '18.5',
      platform: 'ios',
    });
  });

  it('uses the Android package as the application id on Android', () => {
    mockPlatform.OS = 'android';
    mockDevice.brand = 'google';
    mockDevice.deviceType = 2;
    mockDevice.manufacturer = 'Google';
    mockDevice.modelId = null;
    mockDevice.modelName = 'Pixel Tablet';
    mockDevice.osName = 'Android';
    mockDevice.osVersion = '15';

    expect(createClientEnvironmentSnapshot()).toMatchObject({
      applicationId: 'com.example.android',
      deviceType: 'tablet',
      platform: 'android',
    });
  });

  it('normalizes missing optional fields to null and unknown', () => {
    mockConstants.executionEnvironment = null;
    mockConstants.expoConfig = null;
    mockDevice.brand = null;
    mockDevice.deviceType = null;
    mockDevice.manufacturer = null;
    mockDevice.modelId = null;
    mockDevice.modelName = null;
    mockDevice.osName = null;
    mockDevice.osVersion = null;

    expect(createClientEnvironmentSnapshot()).toEqual({
      appName: null,
      appSlug: null,
      appVersion: null,
      applicationId: null,
      deviceBrand: null,
      deviceManufacturer: null,
      deviceModelId: null,
      deviceModelName: null,
      deviceType: 'unknown',
      executionEnvironment: null,
      isPhysicalDevice: true,
      osName: null,
      osVersion: null,
      platform: 'ios',
    });
  });

  it('caches the first snapshot until the test reset helper clears it', () => {
    const firstSnapshot = getClientEnvironment();
    mockConstants.expoConfig = {
      ...mockConstants.expoConfig,
      version: '9.9.9',
    };

    const cachedSnapshot = getClientEnvironment();
    expect(cachedSnapshot).toBe(firstSnapshot);
    expect(cachedSnapshot.appVersion).toBe('1.2.3');
    expect(Object.isFrozen(cachedSnapshot)).toBe(true);

    resetClientEnvironmentCacheForTest();

    expect(getClientEnvironment().appVersion).toBe('9.9.9');
  });

  it('maps environment snapshots to the analytics client_context shape', () => {
    expect(toAnalyticsClientContext(createClientEnvironmentSnapshot())).toEqual({
      app_version: '1.2.3',
      device_model: 'iPhone16,2',
      os_version: '18.5',
      platform: 'ios',
    });
  });
});
