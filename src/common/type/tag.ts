import { IPagination } from './pagination';
import { IUser } from './user';

export interface ITag {
	_id?: string;
	text: string;
	slug: string;
	is_active?: boolean;
	created?: IUser;
	updated?: IUser;
}

export interface ITagWithMeta {
	data: ITag[];
	meta: {
		pagination: IPagination;
	};
}
