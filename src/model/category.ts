import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../common/type/category';
import { CommonUtils } from '../common/packages/utils';

const categorySchema = new Schema<ICategory>({
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true,
	},

	desc: {
		type: String,
		required: true,
		trim: true,
	},

	code: {
		type: String,
		uppercase: true,
		trim: true,
		unique: true,
		index: true,
		immutable: true,
	},

	is_active: {
		type: Boolean,
		default: true,
	},

	img_url: {
		type: String,
		required: true,
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
			default: Date.now,
			immutable: true,
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
	},
});
categorySchema.pre(['save'], function () {
	this.name = CommonUtils.capitalInit(this.name);
	this.sort = Math.floor(this.sort);
});

const Category = mongoose.model<ICategory>('categories', categorySchema);

export default Category;
