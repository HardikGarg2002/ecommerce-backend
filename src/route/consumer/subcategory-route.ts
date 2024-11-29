import express from 'express';
import * as subcategoryHandler from '../../handler/express/consumer/subcategory-handler';

const router = express.Router();

//Route to get all subcategories
router.route('/').get(subcategoryHandler.get);

//Route to get all subcategories based on searchText
router.route('/search').get(subcategoryHandler.search);

//Route to get a subcategory by id
router.route('/:id').get(subcategoryHandler.getById);

export default router;
