import {
    _decorator,
    AudioClip,
    BoxCollider2D,
    Collider2D,
    Contact2DType,
    director,
    find,
    IPhysics2DContact,
    Label,
    Node,
    RigidBody2D,
    Size,
    Sprite,
    tween,
    UITransform,
    Vec2,
    Vec3,
} from "cc"
import { AudioManager } from "../../AudioManager"
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
const { ccclass, property } = _decorator

@ccclass("Box")
export class Box extends Entity {
    @property({ type: ColliderGroup })
    public color: number = ColliderGroup.RED

    private bindedTo: Node | null = null
    private bindOffsetX: number = 0
    private bingOffsetLength: number = 0

    private static readonly DENSITY: number = 20
    private static readonly DENSITY_MOVING: number = 0
    private static readonly GRAVITY: number = 5

    private collidedHaloSet: Set<string> = new Set()

    @property(AudioClip)
    private boxHitGround: AudioClip = null
    private static readonly DROP_VELOCITY: number = -5

    public myParent: Node

    protected onLoad(): void {
        this.initialize(
            this.color,
            new Vec2(this.node.position.x, this.node.position.y),
            this.node.getComponent(UITransform).contentSize,
        )

        this.myParent = this.node.parent

        for (const collider of this.node.getComponents(Collider2D)) {
            // log(`box collider tag: ${collider.tag}`)
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
            // if (collider.tag === ColliderType.BOX) {
            // }
        }
        this.node.getChildByName("Particle2D").active = false
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
        if (this.bindedTo) {
            this.node.worldPosition = new Vec3(
                this.bindedTo.worldPosition.x + this.bindOffsetX,
                this.node.worldPosition.y,
                this.node.worldPosition.z,
            )

            const dist = this.node.worldPosition.clone().subtract(
                this.bindedTo.worldPosition,
            )
            if (dist.length() > this.bingOffsetLength + 0.1) {
                const player = this.bindedTo.getComponent(Player)
                if (player) this.onEndInteract(player)
            }
        }
        if (this.node.name === "RedBoxDebug") {
            const worldX = this.node.worldPosition.x.toFixed(2)
            const worldY = this.node.worldPosition.y.toFixed(2)
            const localX = (this.node.position.x * 2.5).toFixed(2)
            const localY = (this.node.position.y * 2.5).toFixed(2)
            const offsetX = this.bindOffsetX.toFixed(2)
            director
                .getScene()
                .getChildByPath("Canvas/Camera/HUD/DebugPos")
                .getComponent(
                    Label,
                ).string = `World: ${worldX}, ${worldY}\nLocal: ${localX}, ${localY}\nOffset: ${offsetX}`
        }
    }

    public showPrompt(): void {
        GameManager.inst.interactPrompt.showPrompt(
            Settings.keybinds.interact,
            "Push/Pull",
        )
    }

    private determineActive(player: Player): void {
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
                if (player.interactingWith) {
                    player.interactingWith.onEndInteract(player)
                    player.interactingWith = null
                }
            }, 0)
        }
    }

    public onEnterHalo(playerHalo: PlayerHalo): void {
        if (playerHalo.color === this.color) {
            this.collidedHaloSet.add(playerHalo.node.uuid)
        }
        this.determineActive(playerHalo.node.getComponent(Player))
    }

    public onLeaveHalo(playerHalo: PlayerHalo, force: boolean = false): void {
        // if (this.color === playerHalo.color) {
        //     return
        // }
        this.collidedHaloSet.delete(playerHalo.node.uuid)
        this.determineActive(playerHalo.node.getComponent(Player))
    }

    public onEnterLampHalo(lamp: Lamp): void {
        if (lamp.color === this.color) {
            this.collidedHaloSet.add(lamp.node.uuid)
        }
        this.determineActive(
            find("Canvas/Map/Entities/Player").getComponent(Player),
        )
    }

    public onLeaveLampHalo(lamp: Lamp, force: boolean = false): void {
        this.collidedHaloSet.delete(lamp.node.uuid)
        this.determineActive(
            find("Canvas/Map/Entities/Player").getComponent(Player),
        )
    }

    public canInteract(player: Player, normal: Vec2): boolean {
        return fuzzyEqual(normal.y, 0)
    }

    public onBeginInteract(player: Player): void {
        player.startMovingBox(this)
        GameManager.inst.interactPrompt.hidePrompt()
        this.bindedTo = player.node
        this.bindOffsetX =
            this.node.worldPosition.x - player.node.worldPosition.x
        this.bingOffsetLength = this.node.worldPosition.clone().subtract(
            player.node.worldPosition,
        ).length()

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
        this.scheduleOnce(() => collider.apply(), 0)
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

        if (!isOnTop || !isDropping || !isAbove) return
        switch (other.tag) {
            case ColliderType.ONEWAY:
                AudioManager.inst.playOneShot(this.boxHitGround)
                break
            case ColliderType.GROUND:
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
                this.node.getChildByName("Particle2D").active = true
                this.scheduleOnce(() => {
                    this.node.getChildByName("Particle2D").active = false
                }, 0.8)
                break
            case ColliderType.BOX:
                AudioManager.inst.playOneShot(this.boxHitGround)
                break
            case ColliderType.BRICK:
                AudioManager.inst.playOneShot(this.boxHitGround)
                break
            case ColliderType.SENSOR:
                AudioManager.inst.playOneShot(this.boxHitGround)
                break
        }
    }
}
