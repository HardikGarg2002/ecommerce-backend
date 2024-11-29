import { IFieldAttributes } from '../packages/utils/common-validator';
import { Currency, OrderStatus, PaymentMethod, OrderPaymentStatus } from '../type/order';

export default class OrderAttributes {
	static orderId: IFieldAttributes = {
		fieldName: 'orderId',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Order Id can only be alphabets, only 24 characters long',
	};
	static type: IFieldAttributes = {
		fieldName: 'type',
		type: 'enum',
		enumValues: ['asc', 'desc'],
		message: 'Order type can only be asc or desc',
	};
	static productId: IFieldAttributes = {
		fieldName: 'productId',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Product Id can only be alphabets, only 24 characters long',
	};
	static customerId: IFieldAttributes = {
		fieldName: 'customerId',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Customer Id can only be alphabets, only 24 characters long',
	};
	static orderCurrency: IFieldAttributes = {
		fieldName: 'currency',
		type: 'enum',
		enumValues: Object.values(Currency),
		message: `Currency can only includes ${Object.values(Currency)}`,
	};
	static orderPaymentStatus: IFieldAttributes = {
		fieldName: 'orderPaymentStatus',
		type: 'enum',
		enumValues: Object.values(OrderPaymentStatus),
		message: `Payment Status can only includes ${Object.values(OrderPaymentStatus)}`,
	};
	static paymentMethod: IFieldAttributes = {
		fieldName: 'paymentMethod',
		type: 'enum',
		enumValues: Object.values(PaymentMethod),
		message: `Payment Method can only includes ${Object.values(PaymentMethod)}`,
	};
	static orderStatus: IFieldAttributes = {
		fieldName: 'orderStatus',
		type: 'enum',
		enumValues: Object.values(OrderStatus),
		message: `Order Status can only includes ${Object.values(OrderStatus)}`,
	};
	static quantity: IFieldAttributes = {
		fieldName: 'quantity',
		type: 'number',
		minValue: 0,
		message: 'Quantity should be a non-negative number',
	};
	static taxAmount: IFieldAttributes = {
		fieldName: 'taxAmount',
		type: 'number',
		minValue: 0,
		message: 'TaxAmount should be a non-negative number',
	};
	static subtotal: IFieldAttributes = {
		fieldName: 'product subtotal',
		type: 'number',
		minValue: 0,
		message: 'Subtotal of product should be a non-negative number',
	};
	static totalOrderAmount: IFieldAttributes = {
		fieldName: 'totalOrderAmount',
		type: 'number',
		minValue: 0,
		message: 'TotalOrderAmount should be a non-negative number',
	};
	static totalSpAmount: IFieldAttributes = {
		fieldName: 'totalSpAmount',
		type: 'number',
		minValue: 0,
		message: 'TotalSpAmount should be a non-negative number',
	};
	static totalTaxAmount: IFieldAttributes = {
		fieldName: 'totalTaxAmount',
		type: 'number',
		minValue: 0,
		message: 'TotalTaxAmount should be a non-negative number',
	};
	static handlingCost: IFieldAttributes = {
		fieldName: 'handlingCost',
		type: 'number',
		minValue: 0,
		message: 'HandlingCost should be a non-negative number',
	};
	static deliveryCharges: IFieldAttributes = {
		fieldName: 'deliveryCharges',
		type: 'number',
		minValue: 0,
		message: 'DeliveryCharges should be a non-negative number',
	};
	static discountAmount: IFieldAttributes = {
		fieldName: 'discountAmount',

		type: 'number',
		minValue: 0,
		message: 'DiscountAmount should be a non-negative number',
	};
	static discountCode: IFieldAttributes = {
		fieldName: 'discountCode',
		type: 'string',
		regex: /^[a-zA-Z0-9]{0,24}$/i,
		minLength: 0,
		maxLength: 24,
		message: 'DiscountCode can only be alphabets, numbers and only 24 characters long',
	};
	static paymentAmount: IFieldAttributes = {
		fieldName: 'paymentAmount',
		type: 'number',
		minValue: 0,
		message: 'PaymentAmount should be a non-negative number',
	};
	static paymentCurrency: IFieldAttributes = {
		fieldName: 'paymentCurrency',
		type: 'enum',
		enumValues: Object.values(Currency),
		message: `Payment Currency can only includes ${Object.values(Currency)}`,
	};
	static paymentTransactionId: IFieldAttributes = {
		fieldName: 'paymentTransactionId',
		type: 'string',
		regex: /^[a-zA-Z0-9]{0,24}$/i,
		minLength: 0,
		maxLength: 24,
		message: 'PaymentTransactionId can only be alphabets, numbers and only 24 characters long',
	};
	static orderNotes: IFieldAttributes = {
		fieldName: 'orderNotes',
		type: 'string',
		regex: /^[^<>]{5,500}$/,
		minLength: 5,
		maxLength: 500,
		message: `Order Notes can be alphanumeric and contain ( .,'@&:-) these special characters with  Max and Min length of 500 and 5 respectively`,
	};
}
