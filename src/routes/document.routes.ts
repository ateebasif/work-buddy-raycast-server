import express from "express";
import { uploadDocument } from "@/controllers/document.controller"; // Adjust the path if needed

const router = express.Router();

router.post("/upload", uploadDocument);

export default router;
