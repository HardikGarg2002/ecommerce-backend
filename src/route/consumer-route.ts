import express from 'express';
import * as bannerHandler from '../handler/express/banner-handler';
import * as featureHandler from '../handler/express/feature-handler';
import * as storeHandler from '../handler/express/store-handler';
import * as variantHandler from '../handler/express/variant-handler';
import { addFiltersMiddleware } from '../common/consumer-middleware';

// Create routers for each entity
const router = express.Router();

// Banners
router.route('/banners').get(addFiltersMiddleware, bannerHandler.get);
router.route('/banners/:id').get(bannerHandler.getById);

// Banners
router.route('/features').get(addFiltersMiddleware, featureHandler.get);
router.route('/features/:id').get(featureHandler.getById);

// Stores
router.route('/stores').get(addFiltersMiddleware, storeHandler.get);
router.route('/stores/:id').get(storeHandler.getById);

// Variant
router.route('/variants').get(addFiltersMiddleware, variantHandler.get);
router.route('/variants/:id').get(variantHandler.getById);

// Export routers
export default router;
