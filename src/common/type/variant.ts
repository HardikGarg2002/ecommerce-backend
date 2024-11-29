import { ObjectId } from 'mongodb';
import { IUser } from './user';
import { IPagination } from './pagination';

export interface CommonVariantProduct {
	_id: string;
	value: string;
}

export interface UnitVariantProduct {
	_id: string;
	quantity: number;
	measure: string;
}

export enum IVariantType {
	Unit = 'UNIT',
	Model = 'MODEL',
	Size = 'SIZE',
	Color = 'COLOR',
}

export type IVariantProduct = UnitVariantProduct | CommonVariantProduct;

export interface IVariant {
	_id: ObjectId | string;
	type:  IVariantType;
	products: IVariantProduct[];
	created?: IUser;
	updated?: IUser;
}

export interface IVariantWithMeta {
	data: IVariant[];
	meta: {
		pagination: IPagination;
	};
}
