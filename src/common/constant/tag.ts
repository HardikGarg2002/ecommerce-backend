import { IFieldAttributes } from '../packages/utils/common-validator';

export default class TagAttributes {
	static text: IFieldAttributes = {
		fieldName: 'text',
		type: 'string',
		regex: /^[^<>]{3,20}$/,
		message: 'text can contain characters except < > with Max and Min length of 20 and 3 respectively',
	};
	static tagId: IFieldAttributes = {
		fieldName: 'Id',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Tag Id can only be alphabets, only 24 characters long',
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
	static reason: IFieldAttributes = {
		fieldName: 'reason',
		type: 'string',
		regex: /^[A-Za-z0-9 .,'@&:-]{10,500}$/,
		minLength: 10,
		maxLength: 500,
		message: `Reason can be alphanumeric and contain ( .,'@&:-) these special characters with  Max and Min length of 500 and 10 respectively`,
	};
}
