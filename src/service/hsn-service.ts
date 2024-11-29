import { BusinessError } from '../common/packages/common-errors/common-errors';
import dbutils from '../common/packages/db-utils';
import { IHsn, IHsnWithMeta } from '../common/type/hsn';
import Hsn from '../model/hsn';
import { IUser } from '../common/type/user';
import { audit } from '../common/util';

export default class HsnService {
	private async save(hsnInput: IHsn, isNew: boolean = false): Promise<IHsn> {
		const hsn = new Hsn(hsnInput);
		hsn.isNew = isNew;
		return (await hsn.save()).toObject();
	}

	public async get(filters: any, pagination: any, sort: string): Promise<IHsnWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const hsnList: IHsn[] = await Hsn.find(criteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Hsn.countDocuments(criteria);

		const data: IHsnWithMeta = {
			data: hsnList,
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

	public async getById(id: string): Promise<IHsn> {
		const hsn: IHsn | null = await Hsn.findById(id).lean();
		if (!hsn) throw new BusinessError(`Hsn does not exist by this id ${id}`, `ERR_NOT_FOUND`);
		return hsn;
	}
	public async getByCode(code: string, statusError: boolean = false): Promise<IHsn> {
		const hsn: IHsn | null = await Hsn.findOne({ code }).lean();
		if (!hsn) throw new BusinessError(`Hsn does not exist by code ${code}`, `ERR_NOT_FOUND`);
		if (statusError === true && hsn.is_active === false) {
			throw new BusinessError('Hsn Inactive', 'ERR_INACTIVE_HSN');
		}
		return hsn;
	}
	public search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<IHsnWithMeta> => {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const searchCriteria = {
			$or: [
				{ code: { $regex: searchText, $options: 'i' } },
				{ desc: { $regex: searchText, $options: 'i' } },
				{ 'updated.name': { $regex: searchText, $options: 'i' } },
			],
		};

		const filterSearch = { ...criteria, ...searchCriteria };

		const hsnList: IHsn[] = await Hsn.find(filterSearch)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCount = await Hsn.countDocuments(filterSearch);

		const data: IHsnWithMeta = {
			data: hsnList,
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

	public async create(hsnInput: IHsn): Promise<string> {
		await this.validateCodeUnique(hsnInput.code);
		const newHsn = await this.save(hsnInput, true);
		await audit(newHsn._id!, 'hsn', 'create', 'hsn', 'creating new hsn', hsnInput.updated!, newHsn);
		return newHsn._id!;
	}

	public async patch(
		id: string,
		updated: IUser,
		reason: string,
		code?: string,
		desc?: string,
		gst?: number,
		is_active?: boolean,
	): Promise<void> {
		const existingHsn = await this.getById(id);

		// if (is_active === undefined && !existingHsn.is_active)
		// 	throw new BusinessError(`Cannot edit inactive hsn`, `ERR_NOTEDITABLE`);

		if (code && code?.toLowerCase() !== existingHsn.code.toLowerCase()) await this.validateCodeUnique(code);
		const updatedHsn: IHsn = {
			...existingHsn,
			code: code ?? existingHsn.code,
			desc: desc ?? existingHsn.desc,
			gst: gst ?? existingHsn.gst,
			is_active: is_active ?? existingHsn.is_active,
			updated,
		};
		const savedHsn = await this.save(updatedHsn);
		await audit(existingHsn._id!, 'hsn', 'update', 'hsn', reason, updated, savedHsn, existingHsn);
	}

	public async activate(id: string, user: IUser, reason: string, is_active: boolean): Promise<void> {
		await this.patch(id, user, reason, undefined, undefined, undefined, is_active);
	}

	public async validateCodeUnique(code: string): Promise<void> {
		if (await Hsn.exists({ code: { $regex: new RegExp('^' + code + '$', 'i') } })) {
			throw new BusinessError('hsn with the same code already exists in the Database', 'Err_DUPLICATES');
		}
	}
}
