#! /usr/bin/env node

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Product = require('./models/product')
var Category = require('./models/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var products = []
var categories = []

function categoryCreate(name, cb) {
  var category = new Category({ name: name });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function productCreate(title, price, description, category, image, rate, count, cb) {
  productdetail = { 
    title: title,
    price: price,
    description: description,
    image: image,
    rating: {
        rate: rate,
        count: count
    }
  }
  if (category != false) productdetail.category = category
    
  var product = new Product(productdetail);    
  product.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Product: ' + product);
    products.push(product)
    cb(null, product)
  }  );
}


function createCategories(cb) {
    async.series([
        function(callback) {
            categoryCreate("Chairs", callback);
        },
        function(callback) {
            categoryCreate("Tables", callback);
        },
        function(callback) {
            categoryCreate("Couches", callback);
        },
        ],
        // optional callback
        cb);
}


function createProducts(cb) {
    async.parallel([
        function(callback) {
            productCreate('Blue Chair', 109.95, 'A lovely blue chair', categories[0], '/images/product1.jpg', 3.9, 120, callback);
        },
        function(callback) {
            productCreate('Red Table', 499.95, 'A sturdy red table', categories[1], '/images/product2.jpg', 4.1, 259, callback);
        },
        function(callback) {
            productCreate('Green Couch', 2499.95, 'A comfy green couch', categories[2], '/images/product3.jpg', 4.7, 500, callback);
        },
        function(callback) {
            productCreate('Weird Chair Couch', 1499.90, 'A combination chair couch?', [categories[0],categories[2]], '/images/product4.jpg', 4.9, 1100, callback);
        }
        ],
        // optional callback
        cb);
}



async.series([
    createCategories,
    createProducts
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Products: '+ products);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



