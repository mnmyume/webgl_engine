import {$assert} from "./common.js";

window.__textures = {};
export default class Texture2D {
    texture = null;
    name = null;
    params = null;
    generateMipMap = null;
    path = null;
    image = null;
    textureSetting = null;
    type = "2DTexture";
    constructor(name, params={}) {
        this.name = name;
        this.params = params;
    }
    delete() {
        delete __textures[this.name];
        this.texture = null;
        this.name = null;
        this.generateMipMap = null;
        this.type = null;
        this.image = null;
        this.textureSetting = null;
    }


    initialize({ gl }) {
        this.generateMipMap = this.params.generateMipMap??false;
        this.path = this.params.path??null;
        $assert(this.params.image instanceof Image || this.params.image instanceof HTMLCanvasElement);
        this.image = this.params.image;

        this.width = this.params.width??512;
        this.height = this.params.height??512;
        this.textureSetting = this.params.textureSetting??{
            wrapS:'CLAMP_TO_EDGE',
            wrapT:'CLAMP_TO_EDGE',
            scaleDown:'NEAREST',
            scaleUp:'NEAREST'
        };

        __textures[this.name] = {img:this.image, name:this.name};

        this.texture = gl.createTexture();
        this.setTextureParams({ gl });
    }

    setTextureParams ({ gl }) {
        $assert(this.texture);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        //WARPPing
        //doesnt work with non-power of 2
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        //work with non-power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[this.textureSetting.wrapS]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[this.textureSetting.wrapT]);

        if (this.generateMipMap)
            gl.generateMipmap(gl.TEXTURE_2D);

        //FILTERing
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[this.textureSetting.scaleDown]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[this.textureSetting.scaleUp]);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

        gl.bindTexture(gl.TEXTURE_2D, null);
    };

    setColorRamp(gl, colorRamp) {
        const width = colorRamp.length / 4;
        if (width % 1 !== 0) {
            throw 'colorRamp must have multiple of 4 entries';
        }
        this.createTexture(gl, width, 1, colorRamp);
    }

    createTexture(gl, width, height, pixels) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const data = new Float32Array(pixels);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, data);
        this.texture = texture
    };

    createFloatTexture(gl, width, height, floatArr) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const data = new Float32Array(floatArr);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array( data.buffer));
        this.texture = texture
    };

    
    
}
