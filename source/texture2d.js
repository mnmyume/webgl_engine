import {$assert} from "./common.js";

window.__textures = {};
export default class Texture2D {
    texture = null;
    name = null;
    params = null;
    path = null;
    image = null;
    width = null;
    height = null;
    type = "2DTexture";
    constructor(name, params={}) {
        this.name = name;
        this.params = params??{
            wrapS:'CLAMP_TO_EDGE',
            wrapT:'CLAMP_TO_EDGE',
            scaleDown:'NEAREST',
            scaleUp:'NEAREST',
            generateMipMap:false
        };

    }
    delete() {
        delete __textures[this.name];
        this.texture = null;
        this.name = null;
        this.type = null;
        this.image = null;
        this.params = null;
    }


    initialize({ gl }) {

        this.path = this.params.path??null;
        this.image = this.params.image??null;
        this.data = this.params.data??null;

        $assert(
            this.data instanceof Float32Array
            ||(this.params.image instanceof Image ||
                this.params.image instanceof HTMLCanvasElement));


        this.width = this.params.width??512;
        this.height = this.params.height??512;
       

        __textures[this.name] = {img:this.image, name:this.name};

        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        this.setFilter(gl);
        this.setData(gl, this.image||this.data);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    setFilter (gl) {
        $assert(this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        //WARPPing
        //doesnt work with non-power of 2
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        //work with non-power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[this.params.wrapS]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[this.params.wrapT]);

        if (this.params.generateMipMap)
            gl.generateMipmap(gl.TEXTURE_2D);

        //FILTERing
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[this.params.scaleDown]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[this.params.scaleUp]);


    };

    setData(gl,data){
        if(data instanceof Image || data instanceof HTMLCanvasElement)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
        else if(data instanceof Float32Array){
            $assert(this.width && this.height);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.FLOAT, data);

        }

    }

    setColorRamp(gl, colorRamp) {
        const width = colorRamp.length / 4;
        if (width % 1 !== 0) {
            throw 'colorRamp must have multiple of 4 entries';
        }
        // this.createTexture(gl, width, 1, colorRamp);

        this.width = width;
        this.height = 1;
    }

    createTexture(gl, width, height, pixels) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        if(width<1.0) width = 1;
        const data = new Float32Array(pixels);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, data);
        this.texture = texture
    };
}
