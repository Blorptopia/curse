import { provide } from "@lit/context";
import { Task } from "@lit/task";
import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { physicsContext, type PhysicsContext, type Rapier } from "../lib/physics_context";
import { ResizeController } from "@lit-labs/observers/resize-controller.js";
import { PHYSICS_DEBUG, PHYSICS_DEBUG_RES, STAND_HEIGHT_METERS } from "../config";
import type { Collider, World } from "@dimforge/rapier2d-compat";
import type { GameElement } from "./game";
import "./game";


@customElement("curse-physics-world")
export class PhysicsWorldElement extends LitElement {
	// Props
	@provide({context: physicsContext})
	@property({type: Object})
	public physics?: PhysicsContext;

	// Attributes
	private resizeController: ResizeController<DOMRectReadOnly>;
	private oldSize?: DOMRectReadOnly;

	// Elements
	@query("canvas")
	private canvasElement?: HTMLCanvasElement;
	@query("curse-game")
	private gameElement?: GameElement;

	public constructor() {
		super();

		new Task(
			this,
			{
				task: async () => {
					const RAPIER = await import("@dimforge/rapier2d-compat");
					await RAPIER.init();
					return RAPIER;
				},
				args: () => [],
				onComplete: (RAPIER) => {this.onRapierLoaded(RAPIER)}
			}
		);
		new Task(this, {
			task: async ([physicsContext, canvasElement], {signal}) => {
				if (physicsContext === undefined) {
					return;
				}
				let context: CanvasRenderingContext2D | undefined = undefined;
				if (canvasElement !== undefined) {
					canvasElement.height = STAND_HEIGHT_METERS * PHYSICS_DEBUG_RES;
					const pixelDensity = physicsContext.screenSpace.height / STAND_HEIGHT_METERS;
					canvasElement.width = Math.floor(physicsContext.screenSpace.width / pixelDensity * PHYSICS_DEBUG_RES);
					context = canvasElement.getContext("2d")!;
				}
				const eventQueue = new physicsContext.rapier.EventQueue(true);
				while (!signal.aborted) {
					physicsContext.world.step(eventQueue);
					eventQueue.drainCollisionEvents((handle1, handle2, started) => {
						console.log("got physics event");
						const collider1 = physicsContext.world.getCollider(handle1);
						const collider2 = physicsContext.world.getCollider(handle2);
						if (this.gameElement !== undefined && this.gameElement !== null) {
							console.log("sending collision event");
							this.gameElement.handleCollisionEvent(collider1, collider2, started);
							console.log("sent collision event");
						} else {
							console.log("ignoring event - no gameElement");
						}
					});

					if (context !== undefined && PHYSICS_DEBUG) {
						context.reset();
						const { vertices } = physicsContext.world.debugRender();
						
						for (let startIndex = 0; startIndex < vertices.length; startIndex += 4) {
							const points = vertices.slice(startIndex, startIndex + 4);

							const startX = points[0] * PHYSICS_DEBUG_RES;
							const startY = points[1] * PHYSICS_DEBUG_RES;
							const stopX = points[2] * PHYSICS_DEBUG_RES;
							const stopY = points[3] * PHYSICS_DEBUG_RES;
							context.beginPath();
							context.moveTo(startX, startY);
							context.lineTo(stopX, stopY);
							context.strokeStyle = "#0FF";
							context.stroke();
						}
					}
					await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
				}
			},
			args: () => [this.physics, this.canvasElement],
			onError: (error) => {
				console.error(error);
			}
		});

		this.resizeController = new ResizeController(
				this,
				{
					callback: (entries) => {
						if (entries.length > 0) {
							return entries[0].contentRect;
						}
						return new DOMRectReadOnly();
					},
					target: document.documentElement
				}
		);
	}
	private onRapierLoaded(rapier: Rapier): void {
		const world = new rapier.World({x: 0.0, y: 9.81});

		const screenSpace = {
			height: this.resizeController.value!.height,
			width: this.resizeController.value!.width,
		};
		const pixelDensity = screenSpace.height / STAND_HEIGHT_METERS;
		const worldWidth = screenSpace.width / pixelDensity;
		
		this.physics = {
			rapier,
			world,
			screenSpace,
			boundingColliders: this.createBoundColliders(world, rapier, worldWidth)
		};
		console.log("Initialized rapier", {screenSpace, worldWidth, pixelDensity});

	}
	private createBoundColliders(world: World, rapier: Rapier, worldWidth: number): Collider[] {
		const colliderWidth = 1;
		const topCollider = world.createCollider(rapier.ColliderDesc.cuboid(worldWidth, colliderWidth));
		topCollider.setTranslation({x: 0, y: -colliderWidth})
		const bottomCollider = world.createCollider(rapier.ColliderDesc.cuboid(worldWidth, colliderWidth));
		bottomCollider.setTranslation({x: 0, y: STAND_HEIGHT_METERS + colliderWidth});

		const leftCollider = world.createCollider(rapier.ColliderDesc.cuboid(colliderWidth, STAND_HEIGHT_METERS));
		leftCollider.setTranslation({x: -colliderWidth, y: 0})
		const rightCollider = world.createCollider(rapier.ColliderDesc.cuboid(colliderWidth, STAND_HEIGHT_METERS));
		rightCollider.setTranslation({x: worldWidth + colliderWidth, y: 0})
		
		return [
			topCollider,
			bottomCollider,
			leftCollider,
			rightCollider
		];
	}

	protected willUpdate(changedProperties: PropertyValues): void {
		console.log("willUpdate");
	    super.willUpdate(changedProperties);
		if (this.physics === undefined) {
			return;
		}
		const currentSize = this.resizeController.value!;
		const sizeUpdated = this.oldSize === undefined || currentSize.height !== this.oldSize.height || currentSize.width !== this.oldSize.width;
		if (sizeUpdated) {
			const screenSpace = {
				height: this.resizeController.value!.height,
				width: this.resizeController.value!.width,
			};
			for (const oldCollider of this.physics.boundingColliders) {
				this.physics.world.removeCollider(oldCollider, false);
			}
			const pixelDensity = screenSpace.height / STAND_HEIGHT_METERS;
			const worldWidth = screenSpace.width / pixelDensity;
			this.physics = {
				...this.physics,
				screenSpace,
				boundingColliders: this.createBoundColliders(this.physics.world, this.physics.rapier, worldWidth)
			};
			console.log("updated after size change", {screenSpace, pixelDensity, worldWidth});
			this.oldSize = currentSize;
		}
	}

	protected render(): HTMLTemplateResult {
		return html`
			<canvas></canvas>
			<curse-game></curse-game>
		`;
	}

	static styles: CSSResultGroup = css`
		:host {
			width: 100%;
			height: 100%;

			display: block;
		}
		canvas {
			position: absolute;
			top: 0;
			left: 0;
			height: 100vh;
			width: 100vw;

			z-index: 5000;
			pointer-events: none;
		}
	`;

}
