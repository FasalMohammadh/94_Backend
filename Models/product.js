import mongoose from './../DB/connection.js';

const productSchema = new mongoose.Schema({
  SKU: { type: String, required: true, unique: true },
  quantity: Number,
  productName: String,
  image: [String],
  productDesc: { type: String, trim: true },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
