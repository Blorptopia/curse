import type { CustomerId } from "../types/customer";

export const CUSTOMER_ID_TO_NAME = {
	LOANS_HARK: "Loans Hark",
	JACK: "Jack",
	JOANY: "Joany"
} satisfies Record<CustomerId, String>;
