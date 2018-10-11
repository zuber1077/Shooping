const express = require('express'),
      router = express.Router(),
      mkdirp = require('mkdirp'),
      fs = require('fs-extra'),
      resizeImg = require('resize-img'),
      Product  = require('../models/product'),
      Category  = require('../models/category');

// get product index
router.get('/', (req,res) => {
    var count;
    
    Product.count((err, c) => {
        count = c;
    });

    Product.find(function(err, products) {
      res.render("admin/products", { titles: 'Products' , back: 'products' ,  products , count });
    });
});


// get add Product 
router.get('/add-product', (req,res) => {
    const title = '';
    const desc = '';
    const slug = '';
    const categories = '';
    const price = '';
    Category.find().then(categories => {
        res.render('admin/add_product', { titles: 'Add Product', title, desc , categories ,price , back: 'products'});
    });
});

// post add products 
router.post('/add-product', (req,res) => {

    const imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'Must Upload an Image').isImage(imageFile);
    var title = req.body.title;
    slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    const errors = req.validationErrors();

    if(errors){
        Category.find().then(categories => {
            res.render('admin/add_product', {errors , titles: 'Add Product', title, desc, categories, price, back: 'products' });
        });
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'product title exits, choose another.'); 
                Category.find().then(categories => {
                    res.render('admin/add_product', { titles: 'Add Product', title, desc, categories, price, back: 'products' });
                });

            } else {
                const price2 = parseFloat(price).toFixed(2);

                const product = new Product({
                    title, slug, desc, price: price2 , category  , image: imageFile 
                });

                product.save().then(err => {

                    mkdirp(`public/product_images/${product._id}`, (err) => {
                        return console.log(err);
                    });
                    mkdirp(`public/product_images/${product._id}/gallery`, (err) => {
                        return console.log(err);
                    });
                    mkdirp(`public/product_images/${product._id}/gallery/thumbs`, (err) => {
                        return console.log(err);
                    });
                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = `public/product_images/${product._id}/${imageFile}`;
                        productImage.mv(path, (err) => {
                            return console.log(err);
                        });
                    }
                    req.flash('success', 'Product added Successfully!');
                    res.redirect('/admin/products');
                }).catch(err => console.log(err));
            }
        });
    }

});


// post reorder pages
router.post('/reorder-pages', (req,res) => {
    var ids = req.body['id[]'];

    var count = 0;
    for (var i = 0; i < ids.length; i++){
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id).then(page => {
                page.sorting = count;
                page.save();
            }).catch(error =>console.log(error));
        }) (count);

    }
});

// get edit product 
router.get('/edit-product/:id', (req,res) => {

    var errors;

    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;

     Category.find().then(categories => {

        Product.findById(req.params.id, (err, p) => {
            if(err){
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/'+p._id+'/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, (err, files) => {
                    if (err) {
                        console.log(err);
                    } else {
                    galleryImages = files;
                    res.render('admin/edit_product', 
                    { titles: 'Edit Product', title: p.title, errors, desc: p.desc , categories: categories  , 
                    category: p.category , 
                    price: parseFloat(p.price).toFixed(2), 
                    image: p.image, galleryImages, id: p._id, back: 'products'});
                    }
                });
            }
        });
    }).catch(err=>console.log(err));
});


// get edit page 
router.get('/edit-page/:id', (req,res) => {

    Page.findById(req.params.id).then(page => {
        res.render('admin/edit_page', {titles: 'Edit Page', title: page.title, slug: page.slug, content: page.content, id: page._id , back: 'pages'});
    }).catch(error=>console.log(error));
});

// post edit product 
router.post('/edit-product/:id', (req,res) => {
    const imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'Must Upload an Image').isImage(imageFile);
    var title = req.body.title;
    slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    const errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect(`/admin/products/edit-product/${id}`);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, (err, p) => {
            if (err) console.log(err);
            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect(`/admin/products/edit-product/${id}`);
            } else {
                Product.findById(id, function (err, p) {
                    if(err) console.log(err);
                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }
                    p.save(function (err) {
                        if (err) console.log(err);
                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove(`public/product_images/${id}/${pimage}`, function (err) {
                                    if (err) console.log(err);
                                })
                            }
                            var productImage = req.files.image;
                            var path = `public/product_images/${id}/${imageFile}`;
                            productImage.mv(path, (err) => {
                                return console.log(err);
                            });
                        }
                        req.flash('success', 'Product Edited Successfully!');
                        res.redirect(`/admin/products/edit-product/${id}`);
                    })
                })
            }
        })
    }

});

// post edit page 
router.post('/edit-page/:id', (req,res) => {

    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('content', 'content must have a value').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;

    const errors = req.validationErrors();

    if(errors){
        res.render('admin/edit_page', {errors, title, slug, content, id});
    } else {
        Page.findOne({slug: slug, _id: {'$ne': id}}, function (err, page) {
            if (page) {
                req.flash('danger', 'page slug exits, choose another.'); 
                res.render('admin/edit_page', { title, slug, content, id, titles: 'Edit Page', back: 'pages'})

            } else {
                
                Page.findById(id).then(page => {
                    page.title = title;
                    page.slug = title;
                    page.content = title;

                    page.save().then(err => {
                        req.flash('success', 'page Updated Successfully!');
                        res.redirect(`/admin/pages/edit-page/${id}`);
                    }).catch(err => console.log(err));

                }).catch(error=>console.log(error));

            }
        });
    }

});

// get Delete pages
router.get('/delete-page/:id', (req,res) => {
    Page.findByIdAndRemove(req.params.id).then(err => {
        req.flash('success', 'page Deleted Successfully!');
        res.redirect('/admin/pages');
    }).catch(error=>console.log(error));
});


// Export
module.exports = router;
