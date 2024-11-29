import ValidvalueAttributes from '../common/constant/validvalue';
import { CommonValidator } from '../common/packages/utils';
import { IUser } from '../common/type/user';
import { IValidvalue, IValue } from '../common/type/validvalue';
import ValidvalueService from '../service/validvalue-service';
// import { CommonValidator } from './packages/utils';

export default class ValidvalueController {
	_validvalueSerice = new ValidvalueService();

	public get = async (filters: any, pagination: any, sort: string) => {
		return await this._validvalueSerice.get(filters, pagination, sort);
	};

	public getByType = async (type: string, fetch?: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: type, attributes: ValidvalueAttributes.type });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._validvalueSerice.getByType(type.trim(), fetch?.trim());
	};

	public getValue = async (type: string, key: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: type, attributes: ValidvalueAttributes.type });
		inputFields.push({ value: key, attributes: ValidvalueAttributes.key });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._validvalueSerice.getValue(type.trim(), key.trim());
	};

	public create = async (vvInput: IValidvalue) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: vvInput.type, attributes: ValidvalueAttributes.type });
		inputFields.push({ value: vvInput.label, attributes: ValidvalueAttributes.label });
		vvInput.values && this._validateValues(vvInput.values, inputFields);
		CommonValidator.validateAndThrowError(inputFields);
		return await this._validvalueSerice.create(vvInput);
	};

	public patch = async (type: string, labelInput: string, reason: string, user: IUser) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: type, attributes: ValidvalueAttributes.type });
		inputFields.push({ value: labelInput, attributes: ValidvalueAttributes.label });
		inputFields.push({ value: reason, attributes: ValidvalueAttributes.reason });
		console.log(user);
		CommonValidator.validateAndThrowError(inputFields);
		return await this._validvalueSerice.patch(type.trim(), reason.trim(), user, labelInput.trim());
	};

	public addValues = async (type: string, values: IValue[], reason: string, user: IUser) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: type, attributes: ValidvalueAttributes.type });
		inputFields.push({ value: reason, attributes: ValidvalueAttributes.reason });
		this._validateValues(values, inputFields);
		CommonValidator.validateAndThrowError(inputFields);
		return await this._validvalueSerice.addValues(type.trim(), values, reason.trim(), user);
	};

	public patchValue = async (type: string, key: string, reason: string, user: IUser, label: string, sort: number) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: type, attributes: ValidvalueAttributes.type });
		label && inputFields.push({ value: label, attributes: ValidvalueAttributes.value });
		sort && inputFields.push({ value: sort, attributes: ValidvalueAttributes.sort });
		inputFields.push({ value: reason, attributes: ValidvalueAttributes.reason });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._validvalueSerice.patchValue(type.trim(), key.trim(), reason.trim(), user, label?.trim(), sort);
	};

	public activateValue = async (type: string, key: string, reason: string, user: IUser, active: boolean) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: type, attributes: ValidvalueAttributes.type });
		inputFields.push({ value: key, attributes: ValidvalueAttributes.key });
		inputFields.push({ value: active, attributes: ValidvalueAttributes.active });
		inputFields.push({ value: reason, attributes: ValidvalueAttributes.reason });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._validvalueSerice.activateValue(type.trim(), key.trim(), reason.trim(), user, active);
	};

	public removeValue = async (type: string, key: string, reason: string, user: IUser) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: type, attributes: ValidvalueAttributes.type });
		inputFields.push({ value: reason, attributes: ValidvalueAttributes.reason });
		inputFields.push({ value: key, attributes: ValidvalueAttributes.key });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._validvalueSerice.removeValue(type.trim(), key.trim(), reason, user);
	};

	protected _validateValues(values: IValue[], inputFields: CommonValidator.IValidateFieldInput[]) {
		values.forEach((value) => {
			const { key, label, sort } = value;
			inputFields.push({ value: key, attributes: ValidvalueAttributes.key });
			inputFields.push({ value: label, attributes: ValidvalueAttributes.value });
			sort && inputFields.push({ value: sort, attributes: ValidvalueAttributes.sort });
		});
	}
}
