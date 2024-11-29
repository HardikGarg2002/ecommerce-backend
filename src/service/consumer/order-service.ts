import Order from '../../model/order';
import IOrder, {
	OrderStatus,
	IOrderWithMeta,
	PaymentGateway,
	OrderPaymentStatus,
	PaymentMethod,
	Currency,
} from '../../common/type/order';
import { IUser } from '../../common/type/user';
import { compareAmountsWithTolerance } from '../../common/util';
import dbutils from '../../common/packages/db-utils';
import { BusinessError } from '../../common/packages/common-errors/common-errors';
import { createOrder } from '../../adapter/razorpay-adapter';
import PaymentService from './payment-service';
import { IPayment, RzpOrder } from '../../common/type/payment';
import { RazorpayWebhookPayload } from '../../common/type/webhook/rzp';
import crypto from 'crypto';
import { createCheckoutPayment, getCheckoutPayment } from '../../adapter/checkout-adapter';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export default class OrderService {
	_paymentService = new PaymentService();
	private generateHmacSha256(data: string, secret: string) {
		const hmac = crypto.createHmac('sha256', secret);
		hmac.update(data);
		return hmac.digest('hex');
	}
	private async save(orderInput: IOrder, isNew: boolean = false): Promise<IOrder> {
		const order = new Order(orderInput);
		order.isNew = isNew;
		return (await order.save()).toObject();
	}
	private ValidateTotals(order: IOrder) {
		if (
			!compareAmountsWithTolerance(
				order.total_sp_amount,
				order.products.reduce((sum, product) => sum + product.subtotal, 0),
			)
		)
			throw new BusinessError('Total Sp Amount', 'Total Sp Amount does not match with subtotals of products');
		if (
			!compareAmountsWithTolerance(
				order.total_order_amount,
				order.total_sp_amount +
					(order.other_charges?.handling_cost ?? 0) +
					(order.other_charges?.delivery_charges ?? 0) -
					(order.discounts?.amount ?? 0),
			)
		)
			throw new BusinessError('Total Order Amount', 'Total Order Amount does not match with calculated order amount');
		if (
			!compareAmountsWithTolerance(
				order.total_tax_amount,
				order.products.reduce((sum, product) => sum + product.tax_amount, 0),
			)
		)
			throw new BusinessError(
				'Total Tax Amount',
				'Total Tax Amount does not match with total tax amount of all products',
			);
	}
	private createOrderResponse(rzpOrder: RzpOrder, order: IOrder, payment: IPayment) {
		return {
			order_id: order._id,
			rzp_order_id: rzpOrder.id,
			payment_id: payment._id,
			total_order_amount: +rzpOrder.amount / 100,
			description: `Order Id: '${order._id}' for the order of customer '${order.customer.name}' with mobile number '${order.customer.mobile}' which was created on '${order.order_date.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })}'`,
			order_date: order.order_date,
			customer: order.customer,
			currency: rzpOrder.currency,
		};
	}

	public async create(order: IOrder) {
		this.ValidateTotals(order);
		const newOrder = await this.save(order, true);
		return newOrder._id;
	}

	public async createPayment(order_id: string, user_id: string) {
		const order = await this.getById(order_id, user_id);
		const rzpOrder: RzpOrder = await createOrder(order_id, order.total_order_amount);
		const payment = await this._paymentService.create({ ...rzpOrder, amount: +rzpOrder.amount, rzp_id: rzpOrder.id });
		order.payment = {
			payment_gateway: PaymentGateway.RAZORPAY,
			payment_id: payment._id,
			rzp_id: rzpOrder.id,
			currency: rzpOrder.currency,
			amount: +rzpOrder.amount / 100,
			status: OrderPaymentStatus.PEND,
		};

		await this.save(order);
		// await this.updatePaymentDetails(order._id!, order.customer, order.payment);
		return this.createOrderResponse(rzpOrder, order, payment);
	}
	public async createCheckoutPayment(
		order_id: string,
		token: string,
		success_url: string,
		failure_url: string,
		user_id: string,
	) {
		const order: IOrder = await this.getById(order_id, user_id);
		const checkoutResponse = await createCheckoutPayment(order, token, success_url, failure_url);
		order.payment = {
			payment_gateway: PaymentGateway.Checkout,
			payment_id: checkoutResponse._id,
			rzp_id: checkoutResponse.id,
			currency: Currency.AED,
			amount: order.total_order_amount,
			status: OrderPaymentStatus.PEND,
		};

		await this.save(order);
		return checkoutResponse;
	}

	public async get(user: IUser, filters: any, pagination: any, sort: string): Promise<IOrderWithMeta> {
		// get all orders for only the logged in customer
		filters = { ...filters, 'customer._id': { $eq: user._id } };
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const orderList: IOrder[] = await Order.find(criteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Order.countDocuments(criteria);
		const data: IOrderWithMeta = {
			data: orderList,
			meta: {
				pagination: {
					page: skip / limit + 1,
					pageSize: limit,
					pageCount: Math.ceil(totalCount / limit),
					total: totalCount,
				},
			},
		};
		return data;
	}

	public async getById(id: string, userId: string): Promise<IOrder> {
		const order: IOrder | null = await Order.findOne({ _id: id, 'customer._id': userId });
		if (!order) throw new BusinessError('Order does not exist or belongs to different user', 'ERR_ORDER_NOT_FOUND');
		return order;
	}

	public async getCheckoutPayment(ckoSessionId: string, userId: string): Promise<any> {
		const paymentResponse = await getCheckoutPayment(ckoSessionId);
		console.log('checkout response:', paymentResponse);
		if (paymentResponse.status === OrderPaymentStatus.CAPTURED) {
			const order = await this.getById(paymentResponse.reference, userId);
			order.status = OrderStatus.PAID;
			order.payment = {
				payment_gateway: PaymentGateway.Checkout,
				method: paymentResponse.source.type === 'card' ? PaymentMethod.CARD : PaymentMethod.UPI,
				payment_id: paymentResponse._id,
				rzp_id: paymentResponse.id,
				currency: Currency.AED,
				amount: order.total_order_amount,
				status: OrderPaymentStatus.CAPTURED,
			};
			await this.save(order);
		}
		return paymentResponse;
	}
	public async patch(id: string, user: IUser, reason: string, updatedFields: Partial<IOrder>): Promise<void> {
		const existingOrder = await this.getById(id, user._id);
		console.log(
			'updatedFields.payment.amount !== existingOrder.total_order_amount :',
			updatedFields.payment?.amount,
			existingOrder.total_order_amount,
		);
		if (updatedFields.payment && updatedFields.payment.amount !== existingOrder.total_order_amount) {
			throw new BusinessError('Payment done by user is not same as total order amount', 'ERR_PAYMENT_MISMATCH');
		}
		const updatedOrder: IOrder = {
			...existingOrder,
			...Object.fromEntries(Object.entries(updatedFields).filter(([_, value]) => value !== undefined)),
			updated: user,
		};
		const savedOrder = await this.save(updatedOrder);
		// await audit(existingOrder._id!, 'order', 'update', 'order', reason, user, savedOrder!, existingOrder);
	}
	public async updateStatus(id: string, reason: string, user: IUser, status: OrderStatus): Promise<void> {
		await this.patch(id, user, reason, { status });
	}
	public async updatePaymentDetails(id: string, user: IUser, payment: IOrder['payment']): Promise<void> {
		await this.patch(id, user, 'Payment Details Updated', { payment });
	}
	public async getByRzpOrderId(rzp_order_id: string): Promise<IOrder> {
		const order = await Order.findOne({ 'payment.rzp_id': rzp_order_id }).lean();
		if (!order) {
			throw new BusinessError('Order not found', 'ERR_ORDER_NOT_FOUND');
		}
		return order;
	}
	public async verifyPaymentSignature(
		razorpayPaymentId: string,
		razorpayOrderId: string,
		razorpaySignature: string,
	): Promise<boolean> {
		if (!RAZORPAY_KEY_SECRET) throw new Error('Razorpay keys not found. Please configure in env file');

		const data = razorpayOrderId + '|' + razorpayPaymentId;
		const generated_signature = this.generateHmacSha256(data, RAZORPAY_KEY_SECRET);
		if (generated_signature !== razorpaySignature) {
			// throw new BusinessError('Invalid razorpay signature', 'ERR_INVALID_RZP_SIGNATURE');
			return false;
		}
		return true;
	}

	public async verifyPayment(razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string) {
		const isValidSignature = await this.verifyPaymentSignature(razorpayPaymentId, razorpayOrderId, razorpaySignature);
		await this._paymentService.storeVerifyPaymentResponse(razorpayPaymentId, razorpayOrderId, razorpaySignature);
		const order = await this.getByRzpOrderId(razorpayOrderId);
		order.payment.status = OrderPaymentStatus.ATTEMPTED;
		return { isValidSignature, order_id: order._id };
	}

	public async rzpWebhook(data: RazorpayWebhookPayload) {
		const order = await this.getByRzpOrderId(data.payload.payment.entity.order_id);
		console.log('webhook clicked');
		let paymentStatus = OrderPaymentStatus.PEND;
		let paymentMethod;
		if (data.payload.payment.entity.status === 'captured') {
			paymentStatus = OrderPaymentStatus.PAID;
			order.orderHistory.push({
				status: OrderStatus.PAID,
				timestamp: new Date(),
			});
			order.status = OrderStatus.PAID;

			if (data.payload.payment.entity.method === 'card') {
				paymentMethod = PaymentMethod.CARD;
			} else if (data.payload.payment.entity.method === 'upi') {
				paymentMethod = PaymentMethod.UPI;
			} else if (data.payload.payment.entity.method === 'wallet') {
				paymentMethod = PaymentMethod.WALLET;
			} else if (data.payload.payment.entity.method === 'netbanking') {
				paymentMethod = PaymentMethod.NETBANKING;
			}
		} else if (data.payload.payment.entity.status === 'failed') {
			paymentStatus = OrderPaymentStatus.FAILED;
		}

		order.payment = {
			...order.payment,
			method: paymentMethod,
			status: paymentStatus,
		};
		await this.save(order);
		await this._paymentService.rzpPaymentWebhook(data);
	}
}
