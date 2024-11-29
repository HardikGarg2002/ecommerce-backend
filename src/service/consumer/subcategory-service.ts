import { ISubcategory, ISubcategoryWithMeta } from '../../common/type/subcategory';
import Subcategory from '../../model/subcategory';
import { BusinessError } from '../../common/packages/common-errors/common-errors';
import dbutils from '../../common/packages/db-utils';

export default class SubcatService {
	removeFields = '-is_active -created -updated -desc';

	private activeCriteria(criteria: any) {
		return { ...criteria, is_active: true };
	}
	public async get(filters: any, pagination: any, sort: string): Promise<ISubcategoryWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const activeCriteria = this.activeCriteria(criteria);
		const subcategoryList: ISubcategory[] = await Subcategory.find(activeCriteria)
			.select(this.removeFields)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Subcategory.countDocuments(activeCriteria);

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
		const subcategory = await Subcategory.findById(id)
			.select(this.removeFields + ' desc')
			.lean();
		if (!subcategory || subcategory.is_active === false) {
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
				// { 'updated.name': { $regex: searchText, $options: 'i' } },
			],
		};

		const filterSearch = { ...criteria, ...searchCriteria, is_active: true };

		const subcategoryList: ISubcategory[] = await Subcategory.find(filterSearch)
			.select(this.removeFields)
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
}
