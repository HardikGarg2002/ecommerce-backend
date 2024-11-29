import CommonVariables from '../common/common-variable';
import BaseAdapter from './base-adapter';
import { auditLogInput } from '../common/type/audit';
import { SystemError } from '../common/packages/common-errors/common-errors';

export default class AuditAdapter extends BaseAdapter {
	public auditEvent = async (auditEventInput: auditLogInput) => {
		if (!CommonVariables.AUDIT_SERVICE_URL) {
			throw new SystemError('ERR_AUDIT_URL_NOT_DEFINED', new Error('AUDIT_URL not defined'));
		}
		await this.sendHTTPPostRequest(CommonVariables.AUDIT_SERVICE_URL + '/api/auditlogs', auditEventInput);
	};
}
