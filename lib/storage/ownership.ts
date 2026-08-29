import core from './core';

export interface FileOwnershipMetadata {
  file_id: string;
  bucket: string;
  file_name: string;
  owner_user_id: string;
  organization_id: string;
  file_type: string;
  file_size: number;
  created_at: string;
  checksum: string;
  virus_scan_status: 'CLEAN' | 'INFECTED' | 'PENDING';
  tags?: Record<string, string>;
}

export const registerFileMetadata = core.registerFileMetadata as (
  metadata: Omit<FileOwnershipMetadata, 'checksum' | 'created_at'> & { content?: Buffer | string }
) => FileOwnershipMetadata;

export const getFileMetadata = core.getFileMetadata as (bucket: string, fileId: string) => FileOwnershipMetadata | null;

export const verifyFileOwnership = core.verifyFileOwnership as (
  bucket: string,
  fileId: string,
  requestingUserId: string
) => boolean;
