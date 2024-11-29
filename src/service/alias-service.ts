import Alias from '../model/alias';
import { BusinessError } from '../common/packages/common-errors/common-errors';
import { IAlias, IAliasWithMeta } from '../common/type/alias';
import dbutils from '../common/packages/db-utils';
import { audit } from '../common/util';
import { IUser } from '../common/type/user';
import ProductService from './product-service';
export default class AliasService {
	private _productService = new ProductService();

	private async _validateNameUnique(name: string) {
		const matchedAliasCount: number = await Alias.countDocuments({
			$or: [{ name: { $regex: new RegExp(`^${name?.trim()}$`), $options: 'i' } }],
		});
		if (matchedAliasCount > 0) {
			throw new BusinessError(`alias with this name already exists in database`, 'ERR_DUPLICATE');
		}
	}
	public async get(filters: any, pagination: any, sort: string): Promise<IAliasWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const aliasList: IAlias[] = await Alias.find(criteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Alias.countDocuments(criteria);
		const data: IAliasWithMeta = {
			data: aliasList,
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
	public async getById(id: string, statusError: boolean = false): Promise<IAlias> {
		const alias = await Alias.findById(id).lean();
		if (!alias) {
			throw new BusinessError('alias not found', 'ERR_NOT_FOUND');
		}
		if (statusError === true && alias.is_active === false) {
			throw new BusinessError('alias Inactive', 'ERR_INACTIVE_ALIAS');
		}
		return alias;
	}

	public search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<IAliasWithMeta> => {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const searchCriteria = {
			$or: [
				{ name: { $regex: searchText, $options: 'i' } },
				{ 'created.name': { $regex: searchText, $options: 'i' } },
				{ 'updated.name': { $regex: searchText, $options: 'i' } },
			],
		};

		const filterSearch = { ...criteria, ...searchCriteria };

		const aliasList: IAlias[] = await Alias.find(filterSearch)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCount = await Alias.countDocuments(filterSearch);

		const data: IAliasWithMeta = {
			data: aliasList,
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

	public async create(aliasInput: IAlias): Promise<string> {
		await this._validateNameUnique(aliasInput.name);
		const newAlias = await this.save(aliasInput, true);
		//AUDIT
		await audit(newAlias._id!, 'alias', 'create', 'alias', 'New', aliasInput.updated!, newAlias);
		return newAlias._id!;
	}

	public async patch(id: string, reason: string, updated: IUser, nameInput?: string, is_activeInput?: boolean) {
		const existingAlias = await this.getById(id);
		nameInput &&
			existingAlias.name.toLowerCase() != nameInput.toLowerCase() &&
			(await this._validateNameUnique(nameInput));

		if (is_activeInput !== undefined && is_activeInput === false) {
			await this._productService.removeAliasFromProducts(id, updated);
		}

		const updatedAlias: IAlias = {
			...existingAlias,
			name: nameInput ?? existingAlias.name,
			is_active: is_activeInput ?? existingAlias.is_active,
			updated,
		};
		const savedAlias = await this.save(updatedAlias);
		//AUDIT
		await audit(existingAlias._id!, 'alias', 'update', 'alias', reason, updated, savedAlias!, existingAlias);
	}

	public async activate(id: string, reason: string, user: IUser, status: boolean): Promise<void> {
		await this.patch(id, reason, user, undefined, status);
	}

	public async save(aliasInput: IAlias, isNew: boolean = false): Promise<IAlias> {
		const alias = new Alias(aliasInput);
		alias.isNew = isNew;
		return (await alias.save()).toObject();
	}
}
