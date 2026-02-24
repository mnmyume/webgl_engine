import * as math from "gl-matrix";

import Shader from "../source/shader.js";
import Texture2D from "../source/texture2d.js";
import Material from "../source/material.js";
import Shape from "../source/shape.js";
import {readAttrSchema} from "../source/shapeHelper.js";
import AniRender from "../source/aniRender.js";
import Grid from "../source/grid.js";

import char2DVert from "../shaders/glsl/char2D-vert.glsl";
import char2DFrag from "../shaders/glsl/char2D-frag.glsl";
import {getMouseScreenPos, world2Boundary} from "../source/generatorHelper.js";
import {$invProjView} from "../source/common/commonHelper.js";


export function initGrid(gl, canvas, camera) {

    const gridParams = {
        gridCol: 10,
        gridRow: 10,
        gridUnitSize: 1,
    }
    const gridNum = [gridParams.gridCol, gridParams.gridRow];

    const aniTexParams = {
        texSize: [1408,1088],
        texBoundarySize: [1,1],
        texCellSize: 64,
        scale: 1
    }

    const grid = new Grid('grid',{});
    grid.initialize({
        gl:gl, mode:2048,
        gridUnitSize:gridParams.gridUnitSize, col:gridParams.gridCol, row:gridParams.gridRow});

    const charShader = new Shader('charShader', {
        vertexSource: char2DVert,
        fragmentSource: char2DFrag
    });
    charShader.initialize({gl});

    const colTexImg = new Image();
    colTexImg.src = '../resources/iso.png';
    colTexImg.onload = _ => {

        const aniTexture = new Texture2D('aniTexture', {
            image: colTexImg,
            scaleDown: 'LINEAR',
            scaleUp: 'LINEAR'
        });
        aniTexture.initialize({gl});

        const charMaterial = new Material('charMaterial', {
            shader: charShader, blend:0
        });

        const charShape = new Shape('charShape', {
            count: 1,
            schema: readAttrSchema(char2DVert.input)
        });

        const aniRender = new AniRender('aniRender', {
            texBoundarySize: aniTexParams.texBoundarySize, texCellSize: aniTexParams.texCellSize,
            scale:aniTexParams.scale, canvasMode: 256,
        });
        aniRender.initialize({gl}, {
            material:charMaterial, shape:charShape, aniTex:aniTexture});


        canvas.addEventListener('mousedown', (e) => {
            const clickPos = getMouseScreenPos(e, canvas);

            const invProjView = $invProjView( math.mat4.create(),camera);
            const [worldX, worldY, worldZ] = camera.screen2World(gl, clickPos, invProjView);
            const startPos = [worldX, worldY];
            const boundary = world2Boundary(startPos, startPos, gridNum, gridParams.gridUnitSize);
            const selection = [];
            selection.push(boundary);

            if(grid)
                grid.SelBoundary = selection;
        });

        function drawGrid() {

            requestAnimationFrame(drawGrid);

            canvas.addEventListener('mousedown', (e) => {

            });

            gl.clearColor(0.2, 0.2, 0.2, 1.0);
            gl.colorMask(true, true, true, true);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            grid.preDraw(gl, camera);
            grid.draw(gl);
            grid.postDraw(gl);

            aniRender.preDraw(gl, camera);
            aniRender.draw(gl,camera);
            aniRender.postDraw(gl);
        }
        drawGrid();
    }
}