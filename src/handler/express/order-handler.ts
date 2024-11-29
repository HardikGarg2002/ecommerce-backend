import { NextFunction, Request, Response } from 'express';

import OrderController from '../../controller/order-controller';
import { IUser } from '../../common/type/user';

const orderController = new OrderController();
export const patchStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const orderId = req.params.id;
		const { status } = req.body;
		await orderController.patchStatus(orderId, status);
		res.status(200).json({ message: 'Order Status updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'updated.date:desc';
		}
		const orders = await orderController.get(filters, pagination, sort);
		res.status(200).json(orders);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const orderId = req.params.id;
		const user: IUser = req.body.loggedInUser;
		const order = await orderController.getById(orderId);
		res.status(200).json(order);
	} catch (err) {
		next(err);
	}
};

export const refreshStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const orderId = req.params.id;
		const result = await orderController.refreshPaymentStatus(orderId);
		res.status(200).json({ message: 'payment Status refreshed successfully', result });
	} catch (err) {
		next(err);
	}
};
