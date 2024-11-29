import express from 'express';
import * as OrderHandler from '../../handler/express/consumer/order-handler';
import { authorizer } from '../../common/packages/auth-client';

const router = express.Router();

//Route to create an order
router.route('/').post(authorizer, OrderHandler.create);

//Route to get all products
router.route('/').get(authorizer, OrderHandler.get);

//Route to get a product by id
router.route('/:id').get(authorizer, OrderHandler.getById);

// Route to update status of order
router.route('/:id/status').put(authorizer, OrderHandler.updateStatus);

// ROute to create payment and rzp order after order creation
router.route('/:id/payment').post(authorizer, OrderHandler.createPayment);

router.route('/:id/checkoutPayment').post(authorizer, OrderHandler.createCheckoutPayment);
router.route('/:id/checkoutPayment').get(authorizer, OrderHandler.getCheckoutPayment);
// Route to update payment details of order
router.route('/:id/payment').put(authorizer, OrderHandler.updatePaymentDetails);

router.route('/rzp/verifyPayment').post(authorizer, OrderHandler.verifyPayment);
router.route('/rzp/webhook').post(OrderHandler.rzpWebhook);

export default router;
