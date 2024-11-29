import express, { Express } from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import CommonVariables from './common/common-variable';
CommonVariables.init();
import { defaultErrorHandler } from './common/middleware';
import swaggerUi from 'swagger-ui-express';
import categoryRoute from './route/category-route';
import subcategoryRoute from './route/subcategory-route';
import validvalueRoute from './route/validvalue-route';
import featureRoute from './route/feature-route';
import storeRoute from './route/store-route';
import bannerRoute from './route/banner-route';
import productRoute from './route/product-route';
import tagRoute from './route/tag-route';
import hsnRoute from './route/hsn-route';
import aliasRoute from './route/alias-route';
import variantRoute from './route/variant-route';
import customerRoute from './route/consumer/customer-route';
import paymentRoute from './route/consumer/payment-route';
import consumerRoute from './route/consumer-route';
import categoryConsumerRoute from './route/consumer/category-route';
import subcategoryConsumerRoute from './route/consumer/subcategory-route';
import productConsumerRoute from './route/consumer/product-route';
import orderRoute from './route/consumer/order-route';
import adminOrderRoute from './route/order-route';
import setUpWorker from './adapter/queue-adapter';
import client from 'prom-client';
import responseTime from 'response-time';

import bulkProductRoute from './route/bulk/product-route';
import dbUtils from './common/packages/db-utils';

let app: Express;
export default function createServer() {
	dbUtils.initMongoDB();
	CommonVariables.init();
	app = express().use(cors()).use(express.json());

	collectMetrics(app);
	// ---- All Routes and end points will come after this----
	app
		.use('/api/categories', categoryRoute)
		.use('/api/subcategories', subcategoryRoute)
		.use('/api/validvalues', validvalueRoute)
		.use('/api/features', featureRoute)
		.use('/api/stores', storeRoute)
		.use('/api/banners', bannerRoute)
		.use('/api/tags', tagRoute)
		.use('/api/hsns', hsnRoute)
		.use('/api/products', productRoute)
		.use('/api/aliases', aliasRoute)
		.use('/api/variants', variantRoute)
		.use('/api/orders', adminOrderRoute)

		.use('/api/consumer', consumerRoute)
		.use('/api/consumer/categories', categoryConsumerRoute)
		.use('/api/consumer/subcategories', subcategoryConsumerRoute)
		.use('/api/consumer/products', productConsumerRoute)
		.use('/api/consumer/orders', orderRoute)
		.use('/api/consumer/customer', customerRoute)
		.use('/api/consumer/payment', paymentRoute)

		.use('/api/bulk/products', bulkProductRoute)

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		.use('/api-docs', swaggerUi.serve, swaggerUi.setup(require('../swagger.json')))
		.use(defaultErrorHandler);

	// setup queue worker
	setUpWorker();
	return app;
}

function collectMetrics(app: Express) {
	const collectDefaultMetrics = client.collectDefaultMetrics;
	const Registry = client.Registry;
	const register = new Registry();
	collectDefaultMetrics({ register });
	const reqResTimer = new client.Histogram({
		name: 'http_request_duration_seconds',
		help: 'Duration of HTTP requests in seconds',
		labelNames: ['method', 'status_code', 'route'],
		registers: [register],
		buckets: [10, 50, 100, 200, 400, 800, 1000, 2000],
	});

	app.use(
		responseTime((req: Request, res: Response, time) => {
			reqResTimer
				.labels({
					method: req.method,
					status_code: res.statusCode.toString(),
					route: req.originalUrl.split('?').shift(),
				})
				.observe(time);
		}) as express.RequestHandler,
	);

	app.get('/metrics', async (req, res) => {
		res.setHeader('Content-Type', register.contentType);
		const metrics = await register.metrics();
		res.send(metrics);
	});
}

export function destroyApp(event?: string) {
	console.log('destroying app on event:', event);
	try {
		dbUtils.disconnectMongoDB();
		process.exit(0);
	} catch (error) {
		console.log('Error in destroying app', error);
		process.exit(1);
	}
}

process.on('SIGINT', () => destroyApp('SIGINT'));
process.on('SIGTERM', () => destroyApp('SIGTERM'));
process.on('SIGQUIT', () => destroyApp('SIGQUIT'));
process.on('SIGUSR2', () => destroyApp('SIGUSR2'));
process.on('exit', () => console.log('exit called'));
process.on('uncaughtException', (err) => {
	console.warn('uncaughtException', err);
	// logger.warn('debug', 'Uncaught exception', err);
	// destroyApp('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
	console.warn('unhandledRejection', reason, promise);
	// logger.warn('debug', 'Unhandled Rejection at:', promise, 'reason:', reason);
	// destroyApp('unhandledRejection');
});
