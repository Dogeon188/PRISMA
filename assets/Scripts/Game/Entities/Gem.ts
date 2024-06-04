import { _decorator, Node, Sprite, SpriteFrame } from "cc"
import { EDITOR_NOT_IN_PREVIEW } from "cc/env"
import { ColliderGroup } from "../Physics/ColliderManager"
import { Entity } from "./Entity"
import { PlayerHalo } from "./PlayerHalo"
const { ccclass, property, executeInEditMode } = _decorator

@ccclass("Gem")
@executeInEditMode
export class Gem extends Entity {
    @property({ type: ColliderGroup })
    private color: number = ColliderGroup.GREEN

    public onCollide(other: Node): void {
        other.getComponent(PlayerHalo).addGem(this.color)
        this.scheduleOnce(() => {
            this.node.destroy()
        }, 0.1)
    }
}
