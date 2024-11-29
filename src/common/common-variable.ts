// import { SystemError } from '../common/packages/common-errors/common-errors';
import { SystemError } from './packages/common-errors/common-errors';

export default class CommonVariables {
	static PORT: string;
	static MONGO_URI: string | undefined;
	static MONGO_DB_NAME: string;
	static MONGO_TIMEOUT: string | number;
	static NODE_ENV: string;
	static LOGGER_LOG_LEVEL: string;
	static LOGGER_LOG_TO_CONSOLE: string | boolean;
	static APP_SERVICE: string;
	static ACCESS_TOKEN_SECRET: string | undefined;
	static VERIFICATION_TOKEN_SECRET: string | undefined;
	static SERVER_URL: string | undefined;
	static AUTH_TOKEN_EXPIRY_IN_MINS = '1440';
	static VERIFICATION_TOKEN_EXPIRY_IN_HRS = '2';
	static AUDIT_SERVICE_URL: string | undefined;
	static APP_VERSION: string | undefined;
	static NOTIFICATION_URL: string | undefined;
	static isProduction = (): boolean => {
		return CommonVariables.NODE_ENV.toUpperCase().includes('PROD');
	};
	static getRedisUrl = () => {
		const redisUrl = process.env.REDIS_URL;
		if (!redisUrl) {
			throw new SystemError('REDIS_URL is not defined', new Error('REDIS_URL is not defined'));
		}
		return redisUrl;
	};

	static init() {
		console.log('In CommonVariables Init process.env.port', process.env.PORT);
		CommonVariables.PORT = process.env.PORT || '6001';
		console.log('process.env.MONGO_URI', process.env.MONGO_URI);
		CommonVariables.MONGO_URI = process.env.MONGO_URI;
		CommonVariables.MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'product';
		CommonVariables.MONGO_TIMEOUT = process.env.MONGO_TIMEOUT || 10000;
		CommonVariables.NODE_ENV = process.env.NODE_ENV || 'development';
		CommonVariables.LOGGER_LOG_LEVEL = process.env.LOGGER_LOG_LEVEL || 'debug';
		CommonVariables.LOGGER_LOG_TO_CONSOLE = process.env.LOGGER_LOG_TO_CONSOLE || true;
		CommonVariables.APP_SERVICE = process.env.APP_SERVICE || 'ITUPLECOMM';
		CommonVariables.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
		CommonVariables.VERIFICATION_TOKEN_SECRET =
			process.env.VERIFICATION_TOKEN_SECRET || CommonVariables.ACCESS_TOKEN_SECRET;
		CommonVariables.SERVER_URL = process.env.SERVER_URL;
		CommonVariables.AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL;
		CommonVariables.APP_VERSION = process.env.APP_VERSION;
		CommonVariables.AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL;
		CommonVariables.NOTIFICATION_URL = process.env.NOTIFICATION_URL;
	}
}
