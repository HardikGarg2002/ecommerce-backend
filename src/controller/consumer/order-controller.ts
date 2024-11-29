import IOrder, { OrderStatus, OrderProduct } from '../../common/type/order';
import OrderAttributes from '../../common/constant/order';
import { CommonValidator, ValidationErrors } from '../../common/packages/utils';
import OrderService from '../../service/consumer/order-service';
import ProductService from '../../service/consumer/product-service';
import CustomerService from '../../service/customer-service';
import { IUser } from '../../common/type/user';
import { RazorpayWebhookPayload } from '../../common/type/webhook/rzp';

export default class OrderController {
	private _orderService = new OrderService();
	private _productService = new ProductService();
	private _customerService = new CustomerService();

	private validateDiscounts(
		discounts: IOrder['discounts'],
		total_order_amount: number,
		validateInputs: CommonValidator.IValidateFieldInput[],
		errors: ValidationErrors,
	) {
		if (discounts.code || discounts.amount) {
			validateInputs.push({ value: discounts.code, attributes: OrderAttributes.discountCode });
			validateInputs.push({ value: discounts.amount, attributes: OrderAttributes.discountAmount });
		}
		if (discounts.amount && discounts.amount > total_order_amount) {
			errors.addError(
				'Discount Amount',
				'Discount amount cannot be greater than total order amount',
				'ERR_DISCOUNT_EXCEEDS_TOTAL_ORDER_AMOUNT',
			);
		}
	}
	private async enrichAndvalidateProducts(products: OrderProduct[]) {
		const updatedProducts: OrderProduct[] = await Promise.all(
			products.map(async (orderProduct: OrderProduct) => {
				return await this._productService.enrichAndValidateOrderProduct(orderProduct);
			}),
		);

		return updatedProducts;
	}
	private validateProductDetails(
		products: IOrder['products'],
		errors: ValidationErrors,
		validateInputs: CommonValidator.IValidateFieldInput[],
	) {
		products.length === 0 && errors.addError('Product', 'Products in Order cannot be empty', 'ERR_PRODUCT_IS_EMPTY');
		products.map((orderProduct: OrderProduct) => {
			validateInputs.push({ value: orderProduct.product_id, attributes: OrderAttributes.productId });
			validateInputs.push({ value: orderProduct.quantity, attributes: OrderAttributes.quantity });
			validateInputs.push({ value: orderProduct.tax_amount, attributes: OrderAttributes.taxAmount });
			validateInputs.push({ value: orderProduct.subtotal, attributes: OrderAttributes.subtotal });
		});
	}
	// private validateShipping(
	// 	shipping: IOrder['shipping'],
	// 	errors: ValidationErrors,
	// 	validateInputs: CommonValidator.IValidateFieldInput[],
	// ) {
	// Check if shipping address is available in customer address book and is not blacklisted
	// 	shipping.name && validateInputs.push({ value: shipping.name, attributes: OrderAttributes.shippingName });
	// 	shipping.address && validateInputs.push({ value: shipping.address, attributes: OrderAttributes.shippingAddress });
	// 	shipping.tracking_no &&
	// 		validateInputs.push({ value: shipping.tracking_no, attributes: OrderAttributes.trackingNo });
	// }
	private validatePayment(payment: IOrder['payment'], validateInputs: CommonValidator.IValidateFieldInput[]) {
		validateInputs.push({ value: payment.amount, attributes: OrderAttributes.paymentAmount });
		validateInputs.push({ value: payment.currency, attributes: OrderAttributes.paymentCurrency });
		validateInputs.push({ value: payment.method, attributes: OrderAttributes.paymentMethod });
		validateInputs.push({ value: payment.transaction_id, attributes: OrderAttributes.paymentTransactionId });
		validateInputs.push({ value: payment.status, attributes: OrderAttributes.orderPaymentStatus });
		// !compareAmountsWithTolerance(payment.amount, totalOrderAmount) &&
		// 	errors.addError(
		// 		'Payment Amount',
		// 		'Payment amount does not match with total order amount',
		// 		'ERR_PAYMENT_AMOUNT_MISMATCH',
		// 	);
	}

	private validateOtherCharges(
		other_charges: IOrder['other_charges'],
		errors: ValidationErrors,
		validateInputs: CommonValidator.IValidateFieldInput[],
	) {
		validateInputs.push({ value: other_charges.handling_cost ?? 0, attributes: OrderAttributes.handlingCost });
		validateInputs.push({
			value: other_charges.delivery_charges ?? 0,
			attributes: OrderAttributes.deliveryCharges,
		});
	}
	private validateTotals(
		total_order_amount: number,
		total_sp_amount: number,
		total_tax_amount: number,
		validateInputs: CommonValidator.IValidateFieldInput[],
	) {
		validateInputs.push({ value: total_order_amount, attributes: OrderAttributes.totalOrderAmount });
		validateInputs.push({ value: total_sp_amount, attributes: OrderAttributes.totalSpAmount });
		validateInputs.push({ value: total_tax_amount, attributes: OrderAttributes.totalTaxAmount });
	}

	private validateOrderDetails(order: IOrder) {
		const errors = new ValidationErrors();
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		// Order details validations
		validateInputs.push({ value: order.status?.toUpperCase(), attributes: OrderAttributes.orderStatus });
		// Total Pricing Validations
		this.validateTotals(order.total_order_amount, order.total_sp_amount, order.total_tax_amount, validateInputs);
		validateInputs.push({ value: order.currency, attributes: OrderAttributes.orderCurrency });

		// Other charges and discount validations
		order.other_charges && this.validateOtherCharges(order.other_charges, errors, validateInputs);
		order.discounts && this.validateDiscounts(order.discounts, order.total_order_amount, validateInputs, errors);
		order.orderNotes && validateInputs.push({ value: order.orderNotes, attributes: OrderAttributes.orderNotes });
		// this.validatePayment(order.payment, order.total_order_amount, errors, validateInputs);
		this.validateProductDetails(order.products, errors, validateInputs);
		CommonValidator.validateAndThrowError(validateInputs, errors);
	}

	public async create(order: IOrder) {
		this.validateOrderDetails(order);
		order.products = await this.enrichAndvalidateProducts(order.products);

		await this._customerService.validateCustomerInOrder(order.customer);
		return await this._orderService.create(order);
	}

	public async createPayment(order_id: string, user_id: string) {
		return await this._orderService.createPayment(order_id, user_id);
	}

	public async createCheckoutPayment(
		order_id: string,
		token: string,
		success_url: string,
		failure_url: string,
		user_id: string,
	) {
		return await this._orderService.createCheckoutPayment(order_id, token, success_url, failure_url, user_id);
	}
	public async get(user: IUser, filters: any, pagination: any, sort: string) {
		// get all orders for only the logged in customer
		return await this._orderService.get(user, filters, pagination, sort);
	}

	public async getCheckoutPayment(ckoSessionId: string, userId: string) {
		return await this._orderService.getCheckoutPayment(ckoSessionId, userId);
	}
	public async getById(id: string, userId: string) {
		// get orders for only the logged in customer
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: OrderAttributes.orderId });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._orderService.getById(id, userId);
	}
	public async updateStatus(orderId: string, reason: string, user: IUser, status: OrderStatus) {
		return await this._orderService.updateStatus(orderId, reason, user, status);
	}
	public async updatePaymentDetails(orderId: string, user: IUser, payment: IOrder['payment']) {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: orderId, attributes: OrderAttributes.orderId });
		this.validatePayment(payment, inputFields);
		CommonValidator.validateAndThrowError(inputFields);
		return await this._orderService.updatePaymentDetails(orderId, user, payment);
	}

	public async verifyPayment(razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string) {
		return await this._orderService.verifyPayment(razorpayPaymentId, razorpayOrderId, razorpaySignature);
	}

	public async rzpWebhook(data: RazorpayWebhookPayload) {
		await this._orderService.rzpWebhook(data);
	}
}
