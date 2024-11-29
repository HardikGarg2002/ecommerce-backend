import Razorpay from 'razorpay';
import { Currency } from '../common/type/order';
import { RzpOrder } from '../common/type/payment';
import { BusinessError } from '../common/packages/common-errors/common-errors';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Ref: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
export const createOrder = async (
	orderId: string,
	amount: number,
	currency: string = Currency.INR,
): Promise<RzpOrder> => {
	if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET)
		throw new Error('Razorpay keys not found. Please configure in env file');
	const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
	if (!orderId || !amount) throw new Error('Cannot create Razorpay order. Invalid input ');

	const order = await instance.orders.create({
		amount: amount * 100, // amount in the smallest currency unit
		currency: currency,
		receipt: orderId,
		notes: {
			key1: 'Ecomm Order',
		},
		payment_capture: true,
	});

	/**
     * Order is created by not paid as of now. Expected response
     * {
    "id": "order_IluGWxBm9U8zJ8",
    "entity": "order",
    "amount": 5000,
    "amount_paid": 0,
    "amount_due": 5000,
    "currency": "INR",
    "receipt": "rcptid_11",
    "offer_id": null,
    "status": "created",
    "attempts": 0,
    "notes": [],
    "created_at": 1642662092
}
     */

	console.log('order', order);
	// order.amount = parseInt(order.amount.toString()) / 100;
	return order as unknown as RzpOrder;
};

export const getOrderFromRzp = async (orderId: string) => {
	if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET)
		throw new Error('Razorpay keys not found. Please configure in env file');
	const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
	if (!orderId) throw new Error('Cannot create Razorpay order. Invalid input ');

	const order = await instance.orders.fetch(orderId);
	console.log('order', order);
	return order;
};

export const getPaymentFromRzp = async (paymentId: string) => {
	if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET)
		throw new Error('Razorpay keys not found. Please configure in env file');
	const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
	if (!paymentId) throw new Error('Cannot create Razorpay order. Invalid input ');

	const payment = await instance.payments.fetch(paymentId);

	console.log('payment', payment);
	return payment;
};

export const initiateRefund = async (paymentId: string, amount: string | number, receipt: string) => {
	if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET)
		throw new Error('Razorpay keys not found. Please configure in env file');
	const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
	try {
		const paymentRefund = await instance.payments.refund(paymentId, {
			amount,
			speed: 'normal',
			receipt,
		});
		return paymentRefund;
	} catch (err: any) {
		throw new BusinessError('Error from Razorpay' + err.error.description, 'ERR_PAYMENT_REFUND_FAILED');
	}
};
