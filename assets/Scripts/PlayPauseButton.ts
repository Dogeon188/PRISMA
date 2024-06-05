import {
    _decorator,
    Button,
    Component,
    director,
    Node,
    Sprite,
    SpriteFrame,
} from "cc"
const { ccclass, property } = _decorator

@ccclass("PlayPauseButton")
export class PlayPauseButton extends Component {
    public isPlay: boolean = true

    @property(SpriteFrame)
    private playSprite: SpriteFrame = null

    @property(SpriteFrame)
    private pauseSprite: SpriteFrame = null

    pauseGame(): void {
        director.pause()
    }

    resumeGame(): void {
        director.resume()
    }

    pausePlayButton(): void {
        if (this.isPlay) {
            this.pauseGame()
            this.isPlay = false
            this.getComponent(Sprite).spriteFrame = this.playSprite
        } else {
            this.resumeGame()
            this.isPlay = true
            this.getComponent(Sprite).spriteFrame = this.pauseSprite
        }
    }
}
