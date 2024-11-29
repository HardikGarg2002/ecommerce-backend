import mongoose, { Schema } from 'mongoose';
import { IFeature } from '../common/type/feature';
import { CommonUtils } from '../common/packages/utils';

const featureSchema = new Schema<IFeature>({
	name: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},

	desc: {
		type: String,
		required: true,
		trim: true,
	},

	code: {
		type: String,
		index: true,
		uppercase: true,
		immutable: true,
		trim: true,
	},

	type: {
		type: String,
		uppercase: true,
		trim: true,
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

	sort: {
		type: Number,
		required: true,
		default: 100,
	},
});

featureSchema.pre('save', function () {
	this.name = CommonUtils.capitalInit(this.name);
});

const Feature = mongoose.model<IFeature>('features', featureSchema);

export default Feature;
