import { BusinessError } from '../common/packages/common-errors/common-errors';
import dbutils from '../common/packages/db-utils';
import Feature from '../model/feature';
import { IFeature, IFeatureWithMeta } from '../common/type/feature';
import { IUser } from '../common/type/user';
import { audit } from '../common/util';
import ProductService from './product-service';

export default class FeatureService {
	private _productService = new ProductService();
	private async _validateNameAndCodeUnique(name: string, code?: string) {
		const matchedFeature: IFeature[] = await Feature.find({
			$or: [
				{ name: { $regex: new RegExp(`^${name?.trim()}$`), $options: 'i' } },
				{ code: { $regex: new RegExp(`^${code?.trim()}$`), $options: 'i' } },
			],
		});
		if (matchedFeature.length > 0)
			throw new BusinessError('feature with the same name/code already exists in database', 'ERR_DUPLICATE');
	}

	public async get(filters: any, pagination: any, sort: string): Promise<IFeatureWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);

		const featuresList: IFeature[] = await Feature.find(criteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Feature.countDocuments(criteria);

		const data: IFeatureWithMeta = {
			data: featuresList,
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

	public async getById(id: string): Promise<IFeature> {
		const feature = await Feature.findById(id).lean();
		if (!feature) {
			throw new BusinessError('feature not found', 'ERR_NOT_FOUND');
		}

		return feature;
	}

	public async getByCode(code: string): Promise<IFeature> {
		const feature = await Feature.findOne({ code }).lean();
		if (!feature) {
			throw new BusinessError(`feature with ${code} not found`, 'ERR_NOT_FOUND');
		}

		return feature;
	}

	public async save(featureInput: IFeature, isNew: boolean = false): Promise<IFeature> {
		const feature = new Feature(featureInput);
		feature.isNew = isNew;
		return (await feature.save()).toObject();
	}

	public search = async (
		filters: any,
		pagination: any,
		sort: string,
		searchText: string,
	): Promise<IFeatureWithMeta> => {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const searchCriteria = {
			$or: [
				{ name: { $regex: searchText, $options: 'i' } },
				{ desc: { $regex: searchText, $options: 'i' } },
				{ 'updated.name': { $regex: searchText, $options: 'i' } },
			],
		};

		const filterSearch = { ...criteria, ...searchCriteria };

		const featureList: IFeature[] = await Feature.find(filterSearch)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCount = await Feature.countDocuments(filterSearch);

		const data: IFeatureWithMeta = {
			data: featureList,
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

	public async create(featureInput: IFeature): Promise<string> {
		await this._validateNameAndCodeUnique(featureInput.name, featureInput.code);
		const newFeature = await this.save(featureInput, true);
		//AUDIT
		await audit(newFeature._id!, 'feature', 'create', 'feature', 'New', featureInput.created!, newFeature);

		return newFeature._id!;
	}

	public async patch(
		updated: IUser,
		id: string,
		reason: string,
		name?: string,
		desc?: string,
		sort?: number,
	): Promise<void> {
		const existingFeature = await this.getById(id);
		name && existingFeature.name.toLowerCase() != name.toLowerCase() && (await this._validateNameAndCodeUnique(name));
		if (sort) {
			await this._productService.updateSortOftheProductFeature(existingFeature.code, sort, updated);
		}
		const updatedFeature: IFeature = {
			...existingFeature,
			name: name ?? existingFeature.name,
			desc: desc ?? existingFeature.desc,
			sort: sort ?? existingFeature.sort,
			updated,
		};
		const savedFeature = await this.save(updatedFeature);
		await audit(existingFeature._id!, 'feature', 'update', 'feature', reason, updated, savedFeature!, existingFeature);
	}

	public async remove(user: IUser, id: string, reason: string) {
		// to do find if not associated to any product //
		const feature = await this.getById(id);
		const productsAssociated = await this._productService.getProductsWithFeatureCode(feature.code);
		if (productsAssociated.length > 0) {
			throw new BusinessError('features associated to the products cannot be deleted', 'ERR_EXIST');
		}
		await Feature.findByIdAndDelete(id).lean();
		await audit(id, 'feature', 'delete', 'feature', reason, user, undefined, feature);
	}
}
