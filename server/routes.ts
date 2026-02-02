
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import AdmZip from "adm-zip";

const execAsync = promisify(exec);
const upload = multer({ dest: "uploads/" });

// Ensure upload and output directories exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
if (!fs.existsSync("converted")) {
  fs.mkdirSync("converted");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.conversions.list.path, async (req, res) => {
    const items = await storage.getConversions();
    res.json(items);
  });

  app.get(api.conversions.get.path, async (req, res) => {
    const item = await storage.getConversion(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: "Conversion not found" });
    }
    res.json(item);
  });

  app.post(api.conversions.upload.path, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const targetFormat = req.body.targetFormat || "fbx";
      if (!['fbx', 'obj'].includes(targetFormat)) {
        return res.status(400).json({ message: "Invalid target format. Must be 'fbx' or 'obj'" });
      }

      // Rename file to include original extension for assimp or zip handling
      const ext = path.extname(req.file.originalname);
      const newPath = req.file.path + ext;
      fs.renameSync(req.file.path, newPath);

      const conversion = await storage.createConversion({
        fileName: req.file.filename + ext, 
        originalName: req.file.originalname,
        targetFormat: targetFormat,
        fileSize: req.file.size,
      });

      // Start processing in background
      processConversion(conversion.id, newPath, targetFormat);

      res.status(201).json(conversion);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.conversions.download.path, async (req, res) => {
    const item = await storage.getConversion(Number(req.params.id));
    if (!item || !item.downloadUrl) {
      return res.status(404).json({ message: "File not found or not ready" });
    }
    
    const filePath = path.resolve(item.downloadUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing on server" });
    }

    res.download(filePath);
  });

  return httpServer;
}

async function processConversion(id: number, inputPath: string, targetFormat: string) {
  try {
    await storage.updateConversionStatus(id, "processing");

    let sourceFile = inputPath;
    let tempDir = "";

    // Check if zip
    if (path.extname(inputPath).toLowerCase() === ".zip") {
      try {
        const zip = new AdmZip(inputPath);
        const zipEntries = zip.getEntries();
        
        // Find .dae file
        const daeEntry = zipEntries.find(entry => entry.entryName.toLowerCase().endsWith(".dae"));
        
        if (!daeEntry) {
          throw new Error("No .dae file found in the ZIP archive.");
        }

        // Extract to a temp folder
        tempDir = path.join("uploads", `temp_${id}`);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
        }
        zip.extractAllTo(tempDir, true);
        
        sourceFile = path.join(tempDir, daeEntry.entryName);
        console.log(`Found DAE in zip: ${sourceFile}`);

      } catch (err: any) {
         throw new Error(`Failed to process ZIP: ${err.message}`);
      }
    }

    const outputFilename = `converted_${id}.${targetFormat}`;
    const outputPath = path.join("converted", outputFilename);

    // Command to convert using assimp
    // assimp export <input> <output>
    const command = `assimp export "${sourceFile}" "${outputPath}"`;
    
    console.log(`Running conversion: ${command}`);
    await execAsync(command);

    await storage.updateConversionStatus(id, "completed", undefined, outputPath);
    
    // Cleanup temp dir if created
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

  } catch (error: any) {
    console.error(`Conversion failed for ID ${id}:`, error);
    await storage.updateConversionStatus(id, "failed", error.message || "Conversion failed");
  }
}
