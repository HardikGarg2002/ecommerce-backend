import moment from 'moment';

export const applyPaginationFilter = (filters: any, pagination: { page?: number; pageSize?: number }, sort: string) => {
	// eslint-disable-next-line prefer-const
	let { page = 1, pageSize = 20 } = pagination || {};
	if (page < 1) {
		page = 1;
	}
	const limit = Math.min(parseInt(pageSize.toString(), 10) || 20, 500);
	const skip = (page - 1) * limit;
	const sortOptions = parseSort(sort);
	const criteria = parseFilters(filters);

	return { criteria, skip, limit, sortOptions };
};

const parseSort = (sort: string) => {
	const [fieldName, order] = sort.split(':');
	return { [fieldName]: order === 'desc' ? -1 : 1 };
};

const parseFilters = (filters: any) => {
	const criteria: any = {};

	if (!filters) return criteria;

	for (const [field, condition] of Object.entries(filters) as [string, Record<string, any>][]) {
		const [operator, value] = Object.entries(condition)[0] || [];

		if (!operator || value === undefined) continue;

		switch (operator.toLowerCase()) {
			case '$eqi':
				criteria[field] = { $regex: new RegExp(`^${value}$`, 'i') };
				break;
			case '$between':
				parseBetweenFilter(criteria, field, value);
				break;
			case '$contains':
				criteria[field] = { $regex: new RegExp(value, 'i') };
				break;
			case '$in':
				criteria[field] = {
					$in: value.split(',').map((v: string) => v.trim()),
				};
				break;
			case '$lte':
			case '$gte':
				parseDateFilter(criteria, field, operator, value);
				break;
			case '$in_num':
				parseNumericFilter(criteria, field, value);
				break;
			case '$ne':
				criteria[field] = { $ne: value };
				break;
			case '$eq':
				criteria[field] = value === 'null' ? null : value;
				break;
		}
	}

	return criteria;
};

const parseBetweenFilter = (criteria: any, field: string, value: string) => {
	const values = value.split(',');
	if (values.length !== 2) return;
	if (value.startsWith('dt')) {
		const startDate = startOfDay(values[0].slice(2));
		const endDate = endOfDay(values[1]);
		criteria[field] = { $gte: startDate, $lte: endDate };
	} else {
		criteria[field] = { $gte: values[0], $lte: values[1] };
	}
};

const parseDateFilter = (criteria: any, field: string, operator: string, value: string) => {
	if (value.startsWith('dt')) {
		const date = operator === '$gte' ? startOfDay(value.slice(2)) : endOfDay(value.slice(2));
		criteria[field] = { [operator]: date };
	} else {
		criteria[field] = { [operator]: value };
	}
};

const parseNumericFilter = (criteria: any, field: string, value: string) => {
	const matchValues = value.split(',').map((v: any) => parseFloat(v));
	if (matchValues.some(isNaN)) {
		console.log('Invalid input: Non-numeric values found');
	} else {
		criteria[field] = matchValues.length > 1 ? { $in: matchValues } : matchValues[0];
	}
};

const endOfDay = (strDate: string, format: string = 'YYYY-MM-DD'): Date =>
	moment(strDate, format).endOf('day').toDate();

const startOfDay = (strDate: string, format: string = 'YYYY-MM-DD'): Date =>
	moment(strDate, format).startOf('day').toDate();
