import express from 'express';
import * as storeHandler from '../handler/express/store-handler';
import { authorizer } from '../common/packages/auth-client';

const router = express.Router();

// Route to create a new store
router.route('/').post(authorizer, storeHandler.create);

//Route to get all store
router.route('/').get(authorizer, storeHandler.get);

//Route to get all stores based on searchText
router.route('/search').get(authorizer, storeHandler.search);

//Route to get a store by id
router.route('/:id').get(authorizer, storeHandler.getById);

//Route to edit a store by id (only active) (also send meta data for the affected fields future prospective)
router.route('/:id').patch(authorizer, storeHandler.patch);

// Route to edit a status by id (any) (also send meta data for the affected fields)
router.route('/:id/status').patch(authorizer, storeHandler.activate);

export default router;
