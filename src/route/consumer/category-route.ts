import express from 'express';
import * as categoryHandler from '../../handler/express/consumer/category-handler';

const router = express.Router();

//Route to get all categories
router.route('/').get(categoryHandler.get);

//Route to get all categories based on searchText
router.route('/search').get(categoryHandler.search);

//Route to get a category by id
router.route('/:id').get(categoryHandler.getById);

export default router;
