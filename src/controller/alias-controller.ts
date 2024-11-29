import AliasAttributes from '../common/constant/alias';
import AliasService from '../service/alias-service';
import { IAlias, IAliasWithMeta } from '../common/type/alias';
import { IUser } from '../common/type/user';
import { CommonValidator } from '../common/packages/utils';

export default class AliasController {
	private _aliasService = new AliasService();

	public create = async (aliasInput: IAlias) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: aliasInput.name, attributes: AliasAttributes.name });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._aliasService.create(aliasInput);
	};

	public get = async (filters: any, pagination: any, sort: string) => {
		const aliasesWithMeta: IAliasWithMeta = await this._aliasService.get(filters, pagination, sort);
		return aliasesWithMeta;
	};

	public getById = async (id: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: AliasAttributes.aliasId });

		CommonValidator.validateAndThrowError(inputFields);

		return await this._aliasService.getById(id.trim());
	};

	public search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<IAliasWithMeta> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: searchText, attributes: AliasAttributes.searchText });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._aliasService.search(filters, pagination, sort, searchText.trim());
	};

	public patch = async (id: string, reason: string, user: IUser, name: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];

		inputFields.push({ value: id, attributes: AliasAttributes.aliasId });
		inputFields.push({ value: name, attributes: AliasAttributes.name });
		inputFields.push({ value: reason, attributes: AliasAttributes.reason });

		CommonValidator.validateAndThrowError(inputFields);

		return await this._aliasService.patch(id.trim(), reason.trim(), user, name.trim());
	};

	public activate = async (id: string, reason: string, user: IUser, active: boolean) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: AliasAttributes.aliasId });
		inputFields.push({ value: reason, attributes: AliasAttributes.reason });
		inputFields.push({ value: active, attributes: AliasAttributes.active });

		CommonValidator.validateAndThrowError(inputFields);

		return await this._aliasService.activate(id.trim(), reason.trim(), user, active);
	};
}
