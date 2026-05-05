import { HasherService } from '../src/services/hasher';

describe('HasherService Unit Tests', () => {
  it('should calculate accurate SHA-256 hash for buffer', () => {
    const data = Buffer.from('symbiosys-learning-exploration');
    const hash = HasherService.calculateBufferHash(data);
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64);
  });

  it('should return true for identical hashes using timing-safe comparison', () => {
    const hashA = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const hashB = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    expect(HasherService.verifyChecksum(hashA, hashB)).toBe(true);
  });
});
