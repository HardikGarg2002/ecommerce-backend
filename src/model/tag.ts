import mongoose from 'mongoose';
import { ITag } from '../common/type/tag';

const tagSchema = new mongoose.Schema<ITag>({
	text: {
		type: String,
		required: true,
		unique: true,
	},
	slug: {
		type: String,
		required: true,
		unique: true,
	},
	is_active: {
		type: Boolean,
		default: true,
	},
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

export default mongoose.model<ITag>('tags', tagSchema);
