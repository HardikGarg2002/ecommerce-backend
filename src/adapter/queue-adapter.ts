import { Worker } from 'bullmq';
import CommonVariables from '../common/common-variable';
import Redis from 'ioredis';
import ICustomer from '../common/type/customer';
import CustomerController from '../controller/consumer/customer-controller';

let worker;
const redisConfig = CommonVariables.getRedisUrl();
const redisConnection = new Redis(redisConfig, {
	maxRetriesPerRequest: null,
	connectTimeout: 30000,
	autoResubscribe: true,
	enableOfflineQueue: false,
	enableReadyCheck: true,
});
const queueName = 'customer';
const customerController = new CustomerController();

const processor = async (job: any) => {
	try {
		const customer: ICustomer = job.data;
		console.log('customer', customer);
		// throw new Error('intentional Error in processing job');
		await customerController.create(customer);
	} catch (error) {
		console.error('Error in processing job', error);
		throw error;
	}
};

const setUpWorker = () => {
	worker = new Worker(queueName, processor, {
		connection: redisConnection,

		autorun: true,
	});

	worker.on('active', (job) => {
		console.debug(`Processing job with id ${job.id}`);
	});

	worker.on('completed', (job, returnValue) => {
		console.debug(`Completed job with id ${job.id}`, returnValue);
	});

	worker.on('error', (failedReason) => {
		console.error(`Job encountered an error`, failedReason);
	});
};

export default setUpWorker;
