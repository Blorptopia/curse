import type { CustomerId } from "../types/customer";

export const CUSTOMER_ID_TO_NAME = {
	LOANS_HARK: "Loans Hark",
	JACK: "Jack",
	JOANY: "Joany",
	OLE_MARTINSSON: "Big Old Ronnie",
	WHICKY_VEQUILIA: "Whicky Vequlia",
	TIM_TOM: "Tim Tom"
} satisfies Record<CustomerId, String>;
