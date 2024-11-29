import BannerAttributes from '../common/constant/banner';
import BannerService from '../service/banner-service';
import CategoryService from '../service/category-service';
import SubcategoryService from '../service/subcategory-service';
import { IBanner, IBannerType, IBannerWithMeta } from '../common/type/banner';
// import { CommonValidator } from './packages/utils';
import { IUser } from '../common/type/user';
import { CommonValidator } from '../common/packages/utils';

export default class BannerController {
	private _bannerService = new BannerService();
	private _categoryService = new CategoryService();
	private _subcategoryService = new SubcategoryService();

	public create = async (bannerInput: IBanner) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: bannerInput.name, attributes: BannerAttributes.name });
		inputFields.push({ value: bannerInput.desc, attributes: BannerAttributes.desc });
		inputFields.push({ value: bannerInput.code, attributes: BannerAttributes.code });
		inputFields.push({ value: bannerInput.start_date, attributes: BannerAttributes.start_date });
		inputFields.push({ value: bannerInput.end_date, attributes: BannerAttributes.end_date });
		inputFields.push({ value: bannerInput.sort, attributes: BannerAttributes.sort });
		inputFields.push({ value: bannerInput.img_url, attributes: BannerAttributes.img_url });
		inputFields.push({ value: bannerInput.redirect_url, attributes: BannerAttributes.redirect_url });
		inputFields.push({ value: bannerInput.location.type, attributes: BannerAttributes.type });
		if (bannerInput.location.type === IBannerType.Category) {
			await this._categoryService.getByCode(bannerInput.location.code!.trim(), true);
		}
		if (bannerInput.location.type === IBannerType.Subcategory) {
			await this._subcategoryService.validateSubcategoryCode(bannerInput.location.code!.trim());
		}
		if (bannerInput.location.type === IBannerType.Home) {
			bannerInput.location.code = undefined;
		}
		//TODO for the remaining types also such as offer (Note : in case of the home no need of the code)
		CommonValidator.validateAndThrowError(inputFields);
		return await this._bannerService.create(bannerInput);
	};

	public get = async (filters: any, pagination: any, sort: string) => {
		const bannersWithMeta: IBannerWithMeta = await this._bannerService.get(filters, pagination, sort);
		return bannersWithMeta;
	};

	public getById = async (id: string) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: BannerAttributes.bannerId });
		CommonValidator.validateAndThrowError(inputFields);
		return await this._bannerService.getById(id.trim());
	};

	public search = async (filters: any, pagination: any, sort: string, searchText: string): Promise<IBannerWithMeta> => {
		const validateInputs: CommonValidator.IValidateFieldInput[] = [];
		validateInputs.push({ value: searchText, attributes: BannerAttributes.searchText });
		CommonValidator.validateAndThrowError(validateInputs);
		return await this._bannerService.search(filters, pagination, sort, searchText.trim());
	};

	public patch = async (
		id: string,
		reason: string,
		user: IUser,
		name?: string,
		desc?: string,
		start_date?: string,
		end_date?: string,
		sort?: number,
		img_url?: string,
		redirect_url?: string,
	) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: BannerAttributes.bannerId });
		name && inputFields.push({ value: name, attributes: BannerAttributes.name });
		desc && inputFields.push({ value: desc, attributes: BannerAttributes.desc });
		start_date && inputFields.push({ value: start_date, attributes: BannerAttributes.start_date });
		end_date && inputFields.push({ value: end_date, attributes: BannerAttributes.end_date });
		sort && inputFields.push({ value: sort, attributes: BannerAttributes.sort });
		img_url && inputFields.push({ value: img_url, attributes: BannerAttributes.img_url });
		redirect_url && inputFields.push({ value: redirect_url, attributes: BannerAttributes.redirect_url });
		inputFields.push({ value: reason, attributes: BannerAttributes.reason });
		const errors = CommonValidator.validateAndReturnErrors(inputFields);
		if (!name && !desc && !start_date && !end_date && !sort && !img_url && !redirect_url) {
			errors.addError('Banner', 'One field must be provided', 'ERR_MANDATE');
		}
		CommonValidator.checkAndThrowError(errors);
		// CommonValidator.validateAndThrowError(inputFields);

		return await this._bannerService.patch(
			id.trim(),
			reason.trim(),
			user,
			name?.trim(),
			desc?.trim(),
			start_date?.trim(),
			end_date?.trim(),
			sort,
			img_url?.trim(),
			redirect_url?.trim(),
		);
	};

	// public patch = async (id: string, reason: string, user: IUser, bannerInput: Partial<IBanner>) => {
	// 	const inputFields: CommonValidator.IValidateFieldInput[] = [];
	// 	inputFields.push({ value: id, attributes: BannerAttributes.bannerId });
	// 	bannerInput.name && inputFields.push({ value: bannerInput.name, attributes: BannerAttributes.name });
	// 	bannerInput.desc && inputFields.push({ value: bannerInput.desc, attributes: BannerAttributes.desc });
	// 	bannerInput.start_date &&
	// 		inputFields.push({ value: bannerInput.start_date, attributes: BannerAttributes.start_date });
	// 	bannerInput.end_date && inputFields.push({ value: bannerInput.end_date, attributes: BannerAttributes.end_date });
	// 	bannerInput.sort && inputFields.push({ value: bannerInput.sort, attributes: BannerAttributes.sort });
	// 	bannerInput.img_url && inputFields.push({ value: bannerInput.img_url, attributes: BannerAttributes.img_url });
	// 	bannerInput.redirect_url &&
	// 		inputFields.push({ value: bannerInput.redirect_url, attributes: BannerAttributes.redirect_url });
	// 	inputFields.push({ value: reason, attributes: BannerAttributes.reason });
	// 	const errors = CommonValidator.validateAndReturnErrors(inputFields);
	// 	if (Object.keys(bannerInput).length < 1) {
	// 		errors.addError('Banner', 'One field must be provided', 'ERR_MANDATE');
	// 	}
	// 	CommonValidator.checkAndThrowError(errors);
	// 	// CommonValidator.validateAndThrowError(inputFields);

	// 	return await this._bannerService.patch(id.trim(), reason.trim(), user, bannerInput);
	// };

	public activate = async (id: string, reason: string, user: IUser, active: boolean) => {
		const inputFields: CommonValidator.IValidateFieldInput[] = [];
		inputFields.push({ value: id, attributes: BannerAttributes.bannerId });
		inputFields.push({ value: reason, attributes: BannerAttributes.reason });
		inputFields.push({ value: active, attributes: BannerAttributes.active });

		CommonValidator.validateAndThrowError(inputFields);

		return await this._bannerService.activate(id.trim(), reason.trim(), user, active);
	};

	// public activate = async (id: string, reason: string, user: IUser, bannerInput: Partial<IBanner>) => {
	// 	const inputFields: CommonValidator.IValidateFieldInput[] = [];
	// 	inputFields.push({ value: id, attributes: BannerAttributes.bannerId });
	// 	inputFields.push({ value: reason, attributes: BannerAttributes.reason });
	// 	inputFields.push({ value: bannerInput.is_active, attributes: BannerAttributes.active });

	// 	CommonValidator.validateAndThrowError(inputFields);

	// 	return await this._bannerService.activate(id.trim(), reason.trim(), user, bannerInput);
	// };
}
