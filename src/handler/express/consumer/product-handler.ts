import { Request, Response, NextFunction } from 'express';
import ProductController from '../../../controller/consumer/product-controller';
const productController = new ProductController();

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'sort:asc';
		}
		const detailed = req.query.detailed === 'true';
		const products = await productController.get(filters, pagination, sort, detailed);
		res.status(200).json(products);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const productId = req.params.id;
		const product = await productController.getById(productId);
		res.status(200).json(product);
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
		const searchResult = await productController.search(filters, pagination, sort, searchText);
		res.status(200).json(searchResult);
	} catch (e) {
		next(e);
	}
};
