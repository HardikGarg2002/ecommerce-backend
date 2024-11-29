import { IFieldAttributes } from '../packages/utils/common-validator';

export default class RelatedproductAttributes {
	static relatedProductId: IFieldAttributes = {
		fieldName: 'Id',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'related Product id can only be alphabets, only 24 characters long',
	};
	static productId: IFieldAttributes = {
		fieldName: 'Id',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'product id can only be alphabets, only 24 characters long',
	};
	static productIdArray: IFieldAttributes = {
		fieldName: 'productId',
		type: 'stringarray',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Invalid Product id in related array, Product id can only be alphabets, only 24 characters long',
	};

	static sort: IFieldAttributes = {
		fieldName: 'sort',
		type: 'number',
		minValue: 1,
		maxValue: 1000,
		message: 'sort can only be number between 1 to 1000',
	};
	static reason: IFieldAttributes = {
		fieldName: 'reason',
		type: 'string',
		regex: /^[A-Za-z0-9 .,'@&:-]{10,500}$/,
		minLength: 10,
		maxLength: 500,
		message: `Reason can be alphanumeric and contain ( .,'@&:-) these special characters with  Max and Min length of 500 and 10 respectively`,
	};
}
