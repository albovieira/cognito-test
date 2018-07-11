import express from 'express';
import profileGet from './profile-get';

const router = express.Router();
router.get('/', profileGet);

export default router;
