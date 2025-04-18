import express from 'express';
import { protectFaculty } from '../middleware/authMiddleware.js';
import { 
  getFacultyActivities, 
  updateFacultyActivities,
  getPublicFacultyActivities 
} from '../controllers/facultyActivitiesController.js';

const router = express.Router();

router.route('/activities')
  .get(protectFaculty, getFacultyActivities);

router.route('/update-activities')
  .put(protectFaculty, updateFacultyActivities);

  router.get('/public', getPublicFacultyActivities);
export default router;