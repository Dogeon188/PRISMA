import {
    _decorator,
    AudioClip,
    BoxCollider2D,
    Collider2D,
    Color,
    Contact2DType,
    find,
    IPhysics2DContact,
    log,
    Node,
    RigidBody2D,
    Size,
    Sprite,
    tween,
    UITransform,
    Vec2,
    Vec3,
} from "cc"
import { Settings } from "../../Scene/Settings"
import { GameManager } from "../GameManager"
import {
    ColliderGroup,
    ColliderType,
    ColorMap,
} from "../Physics/ColliderManager"
import {
    fuzzyEqual,
    getCorrectNormal,
    NormalDirection,
} from "../Physics/PhysicsFixer"
import { Player } from "../Player"
import { Entity } from "./Entity"
import { Lamp } from "./Lamp"
import { PlayerHalo } from "./PlayerHalo"
import { AudioManager } from "../../AudioManager"
const { ccclass, property } = _decorator

@ccclass("Box")
export class Box extends Entity {
    @property({ type: ColliderGroup })
    public color: number = ColliderGroup.RED

    private bindedTo: Node | null = null
    private bindOffsetX: number = 0

    private static readonly DENSITY: number = 20
    private static readonly DENSITY_MOVING: number = 0
    private static readonly GRAVITY: number = 5

    private collidedHaloSet: Set<string> = new Set()

    @property(AudioClip)
    private boxHitGround: AudioClip = null
    private static readonly DROP_VELOCITY: number = -5

    protected onLoad(): void {
        this.initialize(
            this.color,
            new Vec2(this.node.position.x, this.node.position.y),
            this.node.getComponent(UITransform).contentSize,
        )

        for (const collider of this.node.getComponents(Collider2D)) {
            // log(`box collider tag: ${collider.tag}`)
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
            // if (collider.tag === ColliderType.BOX) {
            // }
        }
    }

    public initialize(color: number, position: Vec2, size: Size): void {
        // set position
        // need to shift the position by quarter (why?) of the size
        this.node.position.set(
            position.x + size.width / 4,
            position.y - size.height / 4,
        )

        // set size
        this.node.getComponent(UITransform).setContentSize(size)
        this.node.getComponent(BoxCollider2D).size = size

        // Set the color of the box
        this.color = color
        this.node.getComponent(Sprite).color = ColorMap[this.color]
        // Set the group of the collider
        const collider = this.node.getComponent(Collider2D)
        collider.group = ColliderGroup.ACTIVE
        collider.density = Box.DENSITY

        this.node.getComponent(RigidBody2D).gravityScale = Box.GRAVITY
    }

    protected update(deltaTime: number) {
        if (!this.bindedTo) return

        const velocityY = this.node.getComponent(RigidBody2D).linearVelocity.y
        if (!fuzzyEqual(velocityY, 0, 1)) {
            const player = this.bindedTo.getComponent(Player)
            if (player) this.onEndInteract(player)
        }
        this.node.position = new Vec3(
            this.bindedTo.position.x + this.bindOffsetX,
            this.node.position.y,
            this.node.position.z,
        )
    }

    public showPrompt(): void {
        GameManager.inst.interactPrompt.showPrompt(
            Settings.keybinds.interact,
            "Interact",
        )
    }

    private determineActive(): void {
        if (this.collidedHaloSet.size === 0) {
            this.scheduleOnce(() => {
                this.node.getComponent(Sprite).enabled = true
                this.node.getComponent(Collider2D).group = ColliderGroup.ACTIVE
            }, 0)
        } else {
            this.scheduleOnce(() => {
                this.node.getComponent(Sprite).enabled = false
                this.node.getComponent(Collider2D).group =
                    ColliderGroup.INACTIVE
            }, 0)
        }
    }

    public onEnterHalo(playerHalo: PlayerHalo): void {
        if (playerHalo.color === this.color) {
            this.collidedHaloSet.add(playerHalo.node.uuid)
        }
        this.determineActive()
    }

    public onLeaveHalo(playerHalo: PlayerHalo, force: boolean = false): void {
        if (this.color === playerHalo.color) {
            return
        }
        this.collidedHaloSet.delete(playerHalo.node.uuid)
        this.determineActive()
    }

    public onEnterLampHalo(lamp: Lamp): void {
        if (lamp.color === this.color) {
            this.collidedHaloSet.add(lamp.node.uuid)
        }
        this.determineActive()
    }

    public onLeaveLampHalo(lamp: Lamp, force: boolean = false): void {
        this.collidedHaloSet.delete(lamp.node.uuid)
        this.determineActive()
    }

    public canInteract(player: Player, normal: Vec2): boolean {
        return fuzzyEqual(normal.y, 0)
    }

    public onBeginInteract(player: Player): void {
        player.startMovingBox(this)
        GameManager.inst.interactPrompt.hidePrompt()
        this.bindedTo = player.node
        this.bindOffsetX = this.node.position.x - player.node.position.x
        const collider = this.node.getComponent(Collider2D)
        collider.density = Box.DENSITY_MOVING
        collider.apply()
    }

    public onEndInteract(player: Player): void {
        player.endMovingBox(this)
        this.bindedTo = null
        const collider = this.node.getComponent(Collider2D)
        collider.density = Box.DENSITY
        collider.friction = 1000
        collider.apply()
        this.scheduleOnce(() => {
            collider.friction = 0.5
            collider.apply()
        }, 0.2)
    }

    private onBeginContact(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const normal = getCorrectNormal(self, other, contact)
        const isOnTop = fuzzyEqual(normal.y, NormalDirection.ON_TOP)
        const isAbove = normal.y > 0
        const selfRigidBody = self.getComponent(RigidBody2D)
        if (!selfRigidBody) return
        const vel = selfRigidBody.linearVelocity
        const isDropping = vel.y < Box.DROP_VELOCITY

        // log(`velocity: x: ${vel.x}, y: ${vel.y}, other tag: ${other.tag}`)
        // log(isDropping)

        if (!isOnTop || !isDropping || !isAbove) return
        switch (other.tag) {
            case ColliderType.ONEWAY:
                // log("box drop on ONEWAY")
                AudioManager.inst.playOneShot(this.boxHitGround)
                break
            case ColliderType.GROUND:
                // log("box drop on GROUND")
                tween(find("Canvas/Camera"))
                    .to(0.02, { eulerAngles: new Vec3(0, 0, 1) })
                    .to(0.02, { eulerAngles: new Vec3(0, 0, -1) })
                    .union()
                    .repeat(5)
                    .call(() => {
                        find("Canvas/Camera").eulerAngles = new Vec3(0, 0, 0)
                    })
                    .start()
                AudioManager.inst.playOneShot(this.boxHitGround)
                break
            case ColliderType.BOX:
                // log("box drop on BOX")
                AudioManager.inst.playOneShot(this.boxHitGround)
                break
            case ColliderType.BRICK:
                // log("box drop on BRICK")
                AudioManager.inst.playOneShot(this.boxHitGround)
                break
            case ColliderType.SENSOR:
                // log("box drop on SENSOR")
                AudioManager.inst.playOneShot(this.boxHitGround)
                break
        }
    }
}
