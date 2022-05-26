let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let ProductSchema = new Schema(
    {
        title: {type: String, required: true},
        price: {type: Number, required: true},
        description: {type: String, required: true},
        category: [{type: Schema.Types.ObjectId, ref: 'Category'}],
        image: {type: String},
        rating: {
            rate: {
                type: Number
            },
            count: {
                type: Number
            }
        }
    }
);

//virtual for product's URL
ProductSchema.virtual('url').get(function () {
    return '/catalog/product/' + this._id;
});

//export model
module.exports = mongoose.model('Product', ProductSchema);