var express = require('express');
var router = express.Router();
const { data } = require('../utils/data');
const { categories } = require('../utils/categories-data');
const slugify = require('slugify');
const { IncrementalId } = require('../utils/IncrementalIdHandler');

// GET all categories (có tìm kiếm theo name)
router.get('/', function(req, res) {
    const { name } = req.query;
    
    let result = categories;
    
    if (name) {
        result = categories.filter(cat => 
            cat.name.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    res.json(result);
});

// ĐẶT route /slug/:slug TRƯỚC /:id
router.get('/slug/:slug', function(req, res) {
    const category = categories.find(cat => cat.slug === req.params.slug);
    
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
});

// ĐẶT route /:id/products TRƯỚC /:id
router.get('/:id/products', function(req, res) {
    const categoryId = parseInt(req.params.id);
    
    // Kiểm tra category có tồn tại không
    const category = categories.find(cat => cat.id === categoryId);
    
    if (!category) {
        return res.status(404).json({ 
            message: 'Category not found' 
        });
    }
    
    // Lọc products theo category id và chưa bị xóa
    const products = data.filter(product => 
        (!product.isDeleted) && product.category.id === categoryId
    );
    
    res.json(products);
});

// ĐẶT route /:id CUỐI CÙNG
router.get('/:id', function(req, res) {
    const id = parseInt(req.params.id);
    const category = categories.find(cat => cat.id === id);
    
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
});

// POST - Create new category
router.post('/', function(req, res) {
    const { name, image } = req.body;
    
    if (!name || !image) {
        return res.status(400).json({ 
            message: 'Name and image are required' 
        });
    }
    
    const newCategory = {
        id: IncrementalId(categories),
        name,
        slug: slugify(name, {
            replacement: '-',
            lower: true,
            locale: 'vi'
        }),
        image,
        creationAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    categories.push(newCategory);
    res.status(201).json(newCategory);
});

// PUT - Update category
router.put('/:id', function(req, res) {
    const id = parseInt(req.params.id);
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index === -1) {
        return res.status(404).json({ message: 'Category not found' });
    }
    
    const body = req.body;
    const keys = Object.keys(body);
    
    for (const key of keys) {
        if (categories[index][key] !== undefined) {
            categories[index][key] = body[key];
        }
    }
    
    // Tự động cập nhật slug nếu name thay đổi
    if (body.name) {
        categories[index].slug = slugify(body.name, {
            replacement: '-',
            lower: true,
            locale: 'vi'
        });
    }
    
    categories[index].updatedAt = new Date().toISOString();
    
    res.json(categories[index]);
});

// DELETE category
router.delete('/:id', function(req, res) {
    const id = parseInt(req.params.id);
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index === -1) {
        return res.status(404).json({ message: 'Category not found' });
    }
    
    categories.splice(index, 1);
    res.status(204).send();
});

module.exports = router;