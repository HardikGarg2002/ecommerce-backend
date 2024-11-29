import mongoose, { Schema } from 'mongoose';
import { IAlias } from '../common/type/alias';

const aliasSchema = new Schema<IAlias>({
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		lowercase: true,
	},

	is_active: {
		type: Boolean,
		default: true,
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

const Alias = mongoose.model<IAlias>('aliases', aliasSchema);

export default Alias;
