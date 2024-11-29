import { Request, Response, NextFunction } from 'express';
import CustomerController from '../../../controller/consumer/customer-controller';
import ICustomer from '../../../common/type/customer';
import { IUser } from '../../../common/type/user';

const customerController = new CustomerController();

export const get = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const customer: ICustomer = await customerController.getByAuthId(user._id);
		res.status(200).json(customer);
	} catch (err) {
		next(err);
	}
};

export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const id = await customerController.addAddress(user._id, req.body);
		res.status(200).json({ message: 'address added successfully', id });
	} catch (err) {
		next(err);
	}
};

export const editAddress = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		await customerController.editAddress(user._id, req.params.id, req.body);
		res.status(200).json({ message: 'address updated successfully' });
	} catch (err) {
		next(err);
	}
};

export const removeAddress = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user: IUser = req.body.loggedInUser;
		const updatedCustomer = await customerController.removeAddress(user._id, req.params.id);
		res.status(200).json(updatedCustomer);
	} catch (err) {
		next(err);
	}
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const user: IUser = req.body.loggedInUser;
		const customer: ICustomer = req.body;
		// customer.auth_id = user._id;
		const id = await customerController.create(customer);
		res.status(201).json({ message: 'Customer created successfully', id });
	} catch (err) {
		next(err);
	}
};
