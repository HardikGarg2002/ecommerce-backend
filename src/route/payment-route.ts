import express from 'express';
import { authorizer } from '../common/packages/auth-client';
const router = express.Router();
import * as paymentHandler from '../handler/express/payment-handler';

router.route('/:id/refreshStatus').patch(authorizer, paymentHandler.refreshStatus);

export default router;
