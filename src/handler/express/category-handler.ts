import { Request, Response, NextFunction } from 'express';
import CategoryController from '../../controller/category-controller';
import { ICategory } from '../../common/type/category';
import { IUser } from '../../common/type/user';
const categoryController = new CategoryController();

export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const categoryInput: ICategory = req.body;
		categoryInput.created = {
			...user,
		};

		categoryInput.updated = categoryInput.created;
		const id = await categoryController.create(categoryInput);
		res.status(201).json({ message: 'category created successfully', id });
	} catch (err) {
		next(err);
	}
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'sort:asc';
		}

		const categories = await categoryController.get(filters, pagination, sort);
		res.status(200).json(categories);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const catId = req.params.id;
		const category = await categoryController.getById(catId);
		res.status(200).json(category);
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
		const searchResult = await categoryController.search(filters, pagination, sort, searchText);
		res.status(200).json(searchResult);
	} catch (err) {
		next(err);
	}
};

export const patch = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const catId = req.params.id;
		const { name, desc, img_url, sort, reason } = req.body;
		await categoryController.patch(catId, reason, user, name, desc, img_url, sort);
		res.status(200).json({ message: 'category updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const catId = req.params.id;
		const reason = req.body.reason;
		await categoryController.remove(catId, reason, user);
		res.status(200).json({ message: 'category deleted successfully' });
	} catch (err) {
		next(err);
	}
};

export const patchStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const catId = req.params.id;
		const { reason, is_active } = req.body;
		await categoryController.activate(catId, reason, user, is_active);
		res.status(200).json({ message: 'category status updated successfully' });
	} catch (err) {
		next(err);
	}
};
