import { IPagination } from './pagination';
import { IUser } from './user';

export interface ISubcategory {
	_id?: string;
	name: string;
	desc: string;
	code?: string;
	is_active?: boolean;
	category_code: string;
	img_url: string;
	created?: IUser;
	updated?: IUser;
	sort: number;
}

export interface ISubcategoryWithMeta {
	data: ISubcategory[];
	meta: {
		pagination: IPagination;
	};
}
