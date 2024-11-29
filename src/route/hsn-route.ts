import express from 'express';
import * as hsnHandler from '../handler/express/hsn-handler';
import { authorizer } from '../common/packages/auth-client';
const router = express.Router();

//route to create new hsn
router.route('/').post(authorizer, hsnHandler.create);

//route to get all hsn
router.route('/').get(authorizer, hsnHandler.get);

//Route to get all hsn based on searchText
router.route('/search').get(authorizer, hsnHandler.search);

//route to get hsn by id
router.route('/:id').get(authorizer, hsnHandler.getById);

//route to edit particular hsn
router.route('/:id').patch(authorizer, hsnHandler.patch);

//route to change status of hsn
router.route('/:id/status').patch(authorizer, hsnHandler.activate);

export default router;
