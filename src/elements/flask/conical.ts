import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import FlaskImageURL from "../../assets/flask/conical/image.png";
import type { PlaceItemData } from "../../types/place";
import { Task } from "@lit/task";
import type { IngredientId } from "../../types/ingredient";
import type { IngredientInstance } from "../../types/flask";
import MaskImageURL from "../../assets/flask/conical/mask.png?url";

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
	private renderTask: Task<[HTMLCanvasElement | undefined, boolean], void>;

	private liquidResolution: number;
	private wavelength: number;

	public constructor() {
		super();
		this.angleRad = 0;
		this.shouldBeDraggable = true;
		this.disabled = false;

		this.instances = {};

		this.renderTask = new Task(this, {
			task: async ([canvas, disabled], { signal }) => {
				if (canvas === undefined) {
					return;
				}
				const context = canvas.getContext("2d")!;
				if (disabled) {
					context.reset();
					return;
				}
				while (!signal.aborted) {
					const angleIncrement = (Math.PI * 2) / this.liquidResolution;
					const height = canvas.height / 4;
					let wave: number[] = [];

					const maskImage = new Image();
					maskImage.src = MaskImageURL;
					context.imageSmoothingEnabled = false;
					context.save()
					context.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
					context.globalCompositeOperation = "source-in";

					const tempCanvas = document.createElement("canvas");
					const tempContext = tempCanvas.getContext("2d")!;
					tempCanvas.width = canvas.width;
					tempCanvas.height = canvas.height;


					tempContext.fillStyle = "#2b6be3";
					tempContext.beginPath();
					tempContext.moveTo(0, height);
					for (let index = 0; index <= this.liquidResolution; index++) {
						wave.push(height + Math.sin(angleIncrement * index) * this.wavelength);
						tempContext.lineTo(canvas.width / this.liquidResolution * index, height + Math.sin(angleIncrement * index) * this.wavelength);
					}
					tempContext.lineTo(canvas.width, canvas.height);
					tempContext.lineTo(0, canvas.height);
					tempContext.fill();

					tempContext.fillStyle = "#34faf3";
					tempContext.beginPath();
					tempContext.moveTo(0, height);
					for (let [index, point] of wave.toReversed().entries()) {
						tempContext.lineTo(canvas.width / this.liquidResolution * index, point);
					}
					tempContext.lineTo(canvas.width, canvas.height);
					tempContext.lineTo(0, canvas.height);
					tempContext.fill();

					context.drawImage(tempCanvas, 0, 0);
					context.restore()

					context.drawImage(this.imageElement!, 0, 0, canvas.width, canvas.height);

					await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
				}
			},
			args: () => [this.canvasElement, this.disabled] as const
		});
		this.liquidResolution = 20;
		this.wavelength = 10;
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
			--source-height: 109;
			--source-width: 74;
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
		// console.log({oldAngleRad, angleRad: this.angleRad});

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
