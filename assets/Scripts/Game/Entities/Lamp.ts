import {
    _decorator,
    CircleCollider2D,
    Collider2D,
    Color,
    Component,
    Contact2DType,
    IPhysics2DContact,
    Node,
    Size,
    Sprite,
    tween,
    UITransform,
    Vec3,
} from "cc"
import { Entity } from "./Entity"
import { Player } from "../Player"
import { GameManager } from "../GameManager"
import { Settings } from "../../Scene/Settings"
import { ColliderGroup } from "../Physics/ColliderManager"
import { PlayerHalo } from "./PlayerHalo"
const { ccclass, property } = _decorator

@ccclass("Lamp")
export class Lamp extends Entity {
    public color: number = null

    private collidedSet: Set<Entity> = new Set()

    @property
    private haloRadius: number = 200

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: Color.RED,
        [ColliderGroup.GREEN]: Color.GREEN,
        [ColliderGroup.BLUE]: Color.BLUE,
    }

    protected onLoad(): void {
        this.drawColor()
        const haloCollider = this.node
            .getChildByName("Halo")
            .getComponent(CircleCollider2D)
        haloCollider.on(
            Contact2DType.BEGIN_CONTACT,
            this.onBeginContactHalo,
            this,
        )
        haloCollider.on(Contact2DType.END_CONTACT, this.onEndContactHalo, this)
        this.scheduleOnce(() => {
            this.node
                .getChildByName("Halo")
                .getComponent(UITransform).contentSize = new Size(0, 0)
        }, 0)
        haloCollider.radius = this.haloRadius
    }

    public onCollide(other: Node): void {}

    public showPrompt(): void {
        GameManager.inst.interactPrompt.showPrompt(
            Settings.keybinds.interact,
            "Interact",
        )
    }

    private drawColor(): void {
        if (this.color === null) {
            this.node.getChildByName("Halo").getComponent(Sprite).color =
                new Color(0, 0, 0, 0)
            return
        }
        const color = Lamp.COLOR_MAP[this.color]
        this.node.getChildByName("Halo").getComponent(Sprite).color = new Color(
            color.r,
            color.g,
            color.b,
            66,
        )
    }

    private changeColor(player: Player): void {
        if (this.color === null) {
            if (player.node.getComponent(PlayerHalo).color === null) {
                return
            }
            this.color = player.node.getComponent(PlayerHalo).color
            this.drawColor()
            tween(this.node.getChildByName("Halo").getComponent(UITransform))
                .to(0.5, {
                    width: this.haloRadius * 2,
                    height: this.haloRadius * 2,
                })
                .start()
        } else {
            this.color = null
            tween(this.node.getChildByName("Halo").getComponent(UITransform))
                .to(0.5, {
                    width: 0,
                    height: 0,
                })
                .call(() => {
                    this.drawColor()
                })
                .start()
        }
        // this.node.getChildByName("Halo").scale = new Vec3(-1, 1, 1)
        // this.node.getChildByName("Halo").scale = new Vec3(1, 1, 1)
        this.collidedSet.forEach((entity) => {
            entity.onLeaveLampHalo(this)
            entity.onEnterLampHalo(this)
        })
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
        this.changeColor(player)
        player.node.getComponent(PlayerHalo).interactWithLamp(target_color)
    }

    public onEndInteract(player: Player): void {}

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
