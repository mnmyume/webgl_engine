import Texture2D from "./texture2d.js";
import {$assert} from "./common.js";

export class FrameBuffer extends Texture2D{

    texture = null;
    params = null;
    constructor(name = 'frameBuffer', params) {
        super(name,params);
    }

    swap(frameBuffer){
        const buff = this.texture;
        this.texture = frameBuffer.texture;
        frameBuffer.texture = buff;

    }

}