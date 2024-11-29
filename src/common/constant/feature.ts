import { IFieldAttributes } from '../packages/utils/common-validator';

export default class FeatureAttributes {
	static featureId: IFieldAttributes = {
		fieldName: 'Id',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Id can only be alphabets and numbers, only 24 characters long',
	};
	static name: IFieldAttributes = {
		fieldName: 'name',
		type: 'string',
		regex: /^[A-Za-z .-]{3,50}$/,
		minLength: 3,
		maxLength: 50,
		message: 'Name can only be alphabets, spaces, dots and hyphens with Max and Min length of 50 and 3 respectively',
	};

	static desc: IFieldAttributes = {
		fieldName: 'description',
		type: 'string',
		regex: /^[^<>]{10,1000}$/,
		minLength: 10,
		maxLength: 1000,
		message: 'Description can contain characters except < > with Max and Min length of 1000 and 10 respectively',
	};

	static code: IFieldAttributes = {
		fieldName: 'code',
		type: 'string',
		regex: /^[A-Za-z]{3,20}$/,
		minLength: 3,
		maxLength: 20,
		message: 'Code can only be alphabets with Max and Min length of 20 and 3 respectively',
	};

	static type: IFieldAttributes = {
		fieldName: 'valueCode',
		type: 'string',
		regex: /^[A-Za-z]{3,20}$/,
		minLength: 3,
		maxLength: 20,
		message: 'Validvalue value Code can only be alphabets with Max and Min length of 20 and 3 respectively',
	};

	static sort: IFieldAttributes = {
		fieldName: 'sort',
		type: 'number',
		minValue: 1,
		maxValue: 10000,
		message: 'Sort can only be a number between 1 and 10000',
	};

	static reason: IFieldAttributes = {
		fieldName: 'reason',
		type: 'string',
		regex: /^[A-Za-z0-9 .,'@&:-]{10,500}$/,
		minLength: 10,
		maxLength: 500,
		message: `Reason can be alphanumeric and contain ( .,'@&:-) these special characters with  Max and Min length of 500 and 10 respectively`,
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
}
