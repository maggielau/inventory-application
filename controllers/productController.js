const req = require('express/lib/request');
const res = require('express/lib/response');
let Product = require('../models/product');
let Category = require('../models/category');

const { body, validationResult } = require('express-validator');
let async = require('async');
const { request } = require('../app');

//Homepage
exports.index = function(req, res) {

    async.parallel({
        product_count: function(callback) {
            Product.countDocuments({}, callback);
        },
        category_count: function(callback) {
            Category.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Inventory Manager', error: err, data: results });
    });
};

//Display list of all products
exports.product_list = function (req, res, next) {
    Product.find({}, 'category title price')
        .sort({category: 1})
        .populate('category')
        .exec(function (err, list_products) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('product_list', { title: 'Product List', product_list: list_products});
        });
};

//Display detail page for a specific product
exports.product_detail = function (req, res, next) {
    Product.findById(req.params.id)
        .populate('category')
        .exec(function (err, product_details) {
            if (err) { return next(err); }
            res.render('product_detail', { title: product_details.title, product_detail: product_details});
        });
};

//Display product create form on GET
exports.product_create_get = function(req, res, next) {
    //retrieve a list of existing categories
    Category.find({}, 'name')
        .sort({name: 1})
        .exec(function (err, list_categories) {
            if (err) { return next(err); }
            res.render('product_form', { title: 'Create New Proudct', categories: list_categories});
        });
};

//Handle product create on POST
exports.product_create_post = [
    //convert categories selected to array
    (req, res, next) => {
        if(!(req.body.category instanceof Array)){
            if (typeof req.body.category === 'undefined')
                req.body.category = [];
            else
                req.body.category = new Array(req.body.category);
        }
        next();
    },

    //clean and validate incoming form data
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('rate', 'Average Rating must not be empty').trim().isLength({ min: 1 }).escape(),
    body('count', 'Rating Count must not be empty').trim().isLength({ min: 1 }).escape(),
    body('category.*').escape(),

    //create new product request
    (req, res, next) => {

        const errors = validationResult(req);

        //create new product object
        let product = new Product(
            {
                title: req.body.title,
                price: req.body.price,
                description: req.body.description,
                rating: {
                    rate: req.body.rate,
                    count: req.body.count
                },
                category: req.body.category
            }
        );

        //if there are errors, then re-render form page
        if (!errors.isEmpty()) {

            //retrieve a list of existing categories
            Category.find({}, 'name')
            .sort({name: 1})
            .exec(function (err, list_categories) {
                if (err) { return next(err); }

                //mark the selected categories as checked
                for (let i=0; i<list_categories.length; i++) {
                    if (product.category.indexOf(list_categories[i]._id)>-1) {
                        list_categories[i].checked='true';
                    }
                }

                res.render('product_form', { title: 'Create New Product', categories: list_categories, product: product, errors: errors.array() });

            });

            return;

        }
        else {
            //form data is valid, save the new product
            product.save(function (err) {
                if (err) { return next(err); }

                res.redirect(product.url);
            });
        }

    }

];

//Display product delete form on GET
exports.product_delete_get = function(req, res) {
    res.send('Product delete GET');
};

//Handle product delete on POST
exports.product_delete_post = function(req, res) {
    res.send('Product delete POST');
};

//Display product update form on GET
exports.product_update_get = function(req, res) {
    res.send('Product update GET');
};

//Handle product update on POST
exports.product_update_post = function(req, res) {
    res.send('Product update POST');
};