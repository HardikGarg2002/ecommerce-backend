import express from 'express';
import * as featureHandler from '../handler/express/feature-handler';
import { authorizer } from '../common/packages/auth-client';

const router = express.Router();

// //Route to get all features
router.route('/').get(authorizer, featureHandler.get);

// // Route to create a new feature
router.route('/').post(authorizer, featureHandler.create);

//Route to get all subcategories based on searchText
router.route('/search').get(authorizer, featureHandler.search);

// //Route to get a feature by id
router.route('/:id').get(authorizer, featureHandler.getById);

// //Route to edit a feature by id (only active) (also send meta data for the affected fields future prospective)
router.route('/:id').patch(authorizer, featureHandler.patch);

// //Route to delete a feature by id     hard delete
router.route('/:id').delete(authorizer, featureHandler.remove);

export default router;
