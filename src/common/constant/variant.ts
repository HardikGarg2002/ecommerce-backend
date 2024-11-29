import { IFieldAttributes } from '../packages/utils/common-validator';
import { IVariantType } from '../type/variant';

export default class VariantAttributes {
	static type: IFieldAttributes = {
		fieldName: 'type',
		type: 'enum',
		enumValues: Object.values(IVariantType),
		message: `variant type can only includes ${Object.values(IVariantType)}`,
	};
	static variantId: IFieldAttributes = {
		fieldName: 'Id',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Variant Id can only be alphabets, only 24 characters long',
	};
	static productId: IFieldAttributes = {
		fieldName: 'ProductId',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Product Id can only be alphabets, only 24 characters long',
	};
	static active: IFieldAttributes = {
		fieldName: 'active',
		type: 'boolean',
	};
	static searchText: IFieldAttributes = {
		fieldName: 'searchText',
		type: 'string',
		regex: /^[^<>]{3,500}$/,
		minLength: 3,
		maxLength: 500,
		message:
			'Search text must be a string with a length greater than 3 and up to 500 characters, allowing uppercase and lowercase letters, numbers',
	};
	static color: IFieldAttributes = {
		fieldName: 'color',
		type: 'string',
		regex: /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/,
		minLength: 3,
		maxLength: 500,
		message: 'Color should be valid hex code',
	};
	static quantity: IFieldAttributes = {
		fieldName: 'quantity',
		type: 'number',
		minValue: 0,
		message: 'Quantity should be a non-negative number',
	};
	static measure: IFieldAttributes = {
		fieldName: 'measure',
		type: 'string',
		regex: /^[^<>]{2,500}$/,
		minLength: 2,
		maxLength: 500,
		message:
			'Measure must be a string with a length greater than 2 and up to 500 characters, allowing uppercase and lowercase letters, numbers',
	};
	static value: IFieldAttributes = {
		fieldName: 'value',
		type: 'string',
		regex: /^[^<>]{2,500}$/,
		minLength: 2,
		maxLength: 500,
		message:
			'value must be a string with a length greater than 2 and up to 500 characters, allowing uppercase and lowercase letters, numbers',
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
