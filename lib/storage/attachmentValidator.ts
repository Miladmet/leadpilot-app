import core from './core';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  virusScanStatus: 'CLEAN' | 'INFECTED' | 'SUSPICIOUS';
}

export const scanFileForMalware = core.scanFileForMalware as (
  buffer: Buffer,
  fileName: string
) => Promise<'CLEAN' | 'INFECTED'>;

export const validateAttachment = core.validateAttachment as (
  bucket: string,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer
) => Promise<FileValidationResult>;
