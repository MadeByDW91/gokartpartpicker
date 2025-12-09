import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

const createBuildSchema = z.object({
  userName: z.string().min(1),
});

const addBuildItemSchema = z.object({
  partId: z.string().min(1),
  slotCategory: z.string().min(1),
  quantity: z.number().int().positive().optional().default(1),
});

// POST /builds - Create new build
router.post('/', async (req, res, next) => {
  try {
    const validated = createBuildSchema.parse(req.body);
    
    const build = await prisma.build.create({
      data: validated,
    });

    res.status(201).json({
      id: build.id,
      userName: build.userName,
      createdAt: build.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

// POST /builds/:buildId/add - Add part to build
router.post('/:buildId/add', async (req, res, next) => {
  try {
    const { buildId } = req.params;
    const validated = addBuildItemSchema.parse(req.body);
    
    // Verify build exists
    const build = await prisma.build.findUnique({
      where: { id: buildId },
    });

    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }

    // Verify part exists
    const part = await prisma.part.findUnique({
      where: { id: validated.partId },
    });

    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }
    
    const buildItem = await prisma.buildItem.create({
      data: {
        buildId,
        partId: validated.partId,
        slotCategory: validated.slotCategory,
        quantity: validated.quantity || 1,
      },
      include: {
        part: {
          include: {
            compatibilityProfiles: true,
          },
        },
      },
    });

    res.status(201).json({
      id: buildItem.id,
      buildId: buildItem.buildId,
      partId: buildItem.partId,
      slotCategory: buildItem.slotCategory,
      quantity: buildItem.quantity,
      part: {
        id: buildItem.part.id,
        name: buildItem.part.name,
        sku: buildItem.part.sku,
        brand: buildItem.part.brand,
        category: buildItem.part.category,
        description: buildItem.part.description,
        price: Number(buildItem.part.price),
        imageUrls: buildItem.part.imageUrls,
        compatibilityProfiles: buildItem.part.compatibilityProfiles.map(profile => ({
          id: profile.id,
          partId: profile.partId,
          engineModel: profile.engineModel,
          shaftDiameter: profile.shaftDiameter,
          boltPattern: profile.boltPattern,
          chainSize: profile.chainSize,
          frameType: profile.frameType,
          notes: profile.notes,
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

// GET /builds/:buildId - Get build with items
router.get('/:buildId', async (req, res, next) => {
  try {
    const { buildId } = req.params;
    const build = await prisma.build.findUnique({
      where: { id: buildId },
      include: {
        items: {
          include: {
            part: {
              include: {
                compatibilityProfiles: true,
              },
            },
          },
        },
      },
    });

    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }

    const response = {
      buildId: build.id,
      items: build.items.map(item => ({
        id: item.id,
        part: {
          id: item.part.id,
          name: item.part.name,
          sku: item.part.sku,
          brand: item.part.brand,
          category: item.part.category,
          description: item.part.description,
          price: Number(item.part.price),
          imageUrls: item.part.imageUrls,
          compatibilityProfiles: item.part.compatibilityProfiles.map(profile => ({
            id: profile.id,
            partId: profile.partId,
            engineModel: profile.engineModel,
            shaftDiameter: profile.shaftDiameter,
            boltPattern: profile.boltPattern,
            chainSize: profile.chainSize,
            frameType: profile.frameType,
            notes: profile.notes,
          })),
        },
        slotCategory: item.slotCategory,
        quantity: item.quantity,
      })),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export { router as buildRoutes };
