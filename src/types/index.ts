export type AssetStatus = 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';

export interface DigitalAsset {
  id: string;
  clientId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  totalChunks: number;
  uploadedChunks: number;
  status: AssetStatus;
  storagePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChunkUploadMetadata {
  assetId: string;
  chunkIndex: number;
  totalChunks: number;
  chunkSizeBytes: number;
  chunkSha256: string;
}

export interface ProcessingJob {
  jobId: string;
  assetId: string;
  taskType: 'METADATA_EXTRACT' | 'THUMBNAIL_GEN' | 'INTEGRITY_AUDIT';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  payload: Record<string, unknown>;
  createdAt: Date;
}
