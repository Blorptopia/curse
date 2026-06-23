import type { World } from "@dimforge/rapier2d-compat";
import { createContext } from "@lit/context";

export type Rapier = typeof import("@dimforge/rapier2d-compat");
export type PhysicsContext = {
	RAPIER?: Rapier,
	world?: World,
}

export const physicsContext = createContext<PhysicsContext>("physics")
