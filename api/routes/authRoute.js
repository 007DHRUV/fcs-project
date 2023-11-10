import express from "express";
import {
  signin,
  signinadmin,
  signout,
  signup,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/admin", signinadmin)
router.get("/signout", signout);

export default router;
