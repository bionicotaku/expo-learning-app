import type { AnalyticsClientContext, ClientEnvironment } from './types';

export function toAnalyticsClientContext(
  environment: ClientEnvironment
): AnalyticsClientContext {
  return {
    app_version: environment.appVersion,
    device_model: environment.deviceModelId ?? environment.deviceModelName,
    os_version: environment.osVersion,
    platform: environment.platform,
  };
}
