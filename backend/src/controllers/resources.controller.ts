import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Get all resources for admin
export const getAllResources = async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: {
        creator: {
          select: {
            fullName: true,
          }
        }
      }
    });
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get published resources for public
export const getPublicResources = async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    console.error("Error fetching public resources:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create a new resource
export const createResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, version, language, status, displayOrder } = req.body;
    
    // @ts-ignore
    const adminId = (req as any).admin?.id;
    
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const file = req.file;
    const filetype = path.extname(file.originalname).replace(".", "").toUpperCase() || "UNKNOWN";

    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || null,
        category,
        version: version || null,
        filename: file.originalname,
        filepath: file.path,
        filesize: file.size,
        filetype,
        language: language || "English",
        status: status || "DRAFT",
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        createdBy: adminId || null,
      },
    });


    res.status(201).json({ success: true, data: resource, message: "Resource uploaded successfully" });
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update a resource
export const updateResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { title, description, category, version, language, status, displayOrder } = req.body;

    const existingResource = await prisma.resource.findUnique({ where: { id } });
    if (!existingResource) {
      res.status(404).json({ success: false, message: "Resource not found" });
      return;
    }

    let updateData: any = {
      title,
      description,
      category,
      version,
      language,
      status,
      displayOrder: displayOrder ? parseInt(displayOrder) : existingResource.displayOrder,
    };

    if (status === "PUBLISHED" && existingResource.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    } else if (status === "DRAFT") {
      updateData.publishedAt = null;
    }

    if (req.file) {
      const file = req.file;
      const filetype = path.extname(file.originalname).replace(".", "").toUpperCase() || "UNKNOWN";
      
      updateData.filename = file.originalname;
      updateData.filepath = file.path;
      updateData.filesize = file.size;
      updateData.filetype = filetype;

      // Delete old file
      if (existingResource.filepath && fs.existsSync(existingResource.filepath)) {
        fs.unlinkSync(existingResource.filepath);
      }
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: updateData,
    });

    if (status === "PUBLISHED" && existingResource.status !== "PUBLISHED") {
    }

    res.status(200).json({ success: true, data: updatedResource, message: "Resource updated successfully" });
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete a resource
export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      res.status(404).json({ success: false, message: "Resource not found" });
      return;
    }

    // Delete local file
    if (resource.filepath && fs.existsSync(resource.filepath)) {
      fs.unlinkSync(resource.filepath);
    }

    await prisma.resource.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Download a resource
export const downloadResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const view = req.query.view === "true";

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      res.status(404).json({ success: false, message: "Resource not found" });
      return;
    }

    if (!fs.existsSync(resource.filepath)) {
      res.status(404).json({ success: false, message: "File not found on server" });
      return;
    }

    if (view) {
      // Send file inline for viewing
      res.sendFile(path.resolve(resource.filepath));
    } else {
      // Increment downloads for actual downloads
      await prisma.resource.update({
        where: { id },
        data: { downloads: { increment: 1 } },
      });
      res.download(resource.filepath, resource.filename);
    }
  } catch (error) {
    console.error("Error downloading resource:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

