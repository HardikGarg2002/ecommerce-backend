import * as orderHandler from '../handler/express/order-handler';
import express from 'express';
import { authorizer } from '../common/packages/auth-client';

const router = express.Router();

//Route to create an order
router.route('/:id/status').patch(authorizer, orderHandler.patchStatus);

//Route to get all products
router.route('/').get(authorizer, orderHandler.get);

//Route to get a product by id
router.route('/:id').get(authorizer, orderHandler.getById);

//Route to refresh payment
router.route('/:id/payment/refresh').get(authorizer, orderHandler.refreshStatus);

export default router;
