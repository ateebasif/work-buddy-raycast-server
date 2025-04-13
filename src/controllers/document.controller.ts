import { Request, Response } from "express";

import { FilesLoaderService } from "@/lib/services/FileLoaderService";
import { PGVectorService } from "@/lib/services/PGVectorService";

// Typing as Express request handler to avoid conflicts
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    // console.log("req.body", req.body);
    console.log("req.file", req.file);
    const file = req.file;

    if (file) {
      const filesLoaderService = new FilesLoaderService();
      const docs = await filesLoaderService.loadFiles([file]);

      console.log("docs", docs);
      const pgService = new PGVectorService();
      await pgService.insertVectorDocuments(docs);
    }

    // Simulate document upload
    console.log("Uploading document...");
  } catch (err) {
    console.log("error in Uploading document", err);
  }

  res.status(200).json({ message: "Document uploaded successfully!" });
};
