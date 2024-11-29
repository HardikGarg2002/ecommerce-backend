import { SystemError } from '../common/packages/common-errors/common-errors';
import axios, { AxiosError } from 'axios';

export default class BaseAdapter {
	defaultHeaders = {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	};

	protected sendHTTPPostRequest = async (url: string, data: any, headers = this.defaultHeaders) => {
		// console.log('url and data for post request is ', url, data);

		try {
			const response = await axios.post(url, data, { headers: headers });
			// console.log('response', response.data);
			return response.data;
		} catch (err) {
			const error = err as AxiosError;
			console.log('err', error.response?.data, error.response?.status, error.response?.headers);
			throw new SystemError('Error in sending httppost request', error);
		}
	};
}
