const express = require('express');
const router = express.Router();

// Export
module.exports = router;

// get page index
router.get('/', (req,res) => {
    res.render('index', {title: 'Home'})
});

// get add page 
router.get('/add-page', (req,res) => {
    const title = '';
    const slug = '';
    const content = '';
    res.render('admin/add_page', {title, slug, content})
});
