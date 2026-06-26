export type BoundingBox = {
	x: number;
	y: number;
	hw: number;
	hh: number;
};

export type PhysicsUserData = {
	boundingBox?: {
		hw: number;
		hh: number;
	};
	entityId?: string;
	role?: "hot_plate";
};
