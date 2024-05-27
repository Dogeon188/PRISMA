import {
    _decorator,
    Animation,
    clamp,
    Collider2D,
    Color,
    Component,
    Contact2DType,
    EventKeyboard,
    Input,
    input,
    IPhysics2DContact,
    KeyCode,
    RigidBody2D,
    Sprite,
    Vec2,
} from "cc"
import { Box } from "./Entities/Box"
import { Entity } from "./Entities/Entity"
import { GameManager } from "./GameManager"
import { ColliderGroup, ColliderType } from "./Physics/ColliderManager"
import {
    fuzzyEqual,
    getCorrectNormal,
    NormalDirection,
} from "./Physics/PhysicsFixer"
import { Movement } from "./Physics/PlayerMovement"

const { ccclass, property, requireComponent } = _decorator

interface KeyBind {
    up: import("cc").KeyCode
    down: import("cc").KeyCode
    left: import("cc").KeyCode
    right: import("cc").KeyCode
    interact: import("cc").KeyCode
}

@ccclass("Player")
@requireComponent(RigidBody2D)
export class Player extends Component {
    //#region Constants

    private static readonly WALK_ACC = 80
    private static readonly WALK_SPEED = 10
    private static readonly JUMP_SPEED = 20
    private static readonly GRAVITY = 5
    private static readonly KEYBINDS: KeyBind = {
        up: KeyCode.KEY_W,
        down: KeyCode.KEY_S,
        left: KeyCode.KEY_A,
        right: KeyCode.KEY_D,
        interact: KeyCode.KEY_E,
    }

    //#endregion

    //#region References

    private rigidBody: RigidBody2D

    /**
     * Set of UUIDs of nodes that the player is standing on. \
     * This works in practice based on the assumption that no two nodes have the same UUID,
     * and that a player won't be standing on too many nodes at once. \
     * Dirty trick... but it works.
     */
    private standingOn: Set<string> = new Set()

    /** Most recently collided/touched entity */
    private recentCollidedWith: Entity

    /** Entity that the player is currently interacting with */
    private interactingWith: Entity

    /** Reference to animation component of sprite node */
    private animation: Animation

    private gameManager: GameManager

    private movement: Movement = new Movement()

    @property({ type: Sprite, tooltip: "Reference to sprite node" })
    private sprite: Sprite = null

    //#endregion

    //#region Properties

    private get onGround(): boolean {
        return this.standingOn.size > 0
    }

    /** Name of current animation being played */
    private currentAnimation: string

    //#endregion

    //#region Lifecycle

    protected onLoad(): void {
        // Initialize references
        this.rigidBody = this.getComponent(RigidBody2D)
        this.rigidBody.gravityScale = Player.GRAVITY

        this.animation = this.sprite.node.getComponent(Animation)

        // Register input events
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this)

        for (const collider of this.node.getComponents(Collider2D)) {
            if (collider.tag === ColliderType.PLAYER) {
                collider.group = ColliderGroup.RED // TODO dynamic change group
                collider.on(
                    Contact2DType.BEGIN_CONTACT,
                    this.onBeginContact,
                    this,
                )
                collider.on(Contact2DType.END_CONTACT, this.onEndContact, this)
            } else if (collider.tag === ColliderType.HALO) {
                collider.on(
                    Contact2DType.BEGIN_CONTACT,
                    this.onBeginContactHalo,
                    this,
                )
                collider.on(
                    Contact2DType.END_CONTACT,
                    this.onEndContactHalo,
                    this,
                )
            } else {
                console.error("Player collider type not set to PLAYER or HALO!")
            }
        }
    }

    protected update(dt: number): void {
        this.updateMovement(dt)
        this.updateAnimation(dt)

        this.sprite.color = this.onGround
            ? new Color(255, 255, 255)
            : new Color(255, 0, 0)
    }

    //#endregion

    //#region Physics

    private updateMovement(dt: number): void {
        // Apply movement forces
        if (this.movement.left) {
            this.rigidBody.applyForceToCenter(
                new Vec2(-Player.WALK_ACC, 0),
                true,
            )
        }
        if (this.movement.right) {
            this.rigidBody.applyForceToCenter(
                new Vec2(Player.WALK_ACC, 0),
                true,
            )
        }
        // Apply friction when not moving
        if (this.movement.static) {
            this.rigidBody.linearVelocity = this.rigidBody.linearVelocity.lerp(
                new Vec2(0, this.rigidBody.linearVelocity.y),
                0.1,
            )
        }
        // Clamp horizontal speed
        this.rigidBody.linearVelocity = new Vec2(
            clamp(
                this.rigidBody.linearVelocity.x,
                -Player.WALK_SPEED,
                Player.WALK_SPEED,
            ),
            this.rigidBody.linearVelocity.y,
        )
        if (this.movement.up) {
            this.jump()
        }
    }

    private onBeginContact(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const normal = getCorrectNormal(self, other, contact)

        switch (other.tag) {
            case ColliderType.ONEWAY:
                if (!fuzzyEqual(normal.y, NormalDirection.ON_TOP))
                    contact.disabled = true // Disable collision if not on top
            case ColliderType.GROUND: // Fall through
                if (fuzzyEqual(normal.y, NormalDirection.ON_TOP)) {
                    this.standingOn.add(other.uuid)
                }
                break
            case ColliderType.SPIKE:
                // this.gameManager.hurt()
                break
            case ColliderType.SENSOR:
                other.getComponent(Entity).onCollide(self.node)
                this.recentCollidedWith = other.getComponent(Entity)
                contact.disabled = true
                break
            case ColliderType.OBJECT:
                this.recentCollidedWith = other.getComponent(Entity)
                break
        }
    }

    private onEndContact(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        /**
         * The normal vector here seems to not contain any useful information. \
         * Could be caused by that no actual collision point is happening at the moment. \
         * Therefore, no normal could be calculated, and it falls back to (1, 0).
         * // const normal = getCorrectNormal(self, other, contact)
         */
        switch (other.tag) {
            case ColliderType.GROUND:
            case ColliderType.ONEWAY:
                this.standingOn.delete(other.uuid)
                break
        }
    }

    private onBeginContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        if (other.tag === ColliderType.OBJECT) {
            other.node.getComponent(Box).onCollisionEnter()
        }
    }

    private onEndContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        if (other.tag === ColliderType.OBJECT) {
            other.node.getComponent(Box).onCollisionExit()
        }
    }

    //#endregion

    //#region Animation

    private updateAnimation(dt: number): void {
        if (this.movement.left) {
            this.sprite.node.setScale(-1, 1)
            // this.changeAnimation("Walk")
        } else if (this.movement.right) {
            this.sprite.node.setScale(1, 1)
            // this.changeAnimation("Walk")
        } else if (this.movement.static) {
            // this.changeAnimation("Idle")
        }
    }

    /**
     * Play animation with given name.
     * If the animation is already playing, do nothing
     *
     * @param name Name of animation to play
     */
    private changeAnimation(name: string) {
        if (!this.currentAnimation || this.currentAnimation !== name) {
            this.animation.play(name)
            this.currentAnimation = name
        }
    }

    //#endregion

    //#region Actions

    private jump(): void {
        if (this.onGround) {
            this.rigidBody.linearVelocity = new Vec2(
                this.rigidBody.linearVelocity.x,
                Player.JUMP_SPEED,
            )
        }
    }

    //#endregion

    //#region Input

    private onKeyDown(event: EventKeyboard): void {
        switch (event.keyCode) {
            case Player.KEYBINDS.up:
                this.movement.up = true
                break
            case Player.KEYBINDS.down:
                this.movement.down = true
                break
            case Player.KEYBINDS.left:
                this.movement.left = true
                break
            case Player.KEYBINDS.right:
                this.movement.right = true
                break
            case Player.KEYBINDS.interact:
                if (this.recentCollidedWith) {
                    this.interactingWith = this.recentCollidedWith
                    this.interactingWith.onBeginInteract(this)
                }
                break
        }
    }

    onKeyUp(event: EventKeyboard): void {
        switch (event.keyCode) {
            case Player.KEYBINDS.up:
                this.movement.up = false
                break
            case Player.KEYBINDS.down:
                this.movement.down = false
                break
            case Player.KEYBINDS.left:
                this.movement.left = false
                break
            case Player.KEYBINDS.right:
                this.movement.right = false
                break
            case Player.KEYBINDS.interact:
                if (this.interactingWith) {
                    this.interactingWith.onEndInteract(this)
                    this.interactingWith = null
                }
                break
        }
    }
}
