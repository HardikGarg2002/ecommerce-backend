import mongoose from 'mongoose';
import { ISubcategory } from '../common/type/subcategory';
import { CommonUtils } from '../common/packages/utils';

const subcategorySchema = new mongoose.Schema<ISubcategory>({
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
	category_code: {
		type: String,
		uppercase: true,
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
		name: {
			type: String,
		},
		_id: {
			type: String,
		},
		date: {
			type: Date,
			default: Date.now,
		},
	},

	updated: {
		name: {
			type: String,
		},
		_id: {
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

subcategorySchema.pre('save', function () {
	this.name = CommonUtils.capitalInit(this.name);
	this.sort = Math.floor(this.sort);
});
const Subcategory = mongoose.model('subcategories', subcategorySchema);

export default Subcategory;
