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

export interface FileScanMetadata {
  fileId: string;
  userId: string;
  organizationId: string;
  uploadTime: string;
  scanResult: 'Pending Scan' | 'Safe' | 'Suspicious' | 'Quarantined';
  scanTime: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  bucket: string;
  quarantineReason?: string | null;
  threatType?: string | null;
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

export const recordFileScan = core.recordFileScan as (params: any) => FileScanMetadata;
export const recordBlockedDownload = core.recordBlockedDownload as (params: any) => void;
export const getFileScanMetadata = core.getFileScanMetadata as (fileId: string) => FileScanMetadata | null;
export const getStorageSecurityDashboardData = core.getStorageSecurityDashboardData as () => {
  metrics: {
    filesScanned: number;
    malwareDetected: number;
    quarantinedFiles: number;
    failedUploads: number;
  };
  alerts: any[];
  auditLogs: any[];
};
