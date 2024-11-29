import { Request, Response, NextFunction } from 'express';
import ValidvalueController from '../../controller/validvalue-controller';
import { IValidvalue } from '../../common/type/validvalue';
import { IUser } from '../../common/type/user';
const validvalueController = new ValidvalueController();

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'label:asc';
		}
		const validvalues = await validvalueController.get(filters, pagination, sort);
		res.status(200).json(validvalues);
	} catch (err) {
		next(err);
	}
};

export const getByType = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const validvalueType = req.params.type;
		const fetch = req.query.fetch as string;
		const validvalue = await validvalueController.getByType(validvalueType, fetch);
		res.status(200).json(validvalue);
	} catch (err) {
		next(err);
	}
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const validvalueInput: IValidvalue = req.body;
		validvalueInput.created = {
			...user,
		};
		validvalueInput.updated = validvalueInput.created;
		const id = await validvalueController.create(validvalueInput);
		res.status(201).json({ message: 'valid value created successfully', id });
	} catch (err) {
		next(err);
	}
};

export const patch = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const type = req.params.type;
		const { label, reason } = req.body;
		await validvalueController.patch(type, label, reason, user);
		res.status(200).json({ message: 'valid value updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const addValues = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const type = req.params.type;
		const { values, reason } = req.body;
		await validvalueController.addValues(type, values, reason, user);
		res.status(200).json({ message: 'values added to valid value successfully' });
	} catch (err) {
		next(err);
	}
};

export const getValue = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const type = req.params.type;
		const key = req.params.key;
		const validvalue = await validvalueController.getValue(type, key);
		res.status(200).json(validvalue);
	} catch (err) {
		next(err);
	}
};

export const patchValue = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const type = req.params.type;
		const key = req.params.key;
		const { label, sort } = req.body;
		const reason = req.body.reason;
		await validvalueController.patchValue(type, key, reason, user, label, sort);
		res.status(200).json({ message: `value updated successfully` });
	} catch (err) {
		next(err);
	}
};

export const activateValue = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const type = req.params.type;
		const key = req.params.key;
		const { is_active, reason } = req.body;
		console.log(reason);
		await validvalueController.activateValue(type, key, reason, user, is_active);
		res.status(200).json({ message: `status of the value updated successfully` });
	} catch (err) {
		next(err);
	}
};

export const removeValue = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const type = req.params.type;
		const key = req.params.key;
		const { reason } = req.body;
		await validvalueController.removeValue(type, key, reason, user);
		res.status(200).json({ message: `status of ${key.toUpperCase()} updated` });
	} catch (err) {
		next(err);
	}
};
