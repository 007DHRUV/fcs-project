import express from 'express';
import {
  admindeleteUser,
  deleteUser,
  getUser,
  getUserListing,
  // getallUsers,
  test,
  updateUser,
} from '../controllers/userController.js';
import { verifyToken } from '../utils/verifyUser.js';
import { admindeleteListing } from '../controllers/listingController.js';

const router = express.Router();

router.get('/test', test);
router.post('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.get('/listings/:id', verifyToken, getUserListing);
router.get('/:id', verifyToken, getUser);
// router.get('/all', getallUsers);
router.delete('/admindelete/:id', admindeleteUser);

export default router;
