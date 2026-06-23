import type { RigidBody } from "@dimforge/rapier2d-compat";

export type GameEntity = {
	rigidBody: RigidBody;
	element: HTMLElement;
	size: {
		height: number;
		width: number;
	}
};
