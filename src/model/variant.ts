import mongoose from 'mongoose';
import { IVariant, IVariantType } from '../common/type/variant';

const variantSchema = new mongoose.Schema<IVariant>({
	// _id: mongoose.Schema.Types.ObjectId,
	type: {
		type: String,
		enum: Object.values(IVariantType),
		required: true,
		uppercase: true,
	},
	products: [
		{
			_id: {
				type: mongoose.Schema.Types.ObjectId,
				required: true,
				trim: true,
				ref: 'products',
			},
			value: { type: String, trim: true },
			quantity: Number,
			measure: { type: String, trim: true },
		},
	],
	created: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
		},
		name: {
			type: String,
		},
		date: {
			type: Date,
			default: Date.now,
			immutable: true,
		},
	},
	updated: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.model<IVariant>('variants', variantSchema);
