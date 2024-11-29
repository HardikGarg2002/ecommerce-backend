import mongoose from 'mongoose';
import IOrder, { OrderStatus, Currency, OrderPaymentStatus, PaymentMethod, PaymentGateway } from '../common/type/order';

const orderSchema = new mongoose.Schema<IOrder>({
	customer: {
		_id: { type: String, required: true },
		mobile: { type: String, required: true },
		name: { type: String, required: true, trim: true },
	},
	order_date: { type: Date, default: Date.now },
	status: { type: String, enum: OrderStatus, default: OrderStatus.CREATED },
	total_order_amount: { type: Number, required: true },
	total_sp_amount: { type: Number, required: true },
	total_tax_amount: { type: Number, required: true },
	other_charges: {
		handling_cost: { type: Number, default: 0 },
		delivery_charges: { type: Number, default: 0 },
	},
	discounts: {
		code: { type: String },
		amount: { type: Number },
	},
	currency: { type: String, enum: Currency, default: Currency.INR },
	products: [
		{
			product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
			product_name: { type: String, required: true, trim: true },
			quantity: { type: Number, required: true },
			unit_sp: { type: Number, required: true },
			unit_mrp: { type: Number, required: true },
			img_url: { type: String, required: true },
			product_unit: {
				quantity: {
					type: Number,
				},
				measure: {
					type: String,
					trim: true,
				},
			},
			sku: { type: String, required: true },
			tax_amount: { type: Number, required: true },
			subtotal: { type: Number, required: true },
		},
	],
	shipping: {
		name: { type: String, required: true },
		address: { type: String, required: true },
		trackingNumber: { type: String },
	},
	payment: {
		payment_id: { type: String },
		rzp_id: { type: String },
		rzp_payment_id: { type: String },
		payment_gateway: { type: String, enum: PaymentGateway },
		amount: { type: Number },
		method: { type: String, enum: PaymentMethod },
		currency: { type: String, enum: Currency, default: Currency.INR },
		transaction_id: { type: String },
		status: { type: String, enum: OrderPaymentStatus, default: OrderPaymentStatus.PEND },
	},

	orderNotes: { type: String },
	orderHistory: [
		{
			timestamp: { type: Date, default: Date.now },
			status: { type: String, enum: OrderStatus, default: OrderStatus.CREATED },
		},
	],

	created: {
		_id: { type: String, immutable: true },
		name: { type: String, immutable: true },
		date: { type: Date, immutable: true, default: Date.now },
	},

	updated: {
		_id: { type: String },
		name: { type: String },
		date: { type: Date, default: Date.now },
	},
});
orderSchema.pre(['save'], function (next) {
	this.products.map((product) => {
		product.subtotal = Math.round(product.quantity * product.unit_sp);
	});
	this.total_mrp_amount = Math.round(this.total_mrp_amount);
	this.total_order_amount = Math.round(this.total_order_amount);
	this.total_sp_amount = Math.round(this.total_sp_amount);

	next();
});

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
