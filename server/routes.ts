
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

// Ensure directories exist
["uploads", "converted", "temp"].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

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
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.post(api.conversions.upload.path, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file" });
      const targetFormat = req.body.targetFormat || "fbx";
      
      const ext = path.extname(req.file.originalname);
      const newPath = req.file.path + ext;
      fs.renameSync(req.file.path, newPath);

      const conversion = await storage.createConversion({
        fileName: req.file.filename + ext, 
        originalName: req.file.originalname,
        targetFormat: targetFormat,
        fileSize: req.file.size,
      });

      console.log(`[LOG] Conversion started: ZipName=${req.file.originalname}, Target=${targetFormat}`);

      processConversion(conversion.id, newPath, targetFormat);
      res.status(201).json(conversion);
    } catch (err) {
      res.status(500).json({ message: "Upload error" });
    }
  });

  app.get(api.conversions.download.path, async (req, res) => {
    const item = await storage.getConversion(Number(req.params.id));
    if (!item?.downloadUrl) return res.status(404).json({ message: "Not ready" });
    
    const filePath = path.resolve(item.downloadUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File missing" });

    res.download(filePath, item.originalName.replace(/\.[^/.]+$/, "") + ".zip", (err) => {
      if (!err) {
        // Delete the file after download
        try {
          fs.unlinkSync(filePath);
          console.log(`[LOG] File deleted after download: ${filePath}`);
        } catch (unlinkErr) {
          console.error("Error deleting file:", unlinkErr);
        }
      }
    });
  });

  return httpServer;
}

async function processConversion(id: number, inputPath: string, targetFormat: string) {
  const rootWorkDir = path.resolve(process.cwd());
  const workDir = path.join(rootWorkDir, "temp", `job_${id}`);
  try {
    await storage.updateConversionStatus(id, "processing");
    if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

    let daeFileRelative = "";

    if (path.extname(inputPath).toLowerCase() === ".zip") {
      const zip = new AdmZip(inputPath);
      zip.extractAllTo(workDir, true);
      
      const findDae = (dir: string): string => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            const found = findDae(fullPath);
            if (found) return found;
          } else if (file.toLowerCase().endsWith(".dae")) {
            return path.relative(workDir, fullPath);
          }
        }
        return "";
      };
      daeFileRelative = findDae(workDir);
    } else {
      const dest = path.join(workDir, path.basename(inputPath));
      fs.copyFileSync(inputPath, dest);
      daeFileRelative = path.basename(inputPath);
    }

    if (!daeFileRelative) throw new Error("No .dae file found");

    const modelOutputFilename = `model_${id}.${targetFormat}`;
    const modelOutputPath = path.join(workDir, modelOutputFilename);

    await execAsync(`assimp export "${daeFileRelative}" "${modelOutputFilename}"`, { cwd: workDir });

    const finalZip = new AdmZip();
    finalZip.addLocalFolder(workDir);
    
    const finalZipFilename = `converted_${id}.zip`;
    const finalZipPath = path.join(rootWorkDir, "converted", finalZipFilename);
    finalZip.writeZip(finalZipPath);

    await storage.updateConversionStatus(id, "completed", undefined, path.join("converted", finalZipFilename));
    
    // Cleanup input file
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

  } catch (error: any) {
    console.error("Conversion failed:", error);
    await storage.updateConversionStatus(id, "failed", error.message);
  } finally {
    if (fs.existsSync(workDir)) fs.rmSync(workDir, { recursive: true, force: true });
  }
}
