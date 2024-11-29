import { IValidateFieldInput } from '../common/packages/utils/common-validator';
import { IHsn, IHsnWithMeta } from '../common/type/hsn';
import HsnService from '../service/hsn-service';
import HsnAttributes from '../common/constant/hsn';
import { CommonValidator, ValidationErrors } from '../common/packages/utils';
import { IUser } from '../common/type/user';

export default class HsnController {
	private _hsnService = new HsnService();

	public get = async (filters: any, pagination: any, sort: string): Promise<IHsnWithMeta> => {
		return await this._hsnService.get(filters, pagination, sort);
	};

	public getById = async (id: string): Promise<IHsn> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: id, attributes: HsnAttributes.id });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._hsnService.getById(id?.trim());
	};

	public search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<IHsnWithMeta> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: searchText, attributes: HsnAttributes.searchText });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._hsnService.search(filters, pagination, sort, searchText.trim());
	};

	public create = async (hsnInput: IHsn): Promise<string> => {
		const validateInputs: IValidateFieldInput[] = [];

		validateInputs.push({ value: hsnInput.code, attributes: HsnAttributes.code });
		validateInputs.push({ value: hsnInput.desc, attributes: HsnAttributes.desc });
		validateInputs.push({ value: hsnInput.gst, attributes: HsnAttributes.gst });
		CommonValidator.validateAndThrowError(validateInputs);

		hsnInput.code = hsnInput.code.trim();

		return await this._hsnService.create(hsnInput);
	};
	public patch = async (
		id: string,
		user: IUser,
		reason: string,
		code?: string,
		desc?: string,
		gst?: number,
	): Promise<void> => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [
			{ value: code, attributes: HsnAttributes.code },
			{ value: desc, attributes: HsnAttributes.desc },
			{ value: gst, attributes: HsnAttributes.gst },
		].filter((field) => field.value !== undefined);

		inputFields.push({ value: reason, attributes: HsnAttributes.reason });
		inputFields.push({ value: id, attributes: HsnAttributes.id });

		const errors: ValidationErrors = CommonValidator.validateAndReturnErrors(inputFields);
		if (inputFields.length === 2) {
			errors.addError('Field', 'At least one field must be provided for update', 'ERR_FIELD_REQUIRED');
		}

		CommonValidator.checkAndThrowError(errors);

		await this._hsnService.patch(id, user, reason, code?.trim(), desc?.trim(), gst);
	};
	public activate = async (id: string, user: IUser, reason: string, is_active: boolean): Promise<void> => {
		const validateInputs: IValidateFieldInput[] = [];
		validateInputs.push({ value: id, attributes: HsnAttributes.id });
		validateInputs.push({ value: reason, attributes: HsnAttributes.reason });
		validateInputs.push({ value: is_active, attributes: HsnAttributes.active });
		CommonValidator.validateAndThrowError(validateInputs);
		await this._hsnService.activate(id, user, reason, is_active);
	};
}
