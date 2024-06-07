import { _decorator, Component, Label, Node } from "cc"
import { Auth } from "../Auth"
const { ccclass, property } = _decorator

@ccclass("Timer")
export class Timer extends Component {
    public time: number = 0

    protected onLoad(): void {
        this.loadTimeOnUserData()
    }

    protected update(dt: number): void {
        this.time += dt
        const ceilTime = Math.floor(this.time)
        this.node.getComponent(Label).string = `${Math.floor(ceilTime / 60)
            .toString()
            .padStart(2, "0")} : ${Math.floor(ceilTime % 60)
            .toString()
            .padStart(2, "0")}`
    }

    private loadTimeOnUserData(): void {
        this.time = Auth.data.time
    }
}
