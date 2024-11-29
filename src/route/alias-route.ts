import express from 'express';
import * as aliasHandler from '../handler/express/alias-handler';
import { authorizer } from '../common/packages/auth-client';

const router = express.Router();

// Route to create a new alias
router.route('/').post(authorizer, aliasHandler.create);

//Route to get all categories
router.route('/').get(authorizer, aliasHandler.get);

//Route to get all aliases based on searchText
router.route('/search').get(authorizer, aliasHandler.search);

//Route to get a alias by id
router.route('/:id').get(authorizer, aliasHandler.getById);

//Route to edit a alias by id (only active) (also send meta data for the affected fields future prospective)
router.route('/:id').patch(authorizer, aliasHandler.patch);

// Route to edit a status by id (any) (also send meta data for the affected fields)
router.route('/:id/status').patch(authorizer, aliasHandler.patchStatus);

export default router;
