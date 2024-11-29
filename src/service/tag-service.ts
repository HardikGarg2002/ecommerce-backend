import { BusinessError } from '../common/packages/common-errors/common-errors';
import { ITag, ITagWithMeta } from '../common/type/tag';
import Tag from '../model/tag';
import dbutils from '../common/packages/db-utils';
import { IUser } from '../common/type/user';
import { audit } from '../common/util';

export default class TagService {
	public async getById(id: string, statusError: boolean = false): Promise<ITag> {
		const tag: ITag | null = await Tag.findById(id).lean();
		if (!tag) throw new BusinessError(`Tag does not exist by this id ${id}`, `ERR_NOT_FOUND`);
		if (statusError === true && tag.is_active === false) {
			throw new BusinessError('Tag Inactive', 'ERR_INACTIVE_TAG');
		}
		return tag;
	}

	public async get(filters: any, pagination: any, sort: string): Promise<ITagWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const tagList: ITag[] = await Tag.find(criteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Tag.countDocuments(criteria);

		const data: ITagWithMeta = {
			data: tagList,
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

	public async save(input: ITag, isNew: boolean = false): Promise<ITag> {
		const tag = new Tag(input);
		tag.isNew = isNew;
		return (await tag.save()).toObject();
	}

	public search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<ITagWithMeta> => {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const searchCriteria = {
			$or: [
				{ text: { $regex: searchText, $options: 'i' } },
				{ slug: { $regex: searchText, $options: 'i' } },
				{ 'updated.name': { $regex: searchText, $options: 'i' } },
			],
		};

		const filterSearch = { ...criteria, ...searchCriteria };

		const tagList: ITag[] = await Tag.find(filterSearch)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCount = await Tag.countDocuments(filterSearch);

		const data: ITagWithMeta = {
			data: tagList,
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

	public async create(tagInput: ITag): Promise<string> {
		const slug = tagInput.text.replace(/[^\w]/g, '').toLowerCase();
		await this.checkDuplicates(slug);
		tagInput.slug = slug;
		const newTag: ITag = await this.save(tagInput, true);
		//Audit
		await audit(newTag._id!, 'tag', 'create', 'tag', 'New', tagInput.updated!, newTag);

		return newTag._id!;
	}

	public async activate(id: string, updated: IUser, reason: string, is_active: boolean): Promise<void> {
		const existingTag: ITag = await this.getById(id);
		const updatedTag: ITag = { ...existingTag, is_active, updated };
		if (is_active !== existingTag.is_active) {
			const savedTag: ITag = await this.save(updatedTag, false);
			await audit(existingTag._id!, 'tag', 'update', 'tag', reason, updated, savedTag, existingTag);
		}
	}

	public async checkDuplicates(slug: string): Promise<void> {
		if (await Tag.exists({ slug })) {
			throw new BusinessError('Tag with the same text already exists in the Database', 'Err_DUPLICATES');
		}
	}

	public makeSortCriteria(sort: string): any {
		const [field, sortOption] = sort.split(':');
		return { [field]: sortOption };
	}
}
