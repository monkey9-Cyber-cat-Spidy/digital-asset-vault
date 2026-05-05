import { Request, Response } from 'express';
import { ChunkManager } from '../services/chunkManager';
import { BackgroundProcessingQueue } from '../services/queue';
import { DigitalAsset } from '../types';
import crypto from 'crypto';

const chunkManager = new ChunkManager();
const taskQueue = new BackgroundProcessingQueue();

// In-memory mock store for learning demo (can be connected to pg pool)
const assetsStore: Map<string, DigitalAsset> = new Map();

export class AssetController {
  public static async registerAsset(req: Request, res: Response): Promise<void> {
    try {
      const { fileName, mimeType, fileSizeBytes, sha256Checksum, totalChunks, clientId } = req.body;

      if (!fileName || !sha256Checksum || !totalChunks) {
        res.status(400).json({ error: 'Missing required metadata: fileName, sha256Checksum, totalChunks' });
        return;
      }

      const id = crypto.randomUUID();
      const newAsset: DigitalAsset = {
        id,
        clientId: clientId || 'tenant-default',
        fileName,
        mimeType: mimeType || 'application/octet-stream',
        fileSizeBytes: Number(fileSizeBytes) || 0,
        sha256Checksum,
        totalChunks: Number(totalChunks),
        uploadedChunks: 0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      assetsStore.set(id, newAsset);

      res.status(201).json({
        success: true,
        message: 'Asset upload session initialized',
        asset: newAsset
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async uploadChunk(req: Request, res: Response): Promise<void> {
    try {
      const { assetId, chunkIndex, chunkSha256 } = req.body;
      const asset = assetsStore.get(assetId);

      if (!asset) {
        res.status(404).json({ error: 'Asset session not found' });
        return;
      }

      // Convert body payload or raw buffer
      const rawData = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
      await chunkManager.saveChunk(assetId, Number(chunkIndex), rawData, chunkSha256);

      asset.uploadedChunks += 1;
      asset.status = 'UPLOADING';

      // Check if all chunks have arrived
      if (asset.uploadedChunks >= asset.totalChunks) {
        asset.status = 'PROCESSING';
        const assembly = await chunkManager.assembleChunks(
          assetId,
          asset.totalChunks,
          asset.sha256Checksum,
          asset.fileName
        );

        if (!assembly.matchesDeclaredHash) {
          asset.status = 'FAILED';
          res.status(422).json({
            success: false,
            error: 'Final assembly checksum failed. File integrity compromised.'
          });
          return;
        }

        asset.status = 'READY';
        asset.storagePath = assembly.assembledPath;

        // Enqueue background processing (virus scan, thumbnailing, EXIF extraction)
        await taskQueue.enqueue({
          jobId: crypto.randomUUID(),
          assetId,
          taskType: 'METADATA_EXTRACT',
          payload: { storagePath: asset.storagePath }
        });
      }

      assetsStore.set(assetId, asset);

      res.status(200).json({
        success: true,
        message: `Chunk ${chunkIndex} uploaded and verified successfully`,
        uploadedChunks: asset.uploadedChunks,
        totalChunks: asset.totalChunks,
        status: asset.status
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async getAssetStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const asset = assetsStore.get(id);

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    res.status(200).json({ success: true, asset });
  }

  public static async listAssets(_req: Request, res: Response): Promise<void> {
    const list = Array.from(assetsStore.values());
    res.status(200).json({ success: true, count: list.length, assets: list });
  }
}
