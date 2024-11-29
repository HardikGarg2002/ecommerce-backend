import { Request, Response, NextFunction } from 'express';
import ProductController from '../../controller/product-controller';
import { IProduct, IProductFeatures, IProductPrices } from '../../common/type/product';
import { IUser } from '../../common/type/user';

const productController = new ProductController();

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const filters = req.query.filters;
		const pagination = req.query.pagination;
		let sort = req.query.sort as string;
		if (!sort) {
			sort = 'sort:asc';
		}
		console.log('filters in get product apis reqjuest', filters, pagination);
		const products = await productController.get(filters, pagination, sort);
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
export const getbyIds = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.query;
		const arrIds = (id as string)?.trim().split(',');
		const products = await productController.getByIds(arrIds);

		res.status(200).json(products);
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
			sort = 'sort:asc';
		}
		const searchText = req.query.searchText as string;
		const searchResult = await productController.search(filters, pagination, sort, searchText);
		res.status(200).json(searchResult);
	} catch (e) {
		next(e);
	}
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const productInput: IProduct = req.body;
		productInput.created = { ...user };
		productInput.updated = productInput.created;
		if (!Array.isArray(productInput.tags)) {
			productInput.tags = [];
		}
		const id = await productController.create(productInput);
		res.status(201).json({ message: 'Product created successfully', id });
	} catch (err) {
		next(err);
	}
};

export const patch = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const productId = req.params.id;
		const { reason } = req.body;
		const { name, desc, sku, sort, category_code, subcategory_code }: Partial<IProduct> = req.body;
		await productController.patch(productId, user, reason, { name, desc, sku, sort, category_code, subcategory_code });
		res.status(200).json({ message: 'Product updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const activate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const productId = req.params.id;
		const { reason, is_active } = req.body;

		await productController.activate(productId, user, reason, is_active);
		res.status(200).json({ message: 'Product status updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const patchOffer = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const productId = req.params.id;
		const { reason, offer } = req.body;

		await productController.patchOffer(productId, user, reason, offer);
		res.status(200).json({ message: 'Product offer status updated successfully' });
	} catch (err) {
		next(err);
	}
};
export const patchPrice = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const productId = req.params.id;
		const priceDetails: IProductPrices = req.body.prices;
		const { hsn_code, reason } = req.body;

		await productController.patchPrice(productId, user, reason, priceDetails, hsn_code);
		res.status(200).json({ message: 'Product prices updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const patchOos = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const productId = req.params.id;
		const { oos } = req.body;

		await productController.patchOos(productId, user, oos);
		res.status(200).json({ message: 'Product stock availability status updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const addTag = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const productId = req.params.id;
		const { tag_id } = req.body;
		await productController.addTag(productId, tag_id, user);
		res.status(200).json({ message: 'Tag added successfully to the product' });
	} catch (err) {
		next(err);
	}
};

export const removeTag = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const productId = req.params.id;
		const tagId = req.params.tag_id;
		const user: IUser = req.body.loggedInUser;
		await productController.removeTag(productId, tagId, user);
		res.status(200).json({ message: 'Tag removed successfully from the product' });
	} catch (err) {
		next(err);
	}
};

export const addImages = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const productId = req.params.id;
		const { images } = req.body;
		const user: IUser = req.body.loggedInUser;
		await productController.addImages(productId, images, user);
		res.status(200).json({ message: 'Image added successfully to the product' });
	} catch (err) {
		next(err);
	}
};

export const removeImage = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const productId = req.params.id;
		const imageUrl = req.params.img_url;
		const user: IUser = req.body.loggedInUser;

		await productController.removeImage(productId, imageUrl, user);
		res.status(200).json({ message: 'Image removed successfully from the product' });
	} catch (err) {
		next(err);
	}
};

export const addAliases = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const productId = req.params.id;
		const user = req.body.loggedInUser;
		const { aliases }: { aliases: string[] } = req.body;
		await productController.addAliases(productId, user, aliases);
		res.status(200).json({ message: 'Aliases added successfully' });
	} catch (error) {
		next(error);
	}
};

export const removeAlias = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const productId = req.params.id;
		const user = req.body.loggedInUser;
		const aliasId = req.params.alias_id;
		const { reason } = req.body;
		await productController.removeAlias(productId, user, aliasId, reason);
		res.status(200).json({ message: 'Alias removed successfully' });
	} catch (error) {
		next(error);
	}
};

export const addFeatures = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const productId = req.params.id;
		const user = req.body.loggedInUser;
		const { features }: { features: IProductFeatures[] } = req.body;
		await productController.addFeatures(productId, user, features);
		res.status(200).json({ message: 'Features added successfully' });
	} catch (error) {
		next(error);
	}
};

export const removeFeature = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const productId = req.params.id;
		const code = req.params.code;
		const { reason } = req.body;
		await productController.removeFeature(productId, code, reason, user);
		res.status(200).json({ message: `Feature with code ${code.toUpperCase().trim()} removed successfully` });
	} catch (err) {
		next(err);
	}
};

export const addRelatedProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const productId = req.params.id;
		const user = req.body.loggedInUser;
		const relatedProductIds: string[] = req.body.relatedproducts;
		const twoWay = req.body.two_way;
		await productController.addRelatedProduct(productId, user, relatedProductIds, twoWay);
		res.status(200).json({ message: 'relatedProduct added successfully' });
	} catch (error) {
		next(error);
	}
};

export const removeRelatedProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const productId = req.params.id;
		const user = req.body.loggedInUser;
		const relatedProductId = req.params.relatedproduct_id;
		const reason = req.body.reason;
		const twoWay = req.body.two_way;
		await productController.removeRelatedProduct(productId, user, reason, relatedProductId, twoWay);
		res.status(200).json({ message: 'relatedProduct removed successfully' });
	} catch (error) {
		next(error);
	}
};
