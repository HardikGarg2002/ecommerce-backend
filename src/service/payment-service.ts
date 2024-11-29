import { BusinessError } from '../common/packages/common-errors/common-errors';
import { initiateRefund } from '../adapter/razorpay-adapter';
import Payment from '../model/payment';
import { IPayment } from '../common/type/payment';

export default class PaymentService {
	private async save(paymentInput: IPayment, isNew: boolean = false): Promise<IPayment> {
		const payment = new Payment(paymentInput);
		payment.isNew = isNew;
		return (await payment.save()).toObject();
	}
	public async getByRzporderId(rzpId: string) {
		const payment = await Payment.findOne({ rzp_id: rzpId }).lean();
		if (!payment) {
			throw new BusinessError('Payment not found', 'ERR_PAYMENT_NOT_FOUND');
		}
		return payment;
	}

	public async refreshStatus(orderId: string) {
		return;
	}

	public async initiateRefund(rpOrderId: string) {
		// TODO initiate refund
		const payment = await this.getByRzporderId(rpOrderId);

		const refundPayment = await initiateRefund(payment.rzp_payment_id!, payment.amount, payment.order_id);

		payment.rzp_refund_id = refundPayment.id;
		payment.refund_amount = payment.amount;
		await this.save(payment);

		return;
	}
}
