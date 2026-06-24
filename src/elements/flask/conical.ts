import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import FlaskImageURL from "../../assets/flask/conical/image.png";
import type { PlaceItemData } from "../../types/place";
import { Task } from "@lit/task";

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

	// Attributes
	private renderTask: Task<[HTMLCanvasElement?], void>;

	public constructor() {
		super();
		this.angleRad = 0;
		this.shouldBeDraggable = true;
		this.disabled = false;

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
		})
	}
	protected render(): HTMLTemplateResult {
	   	return html`
			<img
				src=${FlaskImageURL}
				.draggable=${this.shouldBeDraggable}
				alt=""
				@dragstart=${(event: DragEvent) => {
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
}
