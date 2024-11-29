import express from 'express';
import * as bannerHandler from '../handler/express/banner-handler';
import { authorizer } from '../common/packages/auth-client';

const router = express.Router();

// Route to create a new banner
router.route('/').post(authorizer, bannerHandler.create);

//Route to get all banners
router.route('/').get(authorizer, bannerHandler.get);

//Route to get all banners based on searchText
router.route('/search').get(authorizer, bannerHandler.search);

//Route to get a banner by id
router.route('/:id').get(authorizer, bannerHandler.getById);

//Route to edit a banner by id (only active) (also send meta data for the affected fields future prospective)
router.route('/:id').patch(authorizer, bannerHandler.patch);

// Route to edit a status by id (any) (also send meta data for the affected fields)
router.route('/:id/status').patch(authorizer, bannerHandler.patchStatus);

export default router;
