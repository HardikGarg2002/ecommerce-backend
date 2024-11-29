import { Request, Response, NextFunction } from 'express';
import OrderController from '../../../controller/consumer/order-controller';
import IOrder, { OrderStatus } from '../../../common/type/order';
import { IUser } from '../../../common/type/user';

const orderController = new OrderController();

export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const orderInput: IOrder = req.body;
		orderInput.created = { ...user };
		orderInput.updated = orderInput.created;
		orderInput.orderHistory = [{ status: OrderStatus.CREATED, timestamp: new Date() }];
		orderInput.status = OrderStatus.CREATED;
		orderInput.customer = { ...user, mobile: user.user! };

		const id = await orderController.create(orderInput);
		res.status(201).json({ message: 'Order created successfully', id });
	} catch (err) {
		next(err);
	}
};

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const orderId = req.params.id;
		const orderResponse = await orderController.createPayment(orderId, user._id);
		res.status(201).json({ message: 'Payment created successfully', ...orderResponse });
	} catch (err) {
		next(err);
	}
};

export const createCheckoutPayment = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const orderId = req.params.id;
		const token = req.body.token;
		const success_url = req.body.success_url;
		const failure_url = req.body.failure_url;
		const order = await orderController.createCheckoutPayment(orderId, token, success_url, failure_url, user._id);
		res.status(200).json(order);
	} catch (err) {
		next(err);
	}
};

export const getCheckoutPayment = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const ckoSessionId = req.params.id;
		const user: IUser = req.body.loggedInUser;
		const order = await orderController.getCheckoutPayment(ckoSessionId, user._id);
		res.status(200).json(order);
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
		const orders = await orderController.get(user, filters, pagination, sort);
		res.status(200).json(orders);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const orderId = req.params.id;
		const user: IUser = req.body.loggedInUser;
		const order = await orderController.getById(orderId, user._id);
		res.status(200).json(order);
	} catch (err) {
		next(err);
	}
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = { _id: '123', name: 'DBTest' };
		const orderId = req.params.id;
		const { reason, status } = req.body;
		await orderController.updateStatus(orderId, reason, user, status);
		res.status(200).json({ message: 'Order status updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const updatePaymentDetails = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const orderId = req.params.id;
		const payment: IOrder['payment'] = req.body;
		await orderController.updatePaymentDetails(orderId, user, payment);
		res.status(200).json({ message: 'Order payment status updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
		const { isValidSignature, order_id } = await orderController.verifyPayment(
			razorpay_payment_id,
			razorpay_order_id,
			razorpay_signature,
		);
		const status = isValidSignature ? 'successfull' : 'failed';
		res.status(200).json({ message: `Payment verification ${status}`, status: isValidSignature, order_id });
	} catch (err) {
		next(err);
	}
};

export const rzpWebhook = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const data = req.body;
		// const signature = req.headers['x-razorpay-signature'];
		await orderController.rzpWebhook(data);

		console.log('payload data from razorpay order paid webhook', JSON.stringify(data));
		res.status(200).json({ message: 'Order payment status updated successfully' });
	} catch (err) {
		next(err);
	}
};
