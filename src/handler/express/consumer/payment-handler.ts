import { Request, Response, NextFunction } from 'express';
import { createOrder, getOrderFromRzp } from '../../../adapter/razorpay-adapter';
import PaymentController from '../../../controller/consumer/payment-controller';

const paymentController = new PaymentController();
export const createRazorpayOrder = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const orderId = req.body.orderId;
		const amount = req.body.amount;
		const currency = req.body.currency;
		const order = await createOrder(orderId, amount, currency);
		res.status(200).json(order);
	} catch (err) {
		next(err);
	}
};

export const getRazorpayOrder = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const orderId = req.params.orderId;
		const order = await getOrderFromRzp(orderId);
		res.status(200).json(order);
	} catch (err) {
		next(err);
	}
};

// export const get = async(req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		const {_id,}
// 		const order = await getOrder(req.body.orderId);
// 		res.status(200).json(order);
// 	} catch (err) {
// 		next(err);
// 	}
// }

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const paymentId = req.params.id;
		const order = await paymentController.getById(paymentId);
		res.status(200).json(order);
	} catch (err) {
		next(err);
	}
};

export const getByRzpId = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const rzpId = req.params.id;
		const order = await paymentController.getByRzpId(rzpId);
		res.status(200).json(order);
	} catch (err) {
		next(err);
	}
};
