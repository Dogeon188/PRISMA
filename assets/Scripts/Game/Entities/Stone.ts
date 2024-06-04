import { _decorator, Component, Node } from "cc"
import { Brick } from "./Brick"
const { ccclass, property } = _decorator

@ccclass("Stone")
export class Stone extends Brick {
    public onCollide(other: Node): void {}
}
