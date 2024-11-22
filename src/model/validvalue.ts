import mongoose, { Schema } from 'mongoose';
import { IValidvalue } from '../common/type/validvalue';

const validvalueSchema = new Schema<IValidvalue>({
  type: {
    type: String,
    required: true,
    immutable: true,
    uppercase: true,
    trim: true,
    index: true,
  },

  label: {
    type: String,
    required: true,
    trim: true,
  },

  values: [
    {
      key: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        index: true,
      },
      label: {
        type: String,
        required: true,
        trim: true,
      },
      sort: {
        type: Number,
        default: 100,
      },
      is_active: {
        type: Boolean,
        default: true,
      },
    },
  ],

  created_by: { type: String, required: true },
  updated_by: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const ValidValues = mongoose.model<IValidvalue>('validvalues', validvalueSchema);

export default ValidValues;
