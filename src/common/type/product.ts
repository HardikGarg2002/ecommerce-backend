import { ObjectId } from 'mongoose';
import { IUser } from './user';
import { IPagination } from './pagination';
import { ITag } from './tag';

export interface IProductImage {
	primary: string;
	additional: string[];
}

export interface IProductPrices {
	mrp: number;
	pbt: number;
	taxpct: number;
	sp?: number;
}

export interface IProductFeatures {
	code: string;
	value: string;
	sort?: number;
}
export interface IProduct {
	_id?: string;
	name: string;
	desc: string;
	sku: string;
	sort?: number;
	is_active: boolean;
	offer: boolean;
	oos: boolean;
	unit: {
		quantity: number;
		measure: string;
	};
	images: IProductImage;
	features: IProductFeatures[];
	category_code: string;
	subcategory_code: string;
	tags: Partial<ITag>[];
	aliases: string[];
	hsn_code: string;
	// packaging?: string;
	// brand: string;
	variant_id?: string | ObjectId;
	relatedproducts?: (string | ObjectId)[];
	prices: IProductPrices;
	responseMessage?: string;
	created?: IUser;
	updated?: IUser;
}

export interface IProductWithMeta {
	data: IProduct[];
	meta: {
		pagination: IPagination;
	};
}

export default IProduct;
