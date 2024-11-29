import { Request, Response, NextFunction } from 'express';
import StoreController from '../../controller/store-controller';
import { IStore } from '../../common/type/store';
import { IUser } from '../../common/type/user';
const storeController = new StoreController();

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'sort:asc';
		}

		const stores = await storeController.get(filters, pagination, sort);
		res.status(200).json(stores);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const storeId = req.params.id;
		const store: IStore = await storeController.getById(storeId);
		res.status(200).json(store);
	} catch (err) {
		next(err);
	}
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'sort:asc';
		}
		const searchText = req.query.searchText as string;
		const searchResult = await storeController.search(filters, pagination, sort, searchText);
		res.status(200).json(searchResult);
	} catch (err) {
		next(err);
	}
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const storeInput: IStore = req.body;
		storeInput.created = {
			...user,
		};
		storeInput.updated = storeInput.created;
		const id = await storeController.create(storeInput);
		res.status(201).json({ message: 'store created successfully', id });
	} catch (err) {
		next(err);
	}
};

export const patch = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.body.loggedInUser;
		const storeId = req.params.id;
		const { name, desc, city_key, sort, reason } = req.body;
		await storeController.patch(storeId, user, reason, name, desc, city_key, sort);
		res.status(200).json({ message: 'store updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const activate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.body.loggedInUser;
		const storeId = req.params.id;
		const { reason, is_active } = req.body;
		await storeController.activate(storeId, user, reason, is_active);
		res.status(200).json({ message: 'store status updated successfully' });
	} catch (err) {
		next(err);
	}
};
