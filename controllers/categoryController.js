const res = require('express/lib/response');
let Category = require('../models/category');
let Product = require('../models/product');

let async = require('async');
const { body, validationResult } = require('express-validator');

//Display list of all categories
exports.category_list = function(req, res, next) {
    Category.find({}, 'name')
        .sort({name: 1})
        .exec(function (err, list_categories) {
            if (err) { return next(err); }
            res.render('categories_list', {title: 'Categories List', category_list: list_categories})
        })
};

//Display detail page for specific category
exports.category_detail = function(req, res) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
                .exec(callback);
        },
        category_products: function(callback) {
            Product.find({'category': req.params.id})
                .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) {
            let err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        else if (results.category_products==null) {
            let err = new Error('Not products in this category');
            err.status = 404;
            return next(err);
        }
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_products: results.category_products});
    })
};

//display category create form on get
exports.category_create_get = function(req, res) {
    res.render('category_form', {title: 'Create New Category'})
};

//Handle category create on post
exports.category_create_post = [

    //validate and sanitize user entered category name field
    body('name', 'Category name required').trim().isLength({ min:1 }).escape(),

    //Process the create category request after validation/sanitation
    (req, res, next) => {

        //pull errors from request
        const errors = validationResult(req);

        //create new category object
        let category = new Category(
            { name: req.body.name }
        );

        if (!errors.isEmpty()) {
            //re-render the form with sanitized values and error msg
            res.render('category_form', {title: 'Create New Category', category: category, errors: errors.array()});
            return;
        }
        else {
            //form submission is valid
            //check if category name already exists
            Category.findOne({'name': req.body.name})
                .exec( function(err, found_category) {
                    if (err) { return next(err); }

                    if (found_category) {
                        //category already exists, redirect to detail page
                        res.redirect(found_category.url);
                    }
                    else {
                        category.save(function(err) {
                            if (err) { return next(err); }
                            //saved new category, redirect to detail page
                            res.redirect(category.url);
                        });
                    }
                });
        }

    }

];

//display category delete form on get
exports.category_delete_get = function(req, res) {
    
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        category_products: function(callback) {
            Product.find({'category': req.params.id}).exec(callback)
        }
    }, function(err, results) {
        if (err) {return next(err);}
        if (results.category==null) {
            res.redirect('/catalog/categories');
        }
        res.render('category_delete', { title: 'Delete Category', category: results.category, category_products: results.category_products });
    });

};

//handle category delete on post
exports.category_delete_post = function(req, res) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.body.categoryid).exec(callback)
        },
        category_products: function(callback) {
            Product.find({'category': req.body.categoryid}).exec(callback)
        }
    }, function(err, results) {
        if (err) {return next(err);}
        if (results.category_products.length>0) {
            //Category still contains products, re-render form with msg
            res.render('category_delete', { title: 'Delete Category' , category: results.category, category_products: results.category_products});
            return;
        }
        else {
            //the category has no books, delete the object
            Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
                if (err) { return next(err); }
                //otherwise it is successful, redirect to category page
                res.redirect('/catalog/categories');
            })
        }
    });

};

//display category update form on GET
exports.category_update_get = function(req, res) {
    res.send('Category update GET');
};

//handle category update on POST
exports.category_update_post = function(req, res) {
    res.send('Category update POST');
};