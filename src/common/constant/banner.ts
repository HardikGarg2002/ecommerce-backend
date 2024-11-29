import { IFieldAttributes } from '../packages/utils/common-validator';

export default class BannerAttributes {
	static CONFIG_BANNER_MAX_COUNT = 10;
	static type: IFieldAttributes = {
		fieldName: 'locationType',
		type: 'enum',
		enumValues: ['category', 'subcategory', 'offer', 'home'],
		message: 'The available type levels are: category, subcategory, offer or home.',
	};

	static name: IFieldAttributes = {
		fieldName: 'name',
		type: 'string',
		regex: /^[A-Za-z .-]{3,50}$/,
		message: 'Name can only be alphabets, spaces, dots and hyphens with Max and Min length of 50 and 3 respectively',
	};

	static bannerId: IFieldAttributes = {
		fieldName: 'Id',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Id can only be alphabets, only 24 characters long',
	};

	static desc: IFieldAttributes = {
		fieldName: 'desc',
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

	static sort: IFieldAttributes = {
		fieldName: 'sort',
		type: 'number',
		minValue: 1,
		maxValue: 100,
		message: 'Sort can only be a number between 1 and 100',
	};

	static img_url: IFieldAttributes = {
		fieldName: 'imageUrl',
		type: 'string',
		regex: /\bhttps?:\/\/\S+?\.(jpg|jpeg|png|gif|bmp|webp)\b/,
		minLength: 50,
		maxLength: 500,
		message: 'Invalid image url/format',
	};

	static redirect_url: IFieldAttributes = {
		fieldName: 'redirectUrl',
		type: 'string',
		regex: /^[^<>]{10,1000}$/,
		minLength: 10,
		maxLength: 1000,
		message: 'Invalid redirect url',
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
	static start_date: IFieldAttributes = {
		fieldName: 'startDate',
		type: 'string',
		// regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2}$/,
		regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
		// regex:
		// 	/^(20[0-9]{2}|21[0-8][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]Z)$/, // vinay sir date valdiation
		// minLength: 10,
		// maxLength: 500,
		// regex: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$/,

		message: `Invalid datetime/format (YYYY-MM-DD)`,
	};

	static end_date: IFieldAttributes = {
		fieldName: 'endDate',
		type: 'string',
		regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
		// regex:
		// /^(20[0-9]{2}|21[0-8][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]Z)$/, // vinay sir date valdiation
		// regex: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$/,

		// regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2}$/,
		// regex:
		// 	/^(?:(?:19|20)\d\d)-(?:0[1-9]|1[0-2])-(?:(?:0[1-9]|1[0-9]|2[0-8])|(?:29(?:(?:0[13-9]|1[0-2]))|30(?:(?:0[13-9]|1[0-2]))|31(?:(?:0[13578]|1[02]))))$/,
		// minLength: 10,
		// maxLength: 500,
		message: `Invalid datetime format (YYYY-MM-DDTHH:mm:ssZ)`,
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
