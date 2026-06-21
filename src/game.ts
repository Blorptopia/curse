import type { CustomerId } from "./types/customer";
import type { Order } from "./types/order";

type GameState = {
	orders: Order[],
	dayIndex: number;
	deadCustomerIds: CustomerId[]
};
const GAME_STATE: GameState = {
	orders: [],
	dayIndex: 0,
	deadCustomerIds: []
};

