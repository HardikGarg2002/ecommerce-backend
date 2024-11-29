import express from 'express';
import * as tagHandler from '../handler/express/tag-handler';
import { authorizer } from '../common/packages/auth-client';
const router = express.Router();

//route to create new tag
router.route('/').post(authorizer, tagHandler.create);

// route to get all tag
router.route('/').get(authorizer, tagHandler.get);

//Route to get all tags based on searchText
router.route('/search').get(authorizer, tagHandler.search);

//route to get a tag by ID
router.route('/:id').get(authorizer, tagHandler.getById);

//route to edit text of tag
router.route('/:id/status').patch(authorizer, tagHandler.activate);

export default router;
