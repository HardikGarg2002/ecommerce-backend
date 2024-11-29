import { IPagination } from './pagination';
import { IUser } from './user';

export interface ICategory {
	_id?: string;
	name: string;
	desc: string;
	code?: string;
	is_active?: boolean;
	img_url: string;
	created?: IUser;
	updated?: IUser;
	sort: number;
}

export interface ICategoryWithMeta {
	data: ICategory[];
	meta: {
		pagination: IPagination;
	};
}

export interface ICategoryInput {
	_id?: string;
	name: string;
	desc1: string;
	code?: string;
	is_active?: boolean;
	img_url: string;
	created?: IUser;
	updated?: IUser;
	sort: number;
}

export interface ICategoryInputWithMeta {
	data: ICategoryInput[];
	meta: {
		pagination: IPagination;
	};
}
