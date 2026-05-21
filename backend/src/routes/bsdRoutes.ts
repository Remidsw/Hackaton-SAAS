import { Router } from 'express';
import { createBSD, getSites, createSite, getBSDsBySite, deleteBSD, getAllBSDs } from '../controllers/bsdController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/sites', getSites);
router.post('/sites', createSite);
router.post('/create', createBSD);
router.get('/all', getAllBSDs);
router.get('/history/:siteId', getBSDsBySite);
router.delete('/:id', deleteBSD);

export default router;
