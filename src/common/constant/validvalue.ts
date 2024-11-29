import { IFieldAttributes } from '../packages/utils/common-validator';

export default class ValidvalueAttributes {
	static type: IFieldAttributes = {
		fieldName: 'type',
		type: 'string',
		regex: /^[A-Za-z]{3,20}$/,
		minLength: 3,
		maxLength: 5,
		message: 'Type can only be alphabets with Max and Min length of 5 and 3 respectively',
	};
	static label: IFieldAttributes = {
		fieldName: 'label',
		type: 'string',
		regex: /^[A-Za-z .-]{3,50}$/,
		minLength: 3,
		maxLength: 50,
		message: 'Label can only be alphabets, spaces, dots and hyphens with Max and Min length of 50 and 3 respectively',
	};

	static validvalueId: IFieldAttributes = {
		fieldName: 'Id',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Id can only be alphabets, only 24 characters long',
	};

	static key: IFieldAttributes = {
		fieldName: 'key',
		type: 'string',
		regex: /^[A-Za-z]{3,20}$/,
		minLength: 3,
		maxLength: 20,
		message: 'Value key can only be alphabets with Max and Min length of 5 and 3 respectively',
	};
	static value: IFieldAttributes = {
		fieldName: 'value',
		type: 'string',
		regex: /^[A-Za-z .-]{3,50}$/,
		minLength: 3,
		maxLength: 50,
		message:
			'Value label can only be alphabets, spaces, dots and hyphens with Max and Min length of 50 and 3 respectively',
	};

	static sort: IFieldAttributes = {
		fieldName: 'sort',
		type: 'number',
		minValue: 1,
		maxValue: 10000,
		message: 'Sort can only be postive number and maximum number can be 10000',
	};

	static reason: IFieldAttributes = {
		fieldName: 'reason',
		type: 'string',
		regex: /^[A-Za-z0-9 .,'@&:-]{10,500}$/,
		minLength: 10,
		maxLength: 500,
		message: `Reason can be alphanumeric and contain ( .,'@&:-) these special characters with  Max and Min length of 500 and 10 respectively`,
	};
	static active: IFieldAttributes = {
		fieldName: 'active',
		type: 'boolean',
	};
}
