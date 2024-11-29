import ProductAttributes from '../common/constant/product';
import ProductService from '../service/product-service';
import { IProduct, IProductFeatures, IProductImage, IProductPrices, IProductWithMeta } from '../common/type/product';
import { IUser } from '../common/type/user';
import { CommonValidator, ValidationErrors } from '../common/packages/utils';
import CategoryAttributes from '../common/constant/category';
import SubcategoryAttributes from '../common/constant/subcategory';
import TagAttributes from '../common/constant/tag';
import HsnService from '../service/hsn-service';
import FeatureService from '../service/feature-service';
import AliasService from '../service/alias-service';
import ValidvalueService from '../service/validvalue-service';
import { compareAmountsWithTolerance } from '../common/util';

export default class ProductController {
	private _productService = new ProductService();
	private _hsnServive = new HsnService();
	private _featureService = new FeatureService();
	private _aliasService = new AliasService();
	private _validvalueService = new ValidvalueService();

	protected async _validateFeatures(features: IProductFeatures[], inputFields: CommonValidator.IValidateFieldInput[]) {
		for (const feature of features) {
			const { code, value } = feature;
			const existingFeature = await this._featureService.getByCode(code);
			feature.sort = existingFeature.sort;
			inputFields.push({ value: value, attributes: ProductAttributes.featureValue });
		}
	}

	public get = async (filters: any, pagination: any, sort: string) => {
		return await this._productService.get(filters, pagination, sort);
	};

	public getById = async (id: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: ProductAttributes.productId });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._productService.getById(id.trim());
	};
	public getByIds = async (ids: string[]) => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: ids, attributes: ProductAttributes.productIdArray });
		CommonValidator.validateAndThrowError(validateInputs);

		return await this._productService.getByIds(ids, true);
	};
	search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<IProductWithMeta> => {
		console.log('seach api called');

		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: searchText, attributes: ProductAttributes.searchText });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._productService.search(filters, pagination, sort, searchText.trim());
	};
	public create = async (productInput: IProduct) => {
		const errors = new ValidationErrors();
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: productInput.name, attributes: ProductAttributes.name });
		inputFields.push({ value: productInput.desc, attributes: ProductAttributes.desc });
		inputFields.push({ value: productInput.sku, attributes: ProductAttributes.sku });
		inputFields.push({ value: productInput.sort, attributes: ProductAttributes.sort });
		inputFields.push({ value: productInput.category_code, attributes: CategoryAttributes.code });
		inputFields.push({ value: productInput.subcategory_code, attributes: SubcategoryAttributes.code });
		inputFields.push({ value: productInput.unit?.quantity || 1, attributes: ProductAttributes.quantity });
		if (Math.floor(productInput.unit?.quantity) !== productInput.unit?.quantity)
			errors.addError('quantity', 'Quantity must be an integer', 'ERR_INVALID_QUANTITY');
		// TO-Do validate maesure from valid values

		const hsn = await this._hsnServive.get({ code: { $eqi: productInput.hsn_code } }, undefined, 'name:asc');
		productInput.prices.taxpct = productInput.prices?.taxpct || hsn.data[0]?.gst;
		// validation of prices
		if (productInput.prices) {
			inputFields.push({ value: productInput.prices.mrp, attributes: ProductAttributes.mrp });
			inputFields.push({ value: productInput.prices.pbt, attributes: ProductAttributes.pbt });
			inputFields.push({ value: productInput.prices.taxpct, attributes: ProductAttributes.taxpct });
			if (
				!compareAmountsWithTolerance(
					productInput.prices.mrp,
					productInput.prices.pbt * (1 + productInput.prices.taxpct / 100),
				)
			) {
				errors.addError('prices', 'PBT after Tax should be equal to MRP', 'ERR_MISMATCH_PBT_MRP');
			}
		} else errors.addError('prices', 'Price details neccessary to create product', 'ERR_EMPTY_PRICES');
		// validating images
		// images not neccessary to create product
		productInput.images?.primary &&
			inputFields.push({ value: productInput.images.primary, attributes: ProductAttributes.primaryImageURL });
		productInput.images?.additional &&
			inputFields.push({
				value: productInput.images.additional,
				attributes: ProductAttributes.additionalImagesURL,
			});

		try {
			await this._validvalueService.getValue('measure', productInput.unit.measure);
		} catch (error) {
			errors.addError('measure', 'Measure is not valid', 'ERR_INVALID_MEASURE');
		}
		CommonValidator.validateAndThrowError(inputFields, errors);
		productInput.features && (await this._validateFeatures(productInput.features, inputFields));

		return await this._productService.create(productInput);
	};

	public patch = async (id: string, user: IUser, reason: string, updatedFields: Partial<IProduct>) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];

		inputFields.push({ value: reason, attributes: ProductAttributes.reason });
		inputFields.push({ value: id, attributes: ProductAttributes.productId });

		updatedFields.name && inputFields.push({ value: updatedFields.name, attributes: ProductAttributes.name });
		updatedFields.desc && inputFields.push({ value: updatedFields.desc, attributes: ProductAttributes.desc });
		updatedFields.sku && inputFields.push({ value: updatedFields.sku, attributes: ProductAttributes.sku });
		updatedFields.sort && inputFields.push({ value: updatedFields.sort, attributes: ProductAttributes.sort });
		updatedFields.category_code &&
			inputFields.push({ value: updatedFields.category_code, attributes: CategoryAttributes.code });
		updatedFields.subcategory_code &&
			inputFields.push({ value: updatedFields.subcategory_code, attributes: SubcategoryAttributes.code });

		CommonValidator.validateAndThrowError(inputFields);
		return await this._productService.patch(id.trim(), user, reason.trim(), updatedFields);
	};

	public activate = async (id: string, user: IUser, reason: string, is_active: boolean) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: reason, attributes: ProductAttributes.reason });
		inputFields.push({ value: id, attributes: ProductAttributes.productId });
		inputFields.push({ value: is_active, attributes: ProductAttributes.is_active });

		CommonValidator.validateAndThrowError(inputFields);
		return await this._productService.activate(id.trim(), user, reason.trim(), is_active);
	};
	public patchPrice = async (
		id: string,
		user: IUser,
		reason: string,
		priceDetails: IProductPrices,
		hsn_code: string,
	) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: reason, attributes: ProductAttributes.reason });
		inputFields.push({ value: id, attributes: ProductAttributes.productId });

		// validate HSN Code
		await this._hsnServive.get({ code: { $eqi: hsn_code } }, undefined, 'name:asc');

		// Validate priceDetails properties
		if (priceDetails) {
			priceDetails.mrp && inputFields.push({ value: priceDetails.mrp, attributes: ProductAttributes.mrp });
			priceDetails.pbt && inputFields.push({ value: priceDetails.pbt, attributes: ProductAttributes.pbt });
			priceDetails.taxpct && inputFields.push({ value: priceDetails.taxpct, attributes: ProductAttributes.taxpct });
		}

		CommonValidator.validateAndThrowError(inputFields);

		return await this._productService.patchPrice(id.trim(), user, reason.trim(), priceDetails, hsn_code);
	};

	public patchOffer = async (id: string, user: IUser, reason: string, offer: boolean) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: reason, attributes: ProductAttributes.reason });
		inputFields.push({ value: id, attributes: ProductAttributes.productId });

		// Validate offerDetails properties
		inputFields.push({ value: offer, attributes: ProductAttributes.offer });

		CommonValidator.validateAndThrowError(inputFields);
		return await this._productService.patchOffer(id.trim(), user, reason.trim(), offer);
	};

	public patchOos = async (id: string, user: IUser, oos: boolean) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: ProductAttributes.productId });

		// Validate stockDetails properties
		inputFields.push({ value: oos, attributes: ProductAttributes.oos });

		CommonValidator.validateAndThrowError(inputFields);
		return await this._productService.patchOos(id.trim(), user, oos);
	};

	public addTag = async (id: string, tagId: string, user: IUser) => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: id, attributes: ProductAttributes.productId });
		validateInputs.push({ value: tagId, attributes: TagAttributes.tagId });
		CommonValidator.validateAndThrowError(validateInputs);

		return await this._productService.addTag(id.trim(), tagId.trim(), user);
	};

	public removeTag = async (id: string, tagId: string, user: IUser) => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: id, attributes: ProductAttributes.productId });
		validateInputs.push({ value: tagId, attributes: TagAttributes.tagId });
		CommonValidator.validateAndThrowError(validateInputs);

		return await this._productService.removeTag(id.trim(), tagId.trim(), user);
	};
	//TO-DO Add methods for handling aliases, and images
	public addImages = async (id: string, images: IProductImage, user: IUser) => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: id, attributes: ProductAttributes.productId });
		const errors = CommonValidator.validateAndReturnErrors(validateInputs);
		// validating images
		// images?.additional = Array.isArray(images.additional) ? images.additional : [];
		if (images && images.additional && !Array.isArray(images.additional)) {
			images.additional = [];
			errors.addError('additional_images', 'additional images must be an array', 'ERR_INVALID_ADDITIONAL_IMAGES');
		}
		if (images && (images.primary || images.additional.length > 0)) {
			images.primary &&
				validateInputs.push({ value: images.primary, attributes: SubcategoryAttributes.primaryImageURL });
			images?.additional?.length > 0 &&
				validateInputs.push({
					value: images.additional,
					attributes: SubcategoryAttributes.additionalImagesURL,
				});
		} else errors.addError('images', 'Image must have either primary or additional images', 'ERR_INVALID_IMAGE_OBJECT');

		CommonValidator.validateAndThrowError(validateInputs);
		CommonValidator.checkAndThrowError(errors);
		return await this._productService.addImages(id.trim(), images, user);
	};
	public async removeImage(id: string, imageUrl: string, user: IUser): Promise<void> {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: id, attributes: ProductAttributes.productId });
		validateInputs.push({ value: imageUrl, attributes: SubcategoryAttributes.imageURL });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._productService.removeImage(id.trim(), imageUrl.trim(), user);
	}
	public addAliases = async (id: string, user: IUser, aliasesInput: string[]): Promise<void> => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: ProductAttributes.productId });
		inputFields.push({ value: aliasesInput, attributes: ProductAttributes.aliases });
		CommonValidator.validateAndThrowError(inputFields);
		aliasesInput = aliasesInput.map((alias: string) => alias.trim());

		await Promise.all(aliasesInput.map(async (alias: string) => await this._aliasService.getById(alias, true)));

		await this._productService.addAliases(id.trim(), user, aliasesInput);
	};
	public removeAlias = async (id: string, user: IUser, aliasId: string, reason: string): Promise<void> => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: ProductAttributes.productId });
		await this._aliasService.getById(aliasId.trim());
		inputFields.push({ value: reason, attributes: ProductAttributes.reason });
		CommonValidator.validateAndThrowError(inputFields);
		await this._productService.removeAlias(id.trim(), user, aliasId.trim(), reason);
	};

	public addFeatures = async (id: string, user: IUser, featureInput: IProductFeatures[]): Promise<void> => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: ProductAttributes.productId });
		await this._validateFeatures(featureInput, inputFields);
		CommonValidator.validateAndThrowError(inputFields);
		await this._productService.addFeatures(id.trim(), user, featureInput);
	};

	public removeFeature = async (id: string, code: string, reason: string, user: IUser) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: ProductAttributes.productId });
		inputFields.push({ value: reason, attributes: ProductAttributes.reason });
		await this._featureService.getByCode(code);
		CommonValidator.validateAndThrowError(inputFields);
		return await this._productService.removeFeature(id.trim(), code.trim(), reason, user);
	};
	public addRelatedProduct = async (
		id: string,
		user: IUser,
		relatedProductIds: string[],
		twoWay?: boolean,
	): Promise<void> => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: ProductAttributes.productId });
		inputFields.push({ value: relatedProductIds, attributes: ProductAttributes.relatedProducts });
		CommonValidator.validateAndThrowError(inputFields);
		await this._productService.addRelatedProduct(id.trim(), user, relatedProductIds, twoWay);
	};

	public removeRelatedProduct = async (
		id: string,
		user: IUser,
		reason: string,
		relatedProductId: string,
		twoWay?: boolean,
	): Promise<void> => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: ProductAttributes.productId });
		inputFields.push({ value: relatedProductId, attributes: ProductAttributes.relatedProductId });
		inputFields.push({ value: reason, attributes: ProductAttributes.reason });
		CommonValidator.validateAndThrowError(inputFields);
		await this._productService.removeRelatedProduct(id.trim(), user, reason, relatedProductId.trim(), twoWay);
	};
}
