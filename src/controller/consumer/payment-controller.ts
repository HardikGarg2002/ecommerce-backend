import { CommonValidator, ValidationErrors } from '../../common/packages/utils';
import PaymentService from '../../service/consumer/payment-service';

export default class PaymentController {
	private _paymentService = new PaymentService();
	async getById(id: string) {
		const errors = new ValidationErrors();
		CommonValidator.stringValidator(
			id,
			{
				fieldName: 'paymentId',
				type: 'string',
				regex: /^[a-f\d]{24}$/i,
				minLength: 24,
				maxLength: 24,
				message: 'Payment Id can only be alphabets, only 24 characters long',
			},
			errors,
		);
		CommonValidator.checkAndThrowError(errors);
		return await this._paymentService.getById(id);
	}
	async getByRzpId(rzpId: string) {
		return await this._paymentService.getByRzpId(rzpId);
	}
}
