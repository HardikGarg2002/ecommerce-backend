import Product from '../model/product';
import { IProduct, IProductFeatures, IProductImage, IProductPrices, IProductWithMeta } from '../common/type/product';
import dbutils from '../common/packages/db-utils';
import TagService from './tag-service';
import { IUser } from '../common/type/user';
import { audit } from '../common/util';
import CategoryService from './category-service';
import SubcategoryService from '../service/subcategory-service';
import { ObjectId } from 'mongoose';
import { CommonUtils } from '../common/packages/utils';
import { BusinessError, SystemError } from '../common/packages/common-errors/common-errors';

export default class ProductService {
	private _tagService = new TagService();

	private _validateCategoryAndSubCategory = async (category_code: string, subcategory_code: string) => {
		const _categoryService = new CategoryService();
		const _subcategoryService = new SubcategoryService();
		await _categoryService.getByCode(category_code, true);
		const subcategory = await _subcategoryService.getByCode(subcategory_code, true);
		// validate if subcategory code belongs to appropriate category
		if (subcategory && subcategory.category_code !== category_code.toUpperCase())
			throw new BusinessError('Subcategory do not belong to this category', 'INVALID_SUBCATEGORY_CODE');
		// if (subcategory.is_active === false) throw new BusinessError('Subcategory is not active', 'INACTIVE_SUBCATEGORY');
	};

	public async areValidProductIds(ids: string[] | ObjectId[]): Promise<boolean> {
		const existingProducts = await Product.find({ _id: { $in: ids } });
		return existingProducts.length === ids.length;
	}

	public async bulkUpdateProductsWithVariantId(
		variantId: ObjectId | string,
		productIds: string[] | ObjectId[],
		user: IUser,
	): Promise<void> {
		// Update each product with the associated variant ID
		const result = await this.bulkUpdateProducts(
			{ _id: { $in: productIds } },
			{ $set: { variant_id: variantId } },
			user,
		);
		console.log(result);
	}
	public async bulkUpdateProducts(filter: any, update: any, updatedBy: IUser): Promise<void> {
		try {
			const modifiedBy = CommonUtils.clone(updatedBy);
			modifiedBy.date = new Date();
			update.$set = { ...update.$set, updated: modifiedBy };
			await Product.updateMany(filter, update);
			console.log('Multiple products updated successfully');
		} catch (error: Error | any) {
			console.error('Error during update:', error);
			throw new SystemError('Error during update', error);
		}
	}
	private async save(productInput: IProduct, isNew: boolean = false): Promise<IProduct> {
		const product = new Product(productInput);
		product.isNew = isNew;
		return (await product.save()).toObject();
	}

	private async validateSkuUnique(sku: string) {
		const matchedProduct = await this.get({ sku: { $eqi: `${sku}` } }, undefined, 'name:asc');
		if (matchedProduct.data.length > 0) {
			throw new BusinessError(
				`Product with SKU: ${sku.toUpperCase()} already exists in the database`,
				'ERR_DUPLICATE_SKU',
			);
		}
	}

	private _addFeaturesToProduct = (product: IProduct, newFeatures: IProductFeatures[]) => {
		for (let i = 0; i < newFeatures.length; i++) {
			const isDuplicate = this._isAnyFeatureDuplicate(product.features, newFeatures[i]);
			if (isDuplicate) {
				throw new BusinessError('duplicate features', 'ERR_DUPLICATE_FEATURES');
			}
			product.features.push(newFeatures[i]);
		}
	};

	private _isAnyFeatureDuplicate = (existingFeatures: IProductFeatures[], newFeature: IProductFeatures) => {
		return existingFeatures.some((existingFeature: IProductFeatures) =>
			this._isFeatureDuplicate(existingFeature, newFeature),
		);
	};
	private _isFeatureDuplicate = (feature1: IProductFeatures, feature2: IProductFeatures) => {
		return feature1.code?.toLowerCase() === feature2.code?.toLowerCase();
	};

	private _sortAndFilterProductFeatures(features: IProductFeatures[] | undefined): IProductFeatures[] {
		if (!features) return [];

		features.sort((a, b) => (a.sort || 0) - (b.sort || 0));

		return features;
	}

	public async get(filters: any, pagination: any, sort: string): Promise<IProductWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		console.log('criteria', criteria, 'skip', skip, 'limit', limit, 'sortOptions', sortOptions);
		const productList: IProduct[] = await Product.find(criteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Product.countDocuments(criteria);
		const data: IProductWithMeta = {
			data: productList,
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

	public async getById(id: string): Promise<IProduct> {
		const product = await Product.findById(id).lean();
		if (!product) {
			throw new BusinessError('Product not found', 'ERR_NOT_FOUND');
		}
		product.features = this._sortAndFilterProductFeatures(product.features);
		return product;
	}

	public async getByIds(ids: string[], populate: boolean = false): Promise<{ _id: string }[]> {
		return await Product.find({ _id: { $in: ids } })
			.select(`${populate ? '' : '_id'}`)
			.populate(`${populate ? 'relatedproducts' : ''}`)
			.lean();
	}

	public search = async (
		filters: any,
		pagination: any,
		sort: string,
		searchText: string,
	): Promise<IProductWithMeta> => {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);

		const searchCriteria = {
			$or: [{ name: { $regex: searchText, $options: 'i' } }, { 'created.name': { $regex: searchText, $options: 'i' } }],
		};

		const filterSearch = { ...criteria, ...searchCriteria };

		const productList: IProduct[] = await Product.find(filterSearch)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCount = await Product.countDocuments(filterSearch);

		const data: IProductWithMeta = {
			data: productList,
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
	};

	public async create(productInput: IProduct): Promise<string> {
		await this.validateSkuUnique(productInput.sku);
		// validate category and subcategory code
		await this._validateCategoryAndSubCategory(productInput.category_code, productInput.subcategory_code);
		const newProduct = await this.save(productInput, true);
		console.log('newProduct', newProduct);
		// AUDIT
		await audit(newProduct._id!, 'product', 'create', 'product', 'New', productInput.updated!, newProduct);
		return newProduct._id!;
	}

	public async patch(id: string, user: IUser, reason: string, updatedFields: Partial<IProduct>): Promise<void> {
		const existingProduct = await this.getById(id);
		if (updatedFields.category_code || updatedFields.subcategory_code || updatedFields.is_active) {
			await this._validateCategoryAndSubCategory(
				updatedFields.category_code || existingProduct.category_code,
				updatedFields.subcategory_code || existingProduct.subcategory_code,
			);
		}

		if (updatedFields.prices) {
			updatedFields.prices = {
				...existingProduct.prices, // Preserve existing values
				...updatedFields.prices, // Apply updated values
			};
		}
		if ('variant_id' in updatedFields) {
			// Set variant_id to the provided value or undefined
			existingProduct.variant_id = updatedFields.variant_id as string | undefined;
		}
		const updatedProduct: IProduct = {
			...existingProduct,
			...Object.fromEntries(Object.entries(updatedFields).filter(([_, value]) => value !== undefined)),
			updated: user,
		};
		updatedProduct.sku.toLowerCase() !== existingProduct.sku.toLowerCase() &&
			(await this.validateSkuUnique(updatedProduct.sku));

		const savedProduct = await this.save(updatedProduct);
		// AUDIT
		await audit(existingProduct._id!, 'product', 'update', 'product', reason, user, savedProduct!, existingProduct);
	}

	public async activate(id: string, user: IUser, reason: string, is_active: boolean): Promise<void> {
		return await this.patch(id, user, reason, { is_active });
	}

	public async patchPrice(
		id: string,
		user: IUser,
		reason: string,
		prices: IProductPrices,
		hsn_code: string,
	): Promise<void> {
		return await this.patch(id, user, reason, { prices, hsn_code });
	}

	public async patchOffer(id: string, user: IUser, reason: string, offer: boolean): Promise<void> {
		return await this.patch(id, user, reason, { offer });
	}

	public async patchOos(id: string, user: IUser, oos: boolean): Promise<void> {
		const reason = 'OOS updated By admin';
		return await this.patch(id, user, reason, { oos });
	}

	public async addTag(id: string, tagId: string, user: IUser): Promise<void> {
		const product = await this.getById(id);
		const tag = await this._tagService.getById(tagId);

		if (!Array.isArray(product.tags)) {
			product.tags = [];
		}

		const tagExists = product.tags.some((productTag) => productTag._id?.toString() === tagId);

		if (!tagExists) {
			product.tags.push({ _id: tag._id, slug: tag?.slug });
			product.updated = user;
			const updatedProduct = await this.save(product);
			await audit(product._id!, 'product', 'update', 'product', 'Tag is added', user, updatedProduct, product);
		}
	}

	public async removeTag(id: string, tagId: string, user: IUser): Promise<void> {
		const product = await this.getById(id);
		const tagExists = product.tags.some((productTag) => productTag._id?.toString() === tagId);
		if (tagExists) {
			product.tags = product.tags?.filter((tag) => !(tag._id?.toString() === tagId));
			product.updated = user;
			const updatedProduct = await this.save(product);
			await audit(product._id!, 'product', 'update', 'product', 'Tag is removed', user, updatedProduct, product);
		}
	}

	public async addImages(id: string, images: IProductImage, user: IUser): Promise<void> {
		const product = await this.getById(id);
		if (!product.images) {
			product.images = {
				primary: '',
				additional: [],
			};
		}

		// Ensure that product.images.additional is defined and is an array
		if (!product.images.additional || !Array.isArray(product.images.additional)) {
			product.images.additional = [];
		}

		if (images.primary) product.images.primary = images.primary;
		if (images.additional) {
			product.images.additional = Array.from(new Set([...product.images.additional, ...images.additional]));
		}

		const updatedProduct = await this.save(product);
		await audit(product._id!, 'product', 'update', 'product', 'Images are added', user, updatedProduct, product);
	}
	public async removeImage(id: string, imageUrl: string, user: IUser): Promise<void> {
		const product = await this.getById(id);
		if (product.images.primary === imageUrl.trim()) {
			throw new BusinessError('Primary image can not be deleted', 'ERR_NOT_ALLOWED');
		}
		const index = product.images.additional.indexOf(imageUrl);

		// If the imageUrl is found, remove it from the additional array
		if (index !== -1) {
			product.images.additional.splice(index, 1);
		} else {
			// If the imageUrl is not found, return a message indicating that it doesn't exist
			throw new BusinessError('Image not found', 'ERR_NOT_FOUND');
		}
		const updatedProduct = await this.save(product);
		await audit(product._id!, 'product', 'update', 'product', 'Images are added', user, updatedProduct, product);
	}

	public async addAliases(id: string, updated: IUser, aliasInput: string[]): Promise<void> {
		const existingProduct = await this.getById(id);
		existingProduct.aliases = Array.isArray(existingProduct.aliases) ? existingProduct.aliases : [];

		// Check for duplicates
		const duplicates = aliasInput.filter((alias) =>
			existingProduct.aliases.some((existingAlias) => existingAlias.toString() === alias),
		);

		if (duplicates.length > 0) {
			throw new BusinessError(
				`Aliases ${duplicates.join(', ')} already exist for this product.`,
				'ERR_ALIAS_ALREADY_EXISTS',
			);
		}
		const uniqueAliases = Array.from(new Set([...existingProduct.aliases, ...aliasInput]));
		const updatedProduct = {
			...existingProduct,
			aliases: uniqueAliases,
			updated,
		};
		const savedProduct = await this.save(updatedProduct);
		await audit(
			savedProduct._id!,
			'product',
			'update',
			'add_alias',
			'aliases added',
			updated,
			savedProduct,
			existingProduct,
		);
	}
	public async removeAlias(id: string, updated: IUser, aliasId: string, reason: string): Promise<void> {
		const existingProduct = await this.getById(id);
		existingProduct.aliases = Array.isArray(existingProduct.aliases) ? existingProduct.aliases : [];

		// Check if the alias exists
		const aliasToRemoveIndex = existingProduct.aliases.findIndex((existingAlias) => String(existingAlias) === aliasId);

		if (aliasToRemoveIndex === -1) {
			throw new BusinessError(`Alias with id ${aliasId} does not exist in this product.`, 'ERR_ALIAS_NOT_EXISTS');
		}

		// Remove the alias from the array
		existingProduct.aliases.splice(aliasToRemoveIndex, 1);

		const updatedProduct = {
			...existingProduct,
			updated,
		};
		await this.save(updatedProduct);

		await audit(id, 'product', 'remove_alias', 'aliases', reason, updated, updatedProduct, existingProduct);
	}

	public async addFeatures(id: string, user: IUser, inputFeatures: IProductFeatures[]): Promise<void> {
		const existingProduct = await this.getById(id);
		const updatedProduct: IProduct = CommonUtils.clone(existingProduct);
		this._addFeaturesToProduct(updatedProduct, inputFeatures);
		updatedProduct.updated = user;
		await this.save(updatedProduct);
		await audit(id, 'product', 'add_feature', 'feature', 'features added', user, updatedProduct, existingProduct);
	}

	public async removeFeature(id: string, code: string, reason: string, updated: IUser) {
		const existingProduct = await this.getById(id);
		const existingFeatureIndex = existingProduct.features?.findIndex(
			(feature: IProductFeatures) => feature.code?.toLowerCase() === code.toLowerCase(),
		);

		if (existingFeatureIndex === -1) {
			throw new BusinessError(
				`Feature with code ${code.toUpperCase()} does not exist in this product`,
				'ERR_NOT_FOUND',
			);
		}

		existingProduct.features.splice(existingFeatureIndex, 1); // Remove the feature at the found index

		existingProduct.updated = updated;
		const updatedProduct = await this.save(existingProduct);

		// AUDIT
		await audit(
			id,
			'product',
			'remove_feature',
			'feature',
			reason,
			updated,
			updatedProduct.features,
			existingProduct.features,
		);
	}

	public async deactivateByCategoryCode(code: string, updated: IUser) {
		const modifiedBy = CommonUtils.clone(updated);
		modifiedBy.date = new Date();

		const bulkOperations = [
			{
				updateMany: {
					filter: { category_code: code, is_active: true },
					update: { $set: { is_active: false, updated: modifiedBy } },
				},
			},
		];

		const result = await Product.bulkWrite(bulkOperations, { ordered: false });
		console.log('result in product , decativate products by category Code', result);
	}

	public async deactivateBySubcategoryCode(code: string, updated: IUser) {
		const modifiedBy = CommonUtils.clone(updated);
		modifiedBy.date = new Date();

		const bulkOperations = [
			{
				updateMany: {
					filter: { subcategory_code: code, is_active: true },
					update: { $set: { is_active: false, updated: modifiedBy } },
				},
			},
		];

		const result = await Product.bulkWrite(bulkOperations, { ordered: false });
		console.log('result in product , decativate products by subcategory Code', result);
	}

	public async removeAliasFromProducts(id: string, user: IUser) {
		const modifiedBy = CommonUtils.clone(user);
		modifiedBy.date = new Date();

		const result = await Product.bulkWrite([
			{
				updateMany: {
					filter: { aliases: id },
					update: {
						$pull: { aliases: id },
						$set: { updated: modifiedBy },
					},
				},
			},
		]);

		console.log('result in the remove aliases from the product', result);
	}

	public async patchVariant(productId: string, user: IUser, reason: string, variantId: string | undefined) {
		return await this.patch(productId, user, reason, { variant_id: variantId });
	}

	public async getProductsWithFeatureCode(featureCode: string) {
		const products = await Product.find({ 'features.code': featureCode });
		return products;
	}

	public async updateSortOftheProductFeature(featureCode: string, sortOrder: number, updated: IUser) {
		const result = await this.bulkUpdateProducts(
			{ 'features.code': featureCode },
			{ $set: { 'features.$.sort': sortOrder } },
			updated,
		);
		// console.log('result in product , updating the sort of the product features', result);
	}
	public async addRelatedProduct(productId: string, user: IUser, relatedProductIds: string[], twoWay: boolean = true) {
		const product = await this.getById(productId);
		const relatedProducts = await this.getByIds(relatedProductIds);
		await this.addRelatedProductToProduct(product, user, relatedProducts);
		// twoWay && (await this.addRelatedProductToProduct(relatedProduct, user, product));
		twoWay &&
			(await this.bulkUpdateProducts(
				{ _id: { $in: relatedProductIds }, relatedproducts: { $ne: productId } },
				{ $addToSet: { relatedproducts: productId } },
				user,
			));
	}
	public async addRelatedProductToProduct(product: IProduct, user: IUser, relatedProducts: { _id: string }[]) {
		const relatedProductIds = relatedProducts.map((rp) => rp._id!.toString());
		product.relatedproducts = product.relatedproducts?.map((id) => id.toString());
		const uniqueRelatedProducts = Array.from(new Set([...(product.relatedproducts || []), ...relatedProductIds]));
		product.relatedproducts = uniqueRelatedProducts;
		product.updated = user;
		const savedProduct = await this.save(product);
		await audit(
			product._id!,
			'product',
			'update',
			'add_related_product',
			'related product added',
			user,
			savedProduct,
			product,
		);
	}

	public async removeRelatedProduct(
		productId: string,
		user: IUser,
		reason: string,
		relatedProductId: string,
		twoWay: boolean = true,
	) {
		const product = await this.getById(productId);
		product.relatedproducts = product.relatedproducts?.map((id) => id.toString());
		const uniqueRelatedProducts = product.relatedproducts?.filter((id) => id !== relatedProductId);
		product.relatedproducts = uniqueRelatedProducts;
		product.updated = user;
		const savedProduct = await this.save(product);
		await audit(productId, 'product', 'update', 'remove_related_product', reason, user, savedProduct, product);
		twoWay && (await this.removeRelatedProduct(relatedProductId, user, reason, productId, false));
	}
}
