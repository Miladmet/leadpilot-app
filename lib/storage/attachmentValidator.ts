import core from './core';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  virusScanStatus: 'CLEAN' | 'INFECTED' | 'SUSPICIOUS';
  scanResult: 'Pending Scan' | 'Safe' | 'Suspicious' | 'Quarantined';
  threatType?: string | null;
  reason?: string;
  scanTime?: string;
}

export const scanFileForMalware = core.scanFileForMalware;
export const scanFile = core.scanFile;
export const validateAttachment = core.validateAttachment as (
  bucket: string,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer
) => Promise<FileValidationResult>;
