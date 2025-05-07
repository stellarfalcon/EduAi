import express from 'express';
import eventsController from '../controllers/events.controller.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateUser, eventsController.create);
router.get('/', authenticateUser, eventsController.getAll);
router.get('/upcoming', authenticateUser, eventsController.getUpcoming);

export default router;