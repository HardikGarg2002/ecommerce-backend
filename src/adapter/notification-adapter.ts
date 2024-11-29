// import CommonVariables from '../common/common-variables';
import CommonVariables from '../common/common-variable';
import BaseAdapter from './base-adapter';

const NOTIFICATION_URL = CommonVariables.NOTIFICATION_URL;
const SEND_EMAIL_ENDPOINT = '/email';

type notificationData = {
	otp?: string;
	recipient: { name?: string; email?: string; mobile?: string };
	type: string;
	verifyLink?: string;
	expire?: number;
};

enum EmailTypes {
	VERIFICATION = 'VERIFICATION',
}

export default class NotificationService extends BaseAdapter {
	public sendConfirmationMessage = async (email: string, name: string, message: string) => {
		const data: notificationData = {
			verifyLink: message,
			recipient: { name: name, email: email },
			type: EmailTypes.VERIFICATION,
			expire: 1,
		};

		await this.sendHTTPPostRequest(NOTIFICATION_URL + SEND_EMAIL_ENDPOINT, data, undefined);
	};
}
