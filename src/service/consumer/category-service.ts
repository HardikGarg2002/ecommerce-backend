import Category from '../../model/category';
import { ICategory, ICategoryWithMeta } from '../../common/type/category';
import dbutils from '../../common/packages/db-utils';
import { BusinessError } from '../../common/packages/common-errors/common-errors';

export default class CategoryService {
	removeFields = '-is_active -created -updated -desc';
	private activeCriteria(criteria: any) {
		return { ...criteria, is_active: true };
	}
	public async get(filters: any, pagination: any, sort: string): Promise<ICategoryWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const activeCriteria = this.activeCriteria(criteria);
		const categoryList: ICategory[] = await Category.find(activeCriteria)
			.select(this.removeFields)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Category.countDocuments(activeCriteria);
		const data: ICategoryWithMeta = {
			data: categoryList,
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
	public async getById(id: string): Promise<ICategory> {
		const category = await Category.findById(id)
			.select(this.removeFields + 'desc')
			.lean();
		if (!category || category.is_active === false) {
			throw new BusinessError('category not found', 'ERR_NOT_FOUND');
		}
		return category;
	}
	public async getByCode(code: string, statusError: boolean = false): Promise<ICategory> {
		const category = await Category.findOne({ code }).lean();
		if (!category) {
			throw new BusinessError('category not found', 'ERR_NOT_FOUND');
		}
		if (statusError === true && category.is_active === false) {
			throw new BusinessError('category Inactive', 'ERR_INACTIVE_CATEGORY');
		}
		return category;
	}

	public search = async (
		filters: any,
		pagination: any,
		sort: string,
		searchText: string,
	): Promise<ICategoryWithMeta> => {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const searchCriteria = {
			$or: [
				{ name: { $regex: searchText, $options: 'i' } },
				{ desc: { $regex: searchText, $options: 'i' } },
				// { 'updated.name': { $regex: searchText, $options: 'i' } },
			],
		};

		const filterSearch = { ...criteria, ...searchCriteria };

		const categoryList: ICategory[] = await Category.find(filterSearch)
			.select(this.removeFields + 'desc')
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCount = await Category.countDocuments(filterSearch);

		const data: ICategoryWithMeta = {
			data: categoryList,
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
