import express from 'express';
import * as subcategoryHandler from '../handler/express/subcategory-handler';
import { authorizer } from '../common/packages/auth-client';
// import { authorizer } from '../common/packages/auth-client';

const router = express.Router();

// Route to create a new subcategory
router.route('/').post(authorizer, subcategoryHandler.create);

//Route to get all subcategories
router.route('/').get(authorizer, subcategoryHandler.get);

//Route to get all subcategories based on searchText
router.route('/search').get(authorizer, subcategoryHandler.search);

//Route to get a subcategory by id
router.route('/:id').get(authorizer, subcategoryHandler.getById);

//Route to edit a subcategory by id (only active) (also send meta data for the affected fields future prospective)
router.route('/:id').patch(authorizer, subcategoryHandler.patch);

//Route to delete a subcategory by id (not assigned to any product)    hard delete
router.route('/:id').delete(authorizer, subcategoryHandler.remove);

// Route to edit a status by id (any) (also send meta data for the affected fields)
router.route('/:id/status').patch(authorizer, subcategoryHandler.patchStatus);

export default router;
