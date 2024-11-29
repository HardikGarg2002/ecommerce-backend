import CategoryAttributes from '../../common/constant/category';
import CategoryService from '../../service/consumer/category-service';
import { ICategoryWithMeta } from '../../common/type/category';
import { CommonValidator } from '../../common/packages/utils';
// import { CommonValidator } from './packages/utils';

export default class CategoryController {
	private _categoryService = new CategoryService();

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
}
