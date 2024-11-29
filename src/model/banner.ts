import mongoose, { Schema } from 'mongoose';
import { IBanner, IBannerType } from '../common/type/banner';
import { CommonUtils } from '../common/packages/utils';

const bannerSchema = new Schema<IBanner>({
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		index: true,
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

	start_date: {
		type: Date,
		required: true,
	},

	end_date: {
		type: Date,
		required: true,
	},

	is_active: {
		type: Boolean,
		default: true,
	},

	sort: {
		type: Number,
		required: true,
	},

	img_url: {
		type: String,
		required: true,
		trim: true,
	},

	redirect_url: {
		type: String,
		required: true,
		trim: true,
	},

	location: {
		type: {
			type: String,
			enum: Object.values(IBannerType),
			required: true,
		},

		code: {
			type: String,
			uppercase: true,
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
});
bannerSchema.pre(['save'], function () {
	this.name = CommonUtils.capitalInit(this.name);
	this.sort = Math.floor(this.sort);
});

const Banner = mongoose.model<IBanner>('banners', bannerSchema);

export default Banner;
