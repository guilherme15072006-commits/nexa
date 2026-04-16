/**
 * NEXA Security — Device Fingerprint System
 *
 * Modulo independente. Gera hash unico do device sem dados pessoais.
 * Gerencia dispositivos confiaveis do usuario.
 *
 * Consumido por: mfa.ts, riskEngine.ts, sessionManager.ts
 */

import { Platform } from 'react-native';

// ─── Types ──────────────────────────────────────────────────

export interface DeviceInfo {
  platform: string;
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  screenWidth: number;
  screenHeight: number;
  timezone: string;
  language: string;
}

export interface TrustedDevice {
  id: string;
  fingerprint: string;
  name: string;
  platform: string;
  firstSeen: string;
  lastSeen: string;
  trusted: boolean;
}

// ─── Fingerprint Generation ─────────────────────────────────

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(12, '0');
}

class DeviceFingerprintService {
  private cachedFingerprint: string | null = null;
  private cachedInfo: DeviceInfo | null = null;
  private trustedDevices: TrustedDevice[] = [];

  /** Generate device fingerprint from hardware attributes */
  getFingerprint(): string {
    if (this.cachedFingerprint) return this.cachedFingerprint;

    const info = this.getDeviceInfo();
    const raw = `${info.platform}|${info.osVersion}|${info.deviceModel}|${info.screenWidth}x${info.screenHeight}|${info.timezone}`;
    this.cachedFingerprint = `fp_${simpleHash(raw)}`;
    return this.cachedFingerprint;
  }

  /** Get device info (non-PII) */
  getDeviceInfo(): DeviceInfo {
    if (this.cachedInfo) return this.cachedInfo;

    const { Dimensions } = require('react-native');
    const { width, height } = Dimensions.get('window');

    this.cachedInfo = {
      platform: Platform.OS,
      osVersion: String(Platform.Version),
      appVersion: '1.0.0',
      deviceModel: Platform.OS === 'android' ? 'Android Device' : 'iOS Device',
      screenWidth: Math.round(width),
      screenHeight: Math.round(height),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: 'pt-BR',
    };
    return this.cachedInfo;
  }

  /** Get device display name */
  getDeviceName(): string {
    const info = this.getDeviceInfo();
    return `${info.platform === 'android' ? 'Android' : 'iPhone'} (${info.osVersion})`;
  }

  /** Check if current device is trusted */
  isDeviceTrusted(): boolean {
    const fp = this.getFingerprint();
    return this.trustedDevices.some(d => d.fingerprint === fp && d.trusted);
  }

  /** Trust current device */
  trustDevice(): TrustedDevice {
    const fp = this.getFingerprint();
    const existing = this.trustedDevices.find(d => d.fingerprint === fp);
    if (existing) {
      existing.trusted = true;
      existing.lastSeen = new Date().toISOString();
      return existing;
    }

    const device: TrustedDevice = {
      id: `dev_${Date.now()}`,
      fingerprint: fp,
      name: this.getDeviceName(),
      platform: Platform.OS,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      trusted: true,
    };
    this.trustedDevices.push(device);
    return device;
  }

  /** Revoke trust from a device */
  revokeDevice(deviceId: string): void {
    this.trustedDevices = this.trustedDevices.filter(d => d.id !== deviceId);
  }

  /** Revoke all devices */
  revokeAll(): void {
    this.trustedDevices = [];
    this.cachedFingerprint = null;
  }

  /** Get all trusted devices */
  getTrustedDevices(): TrustedDevice[] {
    return [...this.trustedDevices];
  }

  /** Load trusted devices from backend */
  loadDevices(devices: TrustedDevice[]): void {
    this.trustedDevices = devices;
  }
}

export const deviceFingerprint = new DeviceFingerprintService();
