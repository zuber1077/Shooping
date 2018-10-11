const express = require('express'),
      path = require('path'),
      mongoose = require('mongoose'),
      ejs = require('ejs'),
      bodyParser = require('body-parser'),
      session = require('express-session'),
      expressValidator = require('express-validator'),
      fileUpload = require('express-fileupload');
require('dotenv').config({ path: 'variables.env' });

// connect to db
mongoose.connect(process.env.DATABASE).then(db => {
    console.log('DB connected');
}).catch(error => console.log(`err ${error}`));


// Init app
const app = express();

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set public fod
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/images/', express.static('./public/images'));
app.use(express.static("/public/images"));
// app.use(favicon(__dirname + "/public/assets/images/favicon.ico"));

// set global errors variable
app.locals.errors = null;

// Express fileUpload middleware
app.use(fileUpload());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// express session middleware
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}));

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});


// set routes
const pages = require('./routes/pages.js');
const adminPages = require('./routes/admin_pages.js');
const adminCategories = require("./routes/admin_categories.js");
const adminProducts = require("./routes/admin_products.js");

app.use('/admin/pages', adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
app.use('/', pages);

// start server
app.set('port', process.env.PORT || 8888);
const server = app.listen(app.get('port'), () => {
   console.log(`App running →  PORT ${server.address().port}`);
});