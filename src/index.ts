import { Request, Response } from 'express';
import createServer from './app';
import CommonVariables from './common/common-variable';
import dbUtils from './common/packages/db-utils';

const app = createServer();
const port = CommonVariables.PORT;
const environment = CommonVariables.NODE_ENV;
const service = CommonVariables.APP_SERVICE;
const appVersion = CommonVariables.APP_VERSION;

app.get('/', (req: Request, res: Response) => {
	res.setHeader('Content-Type', 'text/html');
	const response = {
		message: 'Welcome to iTuple Product Service',
		environment,
		service,
		appVersion,
		dbconnected: dbUtils.isMongoDBConnected(),
	};

	res.send(response);
});
// to show mongoo queries
// mongoose.set('debug', true);
// default end point
app.use('*', (req, res) => {
	res.status(404).send({
		error: 'AUTH404: Could not find the page requested by you',
	});
});

app.listen(port, () => {
	console.log('App listening on port environment/ service is ', port, environment, service);
});
