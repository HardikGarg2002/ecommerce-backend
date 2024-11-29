import { IFieldAttributes } from '../packages/utils/common-validator';

export default class HsnAttributes {
	static code: IFieldAttributes = {
		fieldName: 'code',
		type: 'string',
		regex: /^[a-zA-Z0-9]{4,15}$/,
		message: 'code can contain only alphanumeric characters with Max and Min length of 15 and 4 respectively',
	};
	static desc: IFieldAttributes = {
		fieldName: 'desc',
		type: 'string',
		regex: /^[^<>]{10,100}$/,
		minLength: 10,
		maxLength: 100,
		message: 'Description can contain characters except < > with Max and Min length of 100 and 10 respectively',
	};
	static gst: IFieldAttributes = {
		fieldName: 'gst',
		type: 'number',
		minValue: 0,
		maxValue: 28,
		message: 'gst can only be postive number',
	};
	static id: IFieldAttributes = {
		fieldName: 'Id',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Hsn id can only be alphabets, only 24 characters long',
	};
	static active: IFieldAttributes = {
		fieldName: 'active',
		type: 'boolean',
		message: 'active field can only be true or false',
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
