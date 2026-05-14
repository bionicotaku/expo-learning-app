export type ClientEnvironmentPlatform = 'android' | 'ios' | 'unknown';

export type ClientEnvironmentDeviceType =
  | 'desktop'
  | 'phone'
  | 'tablet'
  | 'tv'
  | 'unknown';

export type ClientEnvironment = Readonly<{
  appName: string | null;
  appSlug: string | null;
  appVersion: string | null;
  applicationId: string | null;
  deviceBrand: string | null;
  deviceManufacturer: string | null;
  deviceModelId: string | null;
  deviceModelName: string | null;
  deviceType: ClientEnvironmentDeviceType;
  executionEnvironment: string | null;
  isPhysicalDevice: boolean;
  osName: string | null;
  osVersion: string | null;
  platform: ClientEnvironmentPlatform;
}>;

export type AnalyticsClientContext = Readonly<{
  app_version: string | null;
  device_model: string | null;
  os_version: string | null;
  platform: ClientEnvironmentPlatform;
}>;
