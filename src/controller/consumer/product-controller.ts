import { CommonValidator } from '../../common/packages/utils';
import ProductAttributes from '../../common/constant/product';
import ProductService from '../../service/consumer/product-service';
import { IProductWithMeta } from '../../common/type/product';

export default class ProductController {
	private _productService = new ProductService();

	public get = async (filters: any, pagination: any, sort: string, detailed?: boolean) => {
		return await this._productService.get(filters, pagination, sort, detailed);
	};

	public getById = async (id: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: ProductAttributes.productId });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._productService.getById(id.trim());
	};
	search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<IProductWithMeta> => {
		console.log('seach api called');

		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: searchText, attributes: ProductAttributes.searchText });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._productService.search(filters, pagination, sort, searchText.trim());
	};
}
