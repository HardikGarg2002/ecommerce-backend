import ValidValue from '../model/validvalue';
import { IValidvalue, IValidvalueWithMeta, IValue } from '../common/type/validvalue';
import { BusinessError } from '../common/packages/common-errors/common-errors';
import dbutils from '../common/packages/db-utils';
import { IUser } from '../common/type/user';
import { audit } from '../common/util';
import { CommonUtils } from '../common/packages/utils';

export default class ValidvalueService {
	public async get(filters: any, pagination: any, sort: string): Promise<IValidvalueWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort!);

		const validvalues: IValidvalue[] = await ValidValue.find(criteria)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await ValidValue.countDocuments(criteria);
		const data: IValidvalueWithMeta = {
			data: validvalues,
			meta: {
				pagination: {
					page: skip / limit + 1,
					pageSize: limit,
					pageCount: Math.ceil(totalCount / limit),
					total: totalCount,
				},
			},
		};
		return data;
	}

	public async getByType(type: string, fetch: string = 'active'): Promise<IValidvalue> {
		const validvalue = await ValidValue.findOne({
			type: type,
		}).lean();
		if (!validvalue) {
			throw new BusinessError(`valid value with type ${type.toUpperCase()} not exists in database`, 'ERR_NOT_FOUND');
		}
		validvalue.values = this._sortAndFilterValues(validvalue.values, (fetch !== 'all') as boolean);
		return validvalue;
	}

	public async getById(id: string, fetch: string = 'active'): Promise<IValidvalue> {
		const validvalue = await ValidValue.findById(id).lean();

		if (!validvalue) {
			throw new BusinessError('validvalue not found', 'ERR_NOT_FOUND');
		}
		// // returning only active valid values from the database
		// validvalue.values = this._sortAndFilterValues(validvalue.values, fetch !== 'all');
		// console.log('valid values in the get by Id function', validvalue.values);
		return validvalue;
	}

	public async getValue(type: string, key: string): Promise<IValue> {
		const validvalue = await this.getByType(type, 'all');
		const value = validvalue.values?.find((value) => value.key?.toLowerCase() === key.toLowerCase());
		if (!value) {
			throw new BusinessError(`value with key ${key.toUpperCase()} not  exists in the valid value`, 'ERR_NOT_FOUND');
		}
		return value;
	}

	public async create(validvalueInput: IValidvalue): Promise<string> {
		await this._validateLabelOrTypeUnique(validvalueInput.label, validvalueInput.type);
		/// check the duplicate keys and values from an array of values from frontend
		const newValidValue = await this.save(validvalueInput, true);
		//AUDIT
		await audit(
			newValidValue._id!,
			'validvalue',
			'create',
			'validvalue',
			'New',
			validvalueInput.created!,
			newValidValue,
		);
		return newValidValue._id!;
	}

	public async patch(type: string, reason: string, updated: IUser, labelInput: string) {
		const validValue = await this.getByType(type);
		console.log(validValue);
		await this._validateLabelOrTypeUnique(labelInput);
		const updatedValidValue: IValidvalue = {
			...validValue,
			label: labelInput,
			updated,
		};
		const savedValidvalue = await this.save(updatedValidValue);
		//AUDIT
		await audit(validValue._id!, 'validvalue', 'update', 'validvalue', reason, updated, savedValidvalue!, validValue);
	}

	public async addValues(type: string, inputValues: IValue[], reason: string, user: IUser) {
		const existingValidvalue = await this.getByType(type);
		const updatedValidValue: IValidvalue = CommonUtils.clone(existingValidvalue);
		this._addValuesToValidValue(updatedValidValue, inputValues);
		updatedValidValue.updated = user;
		await this.save(updatedValidValue);
		//AUDIT
		await audit(
			existingValidvalue._id!,
			'validvalue',
			'add values',
			'validvalue',
			reason,
			user,
			updatedValidValue,
			existingValidvalue,
		);
	}

	public async patchValue(
		type: string,
		key: string,
		reason: string,
		updated: IUser,
		labelInput?: string,
		sortInput?: number,
		is_activeInput?: boolean,
	) {
		const existingValidvalue = await this.getByType(type, 'all');

		if (
			labelInput &&
			existingValidvalue.values.some((value: IValue) => value.label.toLowerCase() === labelInput.toLowerCase())
		) {
			throw new BusinessError('duplicate labels', 'ERR_DUPLICATE_LABELS');
		}

		const existingValue = existingValidvalue.values?.find(
			(value: IValue) => value.key?.toLowerCase() === key.toLowerCase(),
		);

		if (!existingValue) {
			throw new BusinessError(
				`value with key ${key.toUpperCase()} not exists/active in this valid value`,
				'ERR_NOT_FOUND',
			);
		}

		// if (is_activeInput === undefined && !existingValue.is_active) {
		// 	throw new BusinessError(`Inactive value can not be modified`, 'ERR_VALUE_INACTIVE');
		// }

		const updatedValue = {
			...existingValue,
			label: labelInput ?? existingValue.label,
			sort: sortInput ?? existingValue.sort,
			is_active: is_activeInput ?? existingValue.is_active,
		};
		const updatedValidValue = CommonUtils.clone(existingValidvalue);

		updatedValidValue.values = updatedValidValue.values.map((value: IValue) => {
			if (value.key?.toLowerCase() === key.toLowerCase()) {
				value = updatedValue;
			}
			return value;
		});
		await this.save(updatedValidValue);
		//AUDIT
		await audit(existingValidvalue._id!, 'validvalue', 'update', 'value', reason, updated, updatedValue, existingValue);
	}

	public async activateValue(type: string, key: string, reason: string, user: IUser, status: boolean) {
		await this.patchValue(type, key, reason, user, undefined, undefined, status);
	}

	public async removeValue(type: string, key: string, reason: string, updated: IUser) {
		const existingValidvalue = await this.getByType(type);
		const existingValue = existingValidvalue.values?.find(
			(value: IValue) => value.key?.toLowerCase() === key.toLowerCase(),
		);
		if (!existingValue) {
			throw new BusinessError(
				`value with key ${key.toUpperCase()} not exists/deactivated in database`,
				'ERR_NOT_FOUND',
			);
		}
		existingValue.is_active = false;
		existingValidvalue.updated = updated;
		await this.save(existingValidvalue);
		//AUDIT
		await audit(existingValidvalue._id!, 'validvalue', 'delete', 'value', reason, updated, undefined, existingValue);
	}

	public async save(input: IValidvalue, isNew: boolean = false): Promise<IValidvalue> {
		console.log('input in the save ', input);
		const validvalue = new ValidValue(input);
		validvalue.isNew = isNew;
		return (await validvalue.save()).toObject();
	}
	private async _validateLabelOrTypeUnique(label: string, type?: string) {
		const matchedValue: IValidvalue[] = await ValidValue.find({
			$or: [
				{ label: { $regex: new RegExp(`^${label?.trim()}$`), $options: 'i' } },
				{ type: { $regex: new RegExp(`^${type?.trim()}$`), $options: 'i' } },
			],
		});
		if (matchedValue.length > 0) {
			throw new BusinessError(`validvalue with this type/label already exists in database`, 'ERR_DUPLICATE');
		}
	}

	private _sortAndFilterValues(values: IValue[] | undefined, onlyActive: boolean = true): IValue[] {
		if (!values) return [];
		if (onlyActive) {
			const activeValues: IValue[] = values.filter((value) => value.is_active === true);
			values = activeValues;
		}
		values.sort((a, b) => (a.sort || 0) - (b.sort || 0));

		return values;
	}

	private _addValuesToValidValue = (validvalue: IValidvalue, newValues: IValue[]) => {
		for (let i = 0; i < newValues.length; i++) {
			const isDuplicate = this._isAnyValueDuplicate(validvalue.values, newValues[i]);
			if (isDuplicate) {
				throw new BusinessError('duplicate values', 'ERR_DUPLICATE_VALUES');
			}
			validvalue.values.push(newValues[i]);
		}
	};

	private _isAnyValueDuplicate = (existingValues: IValue[], newValue: IValue) => {
		return existingValues.some((existingValue) => this._isValueDuplicate(existingValue, newValue));
	};
	private _isValueDuplicate = (value1: IValue, value2: IValue) => {
		return (
			value1.key?.toLowerCase() === value2.key?.toLowerCase() ||
			value1.label.toLowerCase() === value2.label.toLowerCase()
		);
	};
}
