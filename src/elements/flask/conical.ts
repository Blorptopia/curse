import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import FlaskImageURL from "../../assets/flask/conical/image.png";
import type { PlaceItemData } from "../../types/place";
import { Task } from "@lit/task";
import type { IngredientId } from "../../types/ingredient";
import type { IngredientInstance } from "../../types/flask";
import MaskImageURL from "../../assets/flask/conical/mask.png?url";
import { INGREDIENTS } from "../../data/ingredients";
import { hotPlateActivatedContext } from "../../lib/context";
import { consume } from "@lit/context";
import { FLASK_BASELINE_TEMPERATURE, FLASK_HEAT_SPEED, FLASK_MAX_OVERHEAT_SCORE, FLASK_MAX_TEMPERATURE } from "../../config";
import Color, { type ColorInstance } from "color";


@customElement("curse-conical-flask")
export class ConicalFlaskBaseElement extends LitElement {
	// Props
	@property({type: Boolean})
	public shouldBeDraggable: boolean;
	@property({type: Boolean})
	public disabled: boolean;
	@property({type: Number})
	public angleRad: number;
	@property({type: Boolean})
	public onHotPlate: boolean;
	@property({type: Number})
	public temperature: number;
	@consume({context: hotPlateActivatedContext, subscribe: true})
	@property({type: Boolean})
	public hotPlateActivated: boolean;
	@property({type: Array})
	public instances: Partial<Record<string, IngredientInstance>>;

	// Elements
	@query("img")
	private imageElement?: HTMLImageElement;
	@query("canvas")
	private canvasElement?: HTMLCanvasElement;

	// Attributes
	private renderTask: Task<[HTMLCanvasElement | undefined, boolean], void>;
	private updateTemperatureTask: Task<[boolean], void>;

	private liquidResolution: number;
	private maxLiquid: number;
	private wavelength: number;
	public constructor() {
		super();
		this.angleRad = 0;
		this.shouldBeDraggable = true;
		this.disabled = false;
		this.onHotPlate = false;
		this.temperature = 20;
		this.hotPlateActivated = false;
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
					const maskImage = new Image();
					maskImage.src = MaskImageURL;
					context.imageSmoothingEnabled = false;
					context.save()
					context.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
					context.globalCompositeOperation = "source-in";

					context.drawImage(this.drawIngredients(canvas.width, canvas.height)!, 0, 0);
					context.restore()

					context.drawImage(this.imageElement!, 0, 0, canvas.width, canvas.height);

					await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
				}
			},
			args: () => [this.canvasElement, this.disabled] as const
		});
		this.updateTemperatureTask = new Task(this, {
			task: async ([disabled], {signal}) => {
				if (disabled) {
					return;
				}
				while (!signal.aborted) {
					if (this.onHotPlate && this.hotPlateActivated) {
						await new Promise<void>(resolve => setTimeout(resolve, 300));
						this.temperature += 3;
					} else {
						await new Promise<void>(resolve => setTimeout(resolve, 500));
						this.temperature -= 1;
					}
					this.temperature = Math.max(FLASK_BASELINE_TEMPERATURE, this.temperature);
					console.log(`set temperature to ${this.temperature}`);

					const event = new CustomEvent("cursetemperaturechange");
					this.dispatchEvent(event);

					this.mutateInstances(instance => {
						let heatedFraction = instance.heatedFraction;
						const heatEffect = (this.temperature - FLASK_BASELINE_TEMPERATURE) / FLASK_MAX_TEMPERATURE;
						heatedFraction += heatEffect * FLASK_HEAT_SPEED;

						let wronglyHeatedScore = instance.wronglyHeatedScore;
						const ingredient = INGREDIENTS[instance.ingredientId];
						const minTemp = ingredient.effects?.tempratureRange?.min;
						if (minTemp !== undefined && this.temperature < minTemp) {
							wronglyHeatedScore++;
						}
						const maxTemp = ingredient.effects?.tempratureRange?.max;
						if (maxTemp !== undefined && this.temperature > maxTemp) {
							wronglyHeatedScore++;
						}

						console.log({wronglyHeatedScore, heatedFraction});

						return {
							...instance,
							heatedFraction,
							wronglyHeatedScore
						}
					});
				}
			},
			args: () => [this.disabled] as const
		})
		this.liquidResolution = 20;
		this.wavelength = 10;
		this.maxLiquid = 10;
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
				heatedFraction: 0,
				spinsFromStart: 0,
				totalRotation: 0,
				wronglyHeatedScore: 0
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
	public registerCrash(magnitude: number): void {}
	private drawIngredients(canvasWidth: number, canvasHeight: number): HTMLCanvasElement | undefined {
		if (this.instances === undefined) {
			return;
		}

		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d")!;
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		const angleIncrement = (Math.PI * 2) / this.liquidResolution;
		let wave: number[] = [];


		for (let index = 0; index <= this.liquidResolution; index++) {
			let point = Math.sin(angleIncrement * index + Date.now() / 1000) * this.wavelength

			point += Math.min(6, Math.random() * (this.temperature - 20) / 10);

			wave.push(point);
		}

		let ingredientIndex = 0;

		const instances = Object.values(this.instances);

		for (const instance of instances.toReversed()) {
			if (instance === undefined) {
				continue;
			}

			const ingredient = INGREDIENTS[instance.ingredientId];

			const liquidScale = canvasHeight / this.maxLiquid

			const height = canvasHeight + liquidScale * (ingredientIndex + 1) - liquidScale * instances.length;

			const colorAfterEffects = this.getInstanceColor(instance);

			if (ingredientIndex === 0) {
				context.fillStyle = colorAfterEffects.darken(.2).toString();
				context.beginPath();
				context.moveTo(0, height);
				for (let [index, point] of wave.entries()) {
					context.lineTo(canvas.width / this.liquidResolution * index, height + point - this.wavelength * 2);
				}
				context.lineTo(canvas.width, canvas.height);
				context.lineTo(0, canvas.height);
				context.fill();
			}

			context.fillStyle = colorAfterEffects.toString();
			context.beginPath();
			context.moveTo(0, height);
			for (let [index, point] of wave.toReversed().entries()) {
				context.lineTo(canvas.width / this.liquidResolution * index, height + point - this.wavelength * 2);
			}
			context.lineTo(canvas.width, canvas.height);
			context.lineTo(0, canvas.height);
			context.fill();

			ingredientIndex++;
		}

		return canvas;
	}

	public consumeAndGetValue(): number {
		let value = 0;
		for (const instance of Object.values(this.instances)) {
			if (instance === undefined) {
				continue;
			}
			const ingredient = INGREDIENTS[instance.ingredientId];
			let instanceValue = 0;
			// Positive effects
			instanceValue += ingredient.price * Math.min(1, instance.mixedFraction);

			// Dual sided
			let heatMultiplier = 1;
			if (instance.heatedFraction >= 1) {
				heatMultiplier -= 1 - Math.max(2, instance.heatedFraction);
			} else {
				heatMultiplier = instance.heatedFraction;
			}
			instanceValue += ingredient.price * heatMultiplier;

			// Negative effects
			instanceValue -= instanceValue * 2 * instance.poisonFraction;
			console.log({instanceValue, heatMultiplier});
			
			const wronglyHeatedFraction = Math.min(instance.wronglyHeatedScore, FLASK_MAX_OVERHEAT_SCORE) / FLASK_MAX_OVERHEAT_SCORE;
			instanceValue -= wronglyHeatedFraction * ingredient.price * 0.5;
			value += instanceValue;
		}

		this.instances = {};

		console.log({value});

		return value;
	}

	private getInstanceColor(instance: IngredientInstance): ColorInstance {
		const ingredient = INGREDIENTS[instance.ingredientId];
		let color = ingredient.color;

		// Make more transparent depending on how little it's cooked
		const transparent = new Color("transparent");
		color = ingredient.color.mix(transparent, 1 - Math.max(0.2, Math.min(1, instance.heatedFraction)));

		return color;
		
	}
}
