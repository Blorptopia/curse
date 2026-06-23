import type { Collider, World } from "@dimforge/rapier2d-compat";
import { createContext } from "@lit/context";

export type Rapier = typeof import("@dimforge/rapier2d-compat");
export type PhysicsContext = {
	rapier: Rapier;
	world: World;
	screenSpace: {
		height: number;
		width: number;
	};
	boundingColliders: Collider[];

};

export const physicsContext = createContext<PhysicsContext | undefined>(Symbol("physics"));
