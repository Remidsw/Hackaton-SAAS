import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createBSD = async (req: Request, res: Response) => {
  const { 
    siteId, 
    // ... rest of body
  } = req.body;
  const userId = (req as any).userId;

  try {
    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: { id: parseInt(siteId), userId }
    });

    if (!site) return res.status(403).json({ message: 'Unauthorized site access' });

    const entry = await prisma.wasteEntry.create({
      data: {
        ...req.body,
        siteId: parseInt(siteId),
      },
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error creating BSD', error });
  }
};

export const getSites = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  try {
    const sites = await prisma.site.findMany({
      where: { userId }
    });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sites', error });
  }
};

export const createSite = async (req: Request, res: Response) => {
    const { name, address, companyName, companySiret } = req.body;
    const userId = (req as any).userId;
    try {
        const site = await prisma.site.create({
            data: { name, address, companyName, companySiret, userId }
        });
        res.status(201).json(site);
    } catch (error) {
        res.status(500).json({ message: 'Error creating site', error });
    }
}

export const getBSDsBySite = async (req: Request, res: Response) => {
  const { siteId } = req.params;
  const userId = (req as any).userId;
  try {
    const id = typeof siteId === 'string' ? siteId : Array.isArray(siteId) ? siteId[0] : null;
    if (!id) return res.status(400).json({ message: 'Invalid Site ID' });

    const entries = await prisma.wasteEntry.findMany({
      where: { 
        siteId: parseInt(id),
        site: { userId }
      },
      orderBy: { createdAt: 'desc' },
      include: { site: true }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching BSDs', error });
  }
};

export const getAllBSDs = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  try {
    const entries = await prisma.wasteEntry.findMany({
      where: {
        site: { userId }
      },
      orderBy: { createdAt: 'desc' },
      include: { site: true }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all BSDs', error });
  }
};

export const deleteBSD = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;
  try {
    const entryId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;
    if (!entryId) return res.status(400).json({ message: 'Invalid ID' });

    // Verify ownership before deletion
    const entry = await prisma.wasteEntry.findFirst({
      where: { id: parseInt(entryId), site: { userId } }
    });

    if (!entry) return res.status(403).json({ message: 'Unauthorized' });

    await prisma.wasteEntry.delete({
      where: { id: parseInt(entryId) },
    });
    res.json({ message: 'BSD deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting BSD', error });
  }
};
