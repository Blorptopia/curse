import type { CustomerId } from "../types/customer";

export const CUSTOMER_ID_TO_NAME = {
	LOANS_HARK_PRE_EXPLOSION: "Loans Hark",
	LOANS_HARK: "Loans Hark",
	JACK: "Jack"
} satisfies Record<CustomerId, String>;
