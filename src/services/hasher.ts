import crypto from 'crypto';
import fs from 'fs';

/**
 * Streaming SHA-256 Hasher
 * Demonstrates streaming chunk-by-chunk hashing to keep memory footprint under 30MB
 * even when calculating checksums for multi-gigabyte media or 3D CAD assets.
 */
export class HasherService {
  public static calculateBufferHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  public static async calculateStreamHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    });
  }

  public static verifyChecksum(computed: string, expected: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(expected, 'hex')
    );
  }
}
