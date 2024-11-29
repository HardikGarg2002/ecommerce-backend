import { Request, Response, NextFunction } from 'express';
import SubcategoryController from '../../../controller/consumer/subcategory-controller';

const subcategoryController = new SubcategoryController();

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'sort:asc';
		}

		const subcategories = await subcategoryController.get(filters, pagination, sort);
		res.status(200).json(subcategories);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const subcatId = req.params.id;
		const subcategory = await subcategoryController.getById(subcatId);
		res.status(200).json(subcategory);
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
		const searchResult = await subcategoryController.search(filters, pagination, sort, searchText);
		res.status(200).json(searchResult);
	} catch (err) {
		next(err);
	}
};