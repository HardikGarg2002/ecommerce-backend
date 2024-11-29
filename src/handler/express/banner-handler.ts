/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import BannerController from '../../controller/banner-controller';
import { IBanner } from '../../common/type/banner';
import { IUser } from '../../common/type/user';
const bannerController = new BannerController();

export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const bannerInput: IBanner = req.body;
		bannerInput.created = {
			...user,
		};

		bannerInput.updated = bannerInput.created;
		const id = await bannerController.create(bannerInput);
		res.status(201).json({ message: 'banner created successfully', id });
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

		const banners = await bannerController.get(filters, pagination, sort);
		res.status(200).json(banners);
	} catch (err) {
		next(err);
	}
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const bannerId = req.params.id;
		const banner: IBanner = await bannerController.getById(bannerId);
		res.status(200).json(banner);
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
		const searchResult = await bannerController.search(filters, pagination, sort, searchText);
		res.status(200).json(searchResult);
	} catch (err) {
		next(err);
	}
};

export const patch = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const bannerId = req.params.id;
		const { name, desc, start_date, end_date, sort, img_url, redirect_url, reason } = req.body;
		await bannerController.patch(bannerId, reason, user, name, desc, start_date, end_date, sort, img_url, redirect_url);
		res.status(200).json({ message: 'banner updated successfully' });
	} catch (err) {
		next(err);
	}
};

// export const patch = async (req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		const user: IUser = req.body.loggedInUser;
// 		const bannerId = req.params.id;
// 		const bannerInput: Partial<IBanner> = req.body;
// 		const reason = req.body.reason;
// 		// const { loggedInUser, reason, ...bannerInput }: Partial<IBanner> = req.body;
// 		console.log('bannerInput in the handler is', bannerInput);
// 		await bannerController.patch(bannerId, reason!, user, bannerInput);
// 		res.status(200).json({ message: 'banner updated successfully' });
// 	} catch (err) {
// 		next(err);
// 	}
// };

export const patchStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const bannerId = req.params.id;
		const { reason, is_active } = req.body;
		await bannerController.activate(bannerId, reason, user, is_active);
		res.status(200).json({ message: 'banner status updated successfully' });
	} catch (err) {
		next(err);
	}
};

// export const patchStatus = async (req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		const user: IUser = req.body.loggedInUser;
// 		const bannerId = req.params.id;
// 		const reason = req.body.reason;
// 		const bannerInput: Partial<IBanner> = req.body;
// 		await bannerController.activate(bannerId, reason, user, bannerInput);
// 		res.status(200).json({ message: 'banner status updated successfully' });
// 	} catch (err) {
// 		next(err);
// 	}
// };
