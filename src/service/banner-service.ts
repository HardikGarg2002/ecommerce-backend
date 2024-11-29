import Banner from '../model/banner';
import { BusinessError } from '../common/packages/common-errors/common-errors';
import { IBanner, IBannerWithMeta } from '../common/type/banner';
import { audit, validateDate } from '../common/util';
import dbutils from '../common/packages/db-utils';
import { IUser } from '../common/type/user';
import BannerAttributes from '../common/constant/banner';

export default class BannerService {
	private async _validateNameAndCodeUnique(name: string, code?: string): Promise<void> {
		const matchedBanner: IBanner[] = await Banner.find({
			$or: [
				{ name: { $regex: new RegExp(`^${name?.trim()}$`), $options: 'i' } },
				{ code: { $regex: new RegExp(`^${code?.trim()}$`), $options: 'i' } },
			],
		});
		if (matchedBanner.length > 0) {
			throw new BusinessError('banner with the same name and code already exists in database', 'ERR_DUPLICATE');
		}
	}

	private async _configBannerLimit(locationType: string, startDate: string, endDate: string): Promise<void> {
		const bannerCount = await Banner.countDocuments({
			'location.type': locationType.trim(),
			$or: [
				{
					start_date: { $lte: new Date(endDate) },
					end_date: { $gte: new Date(startDate) },
				},
				{
					start_date: { $gte: new Date(startDate) },
					end_date: { $lte: new Date(endDate) },
				},
			],
			is_active: true,
		});
		console.log('banner count in the config banner limit ', bannerCount);
		if (bannerCount >= BannerAttributes.CONFIG_BANNER_MAX_COUNT) {
			throw new BusinessError('Number of banners exceeds the limit', 'ERR_LIMIT_EXCEEDED');
		}
	}
	public async get(filters: any, pagination: any, sort: string): Promise<IBannerWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const bannerList: IBanner[] = await Banner.find(criteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Banner.countDocuments(criteria);
		const data: IBannerWithMeta = {
			data: bannerList,
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

	public async getById(id: string): Promise<IBanner> {
		const banner = await Banner.findById(id).lean();
		if (!banner) {
			throw new BusinessError('banner not found', 'ERR_NOT_FOUND');
		}
		return banner;
	}

	public search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<IBannerWithMeta> => {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const searchCriteria = {
			$or: [
				{ name: { $regex: searchText, $options: 'i' } },
				{ desc: { $regex: searchText, $options: 'i' } },
				{ code: { $regex: searchText, $options: 'i' } },
				{ 'updated.name': { $regex: searchText, $options: 'i' } },
			],
		};

		const filterSearch = { ...criteria, ...searchCriteria };

		const bannerList: IBanner[] = await Banner.find(filterSearch)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCount = await Banner.countDocuments(filterSearch);

		const data: IBannerWithMeta = {
			data: bannerList,
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

	public async create(bannerInput: IBanner): Promise<string> {
		await this._validateNameAndCodeUnique(bannerInput.name, bannerInput.code);
		validateDate(bannerInput.start_date.toString(), bannerInput.end_date.toString());
		await this._configBannerLimit(
			bannerInput.location.type,
			bannerInput.start_date.toString(),
			bannerInput.end_date.toString(),
		);
		const newBanner = await this.save(bannerInput, true);
		//AUDIT
		await audit(newBanner._id!, 'banner', 'create', 'banner', 'New', bannerInput.updated!, newBanner);
		return newBanner._id!;
	}

	public async patch(
		id: string,
		reason: string,
		updated: IUser,
		nameInput?: string,
		desc?: string,
		startDate?: string,
		endDate?: string,
		sortInput?: number,
		img?: string,
		redirectUrl?: string,
		is_activeInput?: boolean,
	): Promise<void> {
		const existingBanner = await this.getById(id);
		// if (is_activeInput === undefined && !existingBanner.is_active) {
		// 	throw new BusinessError(`Inactive Banner can not be modified`, 'ERR_BANNER_INACTIVE');
		// }
		nameInput &&
			nameInput.toLowerCase() != existingBanner.name.toLowerCase() &&
			(await this._validateNameAndCodeUnique(nameInput));

		const start_date = startDate ? new Date(startDate) : existingBanner.start_date;
		const end_date = endDate ? new Date(endDate) : existingBanner.end_date;
		// no need to validate date if request is to deactivate banner
		is_activeInput !== false && validateDate(start_date.toString(), end_date.toString());

		if ((startDate || endDate) && is_activeInput !== false) {
			if (start_date >= existingBanner.start_date && end_date <= existingBanner.end_date) {
				console.log('Dates accepted');
			} else {
				await this._configBannerLimit(existingBanner.location.type, start_date.toString(), end_date.toString());
			}
		}

		const updatedBanner: IBanner = {
			...existingBanner,
			name: nameInput ? nameInput : existingBanner.name,
			desc: desc ?? existingBanner.desc,
			sort: sortInput ?? existingBanner.sort,
			img_url: img ?? existingBanner.img_url,
			redirect_url: redirectUrl ?? existingBanner.redirect_url,
			is_active: is_activeInput ?? existingBanner.is_active,
			updated,
			start_date,
			end_date,
		};
		const savedBanner = await this.save(updatedBanner);
		//AUDIT
		await audit(existingBanner._id!, 'banner', 'update', 'banner', reason, updated, savedBanner, existingBanner);
	}

	// public async patch(id: string, reason: string, updated: IUser, bannerInput: Partial<IBanner>): Promise<void> {
	// 	const existingBanner = await this.getById(id);
	// 	if (bannerInput.is_active === undefined && !existingBanner.is_active) {
	// 		throw new BusinessError(`Inactive Banner can not be modified`, 'ERR_BANNER_INACTIVE');
	// 	}
	// 	bannerInput.name && (await this._validateNameAndCodeUnique(bannerInput.name));
	// 	const start_date = bannerInput.start_date ? new Date(bannerInput.start_date) : existingBanner.start_date;
	// 	const end_date = bannerInput.end_date ? new Date(bannerInput.end_date) : existingBanner.end_date;
	// 	validateDate(start_date.toString(), end_date.toString());

	// 	if ((bannerInput.start_date || bannerInput.end_date) && bannerInput.is_active !== false) {
	// 		if (start_date >= existingBanner.start_date && end_date <= existingBanner.end_date) {
	// 			console.log('Dates accepted');
	// 		} else {
	// 			await this._configBannerLimit(existingBanner.location.type, start_date.toString(), end_date.toString());
	// 		}
	// 	}
	// 	const updatedBanner: IBanner = {
	// 		...existingBanner,
	// 		name: bannerInput.name ? bannerInput.name : existingBanner.name,
	// 		desc: bannerInput.desc ?? existingBanner.desc,
	// 		sort: bannerInput.sort ?? existingBanner.sort,
	// 		img_url: bannerInput.img_url ?? existingBanner.img_url,
	// 		redirect_url: bannerInput.redirect_url ?? existingBanner.redirect_url,
	// 		is_active: bannerInput.is_active ?? existingBanner.is_active,
	// 		updated,
	// 		start_date,
	// 		end_date,
	// 	};
	// 	const savedBanner = await this.save(updatedBanner);
	// 	//AUDIT
	// 	await audit(existingBanner._id!, 'banner', 'update', 'banner', reason, updated, savedBanner, existingBanner);
	// 	console.log(reason);
	// }

	public async activate(id: string, reason: string, user: IUser, status: boolean): Promise<void> {
		await this.patch(
			id,
			reason,
			user,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			status,
		);
	}

	// public async activate(id: string, reason: string, user: IUser, bannerInput: Partial<IBanner>): Promise<void> {
	// 	await this.patch(id, reason, user, bannerInput);
	// }

	public async save(bannerInput: IBanner, isNew: boolean = false): Promise<IBanner> {
		const banner = new Banner(bannerInput);
		banner.isNew = isNew;
		return (await banner.save()).toObject();
	}
}
