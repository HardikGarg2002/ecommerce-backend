import mongoose from 'mongoose';
import IProduct from '../common/type/product';
import { BusinessError } from '../common/packages/common-errors/common-errors';

const productSchema = new mongoose.Schema<IProduct>({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	desc: {
		type: String,
		required: true,
		trim: true,
	},
	sku: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	sort: {
		type: Number,
		default: 10,
	},
	is_active: {
		type: Boolean,
		default: true,
	},
	offer: {
		type: Boolean,
		default: false,
	},
	oos: {
		type: Boolean,
		default: false,
	},
	unit: {
		quantity: {
			type: Number,
		},
		measure: {
			type: String,
			trim: true,
		},
	},
	images: {
		primary: {
			type: String,
			trim: true,
		},
		additional: [
			{
				type: String,
				trim: true,
				default: [],
			},
		],
	},
	features: {
		type: [
			{
				code: {
					type: String,
					trim: true,
					uppercase: true,
				},
				value: {
					type: String,
					trim: true,
				},
				sort: {
					type: Number,
				},
			},
		],
		default: [], // Set the default features to an empty array
	},
	category_code: {
		type: String,
		required: true,
		trim: true,
		uppercase: true,
	},
	subcategory_code: {
		type: String,
		required: true,
		trim: true,
		uppercase: true,
	},
	relatedproducts: {
		type: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'products',
			},
		],
	},
	variant_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'variants',
	},
	tags: {
		type: [
			{
				id: {
					type: Number,
					ref: 'tags',
				},
				slug: {
					type: String,
					trim: true,
				},
			},
		],
		default: [],
	},
	aliases: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'aliases',
		},
	],
	hsn_code: {
		type: String,
		required: true,
	},
	// packaging: {
	// 	type: String,
	// },
	// brand: {
	// 	type: String,
	// 	minlength: 3,
	// 	maxlength: 20,
	// 	match: /^[a-zA-Z .-]+$/,
	// },
	prices: {
		mrp: {
			type: Number,
			required: true,
		},
		pbt: {
			type: Number,
			required: true,
		},
		taxpct: {
			type: Number,
			required: true,
		},
		sp: {
			type: Number,
		},
	},
	created: {
		_id: {
			type: String,
			immutable: true,
		},
		name: {
			type: String,
			immutable: true,
		},
		date: {
			type: Date,
			immutable: true,
			default: Date.now,
		},
	},

	updated: {
		_id: {
			type: String,
		},
		name: {
			type: String,
		},
		date: {
			type: Date,
			default: Date.now,
		},
	},
});

productSchema.pre(['save'], function (next) {
	// this.name = CommonUtils.capitalInit(this.name);
	this.prices.sp = Math.round((1 + this.prices.taxpct / 100) * this.prices.pbt);
	this.prices.mrp = parseFloat(this.prices.mrp.toFixed(2));
	this.prices.pbt = parseFloat(this.prices.pbt.toFixed(2));
	this.prices.taxpct = Math.round(this.prices.taxpct);

	if (this.prices.sp > this.prices.mrp) {
		return next(new BusinessError('Selling Price exceeded MRP', 'INVALID_PRICE_DETAILS'));
	}
	next();
});

const Product = mongoose.model<IProduct>('products', productSchema);

export default Product;
