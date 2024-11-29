import express from 'express';
import * as categoryHandler from '../handler/express/category-handler';
import { authorizer } from '../common/packages/auth-client';

const router = express.Router();

// Route to create a new category
router.route('/').post(authorizer, categoryHandler.create);

//Route to get all categories
router.route('/').get(authorizer, categoryHandler.get);

//Route to get all categories based on searchText
router.route('/search').get(authorizer, categoryHandler.search);

//Route to get a category by id
router.route('/:id').get(authorizer, categoryHandler.getById);

//Route to edit a category by id (only active) (also send meta data for the affected fields future prospective)
router.route('/:id').patch(authorizer, categoryHandler.patch);

//Route to delete a category by id (not assigned)    hard delete
router.route('/:id').delete(authorizer, categoryHandler.remove);

// Route to edit a status by id (any) (also send meta data for the affected fields)
router.route('/:id/status').patch(authorizer, categoryHandler.patchStatus);

export default router;
