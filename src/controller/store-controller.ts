import { IStore, IStoreWithMeta } from '../common/type/store';
import StoreAttributes from '../common/constant/store';
import StoreService from '../service/store-service';
import { IUser } from '../common/type/user';
import ValidvalueService from '../service/validvalue-service';
import { CommonValidator } from '../common/packages/utils';

export default class StoreController {
	private _storeService = new StoreService();
	private _validvalueService = new ValidvalueService();

	public get = async (filters: any, pagination: any, sort: string): Promise<IStoreWithMeta> => {
		return await this._storeService.get(filters, pagination, sort);
	};

	public getById = async (storeId: string): Promise<IStore> => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: storeId, attributes: StoreAttributes.storeId });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._storeService.getById(storeId.trim());
	};

	public search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<IStoreWithMeta> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: searchText, attributes: StoreAttributes.searchText });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._storeService.search(filters, pagination, sort, searchText.trim());
	};

	public create = async (storeInput: IStore): Promise<string> => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: storeInput.name, attributes: StoreAttributes.name });
		inputFields.push({ value: storeInput.desc, attributes: StoreAttributes.desc });
		inputFields.push({ value: storeInput.code, attributes: StoreAttributes.code });
		inputFields.push({ value: storeInput.sort, attributes: StoreAttributes.sort });
		const errors = CommonValidator.validateAndReturnErrors(inputFields);
		const city = await this._validvalueService.getValue('city', storeInput.city_key);
		if (city.is_active === false) {
			errors.addError('city_key', 'City is inactive', 'ERR_CITY_INACTIVE');
		}
		CommonValidator.checkAndThrowError(errors);
		return await this._storeService.create(storeInput);
	};

	public patch = async (
		storeId: string,
		user: IUser,
		reason: string,
		name?: string,
		desc?: string,
		city_key?: string,
		sort?: number,
	) => {
		// Validate city key if it comes
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: reason, attributes: StoreAttributes.reason });
		inputFields.push({ value: storeId, attributes: StoreAttributes.storeId });
		name && inputFields.push({ value: name, attributes: StoreAttributes.name });
		desc && inputFields.push({ value: desc, attributes: StoreAttributes.desc });
		sort && inputFields.push({ value: sort, attributes: StoreAttributes.sort });
		const errors = CommonValidator.validateAndReturnErrors(inputFields);
		if (city_key) {
			const city = await this._validvalueService.getValue('city', city_key);
			if (city.is_active === false) {
				errors.addError('city_key', 'City is inactive', 'ERR_CITY_INACTIVE');
			}
		}

		CommonValidator.validateAndThrowError(inputFields);

		return await this._storeService.patch(
			storeId.trim(),
			user,
			reason.trim(),
			name?.trim(),
			desc?.trim(),
			city_key?.trim(),
			sort,
		);
	};

	public activate = async (storeId: string, user: IUser, reason: string, is_active: boolean) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: storeId, attributes: StoreAttributes.storeId });
		inputFields.push({ value: reason, attributes: StoreAttributes.reason });
		inputFields.push({ value: is_active, attributes: StoreAttributes.active });

		CommonValidator.validateAndThrowError(inputFields);
		return await this._storeService.activate(storeId.trim(), user, reason.trim(), is_active);
	};
}
