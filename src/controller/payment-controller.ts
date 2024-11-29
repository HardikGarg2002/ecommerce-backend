import { CommonValidator } from '../common/packages/utils';
import OrderAttributes from '../common/constant/order';
import PaymentService from '../service/payment-service';
import { IValidateFieldInput } from '../common/packages/utils/common-validator';

export default class PaymentController {
	private _paymentService = new PaymentService();
	public async refreshStatus(orderId: string) {
		// TODO
		const validateInputs: IValidateFieldInput[] = [];
		validateInputs.push({ value: orderId, attributes: OrderAttributes.orderId });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._paymentService.refreshStatus(orderId);
	}
}
