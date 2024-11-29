import { IPagination } from './pagination';
import { IUser } from './user';

export interface IFeature {
	_id?: string;
	name: string;
	desc: string;
	code: string;
	type: string;
	sort: number;
	created?: IUser;
	updated?: IUser;
}

export interface IFeatureWithMeta {
	data: IFeature[];
	meta: {
		pagination: IPagination;
	};
}
