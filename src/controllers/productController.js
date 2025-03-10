const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const db = require('../config/database');

// Imagen de placeholder predeterminada local
const DEFAULT_PLACEHOLDER = '/images/placeholder.jpg';

// URL base para las imágenes (ajustada según el entorno)
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.API_URL || 'https://ecommerce-serv.onrender.com';
  }
  return 'http://localhost:3000';
};

// Función para normalizar la URL de la imagen
const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) {
    console.log('No se proporcionó imagen, usando placeholder');
    return DEFAULT_PLACEHOLDER;
  }
  
  // Si ya es una URL absoluta (comienza con http/https), devolverla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log(`URL absoluta detectada: ${imageUrl}`);
    return imageUrl;
  }
  
  // Si es una ruta relativa que comienza con '/uploads/' o '/api/uploads/', asegurarnos que sea accesible
  if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('/api/uploads/')) {
    const fileName = imageUrl.split('/').pop();
    console.log(`URL relativa detectada: ${imageUrl}, nombre de archivo: ${fileName}`);
    return `${getBaseUrl()}/uploads/${fileName}`;
  }
  
  // Para cualquier otra ruta relativa, construir la URL completa
  console.log(`Otra ruta detectada: ${imageUrl}`);
  return `${getBaseUrl()}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

// Función auxiliar para garantizar que todos los productos tengan una imagen válida
const ensureValidImageUrl = (products) => {
  if (Array.isArray(products)) {
    return products.map(product => ({
      ...product,
      image_url: normalizeImageUrl(product.image_url)
    }));
  } else if (products && typeof products === 'object') {
    return {
      ...products,
      image_url: normalizeImageUrl(products.image_url)
    };
  }
  return products;
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const products = await Product.findAll(limit, offset);
    res.json({ products: ensureValidImageUrl(products) });
  } catch (error) {
    next(error);
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { categorySlug } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const category = await Category.findBySlug(categorySlug);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    const products = await Product.findByCategory(categorySlug, limit, offset);
    res.json({ 
      category,
      products: ensureValidImageUrl(products)
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductsByBrand = async (req, res, next) => {
  try {
    const { brand } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const products = await Product.findByBrand(brand, limit, offset);
    res.json({ 
      brand,
      products: ensureValidImageUrl(products)
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductsByGameType = async (req, res, next) => {
  try {
    const { gameType } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const products = await Product.findByGameType(gameType, limit, offset);
    res.json({ 
      gameType,
      products: ensureValidImageUrl(products)
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Caso especial para "latest"
    if (productId === 'latest') {
      const result = await Product.findLatest();
      if (!result) {
        return res.status(404).json({ message: 'No se encontraron productos' });
      }
      return res.json({ product: ensureValidImageUrl(result) });
    }
    
    // Verificar que el ID sea un número
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json({ product: ensureValidImageUrl(product) });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { 
      name, 
      price, 
      quantity, 
      short_description, 
      full_description, 
      image_url, 
      category_id,
      brand,
      game_type
    } = req.body;

    if (!name || !price || quantity === undefined || !short_description || !full_description || !category_id) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(400).json({ message: 'La categoría seleccionada no existe' });
    }

    const categoryName = category.name.toLowerCase();
    if (categoryName === 'accesorios' && !brand) {
      return res.status(400).json({ message: 'Para accesorios, la marca es requerida' });
    }
    
    if ((categoryName === 'juegos de cartas' || categoryName === 'singles') && !game_type) {
      return res.status(400).json({ message: 'Para juegos de cartas o singles, el tipo de juego es requerido' });
    }

    console.log(`Creando producto con imagen: ${image_url}`);
    
    const newProduct = await Product.create({
      name,
      price,
      quantity,
      short_description,
      full_description,
      image_url,
      category_id,
      brand: categoryName === 'accesorios' ? brand : null,
      game_type: (categoryName === 'juegos de cartas' || categoryName === 'singles') ? game_type : null
    });

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: ensureValidImageUrl(newProduct)
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { 
      name, 
      price, 
      quantity, 
      short_description, 
      full_description, 
      image_url, 
      category_id,
      brand,
      game_type 
    } = req.body;
    
    const productId = req.params.id;

    // Verificar que el ID sea un número
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    let categoryName;
    if (category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return res.status(400).json({ message: 'La categoría seleccionada no existe' });
      }
      categoryName = category.name.toLowerCase();
    } else if (product.category_name) {
      categoryName = product.category_name.toLowerCase();
    }

    if (categoryName === 'accesorios' && brand === '') {
      return res.status(400).json({ message: 'Para accesorios, la marca es requerida' });
    }
    
    if ((categoryName === 'juegos de cartas' || categoryName === 'singles') && game_type === '') {
      return res.status(400).json({ message: 'Para juegos de cartas o singles, el tipo de juego es requerido' });
    }

    const updatedProduct = await Product.update(productId, {
      name,
      price,
      quantity,
      short_description,
      full_description,
      image_url,
      category_id,
      brand,
      game_type
    });

    res.json({
      message: 'Producto actualizado exitosamente',
      product: ensureValidImageUrl(updatedProduct)
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Verificar que el ID sea un número
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await Product.delete(productId);
    
    res.json({
      message: 'Producto eliminado exitosamente',
      id: productId
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

exports.getAllBrands = async (req, res, next) => {
  try {
    const brands = await Product.findAllBrands();
    res.json({ brands });
  } catch (error) {
    next(error);
  }
};

exports.getAllGameTypes = async (req, res, next) => {
  try {
    const gameTypes = await Product.findAllGameTypes();
    res.json({ gameTypes });
  } catch (error) {
    next(error);
  }
};
