import { BusinessError } from '../common/packages/common-errors/common-errors';
import Order from '../model/order';
import IOrder, { IOrderWithMeta, OrderPaymentStatus, OrderStatus } from '../common/type/order';
import dbutils from '../common/packages/db-utils';
import PaymentService from './payment-service';
import { getOrderFromRzp } from '../adapter/razorpay-adapter';

export default class OrderService {
	private _paymentService = new PaymentService();

	private async save(orderInput: IOrder, isNew: boolean = false): Promise<IOrder> {
		const order = new Order(orderInput);
		order.isNew = isNew;
		return (await order.save()).toObject();
	}
	public async getById(id: string): Promise<IOrder> {
		const order: IOrder | null = await Order.findById(id).lean();
		if (!order) throw new BusinessError('Order does not exist ', 'ERR_ORDER_NOT_FOUND');
		return order;
	}
	public async getByRzpOrderId(rzp_order_id: string): Promise<IOrder> {
		const order = await Order.findOne({ 'payment.rzp_id': rzp_order_id }).lean();
		if (!order) {
			throw new BusinessError('Order not found', 'ERR_ORDER_NOT_FOUND');
		}
		return order;
	}

	public async get(filters: any, pagination: any, sort: string): Promise<IOrderWithMeta> {
		// get all orders for only the logged in customer
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
	private validateOrderStatusTransition(status: OrderStatus, order_status: OrderStatus) {
		switch (order_status) {
			case OrderStatus.PAID:
				if (status !== OrderStatus.CANCEL && status !== OrderStatus.PROCCESS) {
					throw new BusinessError("Paid order can be updated to 'process' or 'cancel'", 'ERR_INVALID_STATUS');
				}
				break;
			case OrderStatus.PROCCESS:
				if (status !== OrderStatus.SHIP && status !== OrderStatus.CANCEL) {
					throw new BusinessError("order in 'process' can be updated to 'ship' or 'cancel'", 'ERR_INVALID_STATUS');
				}
				break;
			case OrderStatus.SHIP:
				if (status !== OrderStatus.DEL && status !== OrderStatus.CANCEL) {
					throw new BusinessError("order in 'ship' can be updated to 'del' or 'cancel'", 'ERR_INVALID_STATUS');
				}
				break;
			case OrderStatus.DEL:
				if (status !== OrderStatus.DEL && status !== OrderStatus.RETURN) {
					throw new BusinessError("order in 'del' can be updated to 'delivered' or 'return'", 'ERR_INVALID_STATUS');
				}
				break;
			case OrderStatus.CANCEL:
				throw new BusinessError('order has already been cancelled', 'ERR_INVALID_STATUS');
		}
	}
	public async patchStatus(orderId: string, status: OrderStatus) {
		// TODO
		const order = await this.getById(orderId);
		// this.validateOrderStatusTransition(status, order.status);
		console.log('statuss of order and sttus recieved', status, order.status);

		if (status === OrderStatus.CANCEL) await this.initiateCancel(orderId);
		else if (status === OrderStatus.RETURN) await this.initiateReturn(orderId);
		else {
			order.status = status;
			order.orderHistory.push({
				status: status,
				timestamp: new Date(),
			});
			await this.save(order);
		}
	}

	public async refreshPaymentStatus(orderId: string) {
		// TODO
		const order = await this.getById(orderId);
		const rzpOrder = await getOrderFromRzp(order.payment.rzp_id!);

		if (order.payment.status === OrderPaymentStatus.PEND && rzpOrder.status === 'paid') {
			order.payment.status = OrderPaymentStatus.PAID;
			order.status = OrderStatus.PAID;
			order.orderHistory.push({
				status: OrderStatus.PAID,
				timestamp: new Date(),
			});
		}

		// const payment = await getPaymentFromRzp(order.payment.rzp_id!);
		await this.save(order);
	}

	public async initiateReturn(orderId: string) {
		// TODO
		const order = await this.getById(orderId);
		if (order.payment.status !== OrderPaymentStatus.PAID)
			throw new BusinessError('Only Paid order can be asked for refund', 'ERR_ORDER_NOT_PAID');
		if (order.status !== OrderStatus.DEL) {
			throw new BusinessError('Only delivered order can be asked for return ', 'ERR_INVALID_STATUS');
		}
		if (order.payment.status === OrderPaymentStatus.PAID) {
			order.payment.status = OrderPaymentStatus.REFUND;
			await this._paymentService.initiateRefund(order.payment.rzp_id!);
		}
		order.status = OrderStatus.RETURN;
		order.orderHistory.push({
			status: OrderStatus.RETURN,
			timestamp: new Date(),
		});
		await this.save(order);
	}

	public async initiateCancel(orderId: string) {
		// TODO
		const order = await this.getById(orderId);
		if (order.status === OrderStatus.CANCEL || order.status === OrderStatus.DEL)
			throw new BusinessError('Either order has already been cancelled OR Delivered', 'ERR_INVALID_STATUS');
		order.status = OrderStatus.CANCEL;
		order.orderHistory.push({
			status: OrderStatus.CANCEL,
			timestamp: new Date(),
		});
		if (order.payment.status === OrderPaymentStatus.PAID) {
			order.payment.status = OrderPaymentStatus.REFUND;
			await this._paymentService.initiateRefund(order.payment.rzp_id!);
		} // Refund initiated
		await this.save(order);
	}
}
