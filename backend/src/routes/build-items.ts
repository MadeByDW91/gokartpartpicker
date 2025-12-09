import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import type { CreateBuildItemRequest, BuildItemResponse, PartResponse } from '@gokartpartpicker/shared';

const router = Router();

const slotCategoryEnum = z.enum([
  'engine',
  'clutch',
  'sprocket',
  'chain',
  'tire',
  'wheel',
  'brake',
  'frame',
  'seat',
  'steering',
  'other'
] as const);

const createBuildItemSchema = z.object({
  buildId: z.string(),
  partId: z.string(),
  slotCategory: slotCategoryEnum,
  quantity: z.number().int().positive().optional().default(1),
});

// Helper to map part to PartResponse
const mapPartToResponse = (part: any): PartResponse => ({
  id: part.id,
  name: part.name,
  sku: part.sku,
  brand: part.brand,
  category: part.category,
  description: part.description,
  price: Number(part.price),
  imageUrls: part.imageUrls,
  createdAt: part.createdAt,
  updatedAt: part.updatedAt,
  compatibilityProfiles: part.compatibilityProfiles.map((profile: any) => ({
    id: profile.id,
    partId: profile.partId,
    engineModel: profile.engineModel,
    shaftDiameter: profile.shaftDiameter,
    boltPattern: profile.boltPattern,
    chainSize: profile.chainSize,
    frameType: profile.frameType,
    notes: profile.notes,
  })),
});

// GET /api/build-items - List all build items
router.get('/', async (req, res, next) => {
  try {
    const { buildId, partId, slotCategory } = req.query;
    
    const where: any = {};
    if (buildId) where.buildId = buildId as string;
    if (partId) where.partId = partId as string;
    if (slotCategory) where.slotCategory = slotCategory as string;

    const items = await prisma.buildItem.findMany({
      where,
      include: {
        part: {
          include: {
            compatibilityProfiles: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    const response: BuildItemResponse[] = items.map(item => ({
      id: item.id,
      buildId: item.buildId,
      partId: item.partId,
      slotCategory: item.slotCategory,
      quantity: item.quantity,
      part: mapPartToResponse(item.part),
    }));

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/build-items/:id - Get single build item
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.buildItem.findUnique({
      where: { id },
      include: {
        part: {
          include: {
            compatibilityProfiles: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Build item not found' });
    }

    const response: BuildItemResponse = {
      id: item.id,
      buildId: item.buildId,
      partId: item.partId,
      slotCategory: item.slotCategory,
      quantity: item.quantity,
      part: mapPartToResponse(item.part),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/build-items - Create new build item
router.post('/', async (req, res, next) => {
  try {
    const validated = createBuildItemSchema.parse(req.body);
    
    // Verify build and part exist
    const [build, part] = await Promise.all([
      prisma.build.findUnique({ where: { id: validated.buildId } }),
      prisma.part.findUnique({ where: { id: validated.partId } }),
    ]);

    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }
    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }
    
    const item = await prisma.buildItem.create({
      data: validated,
      include: {
        part: {
          include: {
            compatibilityProfiles: true,
          },
        },
      },
    });

    const response: BuildItemResponse = {
      id: item.id,
      buildId: item.buildId,
      partId: item.partId,
      slotCategory: item.slotCategory,
      quantity: item.quantity,
      part: mapPartToResponse(item.part),
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

// PUT /api/build-items/:id - Update build item
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = createBuildItemSchema.partial().parse(req.body);
    
    const item = await prisma.buildItem.update({
      where: { id },
      data: validated,
      include: {
        part: {
          include: {
            compatibilityProfiles: true,
          },
        },
      },
    });

    const response: BuildItemResponse = {
      id: item.id,
      buildId: item.buildId,
      partId: item.partId,
      slotCategory: item.slotCategory,
      quantity: item.quantity,
      part: mapPartToResponse(item.part),
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Build item not found' });
    }
    next(error);
  }
});

// DELETE /api/build-items/:id - Delete build item
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.buildItem.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Build item not found' });
    }
    next(error);
  }
});

export { router as buildItemRoutes };
