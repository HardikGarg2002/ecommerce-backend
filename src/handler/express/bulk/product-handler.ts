import { Request, Response } from 'express';
import IProduct from '../../../common/type/product';
import ProductController from '../../../controller/product-controller';
import { IUser } from '../../../common/type/user';

const productController = new ProductController();

export const create = async (req: Request, res: Response) => {
	const productsArray: IProduct[] = req.body.products;
	const user: IUser = req.body.loggedInUser;
	const responseProducts: Array<Partial<IProduct>> = [];
	//For loop for multiple products
	for (const product of productsArray) {
		let message: string;
		try {
			product.created = { ...user };
			product.updated = product.created;
			if (!Array.isArray(product.tags)) {
				product.tags = [];
			}
			const id = await productController.create(product);
			message = 'Product created successfully with id: ' + id;
		} catch (err: any) {
			if (err.fieldErrors !== undefined) {
				message = err.fieldErrors.map((error: { message: string }) => error.message).join(', ');
			} else {
				message = err.message;
			}
		}
		responseProducts.push({ ...product, responseMessage: message });
	}
	res.status(201).json(responseProducts);
};
