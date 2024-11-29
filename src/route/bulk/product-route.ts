import express from 'express';
import * as bulkProductHandler from '../../handler/express/bulk/product-handler';
import { authorizer } from '../../common/packages/auth-client';

const router = express.Router();

// Route to create a new product
router.route('/').post(authorizer, bulkProductHandler.create);

export default router;
