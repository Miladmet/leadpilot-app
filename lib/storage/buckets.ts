import core from './core';

export interface StorageBucketConfig {
  name: string;
  visibility: 'Public' | 'Private';
  containsCustomerData: boolean;
  storagePolicies: 'Present' | 'Missing';
  riskLevel: 'Low' | 'Medium' | 'High';
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  description: string;
}

export const STORAGE_BUCKET_REGISTRY = core.STORAGE_BUCKET_REGISTRY as Record<string, StorageBucketConfig>;
export const getBucketConfig = core.getBucketConfig as (bucketName: string) => StorageBucketConfig | null;
export const auditStorageBuckets = core.auditStorageBuckets as () => {
  totalBuckets: number;
  publicBucketsCount: number;
  privateBucketsCount: number;
  protectedBucketsCount: number;
  signedUrlProtection: string;
  ownershipChecks: string;
  unauthorizedAccessTests: string;
  storageSecurityScore: number;
  isSecure: boolean;
  failedChecks: string[];
  buckets: (StorageBucketConfig & { status: 'PROTECTED' | 'VULNERABLE'; calculatedRisk: string })[];
};
