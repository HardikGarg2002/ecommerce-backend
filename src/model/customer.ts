import mongoose from 'mongoose';
import ICustomer, { AddressType, CustomerStatus } from '../common/type/customer';

const addressSchema = new mongoose.Schema({
	_id: { type: mongoose.Schema.Types.ObjectId },
	name: { type: String },
	contact_phone: { type: String },
	address_type: { type: String, enum: AddressType },
	other_address_type: { type: String },
	address: { type: String },
	landmark: { type: String },
	locality: { type: String },
	city: { type: String },
	state: { type: String },
	country: { type: String },
	pincode: { type: String },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

const customerSchema = new mongoose.Schema<ICustomer>({
	_id: { type: mongoose.Schema.Types.ObjectId },
	auth_id: { type: String, required: true, unique: true },
	name: { type: String, trim: true },
	mobile: { type: String, unique: true, required: true },
	email: { type: String },
	address: [addressSchema],
	status: { type: String, enum: CustomerStatus, default: CustomerStatus.ACTIVE },
	creation_date: { type: Date, default: Date.now },
});

const Customer = mongoose.model<ICustomer>('Customers', customerSchema);

export default Customer;
