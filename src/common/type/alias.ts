import { IPagination } from './pagination';
import { IUser } from './user';

export interface IAlias {
	_id?: string;
	name: string;
	is_active?: boolean;
	created?: IUser;
	updated?: IUser;
}

export interface IAliasWithMeta {
	data: IAlias[];
	meta: {
		pagination: IPagination;
	};
}
