import CustomerService from '../../service/customer-service';
import ICustomer from '../../common/type/customer';

export default class CustomerController {
	customerService = new CustomerService();

	public async create(customer: ICustomer) {
		const newCustomer = await this.customerService.create(customer);
		return newCustomer;
	}

	public async getByAuthId(id: string): Promise<ICustomer> {
		const customer: ICustomer = await this.customerService.getByAuthId(id);
		return customer;
	}

	public async addAddress(auth_id: string, address: any) {
		return await this.customerService.addAddress(auth_id, address);
	}

	public async editAddress(auth_id: string, addressId: string, address: any) {
		return await this.customerService.editAddress(auth_id, addressId, address);
	}

	public async removeAddress(auth_id: string, addressId: string) {
		const updatedCustomer = await this.customerService.removeAddress(auth_id, addressId);
		return updatedCustomer;
	}
}
