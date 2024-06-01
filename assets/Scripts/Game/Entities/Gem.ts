import { _decorator, Component, Node } from "cc"
import { Entity } from "./Entity"
import { PlayerHalo } from "./PlayerHalo"
import { ColliderGroup } from "../Physics/ColliderManager"
const { ccclass, property } = _decorator

@ccclass("Gem")
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
