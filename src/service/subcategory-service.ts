import { BusinessError } from '../common/packages/common-errors/common-errors';
import { ISubcategory, ISubcategoryWithMeta } from '../common/type/subcategory';
import dbutils from '../common/packages/db-utils';
import Subcategory from '../model/subcategory';
import { IUser } from '../common/type/user';
import { audit } from '../common/util';
import ProductService from './product-service';
import CategoryService from './category-service';
import { CommonUtils } from '../common/packages/utils';

export default class SubcatService {
	private _productService = new ProductService();

	private _validateCategoryCode = async (category_code: string) => {
		const _categoryService = new CategoryService();
		await _categoryService.getByCode(category_code, true);
	};
	public async get(filters: any, pagination: any, sort: string): Promise<ISubcategoryWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const subcategoryList: ISubcategory[] = await Subcategory.find(criteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Subcategory.countDocuments(criteria);

		const data: ISubcategoryWithMeta = {
			data: subcategoryList,
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
	public async getById(id: string): Promise<ISubcategory> {
		const subcategory = await Subcategory.findById(id).lean();
		if (!subcategory) {
			throw new BusinessError('subcategory not found', 'ERR_NOT_FOUND');
		}

		return subcategory;
	}
	public async getByCode(code: string, statusError: boolean = false): Promise<ISubcategory> {
		const subcategory = await Subcategory.findOne({ code }).lean();
		if (!subcategory) {
			throw new BusinessError('subcategory not found', 'ERR_NOT_FOUND');
		}
		if (statusError === true && subcategory.is_active === false) {
			throw new BusinessError('subcategory Inactive', 'ERR_INACTIVE_SUBCATEGORY');
		}
		return subcategory;
	}

	public search = async (
		filters: any,
		pagination: any,
		sort: string,
		searchText: string,
	): Promise<ISubcategoryWithMeta> => {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const searchCriteria = {
			$or: [
				{ name: { $regex: searchText, $options: 'i' } },
				{ desc: { $regex: searchText, $options: 'i' } },
				{ 'updated.name': { $regex: searchText, $options: 'i' } },
			],
		};

		const filterSearch = { ...criteria, ...searchCriteria };

		const subcategoryList: ISubcategory[] = await Subcategory.find(filterSearch)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCount = await Subcategory.countDocuments(filterSearch);

		const data: ISubcategoryWithMeta = {
			data: subcategoryList,
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

	public async create(subcategoryInput: ISubcategory): Promise<string> {
		await this._validateNameAndCodeUnique(subcategoryInput.name, subcategoryInput.code);
		await this._validateCategoryCode(subcategoryInput.category_code);
		const newSubcategory = await this.save(subcategoryInput, true);
		//AUDIT
		await audit(
			newSubcategory._id!,
			'subcategory',
			'create',
			'subcategory',
			'New',
			subcategoryInput.created!,
			newSubcategory,
		);
		return newSubcategory._id!;
	}

	public async patch(
		id: string,
		reason: string,
		updated: IUser,
		nameInput?: string,
		desc?: string,
		img?: string,
		category?: string,
		sortInput?: number,
		is_activeInput?: boolean,
	) {
		const existingSubcategory = await this.getById(id);
		if (category || is_activeInput) {
			await this._validateCategoryCode(category || existingSubcategory.category_code);
		}

		// if (is_activeInput === undefined && !existingSubcategory.is_active) {
		// 	throw new BusinessError(`Inactive subcategory can not be modified`, 'ERR_SUBCATEGORY_INACTIVE');
		// }

		nameInput &&
			existingSubcategory.name.toLowerCase() != nameInput.toLowerCase() &&
			(await this._validateNameAndCodeUnique(nameInput));
		// TODO Deactivate the product assciated to it also
		if (is_activeInput !== undefined && is_activeInput === false) {
			await this._productService.deactivateBySubcategoryCode(existingSubcategory.code!, updated);
		}

		const updatedSubcategory: ISubcategory = {
			...existingSubcategory,
			name: nameInput ? nameInput : existingSubcategory.name,
			desc: desc ?? existingSubcategory.desc,
			img_url: img ?? existingSubcategory.img_url,
			sort: sortInput ?? existingSubcategory.sort,
			is_active: is_activeInput ?? existingSubcategory.is_active,
			category_code: category ?? existingSubcategory.category_code,
			updated,
		};
		const savedSubcategory = await this.save(updatedSubcategory);
		//AUDIT
		await audit(
			existingSubcategory._id!,
			'subcategory',
			'update',
			'subcategory',
			reason,
			updated,
			savedSubcategory!,
			existingSubcategory,
		);
	}

	public async remove(id: string, reason: string, user: IUser) {
		const subcategory = await this.getById(id);
		// TODO::AFTER PRODUCTS
		// Before delete check not asociated to any product (subcategory_code)
		const products = await this._productService.get(
			{ subcategory_code: { $eqi: `${subcategory.code}` } },
			undefined,
			'name:asc',
		);

		if (products.data.length > 0) {
			throw new BusinessError(
				`Product exists with this subcategory_code : ${subcategory.code?.toUpperCase()} in database`,
				'ERR_NOT_PERMITTED',
			);
		}
		await Subcategory.findByIdAndDelete(id);
		//AUDIT
		await audit(id, 'subcategory', 'delete', 'subcategory', reason, user, undefined, subcategory);
	}

	public async activate(id: string, reason: string, user: IUser, status: boolean): Promise<void> {
		await this.patch(id, reason, user, undefined, undefined, undefined, undefined, undefined, status);
	}

	public async save(subcategoryInput: ISubcategory, isNew: boolean = false): Promise<ISubcategory> {
		const subcategory = new Subcategory(subcategoryInput);
		subcategory.isNew = isNew;
		return (await subcategory.save()).toObject();
	}

	public async validateSubcategoryCode(code: string) {
		const matchedSubcategory = await this.get({ code: { $eqi: `${code}` } }, undefined, 'name:asc');
		if (matchedSubcategory.data.length < 1) {
			throw new BusinessError(
				`no subcategory exists with code : ${code.toUpperCase()} in database`,
				'ERR_INVALID_SUBCATEGORY',
			);
		}
	}
	private async _validateNameAndCodeUnique(name: string, code?: string) {
		const matchedCat: ISubcategory[] = await Subcategory.find({
			$or: [
				{ name: { $regex: new RegExp(`^${name?.trim()}$`), $options: 'i' } },
				{ code: { $regex: new RegExp(`^${code?.trim()}$`), $options: 'i' } },
			],
		});
		if (matchedCat.length > 0) {
			throw new BusinessError('subcategory with the same name and code already exists in database', 'ERR_DUPLICATE');
		}
	}

	//Bulk operation deactivate subcategories by category code
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

		const result = await Subcategory.bulkWrite(bulkOperations, { ordered: false });
		console.log('result in subcategory , decativate subcategories by category Code', result);
	}

	public async getByCategoryCode(category_code: string): Promise<ISubcategory[]> {
		const subcategories = await Subcategory.find({ category_code: category_code });
		return subcategories;
	}
}
