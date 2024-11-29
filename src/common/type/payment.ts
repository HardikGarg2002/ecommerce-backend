import { Currency } from './order';
import { RazorpayWebhookPayload } from './webhook/rzp';

export enum PaymentStatus {
	CREATED = 'created',
	ATTEMPTED = 'attempted',
	PAID = 'paid',
}

export interface IPaymentHistory {
	status: PaymentStatus;
	updated_by: string; // ID of the user who made the change
	updated_at: number;
}

export interface IPayment {
	_id?: string;
	rzp_id?: string;
	order_id: string;
	rzp_payment_id?: string;
	rzp_refund_id?: string;
	rzp_signature?: string;
	rzp_res?: RazorpayWebhookPayload;
	entity: string;
	amount: number;
	amount_paid: number;
	amount_due: number;
	refund_amount?: number;
	currency: Currency;
	receipt: string;
	offer_id?: string | null;
	status: PaymentStatus;
	attempts: number;
	payment_history?: IPaymentHistory[];
	created_at: number;
}

export interface RzpOrder extends Omit<IPayment, 'amount'> {
	id: string;
	amount: string | number;
}
