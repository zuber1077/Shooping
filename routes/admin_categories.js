const express = require('express');
const router = express.Router();
const Category  = require('../models/category');

// get Category index
router.get('/', (req,res) => {
    Category.find({}).then(categories => {
        res.render('admin/categories', { titles: 'Categories', categories , back: categories })
    }).catch(error => console.log(error));
});


// get add category
router.get('/add-category', (req,res) => {
    const title = '';
    res.render('admin/add_category', { titles: 'Add Categories', title, back: 'categories'})
});

// post add category
router.post('/add-category', (req,res) => {

    req.checkBody('title', 'title must have a value').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    const errors = req.validationErrors();

    if(errors){
        res.render('admin/add_category', {errors, title, slug , titles: 'Add Categories', back: 'categories'});
    } else {
        Category.findOne({slug: slug}, function (err, category) {
            if (category) {
                req.flash('danger', 'Categories title exits, choose another.'); 
                res.render('admin/add_category', {title , titles: 'Add Categories',back: 'categories' })

            } else {
                const category = new Category({
                    title , slug
                });

                category.save().then(err => {
                    req.flash('success', 'category added Successfully!');
                    res.redirect('/admin/categories');
                }).catch(err => console.log(err));
            }
        });
    }

});



// get edit category
router.get('/edit-category/:id', (req,res) => {

    Category.findById(req.params.id).then(category => {
        res.render('admin/edit_category', { titles: 'Edit category', title: category.title, slug: category.slug, id: category._id , back: 'categories'});
    }).catch(error=>console.log(error));
});

// post edit category
router.post('/edit-category/:id', (req,res) => {

    req.checkBody('title', 'title must have a value').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    const errors = req.validationErrors();

    if(errors){
        res.render('admin/edit_category', {titles: 'Edit Category',back: 'categories' , errors, title, id});
    } else {
        Category.findOne({slug: slug, _id: {'$ne': id}}, function (err, category) {
            if (category) {
                req.flash('danger', 'category title exits, choose another.'); 
                res.render('admin/edit_category', {titles: 'Edit Category',back: 'categories' , title, id})

            } else {
                
                Category.findById(id).then(category => {
                    category.title = title;
                    category.slug = title;

                    category.save().then(err => {
                        req.flash('success', 'category Updated Successfully!');
                        res.redirect('/admin/categories');
                    }).catch(err => console.log(err));

                }).catch(error=>console.log(error));

            }
        });
    }

});

// get Delete category
router.get('/delete-category/:id', (req,res) => {
    Category.findByIdAndRemove(req.params.id).then(err => {
        req.flash('success', 'Category Deleted Successfully!');
        res.redirect('/admin/categories');
    }).catch(error=>console.log(error));
});


// Export
module.exports = router;
