import { NextFunction, Request, Response } from 'express';
import { IHsn } from '../../common/type/hsn';
import { IUser } from '../../common/type/user';
import HsnController from '../../controller/hsn-controller';

const hsnController = new HsnController();

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'updated.date:desc';
		}

		const hsn = await hsnController.get(filters, pagination, sort);
		res.status(200).json(hsn);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id: string = req.params.id;
		const hsn = await hsnController.getById(id);
		res.status(200).json(hsn);
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
			sort = 'updated.date:desc';
		}
		const searchText = req.query.searchText as string;
		const searchResult = await hsnController.search(filters, pagination, sort, searchText);
		res.status(200).json(searchResult);
	} catch (error) {
		next(error);
	}
};
export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const hsnInput: IHsn = req.body;
		hsnInput.created = { ...user };
		hsnInput.updated = hsnInput.created;
		const id = await hsnController.create(hsnInput);
		res.status(200).json({ message: 'Hsn created Successfully', id });
	} catch (error) {
		next(error);
	}
};

export const patch = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		const user: IUser = req.body.loggedInUser;
		const { code, desc, gst, reason } = req.body;
		await hsnController.patch(id, user, reason, code, desc, gst);
		res.status(200).json({ message: 'hsn updated successfully' });
	} catch (error) {
		next(error);
	}
};

export const activate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		const user: IUser = req.body.loggedInUser;
		const { is_active, reason } = req.body;
		await hsnController.activate(id, user, reason, is_active);
		res.status(200).json({ message: 'hsn status change successfully' });
	} catch (error) {
		next(error);
	}
};
