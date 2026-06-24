import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import FlaskImageURL from "../../assets/flask/conical/image.png";
import type { PlaceItemData } from "../../types/place";
import { Task } from "@lit/task";
import type { IngredientId } from "../../types/ingredient";
import type { IngredientInstance } from "../../types/flask";

@customElement("curse-conical-flask")
export class ConicalFlaskBaseElement extends LitElement {
	// Props
	@property({type: Boolean})
	public shouldBeDraggable: boolean;
	@property({type: Boolean})
	public disabled: boolean;
	@property({type: Number})
	public angleRad: number;

	// Elements
	@query("img")
	private imageElement?: HTMLImageElement;
	@query("canvas")
	private canvasElement?: HTMLCanvasElement;

	// State
	@state()
	private instances: Partial<Record<string, IngredientInstance>>;

	// Attributes
	private renderTask: Task<[HTMLCanvasElement?], void>;

	public constructor() {
		super();
		this.angleRad = 0;
		this.shouldBeDraggable = true;
		this.disabled = false;

		this.instances = {};

		this.renderTask = new Task(this, {
			task: async ([canvas, disabled], {signal}) => {
				if (canvas === undefined) {
					return;
				}
				const context = canvas.getContext("2d")!;
				if (disabled) {
					context.reset();
					return;
				}
				while (!signal.aborted) {
					// TODO: Render here!
					await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
				}
			},
			args: () => [this.canvasElement, this.disabled] as const
		});
	}
	protected render(): HTMLTemplateResult {
	   	return html`
			<img
				src=${FlaskImageURL}
				.draggable=${this.shouldBeDraggable}
				alt=""
				@dragstart=${(event: DragEvent) => {
					if (!this.shouldBeDraggable) {
						return;
					}
					const imageElement = this.imageElement!;
					const rect = imageElement.getBoundingClientRect();
					const payload: PlaceItemData = {
						itemId: "CONICAL_FLASK",
						sizePixels: {
							height: rect.height,
							width: rect.width
						}
					};
					event.dataTransfer!.setData("curse/item", JSON.stringify(payload));
				}}
			>
			<canvas></canvas>
		`; 
	}
	public static styles?: CSSResultGroup = css`
		:host {
			display: block;
			--source-height: 45;
			--source-width: 28;
			height: calc(var(--source-height) * var(--size-multiplier));
			width: calc(var(--source-width) * var(--size-multiplier));
			position: relative;
			user-select: none;
		}
		img {
			display: block;
			height: 100%;
			width: 100%;
			object-fit: contain;
			object-position: bottom center;

			image-rendering: pixelated;
		}
		canvas {
			position: absolute;
			top: 0;
			left: 0;
			height: 100%;
			width: 100%;
			
			pointer-events: none;
		}
	`;

	public addIngredient(ingredientId: IngredientId): void {
		const instance = {
				ingredientId,
				mixedFraction: 0,
				poisonFraction: 0,
				spinsFromStart: 0,
				totalRotation: 0
		} satisfies IngredientInstance;
		const instanceId = crypto.randomUUID();
		this.instances = {
			...this.instances,
			[instanceId]: instance
		};
	}
	protected willUpdate(changedProperties: PropertyValues): void {
	    super.willUpdate(changedProperties);

		const oldAngleRad = changedProperties.get("angleRad") as number | undefined;
		console.log({oldAngleRad, angleRad: this.angleRad});
		
		// This is broken. @platinumaniac pls fix kthx
		// if (oldAngleRad !== undefined) {
		// 	if (oldAngleRad > 0 && this.angleRad < 0) {
		// 		console.log("mutating - spun left");
		// 		this.mutateInstances(instance => {
		// 			return {
		// 				...instance,
		// 				spinsFromStart: instance.spinsFromStart - 1
		// 			}
		// 		})
		// 	}
		// 	if (oldAngleRad < 0 && this.angleRad > 0) {
		// 		console.log("mutating - spun right");
		// 		this.mutateInstances(instance => {
		// 			return {
		// 				...instance,
		// 				spinsFromStart: instance.spinsFromStart + 1
		// 			}
		// 		})
		// 	}
		// }
	}
	private mutateInstances(mutator: (instance: IngredientInstance) => IngredientInstance): void {
		for (const [instanceId, instance] of Object.entries(this.instances)) {
			this.instances[instanceId] = mutator(instance!);
		}
	}
}
