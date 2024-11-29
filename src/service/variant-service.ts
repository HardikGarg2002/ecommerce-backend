import { BusinessError } from '../common/packages/common-errors/common-errors';
import {
	CommonVariantProduct,
	IVariant,
	IVariantProduct,
	IVariantType,
	IVariantWithMeta,
	UnitVariantProduct,
} from '../common/type/variant';
import Variant from '../model/variant';
import dbutils from '../common/packages/db-utils';
import { IUser } from '../common/type/user';
import { audit } from '../common/util';
import ProductService from '../service/product-service';
import { CommonUtils } from '../common/packages/utils';

export default class VariantService {
	private _productService = new ProductService();

	public async getById(id: string): Promise<IVariant> {
		const variant: IVariant | null = await Variant.findById(id).lean();
		if (!variant) throw new BusinessError(`Variant does not exist by this id ${id}`, `ERR_NOT_FOUND`);
		return variant;
	}

	public async get(filters: any, pagination: any, sort: string): Promise<IVariantWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const variantList: IVariant[] = await Variant.find(criteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Variant.countDocuments(criteria);

		const data: IVariantWithMeta = {
			data: variantList,
			meta: {
				pagination: {
					page: skip / limit + 1,
					pageSize: limit,
					pageCount: Math.ceil(totalCount / limit),
					total: totalCount,
				},
			},
		};
		return data;
	}

	public async save(input: IVariant, isNew: boolean = false): Promise<IVariant> {
		const variant = new Variant(input);
		variant.isNew = isNew;
		return (await variant.save()).toObject();
	}

	public async create(variantInput: IVariant): Promise<string> {
		const productIds = variantInput.products.map((product) => product._id);
		const proudcts: IVariantProduct[] = [];
		this._addProductsToVariant(variantInput.type, proudcts, variantInput.products);

		if (!(await this._productService.areValidProductIds(productIds)))
			throw new BusinessError('Some products do not exists with provided productIds', 'ERR_NOT_FOUND');
		const newVariant: IVariant = await this.save(variantInput, true);
		// Assign Variant to Products
		await this._productService.bulkUpdateProductsWithVariantId(
			newVariant._id! as string,
			productIds,
			newVariant.created!,
		);
		//Audit
		await audit(newVariant._id! as string, 'pdvariant', 'create', 'variant', 'New', variantInput.updated!, newVariant);
		return newVariant._id! as string;
	}

	public async patch(id: string, reason: string, updated: IUser, typeInput: IVariantType) {
		const variant = await this.getById(id);
		const updatedVariant: IVariant = {
			...variant,
			type: typeInput,
			updated,
		};
		const savedVariant = await this.save(updatedVariant);
		//AUDIT
		await audit(id, 'pdvariant', 'update', 'variant', reason, updated, savedVariant!, variant);
	}

	public async addProductsList(id: string, inputVariantProducts: IVariantProduct[], user: IUser): Promise<void> {
		const existingVariant = await this.getById(id);
		const productIds = inputVariantProducts.map((product) => product._id);
		if (!(await this._productService.areValidProductIds(productIds)))
			throw new BusinessError('Some products do not exists with provided productIds', 'ERR_NOT_FOUND');
		const updatedVariant: IVariant = CommonUtils.clone(existingVariant);
		this._addProductsToVariant(existingVariant.type, updatedVariant.products, inputVariantProducts);
		updatedVariant.products = inputVariantProducts;
		updatedVariant.updated = user;
		await this.save(updatedVariant);
		await this._productService.bulkUpdateProductsWithVariantId(id, productIds, updatedVariant.created!);
		await audit(
			id,
			'pdvariant',
			'add product variants',
			'variant',
			'adding products to variant',
			user,
			updatedVariant,
			existingVariant,
		);
	}
	public async removeProduct(variantId: string, productId: string, reason: string, updated: IUser) {
		const existingVariant = await this.getById(variantId);
		const productIndex = existingVariant.products.findIndex(
			(product: IVariantProduct) => product._id.toString() === productId.toString(),
		);

		if (productIndex === -1) {
			throw new BusinessError(`Product with _id ${productId} not found in this variant`, 'ERR_NOT_FOUND');
		}

		// Remove the product from the products array
		const removedProduct = existingVariant.products.splice(productIndex, 1)[0];
		console.log('after removal existing Variant', existingVariant, 'removed product', removedProduct);

		existingVariant.updated = updated;
		await this.save(existingVariant);
		await this._productService.patchVariant(productId, updated, reason, undefined);
		//AUDIT
		await audit(variantId, 'pdvariant', 'delete', 'variantproduct', reason, updated, undefined, removedProduct);
	}

	private _addProductsToVariant = (
		type: string,
		existingProducts: IVariantProduct[],
		newVariantProducts: IVariantProduct[],
	) => {
		// Check for duplicates within newVariantProducts
		this._validateUniqueProductVariants(type, newVariantProducts);
		if (existingProducts.length == 0) return;

		for (let i = 0; i < newVariantProducts.length; i++) {
			const isDuplicate = this._isAnyProductDuplicate(type, existingProducts, newVariantProducts[i]);
			if (isDuplicate) {
				throw new BusinessError(
					'Some or all Products /their-values already exists in this variant',
					'ERR_DUPLICATE_PRODUCTS',
				);
			}
			existingProducts.push(newVariantProducts[i]);
		}
	};

	private _isAnyProductDuplicate = (
		type: string,
		existingVariantProducts: IVariantProduct[],
		newVariantProduct: IVariantProduct,
	) => {
		return existingVariantProducts.some((existingVariantProduct) =>
			this._isVariantProductDuplicate(type, existingVariantProduct, newVariantProduct),
		);
	};
	private _isVariantProductDuplicate = (type: string, product1: IVariantProduct, product2: IVariantProduct) => {
		let value1, value2;
		if (type.toUpperCase() === 'UNIT') {
			value1 = (product1 as UnitVariantProduct).quantity + (product1 as UnitVariantProduct).measure;
			value2 = (product2 as UnitVariantProduct).quantity + (product2 as UnitVariantProduct).measure;
		} else {
			value1 = (product1 as CommonVariantProduct).value;
			value2 = (product2 as CommonVariantProduct).value;
		}

		return (
			product1._id?.toString() == product2._id?.toString() ||
			value1.toLowerCase().trim() === value2.toLowerCase().trim()
		);
	};
	private _validateUniqueProductVariants = (type: string, inputProductVariants: IVariantProduct[]) => {
		const uniqueProductIds = new Set<string>();
		const uniqueValues = new Set<string>();

		for (const product of inputProductVariants) {
			const productId = product._id?.toString();
			const value =
				type.toUpperCase() === 'UNIT'
					? (product as UnitVariantProduct).quantity + (product as UnitVariantProduct).measure.toLowerCase()
					: (product as CommonVariantProduct).value?.toLowerCase();

			if (productId && uniqueProductIds.has(productId)) {
				throw new BusinessError('Duplicate product IDs found in inputProductVariants', 'ERR_DUPLICATE_PRODUCT_IDS');
			}

			if (value && uniqueValues.has(value)) {
				throw new BusinessError(
					"Duplicate product's values/(quantity and measure) found in input productVariants ",
					'ERR_DUPLICATE_PRODUCT_VALUES',
				);
			}
			uniqueProductIds.add(productId);
			uniqueValues.add(value);
		}
	};
}
