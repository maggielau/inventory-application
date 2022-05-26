let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let CategorySchema = new Schema(
    {
        name: { type: String, required: true}
    }
);

//virtual for category URL
CategorySchema.virtual('url').get(function () {
    return '/catalog/category/' + this._id;
});

//export model
module.exports = mongoose.model('Category', CategorySchema);