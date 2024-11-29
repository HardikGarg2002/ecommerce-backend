import SubcategoryAttributes from '../../common/constant/subcategory';
import { ISubcategoryWithMeta } from '../../common/type/subcategory';
import SubcategoryService from '../../service/consumer/subcategory-service';
import { CommonValidator } from '../../common/packages/utils';

export default class SubcategoryController {
	private _subcategoryService = new SubcategoryService();

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
}
