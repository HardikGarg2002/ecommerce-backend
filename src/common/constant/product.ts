import { IFieldAttributes } from '../packages/utils/common-validator';

export default class ProductAttributes {
	static productId: IFieldAttributes = {
		fieldName: 'Id',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Id can only be alphabets and numbers, only 24 characters long',
	};
	static relatedProductId: IFieldAttributes = {
		fieldName: 'relatedProductId',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'related Product id can only be alphabets, only 24 characters long',
	};
	static productIdArray: IFieldAttributes = {
		fieldName: 'productId',
		type: 'stringarray',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Invalid Product id in related array, Product id can only be alphabets, only 24 characters long',
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

	static quantity: IFieldAttributes = {
		fieldName: 'quantity',
		type: 'number',
		minValue: 0,
		message: 'Quantity should be a non-negative number',
	};

	static imageSort: IFieldAttributes = {
		fieldName: 'imageSort',
		type: 'number',
		minValue: 1,
		maxValue: 10000,
		message: 'Image Sort can only be a number between 1 and 10000',
	};
	static reason: IFieldAttributes = {
		fieldName: 'reason',
		type: 'string',
		regex: /^[A-Za-z0-9 .,'@&:-]{10,500}$/,
		minLength: 10,
		maxLength: 500,
		message: `Reason can be alphanumeric and contain ( .,'@&:-) these special characters with  Max and Min length of 500 and 10 respectively`,
	};
	static sku: IFieldAttributes = {
		fieldName: 'sku',
		type: 'string',
		regex: /^[a-zA-Z0-9]{4,20}$/,
		minLength: 4,
		maxLength: 20,
		message: 'sku can only be alphanumeric with Max and Min length of 20 and 4 respectively',
	};

	static is_active: IFieldAttributes = {
		fieldName: 'is_active',
		type: 'boolean',
		message: 'is_active should be a boolean value',
	};

	static offer: IFieldAttributes = {
		fieldName: 'offer',
		type: 'boolean',
		message: 'offer should be a boolean value',
	};

	static oos: IFieldAttributes = {
		fieldName: 'oos',
		type: 'boolean',
		message: 'oos should be a boolean value',
	};

	// Assuming img_url and primary are part of images array
	static imageURL: IFieldAttributes = {
		fieldName: 'img_url',
		type: 'string',
		regex: /\bhttps?:\/\/\S+?\.(jpg|jpeg|png|gif|bmp|webp)\b/,
		minLength: 50,
		maxLength: 500,
		message: 'Invalid image url format',
	};

	static primaryImageURL: IFieldAttributes = {
		fieldName: 'primary Image',
		type: 'string',
		regex: /\bhttps?:\/\/\S+?\.(jpg|jpeg|png|gif|bmp|webp)\b/,
		minLength: 50,
		maxLength: 500,
		message: 'Invalid image format of primary image',
	};
	static additionalImagesURL: IFieldAttributes = {
		fieldName: 'additional Image',
		type: 'stringarray',
		regex: /\bhttps?:\/\/\S+?\.(jpg|jpeg|png|gif|bmp|webp)\b/,
		minLength: 50,
		maxLength: 500,
		message: 'Invalid image format of image-url in additional images array',
	};

	static primary: IFieldAttributes = {
		fieldName: 'primary',
		type: 'boolean',
		message: 'primary should be a boolean value',
	};

	static expiry_date: IFieldAttributes = {
		fieldName: 'expiry_date',
		type: 'string',
		regex: /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
		message: 'expiry_date should be in YYYY-MM-DD format',
	};
	static alias: IFieldAttributes = {
		fieldName: 'alias',
		type: 'string',
		regex: /^[a-f\d]{24}$/i,
		message: 'alias can only be string alphabets, spaces with Max and Min length of 50 and 3 respectively',
	};
	// static aliases: IFieldAttributes = {
	// 	...ProductAttributes.alias,
	// 	type: 'stringarray',
	// 	message:
	// 		'Aliases can only be an array of strings, and each string can consist of alphabets and spaces with a maximum and minimum length of 50 and 3, respectively',
	// };
	// static tags: IFieldAttributes = {
	// 	fieldName: 'tag Ids',
	// 	type: 'stringarray',
	// 	regex: /^[a-f\d]{24}$/i,
	// 	message: 'Invalid Id inside tags array, id can only be alphabets, only 24 characters long',
	// };

	static aliases: IFieldAttributes = {
		fieldName: 'aliases',
		type: 'stringarray',
		regex: /^[a-f\d]{24}$/i,
		message: 'Invalid Id inside aliases array, id can only be alphabets, only 24 characters long',
	};

	static relatedProducts: IFieldAttributes = {
		fieldName: 'relatedProducts',
		type: 'stringarray',
		regex: /^[a-f\d]{24}$/i,
		minLength: 24,
		maxLength: 24,
		message: 'Invalid Product id in related products array, Product id can only be alphabets, only 24 characters long',
	};

	static hsn_code: IFieldAttributes = {
		fieldName: 'hsn_code',
		type: 'string',
		regex: /^[a-zA-Z0-9]{4,20}$/,
		minLength: 4,
		maxLength: 20,
		message: 'hsn_code can only be alphanumeric with Max and Min length of 20 and 4 respectively',
	};
	// For Prices
	static mrp: IFieldAttributes = {
		fieldName: 'mrp',
		type: 'number',
		minValue: 0,
		message: 'MRP should be a non-negative number',
	};

	static pbt: IFieldAttributes = {
		fieldName: 'pbt',
		type: 'number',
		minValue: 0,
		message: 'PBT should be a non-negative number',
	};

	static taxpct: IFieldAttributes = {
		fieldName: 'tax',
		type: 'number',
		minValue: 0,
		maxValue: 100,
		message: 'Tax Percent should be a non-negative number, and it cannot exceed 100%',
	};

	static packaging: IFieldAttributes = {
		fieldName: 'packaging',
		type: 'string',
		// Add appropriate validation for packaging value
		message: 'packaging should be a valid value from the system',
	};

	static brand: IFieldAttributes = {
		fieldName: 'brand',
		type: 'string',
		regex: /^[a-zA-Z .-]{3,20}$/,
		minLength: 3,
		maxLength: 20,
		message: 'brand can only be alphabets, spaces, dots, and hyphens with Max and Min length of 20 and 3 respectively',
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

	static featureValue: IFieldAttributes = {
		fieldName: 'featureValue',
		type: 'string',
		regex: /^[^<>]{3,100}$/,
		minLength: 3,
		maxLength: 100,
		message: 'Feature value can contain characters except < > with Max and Min length of 1000 and 10 respectively',
	};
}
