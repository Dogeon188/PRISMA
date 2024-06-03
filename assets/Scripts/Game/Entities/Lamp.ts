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
        haloCollider.radius = 0
        this.node
            .getChildByName("Halo")
            .getComponent(UITransform)
            .setContentSize(new Size(0, 0))
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
            this.color = player.node.getComponent(PlayerHalo).color
            this.drawColor()
        } else {
            this.color = null
            this.drawColor()
        }
        // use twin to make radius grow from 0 to 200.9 with animation
        // tween(this.node.getChildByName("Halo").getComponent(CircleCollider2D))
        //     .to(5, { radius: this.color ? 200.9 : 0 })
        //     .start()
        const nextColor = player.node.getComponent(PlayerHalo).color
        tween(this.node.getChildByName("Halo").getComponent(UITransform))
            .to(5, {
                width: nextColor ? 401.8 : 0,
                height: this.color ? 401.8 : 0,
            })
            .call(() => {
                this.drawColor()
            })
            .start()
    }

    public onBeginInteract(player: Player): void {
        GameManager.inst.interactPrompt.hidePrompt()
        this.changeColor(player)
    }

    public onEndInteract(player: Player): void {}

    private onBeginContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const entity = other.node.getComponent(Entity)
        console.log(other.node)
        if (entity) {
            entity.onEnterLampHalo(this)
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
        }
    }
}
