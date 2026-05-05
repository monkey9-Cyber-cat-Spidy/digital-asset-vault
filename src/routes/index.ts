import { Router } from 'express';
import { AssetController } from '../controllers/assetController';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

// Asset upload and lifecycle routes
router.post('/assets/register', AssetController.registerAsset);
router.post('/assets/upload-chunk', AssetController.uploadChunk);
router.get('/assets/:id/status', AssetController.getAssetStatus);
router.get('/assets', AssetController.listAssets);

export default router;
