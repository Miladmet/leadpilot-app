import core from './core';

export interface SignedUrlPayload {
  bucket: string;
  fileId: string;
  ownerUserId: string;
  expiresAt: number;
  signature: string;
}

export const generateSignedUrl = core.generateSignedUrl as (
  bucket: string,
  fileId: string,
  ownerUserId: string,
  expiresInSeconds?: number
) => string;

export const verifySignedUrlToken = core.verifySignedUrlToken as (
  token: string,
  expectedBucket: string,
  expectedFileId: string,
  requestingUserId?: string | null
) => { valid: boolean; reason?: string; ownerUserId?: string };
