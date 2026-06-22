import type { World } from "@dimforge/rapier2d-compat";
import { Task } from "@lit/task";
import { html, LitElement, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("curse-physics-world")
export class PhysicsWorldElement extends LitElement {

	private rapierTask: Task<[], typeof import("@dimforge/rapier2d-compat")>;

	private world?: World;

	public constructor() {
		super();

		this.rapierTask = new Task(
			this, {
			task: async () => {
				const RAPIER = await import("@dimforge/rapier2d-compat");
				await RAPIER.init();
				return RAPIER;
			},
				args: () => [],
				onComplete: (RAPIER) => {this.onRapierLoaded(RAPIER)}
		}
		);
	}

	private onRapierLoaded(RAPIER: typeof import("@dimforge/rapier2d-compat")): void {
		this.world = new RAPIER.World({ x: 0.0, y: -9.81 });
	}

	private physicsLoop() {
		if (this.world !== undefined) {
			this.world.step();
		}

		requestAnimationFrame(() => {
			this.physicsLoop();
		})
	}

	protected render(): HTMLTemplateResult {
		return html`
			${this.rapierTask.render({
				complete: () => html`<slot></slot>`
			})}
		`;
	}

}
