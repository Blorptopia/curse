import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import "./customer_portrait";
import "./hot_plate";
import "./cup";
import "./ingredient_icon";
import "./customer_shadow";
import "./flask/conical";
import "./physics_world";
import { map } from "lit/directives/map.js";
import type { Order, OrderTemplate } from "../types/order";
import { MAX_ORDERS_PER_DAY, STAND_HEIGHT_METERS } from "../config";
import type { CustomerId } from "../types/customer";
import { styleMap } from "lit/directives/style-map.js";
import { CUSTOMER_ID_TO_NAME } from "../data/customer";
import { INGREDIENTS } from "../data/ingredients";
import type { IngredientId } from "../types/ingredient";
import type { ItemId } from "../types/item";
import { ITEMS } from "../data/items";
import { consume, provide } from "@lit/context";
import { hotPlateActivatedContext, physicsContext, type PhysicsContext } from "../lib/context";
import type { ImpulseJoint, RigidBody, Collider, TempContactForceEvent } from "@dimforge/rapier2d-compat";
import { HotPlateElement } from "./hot_plate";
import { ResizeController } from "@lit-labs/observers/resize-controller.js";
import type { BoundingBox, PhysicsUserData } from "../types/physics";
import type { GameEntity } from "../types/entity";
import { Task } from "@lit/task";
import type { PlaceIngredientData, PlaceItemData } from "../types/place";
import { ConicalFlaskBaseElement } from "./flask/conical";
import { IngredientIconElement } from "./ingredient_icon";
import { ifDefined } from "lit/directives/if-defined.js";

const RANDOM_VALUE_VARIATION: number = 0.1;

@customElement("curse-game")
export class GameElement extends LitElement {
	// Props
	@consume({context: physicsContext, subscribe: true})
	@property({type: Object})
	public physics?: PhysicsContext;
	@provide({ context: hotPlateActivatedContext })
	@property({type: Object})
	public hotPlateActive: boolean;
	// State
	@state()
	private dayIndex: number;
	@state()
	private orders: Order[];
	@state()
	private deadCustomerIds: CustomerId[];
	@state()
	private dialogIndex: number;
	@state()
	private productPurchaseCount: Partial<Record<ItemId | IngredientId, number>>;
	@state()
	private balance: number;
	@state()
	private flasksOnHotPlate: string[];
	@state()
	private flaskTemperatures: Partial<Record<string, string>>;

	// Attributes
	private constantRigidBodies: RigidBody[];
	private entities: Partial<Record<string, GameEntity>>;
	private cursorRigidBody?: RigidBody;
	private cursorJoint?: ImpulseJoint;

	// Elements
	@query("curse-hot-plate")
	private hotPlateElement?: HotPlateElement;
	@query("#entities-container")
	private entitiesContainerElement?: HTMLDivElement;


	public constructor() {
		super();

		this.hotPlateActive = false;

		this.dayIndex = 0;
		this.deadCustomerIds = [];
		this.orders = this.createOrders();
		this.dialogIndex = 0;
		this.productPurchaseCount = {};
		this.balance = 500;
		this.flasksOnHotPlate = [];
		this.flaskTemperatures = {};
		
		this.constantRigidBodies = [];
		this.entities = {};

		// We only care about it for state updates
		new ResizeController(this, {
			callback: (entries) => {
				if (entries.length > 0) {
					return entries[0].contentRect;
				}
				return new DOMRectReadOnly();
			}
		});

		new Task(this, {
			task: async ([physics], {signal}) => {
				if (physics === undefined) {
					return;
				}
				const pixelDensity = physics.screenSpace.height / STAND_HEIGHT_METERS;
				while (!signal.aborted) {
					await new Promise<void>(resolve => {requestAnimationFrame(() => resolve())});

					for (const entity of Object.values(this.entities)) {
						if (entity === undefined) {
							continue;
						}
						const translation = entity.rigidBody.translation();
						const rotation = entity.rigidBody.rotation();
						const x = (translation.x - entity.size.width) * pixelDensity;
						const y = (translation.y - entity.size.height) * pixelDensity;
						entity.element.style.left = `${x}px`;
						entity.element.style.top = `${y}px`;
						entity.element.style.transform = `rotate(${rotation}rad)`;
						entity.element.setAttribute("anglerad", rotation.toString());
					}
				}
			},
			args: () => [this.physics] as const
		});

	}

	protected render(): HTMLTemplateResult {
		return html`
			<div
				id="window-frame"
				@dragover=${(event: DragEvent) => {
					const types = event.dataTransfer!.types;
					
					const isValid = types.includes("curse/item") || types.includes("curse/ingredient");
					if (isValid) {
						event.preventDefault();
					}
				}}
				@drop=${(event: DragEvent) => {
					event.preventDefault();
					const rawItem = event.dataTransfer!.getData("curse/item")
					const rawIngredient = event.dataTransfer!.getData("curse/ingredient")

					if (this.physics === undefined) {
						throw new Error("cannot handle drop - missing physics");
					}
					if (this.entitiesContainerElement === undefined) {
						throw new Error("entitiesContainerElement is not defined");
					}

					if (rawItem !== "") {
						const item = JSON.parse(rawItem) as PlaceItemData;
						
						const newBalance = this.balance - ITEMS[item.itemId].price;
						if (newBalance < 0) {
							return;
						}
						this.balance = newBalance;

						const entityId = crypto.randomUUID();

						const pixelDensity = this.physics.screenSpace.height / STAND_HEIGHT_METERS;

						const halfHeightWorld = item.sizePixels.height / pixelDensity / 2;
						const halfWidthWorld = item.sizePixels.width / pixelDensity / 2;
						console.log({halfHeightWorld, halfWidthWorld, pixelDensity});
						const rigidBody = this.physics.world.createRigidBody(this.physics.rapier.RigidBodyDesc.dynamic());
						const bodyCollider = this.physics.world.createCollider(this.physics.rapier.ColliderDesc.cuboid(halfWidthWorld, halfHeightWorld), rigidBody);

						const x = event.offsetX / pixelDensity;
						const y = event.offsetY / pixelDensity;
						
						rigidBody.setTranslation({x, y}, true);

						rigidBody.userData = {
							boundingBox: {
								hh: halfHeightWorld,
								hw: halfHeightWorld
							},
							entityId
						} satisfies PhysicsUserData;
						rigidBody.setAdditionalMassProperties(rigidBody.mass(), {x: 0, y: -halfHeightWorld / 1.5}, 0, true)
						
						let visualElement: HTMLElement | undefined = undefined;
						if (item.itemId === "CONICAL_FLASK") {
							visualElement = document.createElement("curse-conical-flask");
							visualElement.shouldBeDraggable = false;

							visualElement.addEventListener("cursetemperaturechange", () => {
								this.flaskTemperatures = {
									...this.flaskTemperatures,
									[entityId]: visualElement!.temperature
								}
							});

							const topSensorCollider = this.physics.world.createCollider(this.physics.rapier.ColliderDesc.cuboid(halfWidthWorld / 2, 0.01), rigidBody);
							topSensorCollider.setTranslationWrtParent({x: 0, y: -halfHeightWorld});
							topSensorCollider.setSensor(true);
							topSensorCollider.setActiveEvents(1);

							// Add contact force events so we can destroy it if required
							bodyCollider.setActiveEvents(2);
						}
						if (item.itemId === "SOLO_CUP") {
							visualElement = document.createElement("curse-cup");
							visualElement.shouldBeDraggable = false;
						}
						if (visualElement === undefined) {
							throw new Error(":(");
						}
						visualElement.classList.add("entity", "ingredient");
						this.entitiesContainerElement.appendChild(visualElement);
						this.entities[entityId] = {
							rigidBody,
							size: {height: halfHeightWorld, width: halfWidthWorld},
							element: visualElement
						};
					}
					if (rawIngredient !== "") {
						const ingredient = JSON.parse(rawIngredient) as PlaceIngredientData;
						const newBalance = this.balance - INGREDIENTS[ingredient.ingredientId].price;
						if (newBalance < 0) {
							return;
						}
						this.balance = newBalance;
						const entityId = crypto.randomUUID();

						const pixelDensity = this.physics.screenSpace.height / STAND_HEIGHT_METERS;

						const sizePixels = ingredient.sizePixels;
						const halfSizeWorld = sizePixels / pixelDensity / 2;
						const rigidBody = this.physics.world.createRigidBody(this.physics.rapier.RigidBodyDesc.dynamic());
						this.physics.world.createCollider(this.physics.rapier.ColliderDesc.cuboid(halfSizeWorld, halfSizeWorld), rigidBody);

						const x = event.offsetX / pixelDensity;
						const y = event.offsetY / pixelDensity;
						
						rigidBody.setTranslation({x, y}, true);
						rigidBody.userData = {
							boundingBox: {
								hh: halfSizeWorld,
								hw: halfSizeWorld
							},
							entityId
						} satisfies PhysicsUserData;
						rigidBody.setAdditionalMassProperties(rigidBody.mass() * 2, {x: 0, y: -halfSizeWorld / 1.5}, 0, true)

						const visualElement = document.createElement("curse-ingredient-icon");
						visualElement.setAttribute("ingredientid", ingredient.ingredientId);
						visualElement.shouldBeDraggable = false;
						visualElement.classList.add("entity", "ingredient");
						this.entitiesContainerElement.appendChild(visualElement);
						this.entities[entityId] = {
							rigidBody,
							size: {height: halfSizeWorld, width: halfSizeWorld},
							element: visualElement
						};
					}
					
				}}
				@mousemove=${(event: MouseEvent) => {
					if (this.cursorRigidBody === undefined) {
						return;
					}
					if (this.physics === undefined) {
						return;
					}
					const pixelDensity = this.physics.screenSpace.height / STAND_HEIGHT_METERS;
					const xInWorldSpace = event.pageX / pixelDensity;
					const yInWorldSpace = event.pageY / pixelDensity;

					this.cursorRigidBody.setTranslation({
						x: xInWorldSpace,
						y: yInWorldSpace
					}, true);
				}}
				@mousedown=${(event: MouseEvent) => {
					event.preventDefault();
					if (this.physics === undefined) {
						return;
					}
					if (this.cursorRigidBody === undefined) {
						return;
					}
					if (this.cursorJoint !== undefined) {
						this.physics.world.removeImpulseJoint(this.cursorJoint, true);
						this.cursorJoint = undefined;
					}
					const pixelDensity = this.physics.screenSpace.height / STAND_HEIGHT_METERS;
					const xInWorldSpace = event.pageX / pixelDensity;
					const yInWorldSpace = event.pageY / pixelDensity;
					const ray = new this.physics.rapier.Ray({x: xInWorldSpace, y: yInWorldSpace}, {x: 0, y: 0});
					const hit = this.physics.world.castRay(ray, 1, true);
					if (hit === null) {
						return;
					}
					const rigidBody = hit.collider.parent();
					if (!rigidBody) {
						return;
					}
					const userData = rigidBody.userData as PhysicsUserData | undefined;
					const halfHeight = userData?.boundingBox?.hh ?? 0;
					const holdPosition = -(halfHeight * 0.75);
					const jointData = this.physics.rapier.JointData.revolute({x: 0, y: 0}, {x: 0, y: holdPosition});
					this.cursorJoint = this.physics.world.createImpulseJoint(jointData, this.cursorRigidBody, rigidBody, true);
				}}
				@mouseup=${() => {
					if (this.physics === undefined) {
						return;
					}
					if (this.cursorJoint !== undefined) {
						this.physics.world.removeImpulseJoint(this.cursorJoint, true);
						this.cursorJoint = undefined;
					}
				}}
			>
				<div id="left-window" class="window"></div>
				<div id="right-window" class="window"></div>

				${this.orders.length === 0 ? this.renderCustomer("LOANS_HARK", "pre-explosion", 0) : null}
				${map(this.orders, (order, index) => this.renderCustomer(order.customer.id, order.customer.pose, index))}
				${this.renderDialog()}
				<div id="entities-container"></div>
				<div id="hot-plate-container">
					<curse-hot-plate
						.temperatures=${this.flasksOnHotPlate.map(entityId => this.flaskTemperatures[entityId])}
						@curseenablehotplate=${() => this.hotPlateActive = true}
						@cursedisablehotplate=${() => this.hotPlateActive = false}
					></curse-hot-plate>
				</div>
			</div>
			<section id="shelf">
				<div id="balance">${this.balance}$</div>
				<div id="items-row" class="shelf-row">
					${map(Object.keys(ITEMS) as ItemId[], itemId => this.renderItemListing(itemId))}
				</div>
				<div id="ingredients-row" class="shelf-row">
					${map(this.getIngredientsForDay() as IngredientId[], ingredientId => this.renderIngredientListing(ingredientId))}
				</div>
			</section>
		`
	}
	private renderIngredientListing(ingredientId: IngredientId): HTMLTemplateResult {
		const ingredient = INGREDIENTS[ingredientId];

		const factFragments: HTMLTemplateResult[] = [];

		factFragments.push(html`
			<dt>Price</dt>
			<dd class="price" ?data-can-afford=${this.balance >= ingredient.price}>${ingredient.price}$</dd>
	   	`);

		if (ingredient.effects.explodesWhenMixedWith !== undefined) {
			factFragments.push(html`
				<dt>Explodes when mixed with</dt>
				${ingredient.effects.explodesWhenMixedWith?.map(ingredientId => html`<dd>${INGREDIENTS[ingredientId].name}</dd>`)}
			`);
		}

		return html`
			<div
				class="listing"
				style=${styleMap({
					anchorName: `--listing-${ingredientId}`
				})}
			>
				<div
					class="listing-details"
					style=${styleMap({
						positionAnchor: `--listing-${ingredientId}`
					})}
				>
					<h1>${ingredient.name}</h1>
					<p>${ingredient.description}</p>
					<h2>Ingredient facts</h2>
					<dl>
						${factFragments}
					</dl>
				</div>
				<curse-ingredient-icon
					.ingredientId=${ingredientId}
				></curse-ingredient-icon>
			</div>
		`

	}
	private renderItemListing(itemId: ItemId): HTMLTemplateResult {
		const item = ITEMS[itemId];

		let itemIconFragment: HTMLTemplateResult | undefined;

		if (itemId === "SOLO_CUP") {
			itemIconFragment = html`<curse-cup class="icon"></curse-cup>`;
		}
		if (itemId === "CONICAL_FLASK") {
			itemIconFragment = html`<curse-conical-flask class="icon" disabled></curse-conical-flask>`;
		}

		const factFragments: HTMLTemplateResult[] = [];

		factFragments.push(html`
			<dt>Price</dt>
			<dd class="price" ?data-can-afford=${this.balance >= item.price}>${item.price}$</dd>
	   	`);


		return html`
			<div
				class="listing"
				style=${styleMap({
					anchorName: `--listing-${itemId}`
				})}
			>
				<div
					class="listing-details"
					style=${styleMap({
						positionAnchor: `--listing-${itemId}`
					})}
				>
					<h1>${item.name}</h1>
					<p>${item.description}</p>
					<h2>Product facts</h2>
					<dl>
						${factFragments}
					</dl>
				</div>
				${itemIconFragment}
			</div>
		`

	}
	private renderCustomer(customerId: CustomerId, pose: string | undefined, orderIndex: number): HTMLTemplateResult {
		if (orderIndex > 4) {
			return html``;
		}
		return html`
			<div
				class="customer-container"
				data-index=${orderIndex}
			>
				${orderIndex === 0 ? html`
					<curse-customer-portrait
						customerid=${customerId}
						pose=${ifDefined(pose)}
					></curse-customer-portrait>
				` : html`
					<curse-customer-shadow
						customerid=${customerId}
					></curse-customer-shadow>
				`}
			</div>
		`

	}
	private renderDialog(): HTMLTemplateResult {
		const activeOrder = this.orders[0];
		const canDecline = this.dayIndex !== 0;

		if (activeOrder !== undefined) {
			const dialogPages = activeOrder.description?.length ?? 0;
			const currentDialogPage = activeOrder.description?.[this.dialogIndex] ?? activeOrder.name;
			const hasMorePages = dialogPages > this.dialogIndex + 1;
			return html`
				<div id="dialog">
					<div id="dialog-heading">
						<h1>${CUSTOMER_ID_TO_NAME[activeOrder.customer.id]}</h1>
					</div>
					<p>${currentDialogPage}</p>

					<div id="actions">
						${hasMorePages ? html`
							<button
								class="primary"
								type="button"
								@click=${() => {
									this.dialogIndex++;
								}}
							>Next</button>
						` : html`
							<button
								class="destructive"
								type="button"
								@click=${() => {
									this.orders = [
										...this.orders.slice(1)
									];
									this.dialogIndex = 0;
								}}
								?hidden=${!canDecline}
							>Reject</button>
						`}
					</div>
				</div>
			`
		}
		const payment = this.getLoanSharkPayment();
		if (this.dayIndex === 0) {
			return html`
				<div id="dialog">
					<div id="dialog-heading">
						<h1>${CUSTOMER_ID_TO_NAME["LOANS_HARK"]}</h1>
					</div>
					<p>Dialoge here</p>
				</div>
			`
		}

		return html`
			<div id="dialog">
				<div id="dialog-heading">
					<h1>${CUSTOMER_ID_TO_NAME["LOANS_HARK"]}</h1>
				</div>
				<p>I'm here for my daily payment of <span class="price">${payment}</span></p>
				<div id="actions">
					<button class="primary">Pay</button>
					<button class="destructive">Reject</button>
				</div>
			</div>
		`
	}
	private createOrderTemplates(): OrderTemplate[] {
		const JACK_INTERACTIONS: OrderTemplate[] = [
			{
				name: "Genius potion",
				description: ["My wife keeps winning at trivia and maths, please make me a genius potion."],
				customer: {
					id: "JACK",
				},
				requiredIngredients: ["BURGER"],
				baseValue: 1
			},
			{
				name: "Stupid potion",
				description: ["I never lose to my wife anymore, but somehow, i learned to speak dog. All my dog does is argue politics with me now. Please make me a stupid potion."],
				customer: {
					id: "JACK",
				},
				requiredIngredients: ["BURGER"],
				baseValue: 1
			},
			{
				name: "Antidepressant potion",
				description: ["Now that i'm stupid, both my dog and wife keep beating me at everything.\nI still speak dog.\nPlease make me an anti-depression potion."],
				customer: {
					id: "JACK",
				},
				requiredIngredients: ["BURGER"],
				baseValue: 1
			},

		];
		const JOANY_INTERACTIONS: OrderTemplate[] = [
			{
				name: "Confidence potion",
				description: [
					"Hey I could need some help",
					"I need some confidence for this job interview, could you help me out?"
				],
				customer: {
					id: "JOANY",
				},
				requiredIngredients: ["BURGER"],
				baseValue: 1
			},
		];
		const templates: OrderTemplate[] = [];
		if (this.dayIndex === 0) {
			templates.push(JOANY_INTERACTIONS[0]);
			templates.push(JACK_INTERACTIONS[0]);
		}
		if (this.dayIndex === 1) {
			templates.push(JACK_INTERACTIONS[1]);
		}
		if (this.dayIndex === 2) {
			templates.push(JACK_INTERACTIONS[2]);
		}

		const RANDOM_ORDER_TEMPLATES: OrderTemplate[] = [
			{
				name: "Armor potion",
				customer: {
					id: "JACK",
				},
				requiredIngredients: ["BURGER"],
				baseValue: 1
			},
			{
				name: "Upside-down potion",
				customer: {
					id: "JACK",
				},
				requiredIngredients: ["BURGER"],
				baseValue: 1
			},
		];

		const desiredRandomOrderCount = MAX_ORDERS_PER_DAY - templates.length;
		for (let i = 0; i < desiredRandomOrderCount; i++) {
			const template = RANDOM_ORDER_TEMPLATES[Math.floor(Math.random() * RANDOM_ORDER_TEMPLATES.length)]!;
			templates.push(template);
		}
		return templates;
	}
	private createOrders(): Order[] {
		const templates = this.createOrderTemplates();
		const templatesWithoutDeadCustomers = templates.filter(template => !this.deadCustomerIds.includes(template.customerId));

		const orders = templatesWithoutDeadCustomers.map(template => {
			const valueRandomMultiplier = 1 + (Math.random() * RANDOM_VALUE_VARIATION) - (RANDOM_VALUE_VARIATION / 2);
			const valueReputationMultipier = 1; // TODO: Change
			const valueDayMultiplier = this.getDayValueMultiplier();
			const value = Math.floor(template.baseValue * valueRandomMultiplier * valueReputationMultipier * valueDayMultiplier);
			const order = {
				id: crypto.randomUUID(),
				name: template.name,
				description: template.description,
				customer: template.customer,
				requiredIngredients: template.requiredIngredients,
				value
			} satisfies Order;
			return order;
		});
		return orders;
	}
	private getDayValueMultiplier(): number {
		if (this.dayIndex === 0) {
			return 50;
		}
		if (this.dayIndex === 1) {
			return 100;
		}
		if (this.dayIndex === 2) {
			return 100;
		}
		const baseValue = 150;
		return baseValue - (this.dayIndex * 10);
	}
	private getLoanSharkPayment(): number {
		if (this.dayIndex === 0) {
			return 50;
		}
		if (this.dayIndex === 1) {
			return 150;
		}
		if (this.dayIndex === 2) {
			return 250;
		}
		if (this.dayIndex === 3) {
			return 350;
		}
		return 550;
	}
	private getIngredientsForDay(): IngredientId[] {
		if (this.dayIndex === 0) {
			return ["BURGER"];
		}
		return ["RED_PILL", "BLUE_PILL"];
	}
	protected willUpdate(changedProperties: PropertyValues): void {
	    super.willUpdate(changedProperties);

		if (this.physics === undefined) {
			return;
		}
		this.updateConstantColliders(this.physics);
		this.updateCursorRigidBody(this.physics);
	}
	private updateCursorRigidBody(physics: PhysicsContext): void {
		if (this.cursorRigidBody === undefined) {
			this.cursorRigidBody = physics.world.createRigidBody(physics.rapier.RigidBodyDesc.fixed());
		}
	}
	private updateConstantColliders(physics: PhysicsContext): void {
		if (this.hotPlateElement === undefined) {
			return;
		}

		for (const rigidBody of this.constantRigidBodies) {
			physics.world.removeRigidBody(rigidBody);
		}
		this.constantRigidBodies = [];
		
		// Hot plate
		const hotPlateRigidBody = physics.world.createRigidBody(physics.rapier.RigidBodyDesc.fixed());
		hotPlateRigidBody.userData = {
			role: "hot_plate"
		} satisfies PhysicsUserData;
		const hotPlateBox = this.createGameBoundsForElement(this.hotPlateElement, physics);
		hotPlateRigidBody.setTranslation({x: hotPlateBox.x, y: hotPlateBox.y}, true);
		this.constantRigidBodies.push(hotPlateRigidBody);
		physics.world.createCollider(physics.rapier.ColliderDesc.cuboid(hotPlateBox.hw, hotPlateBox.hh), hotPlateRigidBody);

		const hotPlateSensor = physics.world.createCollider(physics.rapier.ColliderDesc.cuboid(hotPlateBox.hw, 0.1), hotPlateRigidBody);
		hotPlateSensor.setSensor(true);
		hotPlateSensor.setActiveEvents(1);
	}
	private createGameBoundsForElement(element: HTMLElement, physics: PhysicsContext): BoundingBox {
		let rect = element.getBoundingClientRect();
		const pixelDensity = physics.screenSpace.height / STAND_HEIGHT_METERS;

		const hh = rect.height / pixelDensity / 2;
		const hw = rect.width / pixelDensity / 2;
		const xRelativeToRoot = rect.x + window.scrollX;
		const yRelativeToRoot = rect.y + window.scrollY;
		const x = xRelativeToRoot / pixelDensity + hw;
		const y = yRelativeToRoot / pixelDensity + hh;

		return {
			x,
			y,
			hw,
			hh
		}
		
	}
	public handleCollisionEvent(collider1: Collider, collider2: Collider, started: boolean): void {
		this.handlePlaceItemCollisionEvent(collider1, collider2, started);
		this.handleHotPlateCollisionEvent(collider1, collider2, started);

	}
	private handlePlaceItemCollisionEvent(collider1: Collider, collider2: Collider, started: boolean): void {
		const rigidBody1 = collider1.parent();
		const rigidBody2 = collider2.parent();
		if (!started) {
			return;
		}
		if (rigidBody1 === null || rigidBody2 === null) {
			return;
		}
		if (this.physics === undefined) {
			return;
		}
		const userData1 = rigidBody1.userData as PhysicsUserData | undefined;
		const userData2 = rigidBody2.userData as PhysicsUserData | undefined;

		const entity1Id = userData1?.entityId;
		const entity2Id = userData2?.entityId;

		if (entity1Id === undefined || entity2Id === undefined) {
			return;
		}

		const entity1 = this.entities[entity1Id]!;
		const entity2 = this.entities[entity2Id]!;


		if (entity1.element instanceof ConicalFlaskBaseElement && entity2.element instanceof IngredientIconElement) {
			entity2.element.remove();
			delete this.entities[entity2Id];
			this.physics.world.removeRigidBody(rigidBody2);
			entity1.element.addIngredient(entity2.element.ingredientId);
		}
		if (entity2.element instanceof ConicalFlaskBaseElement && entity1.element instanceof IngredientIconElement) {
			entity1.element.remove();
			delete this.entities[entity1Id];
			this.physics.world.removeRigidBody(rigidBody1);
			entity2.element.addIngredient(entity1.element.ingredientId);

		}
	}
	public handleContactEvent(event: TempContactForceEvent): void {
		if (this.physics === undefined) {
			return;
		}
		const magnitude = event.maxForceMagnitude();
		if (magnitude < 5 || magnitude > 30) {
			return;
		}
		if (this.cursorJoint !== undefined) {
			console.log(`ignoring crash with ${magnitude}mag due cursor being used (stuck inside something?)`);
			return;
		}
		console.log(`crash @ ${magnitude}`);
		const collider1 = this.physics.world.getCollider(event.collider1())!;
		const collider2 = this.physics.world.getCollider(event.collider2())!;

		const rigidBody1 = collider1.parent();
		const rigidBody2 = collider2.parent();

		if (rigidBody1) {
			this.handleCrash(rigidBody1, magnitude)
		}
		if (rigidBody2) {
			this.handleCrash(rigidBody2, magnitude)
		}
	}
	private handleCrash(rigidBody: RigidBody, magnitude: number): void {
		const userData = rigidBody?.userData as PhysicsUserData | undefined;
		const entityId = userData?.entityId;

		if (entityId === undefined) {
			return;
		}
		const entity = this.entities[entityId];
		if (entity === undefined) {
			return;
		}
		if (entity.element instanceof ConicalFlaskBaseElement) {
			entity.element.registerCrash(magnitude);
		}

	}
	private handleHotPlateCollisionEvent(collider1: Collider, collider2: Collider, started: boolean): void {
		const rigidBody1 = collider1.parent();
		const rigidBody2 = collider2.parent();
		if (rigidBody1 === null || rigidBody2 === null) {
			console.log("ignoring - no parent");
			return;
		}
		if (this.physics === undefined) {
			console.log("no physics - ignoring event");
			return;
		}
		const userData1 = rigidBody1.userData as PhysicsUserData | undefined;
		const userData2 = rigidBody2.userData as PhysicsUserData | undefined;

		const entity1Id = userData1?.entityId;
		const entity2Id = userData2?.entityId;

		const entity1Role = userData1?.role;
		const entity2Role = userData2?.role;

		if (entity1Id !== undefined && entity2Role === "hot_plate") {
			const entity1 = this.entities[entity1Id]!;
			if (!(entity1.element instanceof ConicalFlaskBaseElement)) {
				console.log("not hot :(", entity1.element);
				return;
			}
			if (started) {
				this.flasksOnHotPlate = this.flasksOnHotPlate.filter(id => id !== entity1Id);
				this.flasksOnHotPlate.push(entity1Id);
			} else {
				this.flasksOnHotPlate = this.flasksOnHotPlate.filter(id => id !== entity1Id);
			}
			entity1.element.onHotPlate = started;
		}
		if (entity1Role === "hot_plate" && entity2Id !== undefined) {
			const entity2 = this.entities[entity2Id]!;
			if (!(entity2.element instanceof ConicalFlaskBaseElement)) {
				return;
			}
			entity2.element.onHotPlate = started;
			if (started) {
				this.flasksOnHotPlate = this.flasksOnHotPlate.filter(id => id !== entity2Id);
				this.flasksOnHotPlate.push(entity2Id);
			} else {
				this.flasksOnHotPlate = this.flasksOnHotPlate.filter(id => id !== entity2Id);
			}
		}

	}
	public static styles?: CSSResultGroup = css`
		#window-frame {
			border: 2rem solid #775079;

			height: 100%;
			box-sizing: border-box;
		}
		.window {
			position: absolute;
			z-index: -50;
			top: 0;
			background: #ffffff55;
			border-color: #ffffff99;
			height: 100%;
			width: 15%;
			border-width: .2rem;
		}
		#left-window {
			border-right-style: solid;
			left: 0;
		}
		#right-window {
			border-left-style: solid;
			right: 0;
		}
		#shelf {
			background: #775079;
			padding: 1rem;

			display: flex;
			flex-direction: column;
			gap: 1rem;

			position: relative;
		}
		#balance {
			position: absolute;
			right: 1rem;
			padding: 1rem;
			background: black;
			color: green;
			font-weight: bold;
			font-size: 2rem;
		}
		.shelf-row {
			background: #a15d7b;
			padding: 1rem;
			width: 100%;
			box-sizing: border-box;

			display: flex;
			gap: 1rem;
			align-items: flex-end;
		}
		.customer-container {
			position: absolute;
			overflow-y: hidden;
			z-index: -100;

			display: flex;
			justify-content: center;

			pointer-events: none;

			curse-customer-portrait {
				--size-multiplier: .25rem;
				anchor-name: --active-customer;
			}
			curse-customer-shadow {
				--size-multiplier: .20rem;
			}
		}
		.customer-container[data-index="0"] {
			z-index: -50;
			width: 100%;
			left: 0;
			bottom: 0;
		}
		.customer-container[data-index="1"] {
			left: 0;
			bottom: -7rem;
		}
		.customer-container[data-index="2"] {
			right: 0;
			bottom: -5rem;
			transform: rotateY(180deg);
		}
		.customer-container[data-index="3"] {
			left: 20rem;
			bottom: -5rem;
		}
		.customer-container[data-index="4"] {
			right: 20rem;
			bottom: -3rem;
		}
		#hot-plate-container {
			position: absolute;
			left: 0;
			bottom: 1rem;
			width: 100%;

			display: flex;
			justify-content: center;

			curse-hot-plate {
				--size-multiplier: .11rem;
			}
		}
		curse-cup {
			--size-multiplier: .14rem;
		}
		curse-ingredient-icon {
			--size-multiplier: 0.04rem;
		}
		@media (max-width: 800px) {
			#window-frame {
				border-top: none;
				border-left: none;
				border-right: none;
			}
			.window {
				display: none;
			}
			#space-saving-row {
				display: flex;
			}
		}
		@media (max-width: 1000px) {
			.customer-container[data-index="1"] {
				display: none;
			}
			.customer-container[data-index="2"] {
				display: none;
			}
		}
		@media (max-width: 1600px) {
			.customer-container[data-index="3"] {
				display: none;
			}
			.customer-container[data-index="4"] {
				display: none;
			}
		}
		#dialog {
			position: absolute;
			position-anchor: --active-customer;
			position-area: top right;

			padding: 1rem;
			background: white;
			color: black;
			border-radius: .75rem;

			#dialog-heading {
				display: flex;
				align-content: center;
				justify-content: space-between;
			}
			h1 {
				margin: 0;
				vertical-align: middle;
			}
			user-select: none;
		}
		.listing-details {
			position: absolute;
			position-area: top right;
			z-index: 100;

			width: max-content;

			background: white;
			color: black;
			padding: 1rem;
			border-radius: 1rem;
			border: .1rem solid black;

			user-select: none;
		}
		.listing:not(:hover) > .listing-details {
			display: none;
		}
		.price {
			color: green;
		}
		.price:not([data-can-afford]) {
			color: red;
		}
		dt {
			font-weight: bold;
		}

		.entity {
			position: absolute;
		}
		curse-conical-flask {
			--size-multiplier: 0.1rem;
		}
	`;
}
