import { CommonValidator, ValidationErrors } from '../common/packages/utils';
import {
	IVariant,
	IVariantType,
	IVariantWithMeta,
	UnitVariantProduct,
	CommonVariantProduct,
	IVariantProduct,
} from '../common/type/variant';
import VariantService from '../service/variant-service';
import VariantAttributes from '../common/constant/variant';
import { IUser } from '../common/type/user';

export default class VariantController {
	private _variantService = new VariantService();
	private _validateProductsOfVariant = (
		products: IVariantProduct[],
		type: IVariantType,
		validateInputs: CommonValidator.IValidateFieldInput[],
	) => {
		const attributes = VariantAttributes.productId;
		if (type === IVariantType.Color) {
			const variants = products as CommonVariantProduct[];
			variants.map((product: CommonVariantProduct) => {
				attributes.message = `Product Id "${product._id}" can only be alphabets, only 24 characters long`;
				validateInputs.push({ value: product._id, attributes: attributes });
				validateInputs.push({ value: product.value, attributes: VariantAttributes.color });
			});
		} else if (type === IVariantType.Unit) {
			const variants = products as UnitVariantProduct[];
			variants.map((product: UnitVariantProduct) => {
				attributes.message = `Product Id "${product._id}" can only be alphabets, only 24 characters long`;
				validateInputs.push({ value: product._id, attributes: attributes });
				validateInputs.push({ value: product.quantity, attributes: VariantAttributes.quantity });
				validateInputs.push({ value: product.measure, attributes: VariantAttributes.measure });
			});
		} else
			products.map((product: any) => {
				attributes.message = `Product Id "${product._id}" can only be alphabets, only 24 characters long`;
				validateInputs.push({ value: product._id, attributes: attributes });
				validateInputs.push({ value: product.value, attributes: VariantAttributes.value });
			});
	};

	public get = async (filters: any, pagination: any, sort: string): Promise<IVariantWithMeta> => {
		return await this._variantService.get(filters, pagination, sort);
	};

	public getById = async (id: string): Promise<IVariant> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: id, attributes: VariantAttributes.variantId });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._variantService.getById(id?.trim());
	};
	public create = async (variantInput: IVariant): Promise<string> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		const errors = new ValidationErrors();
		validateInputs.push({ value: variantInput.type, attributes: VariantAttributes.type });
		// const errors = CommonValidator.validateAndReturnErrors(validateInputs);
		variantInput.products
			? this._validateProductsOfVariant(variantInput.products, variantInput.type, validateInputs)
			: errors.addError('products', 'Add products to create variant', 'EMPTY_PRODUCTS');
		CommonValidator.validateAndReturnErrors(validateInputs, errors);
		CommonValidator.checkAndThrowError(errors);
		return await this._variantService.create(variantInput);
	};

	public patch = async (id: string, typeInput: IVariantType, reason: string, user: IUser) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: VariantAttributes.variantId });
		inputFields.push({ value: typeInput, attributes: VariantAttributes.type });
		inputFields.push({ value: reason, attributes: VariantAttributes.reason });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._variantService.patch(id.trim(), reason.trim(), user, typeInput);
	};

	public addProductsList = async (id: string, products: IVariantProduct[], user: IUser): Promise<void> => {
		const variant = await this.getById(id);
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		this._validateProductsOfVariant(products, variant.type, validateInputs);
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._variantService.addProductsList(id, products, user);
	};

	// public patchValue = async (type: string, key: string, reason: string, user: IUser, label: string, sort: number) => {
	// 	const inputFields: CommonValidator.IValidateFieldInput[] = [];
	// 	inputFields.push({ value: type, attributes: ValidvalueAttributes.type });
	// 	label && inputFields.push({ value: label, attributes: ValidvalueAttributes.value });
	// 	sort && inputFields.push({ value: sort, attributes: ValidvalueAttributes.sort });
	// 	inputFields.push({ value: reason, attributes: ValidvalueAttributes.reason });
	// 	CommonValidator.validateAndThrowError(inputFields);
	// 	return await this._validvalueSerice.patchValue(type.trim(), key.trim(), reason.trim(), user, label?.trim(), sort);
	// };
	public removeProduct = async (variantId: string, productId: string, reason: string, user: IUser) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: variantId, attributes: VariantAttributes.variantId });
		inputFields.push({ value: reason, attributes: VariantAttributes.reason });
		inputFields.push({ value: productId, attributes: VariantAttributes.productId });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._variantService.removeProduct(variantId.trim(), productId.trim(), reason, user);
	};
}
