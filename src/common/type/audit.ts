export type auditLogInput = {
	id?: string;
	type: string;
	event: string;
	entityName: string;
	reason: string;
	user: any;
	newData?: any;
	oldData?: any;
};
