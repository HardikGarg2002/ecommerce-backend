import express from 'express';
import * as CustomerHandler from '../../handler/express/consumer/customer-handler';
import { authorizer } from '../../common/packages/auth-client';

const router = express.Router();

//Route to create customer
router.route('/').post(CustomerHandler.create);
//Route to get customer by logged in user's auth id
router.route('/').get(authorizer, CustomerHandler.get);

//Route to add address to customer
router.route('/address').post(authorizer, CustomerHandler.addAddress);

//Route to edit address
router.route('/address/:id').patch(authorizer, CustomerHandler.editAddress);

//Route to remove address from customer
router.route('/address/:id').delete(authorizer, CustomerHandler.removeAddress);

export default router;
