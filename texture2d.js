export default class Texture2D {
    constructor() {
        this.texture = null;
    }

    initialize(gl, src) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // Set the parameters for the texture
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Upload the image into the texture
        const level = 0;
        const internalFormat = gl.RGBA;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        // Initialize the texture with a 1x1 blue pixel while the image loads
        const bluePixel = new Uint8Array([0, 0, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, 1, 1, 0, format, type, bluePixel);

        // Load the image
        const imageElement = new Image();
        imageElement.src = src;
        imageElement.addEventListener('load', () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, format, type, imageElement);
            // if (isPowerOfTwo(imageElement.width) && isPowerOfTwo(imageElement.height)) {
            //    gl.generateMipmap(gl.TEXTURE_2D);
            // }
        });
    }

    delete(){
        
    }
}
