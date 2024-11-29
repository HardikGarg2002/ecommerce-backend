import { Request, Response, NextFunction } from 'express';
import FeatureController from '../../controller/feature-controller';
import { IFeature } from '../../common/type/feature';
import { IUser } from '../../common/type/user';
const featureController = new FeatureController();

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'sort:asc';
		}

		const features = await featureController.get(filters, pagination, sort);
		res.status(200).json(features);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const featureId = req.params.id;
		const feature = await featureController.getById(featureId);
		res.status(200).json(feature);
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
		const searchResult = await featureController.search(filters, pagination, sort, searchText);
		res.status(200).json(searchResult);
	} catch (err) {
		next(err);
	}
};
export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const featureInput: IFeature = req.body;
		featureInput.created = {
			...user,
		};
		featureInput.updated = featureInput.created;
		const id = await featureController.create(featureInput);
		res.status(201).json({ message: 'feature created successfully', id });
	} catch (err) {
		next(err);
	}
};

export const patch = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const id = req.params.id;
		const { name, desc, reason, sort } = req.body;
		await featureController.patch(user, id, reason, name, desc, sort);
		res.status(200).json({ message: 'feature updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.body.loggedInUser;
		const id = req.params.id;
		const reason = req.body.reason;
		await featureController.remove(user, id, reason);
		res.status(200).json({ message: 'feature deleted successfully' });
	} catch (err) {
		next(err);
	}
};
