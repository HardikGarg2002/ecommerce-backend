import { CommonValidator } from '../common/packages/utils';
import { ITag, ITagWithMeta } from '../common/type/tag';
import TagService from '../service/tag-service';
import TagAttributes from '../common/constant/tag';
import { IUser } from '../common/type/user';

export default class TagController {
	private _tagService = new TagService();

	public create = async (tagInput: ITag): Promise<string> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({
			value: tagInput.text,
			attributes: TagAttributes.text,
		});
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._tagService.create(tagInput);
	};

	public get = async (filters: any, pagination: any, sort: string): Promise<ITagWithMeta> => {
		return await this._tagService.get(filters, pagination, sort);
	};

	public getById = async (id: string): Promise<ITag> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: id, attributes: TagAttributes.tagId });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._tagService.getById(id?.trim());
	};

	public search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<ITagWithMeta> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: searchText, attributes: TagAttributes.searchText });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._tagService.search(filters, pagination, sort, searchText.trim());
	};

	public activate = async (id: string, user: IUser, reason: string, is_active: boolean): Promise<void> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: is_active, attributes: TagAttributes.active });
		validateInputs.push({ value: reason, attributes: TagAttributes.reason });
		validateInputs.push({ value: id, attributes: TagAttributes.tagId });
		CommonValidator.validateAndThrowError(validateInputs);
		await this._tagService.activate(id, user, reason, is_active);
	};
}
