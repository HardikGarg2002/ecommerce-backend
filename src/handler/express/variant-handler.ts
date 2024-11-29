import { NextFunction, Request, Response } from 'express';
import { IUser } from '../../common/type/user';
import { IVariant } from '../../common/type/variant';
import VariantController from '../../controller/variant-controller';

const variantController = new VariantController();

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'updated.date:desc';
		}

		const variants = await variantController.get(filters, pagination, sort);
		res.status(200).json(variants);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id: string = req.params.id;
		const variant = await variantController.getById(id);
		res.status(200).json(variant);
	} catch (error) {
		next(error);
	}
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
	// As discussed product can be present in mutilple variant( management of multilevel variant will be handled on frontend )
	// To prevent it check presence of product in all of variants
	try {
		const user: IUser = req.body.loggedInUser;
		const variantInput: IVariant = req.body;
		variantInput.created = { ...user };
		variantInput.updated = variantInput.created;
		const _id = await variantController.create(variantInput);
		res.status(200).json({ message: 'Variant created Successfully', id: _id });
	} catch (error) {
		next(error);
	}
};

export const patch = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const id = req.params.id;
		const { type, reason } = req.body;
		await variantController.patch(id, type, reason, user);
		res.status(200).json({ message: 'valid value updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const addProductsList = async (req: Request, res: Response, next: NextFunction) => {
	// As discussed if the product have already been added to some variant then also the product can be added to different variants
	try {
		const user: IUser = req.body.loggedInUser;
		const { products } = req.body;
		const id: string = req.params.id;
		await variantController.addProductsList(id, products, user);
		res.status(200).json({ message: 'Products added to Variant Successfully' });
	} catch (error) {
		next(error);
	}
};

export const removeProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const id = req.params.id;
		const productId = req.params.product_id;
		const { reason } = req.body;
		await variantController.removeProduct(id, productId, reason, user);
		res.status(200).json({ message: 'product removed successfully' });
	} catch (err) {
		next(err);
	}
};
