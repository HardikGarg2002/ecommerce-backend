import express from 'express';
import * as variantHandler from '../handler/express/variant-handler';
import { authorizer } from '../common/packages/auth-client';
const router = express.Router();

//route to create new variant
router.route('/').post(authorizer, variantHandler.create);

// route to get all variant
router.route('/').get(authorizer, variantHandler.get);

//Route to edit a particular valid value
router.route('/:id').patch(authorizer, variantHandler.patch);

// route to add products to variant
router.route('/:id/products').post(authorizer, variantHandler.addProductsList);

//route to get a variant by ID
router.route('/:id').get(authorizer, variantHandler.getById);

//route to edit text of variant
// router.route('/:id/status').patch(authorizer, variantHandler.activate);

//Route to remove a particular product from array of products with help of product_id of a variant
router.route('/:id/products/:product_id').delete(authorizer, variantHandler.removeProduct);

export default router;
