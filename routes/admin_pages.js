const express = require('express');
const router = express.Router();
const Page  = require('../models/page');

// get page index
router.get('/', (req,res) => {
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        res.render('admin/pages', { titles: 'Pages', pages: pages })
    })        
});


// get add page 
router.get('/add-page', (req,res) => {
    const title = '';
    const slug = '';
    const content = '';
    res.render('admin/add_page', { titles: 'Add Page', title, slug, content})
});

// post add page 
router.post('/add-page', (req,res) => {

    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('content', 'content must have a value').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    const errors = req.validationErrors();

    if(errors){
        res.render('admin/add_page', {errors, title, slug, content});
    } else {
        Page.findOne({slug: slug}, function (err, page) {
            if (page) {
                req.flash('danger', 'page slug exits, choose another.'); 
                res.render('admin/add_page', {title, slug, content})

            } else {
                const page = new Page({
                    title, slug, content, sorting: 100
                });

                page.save().then(err => {
                    req.flash('success', 'page added Successfully!');
                    res.redirect('/admin/pages');
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

// get edit page 
router.get('/edit-page/:slug', (req,res) => {

    Page.findOne({slug: req.params.slug}).then(page => {
        res.render('admin/edit_page', {titles: 'Edit Page', title: page.title, slug: page.slug, content: page.content, id: page._id});
    }).catch(error=>console.log(error));
});

// post add page 
router.post('/edit-page/:slug', (req,res) => {

    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('content', 'content must have a value').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.body.id;

    const errors = req.validationErrors();

    if(errors){
        res.render('admin/edit_page', {errors, title, slug, content, id});
    } else {
        Page.findOne({slug: slug, _id: {'$ne': id}}, function (err, page) {
            if (page) {
                req.flash('danger', 'page slug exits, choose another.'); 
                res.render('admin/edit_page', {title, slug, content, id})

            } else {
                
                Page.findById(id).then(page => {
                    page.title = title;
                    page.slug = title;
                    page.content = title;

                    page.save().then(err => {
                        req.flash('success', 'page Updated Successfully!');
                        res.redirect('/admin/pages');
                    }).catch(err => console.log(err));

                }).catch(error=>console.log(error));

            }
        });
    }

});


// Export
module.exports = router;
