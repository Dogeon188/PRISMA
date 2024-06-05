import {
    Animation,
    Collider2D,
    Component,
    Contact2DType,
    EventKeyboard,
    Game,
    IPhysics2DContact,
    Input,
    Node,
    Quat,
    RigidBody2D,
    Sprite,
    Vec2,
    Vec3,
    _decorator,
    clamp,
    input,
    tween,
} from "cc"
import { Settings } from "../Scene/Settings"
import { Entity } from "./Entities/Entity"
import { PlayerHalo } from "./Entities/PlayerHalo"
import { GameManager } from "./GameManager"
import { ColliderGroup, ColliderType } from "./Physics/ColliderManager"
import {
    NormalDirection,
    fuzzyEqual,
    getCorrectNormal,
} from "./Physics/PhysicsFixer"
import { Movement } from "./Physics/PlayerMovement"
import { BlackMaskManager } from "../Interface/BlackMaskManager"

const { ccclass, property, requireComponent } = _decorator

@ccclass("Player")
@requireComponent(RigidBody2D)
export class Player extends Component {
    //#region Constants

    private static readonly WALK_ACC = 80
    private static readonly WALK_SPEED = 10
    private static readonly JUMP_SPEED = 20
    private static readonly GRAVITY = 5

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

    private spawnPoint: Vec3

    private dead: boolean = false

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

    /** collider set that contain inactive object which is collide with Halos */
    public collidedInactiveNodeSet: Set<Entity> = new Set()

    /** collider set  that contain active object which is collide with Halos*/
    public collidedActiveNodeSet: Set<Entity> = new Set()

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
                collider.group = ColliderGroup.ACTIVE
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
    }

    public initialize(gameManager: GameManager, spawnPoint: Vec3): void {
        this.gameManager = gameManager
        this.spawnPoint = spawnPoint
    }

    //#endregion

    //#region Physics

    private updateMovement(dt: number): void {
        if (this.dead) return

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
        const isOnTop = fuzzyEqual(normal.y, NormalDirection.ON_TOP)

        switch (other.tag) {
            case ColliderType.ONEWAY:
                if (!isOnTop) contact.disabled = true // Disable collision if not on top
            case ColliderType.GROUND: // Fall through
                if (isOnTop) this.standingOn.add(other.uuid)
                break
            case ColliderType.SPIKE:
                this.hurt()
                break
            case ColliderType.SENSOR:
                other.getComponent(Entity).onCollide(self.node)
                this.recentCollidedWith = other.getComponent(Entity)
                contact.disabled = true
                break
            case ColliderType.OBJECT:
                this.recentCollidedWith = other.getComponent(Entity)
            case ColliderType.BRICK: // Fall through
                if (isOnTop) this.standingOn.add(other.uuid)
                break
        }
        other.getComponent(Entity)?.showPrompt()
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
            case ColliderType.OBJECT:
                GameManager.inst.interactPrompt.hidePrompt()
            case ColliderType.BRICK:
                this.standingOn.delete(other.uuid)
            case ColliderType.SENSOR: // Fall through
                if (this.recentCollidedWith === other.getComponent(Entity)) {
                    this.recentCollidedWith = null
                }
                break
        }
        // FIXME problematic when player is touching multiple objects
        // could fix by using a set of collided objects
        if (other.getComponent(Entity))
            GameManager.inst.interactPrompt.hidePrompt()
    }

    private onBeginContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const entity = other.node.getComponent(Entity)
        if (entity) {
            const ret = entity.onEnterHalo(self.node.getComponent(PlayerHalo))
            if (ret) {
                this.collidedInactiveNodeSet.add(
                    other.node.getComponent(Entity),
                )
            } else {
                this.collidedActiveNodeSet.add(other.node.getComponent(Entity))
            }
        }
    }

    private onEndContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const entity = other.node.getComponent(Entity)
        if (entity) {
            const ret = entity.onLeaveHalo(self.node.getComponent(PlayerHalo))
            this.collidedInactiveNodeSet.delete(other.node.getComponent(Entity))
            this.collidedActiveNodeSet.delete(other.node.getComponent(Entity))
        }
    }

    //#endregion

    //#region Animation

    private updateAnimation(dt: number): void {
        if (this.dead) {
            // this.changeAnimation("Hurt")
            return
        }
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

    private static readonly HURT_QUATS = {
        [1]: Quat.fromEuler(new Quat(), 0, 0, -90),
        [-1]: Quat.fromEuler(new Quat(), 0, 0, 90),
    }
    private hurt(): void {
        // TODO play animation & sound
        this.dead = true
        tween(this.node)
            .to(0.5, {
                rotation:
                    Player.HURT_QUATS[this.sprite.node.scale.x > 0 ? 1 : -1],
            })
            .delay(2)
            .call(() => {
                console.log("Player died")
                BlackMaskManager.fadeIn(2, () => {
                    this.respawn()
                })
            })
            .start()
    }

    private respawn(): void {
        this.node.rotation = Quat.IDENTITY
        this.node.setPosition(this.spawnPoint)
        this.rigidBody.applyLinearImpulseToCenter(new Vec2(0, 0), true) // wake up rigid body, update collisions
        this.dead = false
    }

    //#endregion

    //#region Input

    private onKeyDown(event: EventKeyboard): void {
        switch (event.keyCode) {
            case Settings.keybinds.jump:
                this.movement.up = true
                break
            case Settings.keybinds.down:
                this.movement.down = true
                break
            case Settings.keybinds.left:
                this.movement.left = true
                break
            case Settings.keybinds.right:
                this.movement.right = true
                break
            case Settings.keybinds.interact:
                if (this.recentCollidedWith) {
                    this.interactingWith = this.recentCollidedWith
                    this.interactingWith.onBeginInteract(this)
                }
                break
        }
    }

    onKeyUp(event: EventKeyboard): void {
        switch (event.keyCode) {
            case Settings.keybinds.jump:
                this.movement.up = false
                break
            case Settings.keybinds.down:
                this.movement.down = false
                break
            case Settings.keybinds.left:
                this.movement.left = false
                break
            case Settings.keybinds.right:
                this.movement.right = false
                break
            case Settings.keybinds.interact:
                if (this.interactingWith) {
                    this.interactingWith.onEndInteract(this)
                    this.interactingWith = null
                }
                break
        }
    }
}
