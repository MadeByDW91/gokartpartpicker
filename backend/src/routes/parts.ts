import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

const compatibilityProfileSchema = z.object({
  engineModel: z.string().optional(),
  shaftDiameter: z.string().optional(),
  boltPattern: z.string().optional(),
  chainSize: z.string().optional(),
  frameType: z.string().optional(),
  notes: z.string().optional(),
});

const createPartSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  imageUrls: z.array(z.string()).optional().default([]),
  compatibilityProfiles: z.array(compatibilityProfileSchema).optional().default([]),
});

// GET /parts - List all parts with rich filtering and pagination
router.get('/', async (req, res, next) => {
  try {
    const {
      q,
      category,
      brand,
      engine_model,
      chain_size,
      price_min,
      price_max,
      page = '1',
      page_size = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(page_size as string, 10) || 20;
    const skip = (pageNum - 1) * pageSizeNum;

    // Build where clause
    const where: any = {};

    // Free-text search across name, brand, and sku
    if (q) {
      where.OR = [
        { name: { contains: q as string, mode: 'insensitive' } },
        { brand: { contains: q as string, mode: 'insensitive' } },
        { sku: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    // Category: exact match
    if (category) {
      where.category = category as string;
    }

    // Brand: case-insensitive exact or prefix match
    if (brand) {
      where.brand = {
        contains: brand as string,
        mode: 'insensitive',
      };
    }

    // Price range
    if (price_min || price_max) {
      where.price = {};
      if (price_min) {
        where.price.gte = new Prisma.Decimal(price_min as string);
      }
      if (price_max) {
        where.price.lte = new Prisma.Decimal(price_max as string);
      }
    }

    // Engine model or chain size: filter via compatibility profiles
    if (engine_model || chain_size) {
      const compatibilityFilter: any = {};
      
      if (engine_model) {
        compatibilityFilter.engineModel = {
          contains: engine_model as string,
          mode: 'insensitive',
        };
      }

      if (chain_size) {
        compatibilityFilter.chainSize = chain_size as string;
      }

      where.compatibilityProfiles = {
        some: compatibilityFilter,
      };
    }

    // Get total count
    const total = await prisma.part.count({ where });

    // Get paginated parts
    const parts = await prisma.part.findMany({
      where,
      include: {
        compatibilityProfiles: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSizeNum,
    });

    const response = {
      items: parts.map(part => ({
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
        compatibilityProfiles: part.compatibilityProfiles.map(profile => ({
          id: profile.id,
          partId: profile.partId,
          engineModel: profile.engineModel,
          shaftDiameter: profile.shaftDiameter,
          boltPattern: profile.boltPattern,
          chainSize: profile.chainSize,
          frameType: profile.frameType,
          notes: profile.notes,
        })),
      })),
      total,
      page: pageNum,
      page_size: pageSizeNum,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// GET /parts/:id - Get single part with compatibility profiles
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const part = await prisma.part.findUnique({
      where: { id },
      include: {
        compatibilityProfiles: true,
      },
    });

    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }

    const response = {
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
      compatibilityProfiles: part.compatibilityProfiles.map(profile => ({
        id: profile.id,
        partId: profile.partId,
        engineModel: profile.engineModel,
        shaftDiameter: profile.shaftDiameter,
        boltPattern: profile.boltPattern,
        chainSize: profile.chainSize,
        frameType: profile.frameType,
        notes: profile.notes,
      })),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /parts - Create part with nested compatibility profiles (Admin only)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const validated = createPartSchema.parse(req.body);
    
    // Create part with nested compatibility profiles
    const part = await prisma.part.create({
      data: {
        name: validated.name,
        sku: validated.sku,
        brand: validated.brand,
        category: validated.category,
        price: new Prisma.Decimal(validated.price),
        imageUrls: validated.imageUrls || [],
        compatibilityProfiles: {
          create: validated.compatibilityProfiles || [],
        },
      },
      include: {
        compatibilityProfiles: true,
      },
    });

    const response = {
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
      compatibilityProfiles: part.compatibilityProfiles.map(profile => ({
        id: profile.id,
        partId: profile.partId,
        engineModel: profile.engineModel,
        shaftDiameter: profile.shaftDiameter,
        boltPattern: profile.boltPattern,
        chainSize: profile.chainSize,
        frameType: profile.frameType,
        notes: profile.notes,
      })),
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

export { router as partRoutes };
