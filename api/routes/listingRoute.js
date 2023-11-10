import express from 'express';
import {
  admindeleteListing,
  createListing,
  deleteListing,
  getListigs,
  getListing,
  getallListings,
  updateListing,
} from '../controllers/listingController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createListing);
router.delete('/delete/:id', verifyToken, deleteListing);
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListigs);
router.get('/getall', getallListings);
router.delete('/admindelete/:id', admindeleteListing);

export default router;
