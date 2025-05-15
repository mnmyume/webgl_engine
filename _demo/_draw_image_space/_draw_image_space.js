import { getShaderSource, createProgram, loadImage } from '../_utility.js';
import { vsSource, fsSource } from './_shaderSource.js';

export default function main() {

    const canvas = document.getElementById('game-surface');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext('webgl2', { antialias: false });
    const isWebGL2 = !!gl;
    if(!isWebGL2) {
        console.log('WebGL 2 is not available.  See <a href="https://www.khronos.org/webgl/wiki Getting_a_WebGL_Implementation">How to get a WebGL 2 implementation</a>');
        return;
    }

    // -- Init program
    const program = createProgram(gl, getShaderSource(vsSource), getShaderSource(fsSource));
    const diffuseLocation = gl.getUniformLocation(program, 'diffuse');
    const imageSizeLocation = gl.getUniformLocation(program, 'u_imageSize');

    // -- Init vertexArray

    const vertexArray = gl.createVertexArray();
    gl.bindVertexArray(vertexArray);

    gl.bindVertexArray(null);


    // -- Load texture then render

    const imageUrl = "Di-3d.png";
    let texture;
    loadImage(imageUrl, function(image) {
        // -- Init Texture
        texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        render();
    });


    function render() {
        // -- Render
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.uniform1i(diffuseLocation, 0);
        gl.uniform2f(imageSizeLocation, canvas.width / 2, canvas.height / 2);

        gl.bindVertexArray(vertexArray);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // Delete WebGL resources
        gl.deleteTexture(texture);
        gl.deleteProgram(program);
        gl.deleteVertexArray(vertexArray);
    }
}


main();