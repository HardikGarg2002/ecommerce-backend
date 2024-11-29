import mongoose from 'mongoose';
import { IPagination } from './pagination';

export enum CustomerStatus {
	ACTIVE = 'ACTIVE',
	BLACKLISTED = 'BLACKLISTED',
}

export enum AddressType {
	HOME = 'HOME',
	WORK = 'WORK',
	HOTEL = 'HOTEL',
	OTHER = 'OTHER',
}

export interface IAddress {
	_id?: any;
	name: string;
	contact_phone: string;
	address_type: AddressType;
	other_address_type?: string;
	address: string;
	landmark?: string;
	locality: string;
	city: string;
	state: string;
	country: string;
	pincode: string;
	created_at?: Date;
	updated_at?: Date;
}

export default interface ICustomer {
	_id?: string;
	auth_id: string;
	name: string;
	mobile: string;
	email?: string;
	address?: IAddress[];
	creation_date?: Date;

	status?: CustomerStatus;
}

export interface ICustomerWithMeta {
	data: ICustomer[];
	meta: {
		pagination: IPagination;
	};
}
