import Customer from '../model/customer';
import { BusinessError } from '../common/packages/common-errors/common-errors';
import dbutils from '../common/packages/db-utils';
import ICustomer, { CustomerStatus, IAddress, ICustomerWithMeta } from '../common/type/customer';
import { ObjectId } from 'mongodb';
import { CommonUtils } from '../common/packages/utils';
import mongoose from 'mongoose';

export default class CustomerService {
	private activeCriteria(criteria: any) {
		return { ...criteria, is_active: true };
	}
	public async save(customerInput: ICustomer, isNew: boolean = false): Promise<ICustomer> {
		const customer = new Customer(customerInput);
		customer.isNew = isNew;
		return (await customer.save()).toObject();
	}

	public async get(filters: any, pagination: any, sort: string): Promise<ICustomerWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const activeCriteria = this.activeCriteria(criteria);
		const customerList: ICustomer[] = await Customer.find(activeCriteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Customer.countDocuments(activeCriteria);
		const data: ICustomerWithMeta = {
			data: customerList,
			meta: {
				pagination: {
					page: skip / limit + 1,
					pageSize: limit,
					pageCount: Math.ceil(totalCount / limit),
					total: totalCount,
				},
			},
		};
		return data;
	}

	public async getById(id: string): Promise<ICustomer> {
		const customer = await Customer.findById(id).lean();
		if (!customer) {
			throw new BusinessError('Customer not found', 'ERR_NOT_FOUND');
		}
		return customer;
	}

	public async getByIds(ids: string[]): Promise<{ _id: string }[]> {
		return await Customer.find({ _id: { $in: ids } })
			.select('_id')
			.lean();
	}

	public search = async (
		filters: any,
		pagination: any,
		sort: string,
		searchText: string,
	): Promise<ICustomerWithMeta> => {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);

		const searchCriteria = {
			$or: [{ name: { $regex: searchText, $options: 'i' } }, { desc: { $regex: searchText, $options: 'i' } }],
		};

		const filterSearch = { ...criteria, ...searchCriteria, is_active: true };

		const customerList: ICustomer[] = await Customer.find(filterSearch)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCount = await Customer.countDocuments(filterSearch);

		const data: ICustomerWithMeta = {
			data: customerList,
			meta: {
				pagination: {
					page: skip / limit + 1,
					pageSize: limit,
					pageCount: Math.ceil(totalCount / limit),
					total: totalCount,
				},
			},
		};
		return data;
	};
	public async create(customer: ICustomer) {
		if (!customer._id) {
			customer._id = customer.auth_id;
		}
		const newCustomer = new Customer({
			_id: new ObjectId(customer._id),
			...customer,
		});
		return await newCustomer.save();
	}

	public async getByAuthId(id: string): Promise<ICustomer> {
		const customer = await Customer.findOne({ $or: [{ auth_id: id }, { _id: id }] }).lean();
		if (!customer) {
			throw new BusinessError('Customer not found', 'ERR_NOT_FOUND');
		}
		return customer;
	}

	public async addAddress(auth_id: string, newAddress: IAddress) {
		const customer = await this.getByAuthId(auth_id);
		newAddress._id = new mongoose.Types.ObjectId();
		customer.address = [...(customer.address ?? []), newAddress];
		await this.save(customer);
		return newAddress._id;
		// return await Customer.updateOne({ auth_id: auth_id }, { $push: { newAddress } });
	}

	public async editAddress(auth_id: string, addressId: string, address: Partial<IAddress>) {
		const customer = await this.getByAuthId(auth_id);
		const existingAddress = customer.address?.find((location) => location._id!.toString() === addressId);
		if (!existingAddress) {
			throw new BusinessError('Address not found', 'ERR_NOT_FOUND');
		}
		const upatedAddress: IAddress = {
			...existingAddress,
			name: address.name ?? existingAddress?.name,
			contact_phone: address.contact_phone ?? existingAddress?.contact_phone,
			address: address.address ?? existingAddress?.address,
			address_type: address.address_type ?? existingAddress?.address_type,
			landmark: address.landmark ?? existingAddress?.landmark,
			locality: address.locality ?? existingAddress?.locality,
			city: address.city ?? existingAddress?.city,
			state: address.state ?? existingAddress?.state,
			country: address.country ?? existingAddress?.country,
			pincode: address.pincode ?? existingAddress?.pincode,
			updated_at: new Date(),
		};
		const updatedCustomer = CommonUtils.clone(customer);
		updatedCustomer.address = updatedCustomer.address?.map((location: IAddress) => {
			if (location._id?.toString() === addressId.toString()) {
				location = upatedAddress;
			}
			return location;
		});
		await this.save(updatedCustomer);
	}

	public async removeAddress(auth_id: string, addressId: string) {
		return await Customer.updateOne({ auth_id: auth_id }, { $pull: { address: { _id: addressId } } });
	}
	public validateCustomerInOrder = async (customer: {
		_id: string;
		name: string;
		mobile: string;
	}): Promise<boolean> => {
		const existingCustomer = await this.getByAuthId(customer._id);
		if (!existingCustomer) {
			throw new BusinessError('Customer not found', 'ERR_NOT_FOUND');
		}
		if (existingCustomer.mobile !== customer.mobile) {
			throw new BusinessError('Customer details mismatch', 'ERR_MOBILE_MISMATCH');
		}
		if (existingCustomer.status === 'BLACKLISTED') {
			throw new BusinessError('Customer is blacklisted', 'ERR_NOT_FOUND');
		}
		if (existingCustomer.status !== CustomerStatus.ACTIVE) {
			throw new BusinessError('Customer status not active', 'ERR_NOT_ACTIVE');
		}
		return true;
	};
}
