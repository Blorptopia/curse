import type { World } from "@dimforge/rapier2d-compat";
import { createContext } from "@lit/context";

export type PhysicsContext = {
	RAPIER?: typeof import("@dimforge/rapier2d-compat"),
	world?: World,
}

export const physicsContext = createContext<PhysicsContext>("physics")
