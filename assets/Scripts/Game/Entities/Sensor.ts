import { _decorator, EventHandler, Node } from "cc"
import { Entity } from "./Entity"
const { ccclass, property } = _decorator

@ccclass("Sensor")
export class Sensor extends Entity {
    @property({ type: [EventHandler], tooltip: "Event handlers to call when this sensor collides with another node" })
    private onSensed: EventHandler[] = []

    onCollide(other: Node): void {
        this.onSensed.forEach((handler) => {
            handler.emit([this, other])
        })
    }
}
