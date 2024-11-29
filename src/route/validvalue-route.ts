import express from 'express';
import * as validvalueHandler from '../handler/express/validvalue-handler';
import { authorizer } from '../common/packages/auth-client';

const router = express.Router();

// Route to create a new valid value
router.route('/').post(authorizer, validvalueHandler.create);

// Route to get a list of valid values
router.route('/').get(authorizer, validvalueHandler.get);

// Route to get a particular valid value
router.route('/:type').get(authorizer, validvalueHandler.getByType);

//Route to edit a particular valid value
router.route('/:type').patch(authorizer, validvalueHandler.patch);

//Route to add values to a particular valid value
router.route('/:type/values').post(authorizer, validvalueHandler.addValues);

//Route to view a particular value from array of values with help of key of a validvalue
router.route('/:type/:key').get(authorizer, validvalueHandler.getValue);

//Route to remove a particular value from array of values with help of key of a validvalue    (soft delete only is_active status changed to false)
router.route('/:type/:key').delete(authorizer, validvalueHandler.removeValue);

//Route  to edit a particular value from array of values of a validvalue
router.route('/:type/:key').patch(authorizer, validvalueHandler.patchValue);

//Route  to update status a particular value from array of values of a validvalue
router.route('/:type/:key/status').patch(authorizer, validvalueHandler.activateValue);

export default router;
