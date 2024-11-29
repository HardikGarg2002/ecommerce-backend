import SubcategoryAttributes from '../common/constant/subcategory';
import SubcategoryService from '../service/subcategory-service';
import { ISubcategory, ISubcategoryWithMeta } from '../common/type/subcategory';
// import CategoryService from '../service/category-service';
import { IUser } from '../common/type/user';
import CategoryAttributes from '../common/constant/category';
import { CommonValidator, ValidationErrors } from '../common/packages/utils';

export default class SubcategoryController {
	private _subcategoryService = new SubcategoryService();
	// private _categoryService = new CategoryService();
	public create = async (subcatInput: ISubcategory) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: subcatInput.name, attributes: SubcategoryAttributes.name });
		inputFields.push({ value: subcatInput.desc, attributes: SubcategoryAttributes.desc });
		inputFields.push({ value: subcatInput.sort, attributes: SubcategoryAttributes.sort });
		inputFields.push({ value: subcatInput.img_url, attributes: SubcategoryAttributes.imageURL });
		// VALIDATE THE CATEGORY CODE FRoM THE CATEGORY SERVICE
		inputFields.push({ value: subcatInput.category_code, attributes: CategoryAttributes.code });
		inputFields.push({ value: subcatInput.code, attributes: SubcategoryAttributes.code });
		CommonValidator.validateAndThrowError(inputFields);
		// await this._categoryService.getByCode(subcatInput.category_code, true); // no need to check on length
		return await this._subcategoryService.create(subcatInput);
	};

	public get = async (filters: any, pagination: any, sort: string) => {
		return await this._subcategoryService.get(filters, pagination, sort);
	};

	public getById = async (id: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: SubcategoryAttributes.subcategoryId });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._subcategoryService.getById(id.trim());
	};

	public search = async (
		filters: any,
		pagination: any,
		sort: string,
		searchText: string,
	): Promise<ISubcategoryWithMeta> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: searchText, attributes: SubcategoryAttributes.searchText });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._subcategoryService.search(filters, pagination, sort, searchText.trim());
	};

	public patch = async (
		id: string,
		reason: string,
		user: IUser,
		name?: string,
		desc?: string,
		img?: string,
		category_code?: string,
		sort?: number,
	) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [
			{ value: name, attributes: SubcategoryAttributes.name },
			{ value: desc, attributes: SubcategoryAttributes.desc },
			{ value: img, attributes: SubcategoryAttributes.imageURL },
			{ value: sort, attributes: SubcategoryAttributes.sort },
			{ value: category_code, attributes: SubcategoryAttributes.categoryCode },
		].filter((field) => field.value !== undefined);

		inputFields.push({ value: reason, attributes: SubcategoryAttributes.reason });
		inputFields.push({ value: id, attributes: SubcategoryAttributes.subcategoryId });

		const errors: ValidationErrors = CommonValidator.validateAndReturnErrors(inputFields);
		if (inputFields.length === 2) {
			errors.addError('Field', 'At least one field must be provided for update', 'ERR_FIELD_REQUIRED');
		}

		CommonValidator.checkAndThrowError(errors);

		// category_code && (await this._categoryService.getByCode(category_code.trim(), true));

		return await this._subcategoryService.patch(
			id.trim(),
			reason.trim(),
			user,
			name?.trim(),
			desc?.trim(),
			img?.trim(),
			category_code?.trim(),
			sort,
		);
	};
	public remove = async (id: string, reason: string, user: IUser) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: SubcategoryAttributes.subcategoryId });
		inputFields.push({ value: reason, attributes: SubcategoryAttributes.reason });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._subcategoryService.remove(id.trim(), reason.trim(), user);
	};

	public activate = async (id: string, reason: string, user: IUser, active: boolean) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: SubcategoryAttributes.subcategoryId });
		inputFields.push({ value: active, attributes: SubcategoryAttributes.active });
		inputFields.push({ value: reason, attributes: SubcategoryAttributes.reason });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._subcategoryService.activate(id.trim(), reason.trim(), user, active);
	};
}
