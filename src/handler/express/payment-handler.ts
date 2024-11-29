
import { NextFunction, Request, Response } from 'express';
import OrderController from '../../controller/order-controller';
const paymentController = new OrderController();

export const refreshStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const orderId = req.params.id;
		await paymentController.refreshPaymentStatus(orderId);
		res.status(200).json({ message: 'payment Status refreshed successfully' });
	} catch (err) {
		next(err);
	}
}