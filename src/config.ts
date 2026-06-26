import type { ObjectSizing } from "./types/sizing";

export const ORDERS_PER_DAY = 5;
export const CUSTOMER_SHADOW_SIZE: ObjectSizing = {
	height: 207,
	width: 66
};
export const CUSTOMER_PORTRAIT_SIZE: ObjectSizing = {
	height: 200,
	width: 133
};
export const IGNITION_OFFSET_MS: number = 175;
export const PHYSICS_DEBUG: boolean = false;
export const PHYSICS_DEBUG_RES: number = 500;
export const STAND_HEIGHT_METERS = 1.5;
export const FLASK_BASELINE_TEMPERATURE = 20;
export const FLASK_MAX_TEMPERATURE = 100;
export const FLASK_HEAT_SPEED = 0.05;
export const FLASK_MAX_OVERHEAT_SCORE = 40;
export const FLASK_REQUIRED_ROTATION: number = 10 * 2 * Math.PI;
