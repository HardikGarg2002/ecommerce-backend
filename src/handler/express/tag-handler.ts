import { NextFunction, Request, Response } from 'express';
import { IUser } from '../../common/type/user';
import { ITag } from '../../common/type/tag';
import TagController from '../../controller/tag-controller';

const tagController = new TagController();
export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const tagInput: ITag = req.body;
		tagInput.created = { ...user };
		tagInput.updated = tagInput.created;
		const _id = await tagController.create(tagInput);
		res.status(200).json({ message: 'Tag created Successfully', id: _id });
	} catch (error) {
		next(error);
	}
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'text:asc';
		}

		const tags = await tagController.get(filters, pagination, sort);
		res.status(200).json(tags);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id: string = req.params.id;
		const tag = await tagController.getById(id);
		res.status(200).json(tag);
	} catch (error) {
		next(error);
	}
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'text:asc';
		}
		const searchText = req.query.searchText as string;
		const searchResult = await tagController.search(filters, pagination, sort, searchText);
		res.status(200).json(searchResult);
	} catch (error) {
		next(error);
	}
};

export const activate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const id: string = req.params.id;
		const { is_active, reason } = req.body;
		await tagController.activate(id, user, reason, is_active);
		res.status(200).json({ message: 'tag updated successfully' });
	} catch (error) {
		next(error);
	}
};
