import type { World } from "@dimforge/rapier2d-compat";
import { provide } from "@lit/context";
import { Task } from "@lit/task";
import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { physicsContext, type PhysicsContext, type Rapier } from "../lib/physics_context";
import { ResizeController } from "@lit-labs/observers/resize-controller.js";


@customElement("curse-physics-world")
export class PhysicsWorldElement extends LitElement {

	@provide({ context: physicsContext })
	public physics: PhysicsContext;

	private rapierTask: Task<[], Rapier>;

	@state()
	private world?: World;

	private resizeController: ResizeController<DOMRectReadOnly>;

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

		this.resizeController = new ResizeController(
			this, {
			callback: (entries) => {
				if (entries.length > 0) {
					return entries[0].contentRect;
				}
				return new DOMRectReadOnly();
			}
		}
		);

		this.physics = {};
	}

	private onRapierLoaded(RAPIER: Rapier): void {
		this.physics.RAPIER = RAPIER;

		this.world = new RAPIER.World({ x: 0.0, y: -9.81 });
		this.physics.world;
	}

	private updateBounds(): void {

	}

	private physicsLoop(): void {
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

	static styles: CSSResultGroup = css`
		:host {
			width: 100%;
			height: 100%;

			display: block;
		}
	`;

}
