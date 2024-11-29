import { APIError, BusinessError, SystemError } from './packages/common-errors/common-errors';
import { NextFunction, Request, Response } from 'express';
import { ValidationErrors } from './packages/utils';

export const defaultErrorHandler = (error: Error, req: Request, res: Response, _next: NextFunction) => {
	// TODO: Log the error using the common handler
	// logger.debug('in default error handler', error.name, error.message, error.stack);
	if (error instanceof APIError) {
		res.status(error.status).json({ message: error.message });
		return;
	} else if (error instanceof ValidationErrors) {
		res.status(400).json(error);
		return;
	} else if (error instanceof BusinessError) {
		res.status(400).json({ message: error.message, errorCode: error.errorCode });
		return;
	} else if (error instanceof SystemError) {
		res.status(500).json({
			message: error.message,
			error: error.error.message,
			stack: error.error.stack,
		});
		return;
	} else if (error instanceof SyntaxError) {
		res.status(400).json({ message: `Invalid JSON Syntax. ${error.message}` });
		return;
	}

	// next(error);
	res.status(500).json({ message: 'defaultErrorHandler : Something went wrong' + error.message });
};
