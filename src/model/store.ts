import mongoose, { Schema } from 'mongoose';
import { IStore } from '../common/type/store';
import { CommonUtils } from '../common/packages/utils';

const storeSchema = new Schema<IStore>({
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
	city_key: {
		type: String,
		uppercase: true,
	}, // code of the valid values value key //
	code: {
		type: String,
		uppercase: true,
		trim: true,
	},
	is_active: {
		type: Boolean,
		default: true,
	},

	created: {
		name: {
			type: String,
			immutable: true,
		},
		_id: {
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
storeSchema.pre(['save'], function () {
	this.name = CommonUtils.capitalInit(this.name);
	this.sort = Math.floor(this.sort);
});

const Store = mongoose.model<IStore>('stores', storeSchema);

export default Store;
