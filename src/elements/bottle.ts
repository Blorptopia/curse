import { css, html, LitElement, svg, type CSSResultGroup, type HTMLTemplateResult, type PropertyValues, type SVGTemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import type { LiquidLayer } from "../types/bottle";
import { ResizeController } from "@lit-labs/observers/resize-controller.js";
import Color from "color";
@customElement("curse-bottle")
export class BottleElement extends LitElement {

	@property({ type: Array })
	public layers: LiquidLayer[];

	private resizeController: ResizeController<DOMRectReadOnly>;
	private contentRect: DOMRectReadOnly;
	private diameter: number;
	private margin: number;

	@state()
	private angle: number;

	private isRotating: boolean;

	public constructor() {
		super();

		this.layers = [
			{
				color: Color("#ff0000"),
				height: 1,
			},
			{
				color: Color("#00ff00"),
				height: 2,
			},
			{
				color: Color("#0000ff"),
				height: 3,
			},
		];
		this.resizeController = new ResizeController(this, {
			callback: (entries) => {
				if (entries.length > 0) {
					return entries[0].contentRect;
				}
				return new DOMRectReadOnly();
			}
		});
		this.contentRect = new DOMRectReadOnly();
		this.diameter = 0;
		this.margin = 50;
		this.angle = 90;
		this.isRotating = false;
	}

	private drawLayers(): SVGTemplateResult[] {
		let offset: number = 0;
		let drawnLayers: SVGTemplateResult[] = [];

		const layerScale = this.diameter / 10;

		for (const layer of this.layers) {
			const layerHeight = layer.height * layerScale;

			drawnLayers.push(svg`
				<rect
					x=${this.margin}
					y=${this.diameter - offset - layerHeight + this.margin}
					width=${this.contentRect.width}
					height=${layerHeight}
					fill=${layer.color}
					mask="url(#bottle-mask)"
				/>
			`);
			offset += layerHeight;
		}

		return drawnLayers;
	}

	private blendLayers(): void {
		if (this.layers.length < 2) {
			return;
		}

		const blendedHeight = this.layers[0].height + this.layers[1].height;
		const blendedColor = this.layers[0].color.mix(this.layers[1].color, this.layers[0].height / blendedHeight).toString();

		const blendedLayer: LiquidLayer = {
			color: Color(blendedColor),
			height: blendedHeight
		};

		this.layers = [blendedLayer, ...this.layers.slice(2)];
	}

	private onMouseDown(_event: MouseEvent) {
		this.isRotating = true;
	}

	private onMouseUp(_event: MouseEvent) {
		this.isRotating = false;
	}

	private onMouseMove(event: MouseEvent) {
		if (this.isRotating) {
			this.angle += (event.movementX + event.movementY) / 10;
		}
	}

	protected render(): HTMLTemplateResult {
		if (this.resizeController.value !== undefined) {
			this.contentRect = this.resizeController.value;
			this.diameter = Math.min(this.contentRect.width, this.contentRect.height) - this.margin * 2;
		}

		const bottleX = (this.contentRect.width - (this.diameter / 109 * 74)) / 2;
		const bottleY = (this.contentRect.height - this.diameter) / 2;


		return html`
			<svg
				@mousedown=${this.onMouseDown}
				@mouseup=${this.onMouseUp}
				@mousemove=${this.onMouseMove}
			>
				<mask id="bottle-mask">
					<image x=${bottleX} y=${bottleY} height=${this.diameter} href="/src/assets/mixing/bottle_mask.png" class="bottle" transform="rotate(${this.angle})"/>
				</mask>
				${this.drawLayers()}

				<image x=${bottleX} y=${bottleY} height=${this.diameter} href="/src/assets/mixing/bottle.png" class="bottle" transform="rotate(${this.angle})"/>
			</svg>
		`;
	}

	static styles: CSSResultGroup = css`
		svg {
			width: 100%;
			height: 100%;

			image-rendering: pixelated;
		}

		.bottle {
			transform-origin: center;
		}
	`;
}
