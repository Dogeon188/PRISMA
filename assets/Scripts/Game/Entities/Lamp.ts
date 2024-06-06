import {
    _decorator,
    CircleCollider2D,
    Collider2D,
    Color,
    Contact2DType,
    IPhysics2DContact,
    math,
    Node,
    Quat,
    Size,
    Sprite,
    tween,
    UITransform,
    Vec2,
    AudioClip,
} from "cc"
import { Settings } from "../../Scene/Settings"
import { GameManager } from "../GameManager"
import { ColliderGroup, ColorMap } from "../Physics/ColliderManager"
import { Player } from "../Player"
import { Entity } from "./Entity"
import { PlayerHalo } from "./PlayerHalo"
import { AudioManager } from "../../AudioManager"
const { ccclass, property } = _decorator

@ccclass("Lamp")
export class Lamp extends Entity {
    public color: number = null

    private collidedSet: Set<Entity> = new Set()

    private haloNode: Node = null
    private gemNode: Node = null

    @property
    private haloRadius: number = 200

    @property(AudioClip)
    private gemSound: AudioClip = null

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: Color.RED,
        [ColliderGroup.GREEN]: Color.GREEN,
        [ColliderGroup.BLUE]: Color.BLUE,
    }

    protected onLoad(): void {
        this.initialize(
            new Vec2(this.node.position.x, this.node.position.y),
            this.haloRadius,
            null,
        )

        const haloCollider = this.haloNode.getComponent(CircleCollider2D)
        haloCollider.on(
            Contact2DType.BEGIN_CONTACT,
            this.onBeginContactHalo,
            this,
        )
        haloCollider.on(Contact2DType.END_CONTACT, this.onEndContactHalo, this)
        this.scheduleOnce(() => {
            this.haloNode.getComponent(UITransform).contentSize = new Size(0, 0)
        }, 0)
        this.drawColor()
    }

    public initialize(position: Vec2, radius: number, angle: number): void {
        this.haloNode = this.node.getChildByName("Halo")
        this.gemNode = this.node.getChildByName("Gem")
        this.gemNode.getComponent(Sprite).enabled = false
        this.node.setPosition(position.x, position.y)
        this.haloRadius = radius
        this.haloNode.getComponent(CircleCollider2D).radius = radius
        if (angle !== null)
            this.node.setRotation(Quat.fromAngleZ(new Quat(), angle))
    }

    public showPrompt(): void {
        GameManager.inst.interactPrompt.showPrompt(
            Settings.keybinds.interact,
            this.color === null ? "Light Up" : "Pick Up",
        )
    }

    private drawColor(): void {
        if (this.color === null) {
            this.haloNode.getComponent(Sprite).color = new Color(0, 0, 0, 0)
            return
        }
        const color = Lamp.COLOR_MAP[this.color]
        this.haloNode.getComponent(Sprite).color = new Color(
            color.r,
            color.g,
            color.b,
            66,
        )
    }

    private changeColor(player: Player): boolean {
        AudioManager.inst.playOneShot(this.gemSound)
        if (this.color === null) {
            if (player.node.getComponent(PlayerHalo).color === null) {
                GameManager.inst.interactPrompt.showPrompt(
                    Settings.keybinds.interact,
                    "Make sure you have light to give.",
                )
                this.scheduleOnce(() => {
                    this.showPrompt()
                }, 2)
                return false
            }
            this.color = player.node.getComponent(PlayerHalo).color
            // Set the gem color
            this.gemNode.getComponent(Sprite).enabled = true
            this.gemNode.getComponent(Sprite).color = ColorMap[this.color]

            this.drawColor()
            tween(this.haloNode.getComponent(UITransform))
                .to(
                    0.5,
                    { width: this.haloRadius * 2, height: this.haloRadius * 2 },
                    { easing: "sineOut" },
                )
                .start()
        } else {
            this.color = null
            this.gemNode.getComponent(Sprite).enabled = false
            tween(this.haloNode.getComponent(UITransform))
                .to(0.5, { width: 0, height: 0 }, { easing: "sineIn" })
                .call(() => {
                    this.drawColor()
                })
                .start()
        }
        this.collidedSet.forEach((entity) => {
            entity.onLeaveLampHalo(this)
            entity.onEnterLampHalo(this)
        })
        this.node.emit("changeColor", this.uuid, this.color)
        return true
    }

    public canInteract(player: Player, normal: math.Vec2): boolean {
        return true
        return (
            this.color !== null ||
            player.node.getComponent(PlayerHalo).color !== null
        )
    }

    public onCollide(other: Node): void {
        const player = other.getComponent(Player)
        this.scheduleOnce(() => {
            if (this.canInteract(player, null)) this.showPrompt()
        }, 0)
    }

    public onBeginInteract(player: Player): void {
        const target_color = this.color
        GameManager.inst.interactPrompt.hidePrompt()
        player.collidedHaloNodeSet.forEach((node) => {
            // check if node position is in the lamp's halo
            // dont change readonly vec3
            const distance = node.node.position
                .clone()
                .subtract(this.node.position)
                .length()
            if (distance > this.haloRadius) {
                return
            }
            this.collidedSet.add(node)
        })
        const ret = this.changeColor(player)
        player.node.getComponent(PlayerHalo).interactWithLamp(target_color)
        if (ret){
            this.showPrompt()
        } 
    }

    private onBeginContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const entity = other.node.getComponent(Entity)
        if (entity) {
            entity.onEnterLampHalo(this)
            this.collidedSet.add(entity)
        }
    }

    private onEndContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const entity = other.node.getComponent(Entity)
        if (entity) {
            entity.onLeaveLampHalo(this)
            this.collidedSet.delete(entity)
        }
    }
}
