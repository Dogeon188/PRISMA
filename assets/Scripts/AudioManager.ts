import { AudioClip, AudioSource, Node, director, resources, tween } from "cc"

/**
 * A simple audio manager that plays sound effects and background music. \
 * It is a singleton, and you should only use {@linkcode AudioManager.inst} to access it. \
 * Don't create it manually.
 */
export class AudioManager {
    private static _inst: AudioManager = null

    static get inst(): AudioManager {
        if (this._inst == null) {
            this._inst = new AudioManager()
        }
        return this._inst
    }

    private _audioSource: AudioSource = null
    private doNotReplay: boolean = false

    constructor() {
        if (AudioManager._inst != null) {
            throw new Error(
                "AudioManager is a singleton, don't create it twice.",
            )
        }
        const audioNode = new Node("__AudioManager__")
        director.getScene().addChild(audioNode)
        director.addPersistRootNode(audioNode)
        this._audioSource = audioNode.addComponent(AudioSource)
    }

    get audioSource(): AudioSource {
        return this._audioSource
    }

    //#region Load Resources

    /**
     * Load an audio clip from the resources folder.
     * @param path The path to the audio clip, always prefixed with "Audios/"
     */
    getAudioClip(path: string): Promise<AudioClip> {
        return new Promise<AudioClip>((resolve, reject) => {
            resources.load("Audios/" + path, AudioClip, (err, clip) => {
                if (err) {
                    console.error("Failed to load audio clip", err)
                    resolve(null)
                }
                resolve(clip)
            })
        })
    }

    //#endregion

    //#region Play Sounds

    /**
     * Play a sound effect once.
     */
    playOneShot(audioClip: AudioClip, volume: number = 1): void {
        this._audioSource.playOneShot(audioClip, volume)
    }

    /**
     * {@linkcode AudioManager.playBGM} will not have effect the next time it is called. \
     * This is useful when you want to play a BGM when the game starts, but you don't want to replay it when the scene is reloaded
     */
    doNotReplayNextTime(): void {
        this.doNotReplay = true
    }

    /**
     * Play a background music, loops infinitely. \
     * Replace the current background music if there is one.
     */
    playBGM(audioClip: AudioClip, volume: number = 1): void {
        if (this.doNotReplay) {
            this.doNotReplay = false
            return
        }
        this._audioSource.stop()
        this._audioSource.clip = audioClip
        this._audioSource.loop = true
        this._audioSource.play()
        this._audioSource.volume = volume
    }

    /**
     * Stop the current background music.
     */
    stopBGM(): void {
        this._audioSource.stop()
    }

    /**
     * Pause the current background music. \
     * Call {@linkcode AudioManager.resumeBGM} to resume.
     */
    pauseBGM(): void {
        this._audioSource.pause()
    }

    /**
     * Resume the current background music.
     */
    resumeBGM(): void {
        this._audioSource.play()
    }

    /**
     * Fade out the current background music.
     * @param duration The time it takes for the music to fade out completely.
     */
    fadeOutBGM(duration: number): void {
        tween(this._audioSource)
            .to(duration, { volume: 0 })
            .call(() => {
                this._audioSource.stop()
            })
            .start()
    }

    /**
     * Fade in a new background music. \
     * Replace the current background music if there is one.
     * @param duration The time it takes for the music to fade in completely.
     */
    fadeInBGM(
        audioClip: AudioClip,
        duration: number,
        volume: number = 1,
    ): void {
        if (this.doNotReplay) {
            this.doNotReplay = false
            return
        }
        this.playBGM(audioClip, 0)
        tween(this._audioSource).to(duration, { volume: volume }).start()
    }

    /**
     * Fade out the current background music, then fade in a new background music. \
     * Replace the current background music if there is one.
     *
     * @param durationOut The time it takes for the music to fade out completely.
     * @param durationIn The time it takes for the music to fade in completely.
     */
    fadeToBGM(
        audioClip: AudioClip,
        durationOut: number,
        durationIn: number,
        volume: number = 1,
    ): void {
        if (this.doNotReplay) {
            this.doNotReplay = false
            return
        }
        tween(this._audioSource)
            .to(durationOut, { volume: 0 })
            .call(() => this.playBGM(audioClip, 0))
            .to(durationIn, { volume: volume })
            .start()
    }

    /**
     * Set the volume of the current background music.
     */
    setVolume(volume: number): void {
        this._audioSource.volume = volume
    }

    //#endregion
}
