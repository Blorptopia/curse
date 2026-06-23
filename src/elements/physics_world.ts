import type { Collider, World } from "@dimforge/rapier2d-compat";
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

	private resizeController: ResizeController<DOMRectReadOnly>;

	@state()
	private world?: World;

	@state()
	private boundDepth: number;

	@state()
	private bounds: Collider[];

	private cachedRect?: DOMRectReadOnly;

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
						this.cachedRect = entries[0].contentRect;
					return entries[0].contentRect;
				}
				return new DOMRectReadOnly();
				},
		}
		);

		this.physics = {};
		this.boundDepth = 30;
		this.bounds = [];
	}

	private onRapierLoaded(RAPIER: Rapier): void {
		this.physics.RAPIER = RAPIER;

		this.world = new RAPIER.World({ x: 0.0, y: -9.81 });
		this.physics.world;

		this.physicsLoop(RAPIER);
	}

	private physicsLoop(RAPIER: typeof import("@dimforge/rapier2d-compat")): void {
		if (this.cachedRect !== undefined && this.resizeController.value !== undefined) {
			if (this.cachedRect.width !== this.resizeController.value.width && this.cachedRect.height !== this.resizeController.value.height) {
				this.updateBounds(RAPIER)
			}
		}

		if (this.world !== undefined) {
			this.world.step();
		}

		requestAnimationFrame(() => {
			this.physicsLoop(RAPIER);
		})
	}

	private updateBounds(RAPIER: typeof import("@dimforge/rapier2d-compat")): void {
		if (this.resizeController.value === undefined) {
			return;
		}
		if (this.world === undefined) {
			return;
		}

		for (const bound of this.bounds) {
			this.world.removeCollider(bound, false);
		}

		const horisontalCollider = RAPIER.ColliderDesc.cuboid(this.resizeController.value.width, this.boundDepth);
		const verticalCollider = RAPIER.ColliderDesc.cuboid(this.boundDepth, this.resizeController.value.height);

		const topCollider = this.world.createCollider(horisontalCollider);
		topCollider.setTranslation({ x: 0, y: -this.boundDepth });

		const rightCollider = this.world.createCollider(verticalCollider);
		rightCollider.setTranslation({ x: this.resizeController.value.right, y: 0 });

		const bottomCollider = this.world.createCollider(horisontalCollider);
		bottomCollider.setTranslation({ x: 0, y: this.resizeController.value.bottom });

		const leftCollider = this.world.createCollider(verticalCollider);
		leftCollider.setTranslation({ x: -this.boundDepth, y: 0 });

		this.bounds = [
			topCollider,
			rightCollider,
			bottomCollider,
			leftCollider
		];

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
