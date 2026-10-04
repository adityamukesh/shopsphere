import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
  const filter = {};

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
  };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum) || 1;

  const products = await Product.find(filter)
    .sort(sortMap[sort] || { createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json({ products, page: pageNum, totalPages, total });
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// POST /api/products (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(product);
});

// PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ message: 'Product deleted' });
});
