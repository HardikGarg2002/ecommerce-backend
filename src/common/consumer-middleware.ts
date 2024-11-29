import { NextFunction, Request, Response } from 'express';

export const addFiltersMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (req.query) {
		req.query = { ...req.query, filters: { ...(req.query.filters as any), is_active: { $ne: 'false' } } };
	}
	// Continue to the next middleware or route handler
	next();
};
