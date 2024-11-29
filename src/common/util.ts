import { BusinessError } from '../common/packages/common-errors/common-errors';
import AuditAdapter from '../adapter/audit-adapter';
import { IUser } from './type/user';
const _auditAdapter = new AuditAdapter();
export async function audit(
	id: string,
	type: string,
	event: string,
	entityName: string,
	reason: string,
	user: IUser,
	newData?: any,
	oldData?: any,
) {
	await _auditAdapter.auditEvent({ id, type, event, entityName, reason, user, newData, oldData });
}

export const validateDate = (start: string | Date, end: string | Date) => {
	const cuurentDate = new Date();
	const startDate = new Date(start);
	const endDate = new Date(end);

	console.log('currentDate', cuurentDate);
	console.log('startDate', startDate);
	console.log('endDate', end);

	if (startDate < cuurentDate) {
		throw new BusinessError('Start date cannot be in the past', 'ERR_PAST_DATE');
	}

	if (startDate >= endDate) {
		throw new BusinessError('Start date cannot be greater than or equal to end date', 'ERR_INVALID_DATE');
	}
};

export function compareAmountsWithTolerance(amount1: number, amount2: number, tolerance: number = 1): boolean {
	// Check if the absolute difference between the two amounts is within the tolerance
	if (Math.abs(amount1 - amount2) <= tolerance) {
		return true; // Acceptable within tolerance
	} else {
		return false; // Not acceptable
	}
}
