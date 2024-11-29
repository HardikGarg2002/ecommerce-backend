import { BusinessError } from '../../common/packages/common-errors/common-errors';
import { IPayment, PaymentStatus } from '../../common/type/payment';
import Payment from '../../model/payment';
import { RazorpayWebhookPayload } from '../../common/type/webhook/rzp';

export default class PaymentService {
	private async save(paymentInput: IPayment, isNew: boolean = false): Promise<IPayment> {
		const payment = new Payment(paymentInput);
		payment.isNew = isNew;
		return (await payment.save()).toObject();
	}
	public async create(payment: IPayment) {
		payment.order_id = payment.receipt;
		const newPayment = await this.save(payment, true);
		return newPayment;
	}
	public async getById(id: string) {
		const payment = await Payment.findById(id);
		if (!payment) {
			throw new BusinessError('Payment not found', 'ERR_PAYMENT_NOT_FOUND');
		}
		return payment;
	}
	public async getByRzpId(rzpId: string) {
		const payment = await Payment.findOne({ rzp_id: rzpId });
		if (!payment) {
			throw new BusinessError('Payment not found', 'ERR_PAYMENT_NOT_FOUND');
		}
		return payment;
	}
	public async storeVerifyPaymentResponse(
		razorpayPaymentId: string,
		razorpayOrderId: string,
		razorpaySignature: string,
	) {
		const payment = await this.getByRzpId(razorpayOrderId);
		payment.rzp_signature = razorpaySignature;
		payment.status = PaymentStatus.ATTEMPTED;
		await this.save(payment);
	}
	public async rzpPaymentWebhook(data: RazorpayWebhookPayload) {
		const payment = await this.getByRzpId(data.payload.payment.entity.order_id);
		if (!payment) {
			throw new BusinessError('Payment not found', 'ERR_PAYMENT_NOT_FOUND');
		}
		if (data.payload.payment.entity.status === 'captured') {
			payment.status = PaymentStatus.PAID;
			payment.amount_paid = payment.amount;
			payment.amount_due = 0;
			payment.rzp_payment_id = data.payload.payment.entity.id;
		} else if (data.payload.payment.entity.status === 'failed') {
			payment.status = PaymentStatus.ATTEMPTED;
		}
		payment.rzp_res = data;
		await payment.save();
	}
}
