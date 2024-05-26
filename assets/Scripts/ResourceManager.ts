import { AudioClip, JsonAsset, resources } from "cc"

/**
 * A simple resource manager that loads assets from the `resources` folder. \
 * Only dynamic assets should be loaded from here, static assets should be imported directly.
 */
export class ResourceManager {
    /**
     * Load a JSON asset from the resources folder.
     * @param path The path to the JSON asset without file association, always prefixed with "Data/"
     */
    static getJsonAsset(path: string): Promise<JsonAsset> {
        return new Promise<JsonAsset>((resolve, reject) => {
            resources.load("Data/" + path, JsonAsset, (err, asset) => {
                if (err) {
                    console.error("Failed to load JSON asset", err)
                    resolve(null)
                }
                resolve(asset)
            })
        })
    }

    /**
     * Load an audio clip from the resources folder.
     * @param path The path to the audio clip, always prefixed with "Audios/"
     */
    static getAudioClip(path: string): Promise<AudioClip> {
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
}
