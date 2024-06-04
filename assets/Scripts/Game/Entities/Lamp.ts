import {
    _decorator,
    CircleCollider2D,
    Collider2D,
    Color,
    Contact2DType,
    IPhysics2DContact,
    math,
    Node,
    Size,
    Sprite,
    SpriteFrame,
    tween,
    UITransform,
    Vec2,
} from "cc"
import { Settings } from "../../Scene/Settings"
import { GameManager } from "../GameManager"
import { ColliderGroup } from "../Physics/ColliderManager"
import { Player } from "../Player"
import { Entity } from "./Entity"
import { PlayerHalo } from "./PlayerHalo"
const { ccclass, property } = _decorator

@ccclass("Lamp")
export class Lamp extends Entity {
    public color: number = null

    private collidedSet: Set<Entity> = new Set()

    private haloNode: Node = null
    private gemNode: Node = null

    @property
    private haloRadius: number = 200

    @property(SpriteFrame)
    private redGem: SpriteFrame = null

    @property(SpriteFrame)
    private greenGem: SpriteFrame = null

    @property(SpriteFrame)
    private blueGem: SpriteFrame = null

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: Color.RED,
        [ColliderGroup.GREEN]: Color.GREEN,
        [ColliderGroup.BLUE]: Color.BLUE,
    }

    protected onLoad(): void {
        this.haloNode = this.node.getChildByName("Halo")
        this.gemNode = this.node.getChildByName("Gem")

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
    }

    public initialize(position: Vec2, radius: number): void {
        this.drawColor()
        this.haloRadius = radius
        this.haloNode.getComponent(CircleCollider2D).radius = radius
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

    private changeColor(player: Player): void {
        if (this.color === null) {
            this.color = player.node.getComponent(PlayerHalo).color
            // Set the gem color
            switch (this.color) {
                case ColliderGroup.RED:
                    this.gemNode.getComponent(Sprite).spriteFrame = this.redGem
                    break
                case ColliderGroup.GREEN:
                    this.gemNode.getComponent(Sprite).spriteFrame =
                        this.greenGem
                    break
                case ColliderGroup.BLUE:
                    this.gemNode.getComponent(Sprite).spriteFrame = this.blueGem
                    break
            }

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
            this.gemNode.getComponent(Sprite).spriteFrame = null
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
    }

    public canInteract(player: Player, normal: math.Vec2): boolean {
        return (
            this.color !== null ||
            player.node.getComponent(PlayerHalo).color !== null
        )
    }

    public onBeginInteract(player: Player): void {
        const target_color = this.color
        GameManager.inst.interactPrompt.hidePrompt()
        this.scheduleOnce(() => {
            if (this.canInteract(player, null)) this.showPrompt()
        }, 0)
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
        this.changeColor(player)
        player.node.getComponent(PlayerHalo).interactWithLamp(target_color)
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
