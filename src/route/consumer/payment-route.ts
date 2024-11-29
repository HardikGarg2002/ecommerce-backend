import express from 'express';
import * as paymentHandler from '../../handler/express/consumer/payment-handler';
import { authorizer } from '../../common/packages/auth-client';

const router = express.Router();

//Route to create a rzrpay order
router.route('/').post(authorizer, paymentHandler.createRazorpayOrder);

router.route('/:id').get(authorizer, paymentHandler.getById);
router.route('/rzp/:id').get(authorizer, paymentHandler.getByRzpId);
//Route to get a rzrpay order
router.route('/rzp/:orderId').get(authorizer, paymentHandler.getRazorpayOrder);

export default router;
