import Razorpay from 'razorpay';
import IOrder, { Currency, OrderPaymentStatus } from '../common/type/order';
import { RzpOrder } from '../common/type/payment';
import { BusinessError } from '../common/packages/common-errors/common-errors';
import { Checkout } from 'checkout-sdk-node';
import { Orders } from 'razorpay/dist/types/orders';
import axios from 'axios';
const secretKey = process.env.CHECKOUT_SECRET_KEY;
const publicKey = process.env.CHECKOUT_PUBLIC_KEY;
const checkoutEnvironment = process.env.CHECKOUT_PAYMENT_ENVIRONMENT;
const clientId = process.env.CHECKOUT_CLIENT_ID;
const ecommercerUrl = process.env.ECOMMERCE_URL;

interface CheckoutOrderResponse {
	id: string;
	status: string;
	reference: string;
	'3ds': {
		downgraded: boolean;
		enrolled: string;
	};
	_links: {
		self: {
			href: string;
		};
		actions: {
			href: string;
		};
		redirect: {
			href: string;
		};
	};
	requiresRedirect: boolean;
	redirectLink: string;
}

export const createCheckoutPayment = async (
	order: IOrder,
	token: string,
	success_url: string,
	failure_url: string,
	currency: string = Currency.AED,
): Promise<any> => {
	try {
		if (!secretKey) throw new Error('Checkout keys not found. Please configure in env file');
		if (!order._id || !order.total_order_amount || !token)
			throw new Error('Cannot create Checkout order. Invalid input');

		let cko = new Checkout(secretKey, {
			pk: publicKey as string,
			scope: ['gateway'],
			environment: checkoutEnvironment as string,
		});
		console.log('cko:', cko);
		const payment = await cko.payments.request({
			source: {
				type: 'token',
				token: token,
			},
			'3ds': {
				enabled: true,
			},
			amount: order.total_order_amount * 100,
			currency: currency,
			processing_channel_id: clientId,
			reference: order._id.toString(),
			capture: true,
			metadata: {
				orderId: order._id.toString(),
			},
			success_url,
			failure_url,
		});

		console.log('Payment successful:', payment);
		return payment as unknown as CheckoutOrderResponse;
	} catch (err: any) {
		console.log('Error in checkout:', err);
	}
};
export async function getCheckoutPayment(ckoSessionId: string) {
	let cko = new Checkout(secretKey, {
		pk: publicKey as string,
		scope: ['gateway'],
		environment: checkoutEnvironment as string,
	});
	try {
		const response = await cko.payments.get(ckoSessionId);

		return response;
	} catch (err: any) {
		console.log('Error in checkout:', err);
	}
}
