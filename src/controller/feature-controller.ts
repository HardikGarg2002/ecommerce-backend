import FeatureAttributes from '../common/constant/feature';
import FeatureService from '../service/feature-service';
import { IFeature, IFeatureWithMeta } from '../common/type/feature';
import { IUser } from '../common/type/user';
import { CommonValidator, ValidationErrors } from '../common/packages/utils';
import ValidvalueService from '../service/validvalue-service';

export default class FeatureController {
	private _featureService = new FeatureService();
	private _validvalueService = new ValidvalueService();

	public get = async (filters: any, pagination: any, sort: string) => {
		return await this._featureService.get(filters, pagination, sort);
	};

	public getById = async (id: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: FeatureAttributes.featureId });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._featureService.getById(id.trim());
	};

	public search = async (
		filters: any,
		pagination: any,
		sort: string,
		searchText: string,
	): Promise<IFeatureWithMeta> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: searchText, attributes: FeatureAttributes.searchText });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._featureService.search(filters, pagination, sort, searchText.trim());
	};

	public create = async (featureInput: IFeature) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: featureInput.name, attributes: FeatureAttributes.name });
		inputFields.push({ value: featureInput.desc, attributes: FeatureAttributes.desc });
		inputFields.push({ value: featureInput.code, attributes: FeatureAttributes.code });
		/// validate the type from the validvalue value key of type feature
		await this._validvalueService.getValue('feature', featureInput.type);
		inputFields.push({ value: featureInput.sort, attributes: FeatureAttributes.sort });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._featureService.create(featureInput);
	};

	public patch = async (user: IUser, id: string, reason: string, name?: string, desc?: string, sort?: number) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [
			{ value: name, attributes: FeatureAttributes.name },
			{ value: desc, attributes: FeatureAttributes.desc },
			{ value: sort, attributes: FeatureAttributes.sort },
		].filter((field) => field.value !== undefined);

		inputFields.push({ value: reason, attributes: FeatureAttributes.reason });
		inputFields.push({ value: id, attributes: FeatureAttributes.featureId });

		const errors: ValidationErrors = CommonValidator.validateAndReturnErrors(inputFields);
		if (inputFields.length === 2) {
			errors.addError('Field', 'At least one field must be provided for update', 'ERR_FIELD_REQUIRED');
		}

		CommonValidator.checkAndThrowError(errors);

		return await this._featureService.patch(user, id.trim(), reason.trim(), name?.trim(), desc?.trim(), sort);
	};

	public remove = async (user: IUser, id: string, reason: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: FeatureAttributes.featureId });
		inputFields.push({ value: reason, attributes: FeatureAttributes.reason });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._featureService.remove(user, id.trim(), reason.trim());
	};
}
