import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import type { CreateCompatibilityProfileRequest, CompatibilityProfileResponse } from '@gokartpartpicker/shared';

const router = Router();

const createCompatibilityProfileSchema = z.object({
  partId: z.string(),
  engineModel: z.string().optional(),
  shaftDiameter: z.string().optional(),
  boltPattern: z.string().optional(),
  chainSize: z.string().optional(),
  frameType: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/compatibility-profiles - List all profiles
router.get('/', async (req, res, next) => {
  try {
    const { partId } = req.query;
    
    const where: any = {};
    if (partId) where.partId = partId as string;

    const profiles = await prisma.compatibilityProfile.findMany({
      where,
      orderBy: {
        id: 'desc',
      },
    });

    const response: CompatibilityProfileResponse[] = profiles.map(profile => ({
      id: profile.id,
      partId: profile.partId,
      engineModel: profile.engineModel,
      shaftDiameter: profile.shaftDiameter,
      boltPattern: profile.boltPattern,
      chainSize: profile.chainSize,
      frameType: profile.frameType,
      notes: profile.notes,
    }));

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/compatibility-profiles/:id - Get single profile
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await prisma.compatibilityProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Compatibility profile not found' });
    }

    const response: CompatibilityProfileResponse = {
      id: profile.id,
      partId: profile.partId,
      engineModel: profile.engineModel,
      shaftDiameter: profile.shaftDiameter,
      boltPattern: profile.boltPattern,
      chainSize: profile.chainSize,
      frameType: profile.frameType,
      notes: profile.notes,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/compatibility-profiles - Create new profile
router.post('/', async (req, res, next) => {
  try {
    const validated = createCompatibilityProfileSchema.parse(req.body);
    
    // Verify part exists
    const part = await prisma.part.findUnique({
      where: { id: validated.partId },
    });

    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }
    
    const profile = await prisma.compatibilityProfile.create({
      data: validated,
    });

    const response: CompatibilityProfileResponse = {
      id: profile.id,
      partId: profile.partId,
      engineModel: profile.engineModel,
      shaftDiameter: profile.shaftDiameter,
      boltPattern: profile.boltPattern,
      chainSize: profile.chainSize,
      frameType: profile.frameType,
      notes: profile.notes,
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

// PUT /api/compatibility-profiles/:id - Update profile
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = createCompatibilityProfileSchema.partial().parse(req.body);
    
    const profile = await prisma.compatibilityProfile.update({
      where: { id },
      data: validated,
    });

    const response: CompatibilityProfileResponse = {
      id: profile.id,
      partId: profile.partId,
      engineModel: profile.engineModel,
      shaftDiameter: profile.shaftDiameter,
      boltPattern: profile.boltPattern,
      chainSize: profile.chainSize,
      frameType: profile.frameType,
      notes: profile.notes,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Compatibility profile not found' });
    }
    next(error);
  }
});

// DELETE /api/compatibility-profiles/:id - Delete profile
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.compatibilityProfile.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Compatibility profile not found' });
    }
    next(error);
  }
});

export { router as compatibilityProfileRoutes };
