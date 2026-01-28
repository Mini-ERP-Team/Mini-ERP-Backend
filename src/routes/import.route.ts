import { Router } from 'express';
import { confirmImport, createImport, getImportDetail, getImports } from '../controllers/import.controller.js';

const router = Router();

router.post('/imports', createImport);
router.get('/imports/:id', getImportDetail);
router.get('/imports', getImports);
router.patch('/imports/:id/confirm', confirmImport);

export default router;
