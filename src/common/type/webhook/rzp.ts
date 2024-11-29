export type RazorpayWebhookPayload = {
	entity: string;
	account_id: string;
	event: string;
	contains: string[];
	payload: {
		payment: {
			entity: {
				id: string;
				entity: string;
				amount: number;
				currency: string;
				status: string;
				order_id: string;
				invoice_id?: string | null;
				international: boolean;
				method: string;
				amount_refunded: number;
				refund_status: string | null;
				captured: boolean;
				description?: string | null;
				card_id?: string | null;
				bank?: string | null;
				wallet?: string | null;
				vpa?: string | null;
				email: string;
				contact: string;
				notes: {
					description?: string;
					participant_name?: string;
				};
				fee?: number | null;
				tax?: number | null;
				error_code?: string | null;
				error_description?: string | null;
				created_at: number;
			};
		};
		order?: {
			entity: {
				id: string;
				entity: 'order';
				amount: number;
				amount_paid: number;
				amount_due: number;
				currency: string;
				receipt?: string;
				offer_id?: string;
				status: string;
				attempts: number;
				notes: any;
				created_at: number;
			};
		};
	};
	created_at: number;
};

export type rzpPaymentStatus = 'created' | 'failed' | 'captured' | 'authorized';
