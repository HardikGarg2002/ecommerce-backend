import CategoryAttributes from '../common/constant/category';
import CategoryService from '../service/category-service';
import { ICategory, ICategoryWithMeta } from '../common/type/category';
import { IUser } from '../common/type/user';
import { CommonValidator, ValidationErrors } from '../common/packages/utils';
// import { CommonValidator, ValidationErrors } from '../common/packages/utils';

export default class CategoryController {
	private _categoryService = new CategoryService();

	public create = async (catInput: ICategory) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: catInput.name, attributes: CategoryAttributes.name });
		inputFields.push({ value: catInput.desc, attributes: CategoryAttributes.desc });
		inputFields.push({ value: catInput.sort, attributes: CategoryAttributes.sort });
		inputFields.push({ value: catInput.img_url, attributes: CategoryAttributes.imageURL });
		inputFields.push({ value: catInput.code, attributes: CategoryAttributes.code });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._categoryService.create(catInput);
	};

	public get = async (filters: any, pagination: any, sort: string) => {
		const categoriesWithMeta: ICategoryWithMeta = await this._categoryService.get(filters, pagination, sort);
		return categoriesWithMeta;
	};

	public getById = async (id: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: CategoryAttributes.categoryId });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._categoryService.getById(id.trim());
	};

	public search = async (
		filters: any,
		pagination: any,
		sort: string,
		searchText: string,
	): Promise<ICategoryWithMeta> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: searchText, attributes: CategoryAttributes.searchText });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._categoryService.search(filters, pagination, sort, searchText.trim());
	};

	public patch = async (
		id: string,
		reason: string,
		user: IUser,
		name?: string,
		desc?: string,
		img?: string,
		sort?: number,
	) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [
			{ value: name, attributes: CategoryAttributes.name },
			{ value: desc, attributes: CategoryAttributes.desc },
			{ value: img, attributes: CategoryAttributes.imageURL },
			{ value: sort, attributes: CategoryAttributes.sort },
		].filter((field) => field.value !== undefined);

		inputFields.push({ value: reason, attributes: CategoryAttributes.reason });
		inputFields.push({ value: id, attributes: CategoryAttributes.categoryId });

		const errors: ValidationErrors = CommonValidator.validateAndReturnErrors(inputFields);
		if (inputFields.length === 2) {
			errors.addError('Field', 'At least one field must be provided for update', 'ERR_FIELD_REQUIRED');
		}
		CommonValidator.checkAndThrowError(errors);

		return await this._categoryService.patch(
			id.trim(),
			reason.trim(),
			user,
			name?.trim(),
			desc?.trim(),
			img?.trim(),
			sort,
		);
	};
	public remove = async (id: string, reason: string, user: IUser) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: CategoryAttributes.categoryId });
		inputFields.push({ value: reason, attributes: CategoryAttributes.reason });
		CommonValidator.validateAndThrowError(inputFields);

		return await this._categoryService.remove(id.trim(), reason.trim(), user);
	};

	public activate = async (id: string, reason: string, user: IUser, active: boolean) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: CategoryAttributes.categoryId });
		inputFields.push({ value: reason, attributes: CategoryAttributes.reason });
		inputFields.push({ value: active, attributes: CategoryAttributes.active });

		CommonValidator.validateAndThrowError(inputFields);

		return await this._categoryService.activate(id.trim(), reason.trim(), user, active);
	};
}
