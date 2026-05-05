import fs from 'fs';
import path from 'path';
import { HasherService } from './hasher';

export interface ChunkVerificationResult {
  isComplete: boolean;
  assembledPath?: string;
  verifiedChecksum?: string;
  matchesDeclaredHash: boolean;
}

export class ChunkManager {
  private baseDir: string;

  constructor(storageBaseDir: string = './storage/chunks') {
    this.baseDir = storageBaseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public getChunkPath(assetId: string, index: number): string {
    const assetChunkDir = path.join(this.baseDir, assetId);
    if (!fs.existsSync(assetChunkDir)) {
      fs.mkdirSync(assetChunkDir, { recursive: true });
    }
    return path.join(assetChunkDir, `chunk_${index}.part`);
  }

  public async saveChunk(
    assetId: string,
    index: number,
    data: Buffer,
    expectedChunkHash: string
  ): Promise<boolean> {
    const computedHash = HasherService.calculateBufferHash(data);
    if (!HasherService.verifyChecksum(computedHash, expectedChunkHash)) {
      throw new Error(`Checksum mismatch on chunk ${index}. Corrupted data received.`);
    }

    const chunkPath = this.getChunkPath(assetId, index);
    await fs.promises.writeFile(chunkPath, data);
    return true;
  }

  public async assembleChunks(
    assetId: string,
    totalChunks: number,
    declaredFinalHash: string,
    outputFileName: string
  ): Promise<ChunkVerificationResult> {
    const finalDir = path.join(this.baseDir, '..', 'completed');
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    const finalPath = path.join(finalDir, `${assetId}_${outputFileName}`);
    const writeStream = fs.createWriteStream(finalPath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = this.getChunkPath(assetId, i);
      if (!fs.existsSync(chunkPath)) {
        return { isComplete: false, matchesDeclaredHash: false };
      }
      const chunkData = await fs.promises.readFile(chunkPath);
      writeStream.write(chunkData);
    }

    await new Promise((resolve) => writeStream.end(resolve));

    const assembledHash = await HasherService.calculateStreamHash(finalPath);
    const matches = HasherService.verifyChecksum(assembledHash, declaredFinalHash);

    return {
      isComplete: true,
      assembledPath: finalPath,
      verifiedChecksum: assembledHash,
      matchesDeclaredHash: matches
    };
  }
}
