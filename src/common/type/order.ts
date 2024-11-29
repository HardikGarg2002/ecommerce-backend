import { ObjectId } from 'mongoose';
import { IUser } from './user';
import IProduct from './product';

export enum OrderStatus {
	CREATED = 'CREATED', // Created but payment not done.
	// PEND = 'PEND',
	PAID = 'PAID', // Payment done but order not processed
	PROCCESS = 'PROCCESS', // Order is being processed
	SHIP = 'SHIP', // Order is shipped
	DEL = 'DEL', // Order is delivered
	CANCEL = 'CANCEL', // Order is cancelled
	RETURN = 'RETURN', // Order is returned
}
export enum PaymentMethod {
	UPI = 'UPI',
	CARD = 'CARD',
	NETBANKING = 'NETBANKING',
	WALLET = 'WALLET',
}

export enum PaymentGateway {
	PAYTM = 'PAYTM',
	RAZORPAY = 'RAZORPAY',
	Checkout = 'CHECKOUT',
}

export enum OrderPaymentStatus {
	PEND = 'PEND', // Payment is pending
	ATTEMPTED = 'ATTEMPTED',
	PAID = 'PAID', // Payment is completed and verified
	FAILED = 'FAILED', // Payment initiated but failed
	REFUND = 'REFUND', // Payment is refunded
	AUTHORIZED = 'Authorized',
	PENDING = 'Pending',
	CAPTURED = 'Captured',
}

export enum Currency {
	INR = 'INR',
	USD = 'USD',
	AED = 'AED',
}

export interface OrderProduct {
	product_id: ObjectId;
	product_name: string;
	quantity: number; // In numbers
	unit_mrp: number;
	product_unit: IProduct['unit'];
	img_url: string;
	unit_sp: number; // SP includes Tax
	sku: string;
	tax_amount: number; // Actual Tax amount calculated per unit * quantity
	subtotal: number; // Quantity * unitSP
}

interface OrderHistory {
	timestamp: Date;
	status: OrderStatus;
}

export default interface IOrder {
	_id?: string;
	customer: {
		_id: string;
		mobile: string;
		name: string;
	};
	order_date: Date;
	status: OrderStatus;
	total_order_amount: number; // Total amount including tax + other charges - discounts
	total_mrp_amount: number;
	total_sp_amount: number; // Total amount including tax
	total_tax_amount: number;

	other_charges: {
		handling_cost?: number;
		delivery_charges?: number;
	};
	discounts: {
		code?: string;
		amount?: number;
	};
	currency: Currency;
	products: OrderProduct[];
	shipping: {
		name: string;
		address: string;
		tracking_no?: string;
	};
	payment: {
		payment_id?: string;
		rzp_id?: string;
		rzp_payment_id?: string;
		payment_gateway?: PaymentGateway;
		amount: number;
		currency: Currency;
		method?: PaymentMethod;
		transaction_id?: string;
		status: OrderPaymentStatus;
	};
	orderNotes?: string;
	orderHistory: OrderHistory[];

	created: IUser;
	updated: IUser;
}
export interface IOrderWithMeta {
	data: IOrder[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}
