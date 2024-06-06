import { _decorator, Component, instantiate, Prefab, Size, Vec2, Node, log } from "cc"
import { ColorStringToGroupMap } from "../Physics/ColliderManager"
import { Stone } from "./Stone"
const { ccclass, property } = _decorator

@ccclass("StoneGenerator")
export class StoneGenerator extends Component {
    private generateInterval = 3
    private timePassed = 0
    private stoneSize: Size = new Size(0, 0)
    private pattern: number[] = []
    private patternIndex = 0
    private stonePool: Node[] = []

    @property({ type: Prefab })
    stone: Prefab = null

    protected start() {
        this.timePassed = 0
        for (let i = 0; i < 20; i++) {
            const stone = instantiate(this.stone)
            this.stonePool.push(stone)
        }
    }

    public initialize(
        position: Vec2,
        size: Size,
        interval: number,
        pattern: string,
    ): void {
        // set position
        this.node.position.set(position.x, position.y)

        // set size
        this.stoneSize = size.clone()

        // set interval
        this.generateInterval = interval

        // set pattern
        this.pattern = pattern.split(",").map((x) => ColorStringToGroupMap[x])
    }

    protected update(deltaTime: number) {
        this.timePassed += deltaTime

        if (this.timePassed >= this.generateInterval) {
            this.timePassed = 0
            this.createStone()
        }
    }

    private createStone() {
        // create a stone using the prefab called stone
        const stoneNode = this.stonePool.pop() 
            
        stoneNode.getComponent(Stone).initialize(
                this.pattern[this.patternIndex++ % this.pattern.length],
                new Vec2(0, 0),
                this.stoneSize,
            )
        stoneNode.parent = this.node
    }

    recycleStone(stone: Node) {
        this.stonePool.push(stone)
        this.node.removeChild(stone)
    }
}
