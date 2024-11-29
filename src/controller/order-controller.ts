import { CommonValidator } from '../common/packages/utils';
import OrderAttributes from '../common/constant/order';
import { OrderStatus } from '../common/type/order';
import OrderService from '../service/order-service';
import { IValidateFieldInput } from '../common/packages/utils/common-validator';

export default class OrderController {
	private _orderService = new OrderService();
	public async patchStatus(orderId: string, status: OrderStatus) {
		// TODO
		const validateInputs: IValidateFieldInput[] = [];
		validateInputs.push({ value: orderId, attributes: OrderAttributes.orderId });
		validateInputs.push({ value: status, attributes: OrderAttributes.orderStatus });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._orderService.patchStatus(orderId, status);
	}
	public async refreshPaymentStatus(orderId: string) {
		// TODO
		const validateInputs: IValidateFieldInput[] = [];
		validateInputs.push({ value: orderId, attributes: OrderAttributes.orderId });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._orderService.refreshPaymentStatus(orderId);
	}

	public async get(filters: any, pagination: any, sort: string) {
		// get all orders for only the logged in customer
		return await this._orderService.get(filters, pagination, sort);
	}

	public async getById(id: string) {
		// get orders for only the logged in customer
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: OrderAttributes.orderId });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._orderService.getById(id);
	}
}
