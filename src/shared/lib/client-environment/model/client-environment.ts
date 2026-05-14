import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import type {
  ClientEnvironment,
  ClientEnvironmentDeviceType,
  ClientEnvironmentPlatform,
} from './types';

let cachedClientEnvironment: ClientEnvironment | null = null;

function normalizePlatform(): ClientEnvironmentPlatform {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS;
  }

  return 'unknown';
}

function normalizeString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function normalizeDeviceType(
  deviceType: typeof Device.deviceType
): ClientEnvironmentDeviceType {
  switch (deviceType) {
    case Device.DeviceType.PHONE:
      return 'phone';
    case Device.DeviceType.TABLET:
      return 'tablet';
    case Device.DeviceType.DESKTOP:
      return 'desktop';
    case Device.DeviceType.TV:
      return 'tv';
    default:
      return 'unknown';
  }
}

function resolveApplicationId(platform: ClientEnvironmentPlatform): string | null {
  if (platform === 'ios') {
    return normalizeString(Constants.expoConfig?.ios?.bundleIdentifier);
  }

  if (platform === 'android') {
    return normalizeString(Constants.expoConfig?.android?.package);
  }

  return null;
}

export function createClientEnvironmentSnapshot(): ClientEnvironment {
  const platform = normalizePlatform();

  return Object.freeze({
    appName: normalizeString(Constants.expoConfig?.name),
    appSlug: normalizeString(Constants.expoConfig?.slug),
    appVersion: normalizeString(Constants.expoConfig?.version),
    applicationId: resolveApplicationId(platform),
    deviceBrand: normalizeString(Device.brand),
    deviceManufacturer: normalizeString(Device.manufacturer),
    deviceModelId: normalizeString(Device.modelId),
    deviceModelName: normalizeString(Device.modelName),
    deviceType: normalizeDeviceType(Device.deviceType),
    executionEnvironment: normalizeString(Constants.executionEnvironment),
    isPhysicalDevice: Device.isDevice,
    osName: normalizeString(Device.osName),
    osVersion: normalizeString(Device.osVersion),
    platform,
  });
}

export function getClientEnvironment(): ClientEnvironment {
  if (!cachedClientEnvironment) {
    cachedClientEnvironment = createClientEnvironmentSnapshot();
  }

  return cachedClientEnvironment;
}

export function resetClientEnvironmentCacheForTest() {
  cachedClientEnvironment = null;
}
