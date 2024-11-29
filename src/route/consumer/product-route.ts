import express from 'express';
import * as productHandler from '../../handler/express/consumer/product-handler';

const router = express.Router();

//Route to get all products
router.route('/').get(productHandler.get);

//Route to get all products based on searchText
router.route('/search').get(productHandler.search);

//Route to get a product by id
router.route('/:id').get(productHandler.getById);

export default router;
