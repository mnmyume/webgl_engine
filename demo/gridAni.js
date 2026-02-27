import Time from "../source/time.js";
import Shader from "../source/shader.js";
import Transform from "../source/transform.js";
import Material from "../source/material.js";
import Shape from "../source/shape.js";
import Texture2D from "../source/texture2d.js";
import FrameSolver from "../source/frameSolver.js";
import { readAttrSchema } from "../source/shapeHelper.js";
import { sqrtFloor } from "../source/mathHelper.js";
import { genQuadUVXY, genInitData, genRectHaltonPos, genWavefrontInitData, genWavefrontInitDataJSON, genWavefrontDataClick, getMouseGridPosition } from "../source/generatorHelper.js";
import gridConfig from './gridHelper/grid_config_test.json';

import quadVert from "../shaders/glsl/quad-vert.glsl";
import quadFrag from "../shaders/glsl/quad-frag.glsl";
import screenQuadVert from "../shaders/glsl/screenQuad-vert.glsl";
import wavefrontFrag from "../shaders/glsl/wavefront-frag.glsl";
import gradientFrag from "../shaders/glsl/gradient-frag.glsl";
import slowFrag from "../shaders/glsl/newSlow-frag.glsl";
import particleVert from "../shaders/glsl/particle-vert.glsl";
import particleFrag from "../shaders/glsl/particle-frag.glsl";
import obstacleFrag from "../shaders/glsl/obstacle-frag.glsl";
import char2DVert from "../shaders/glsl/newParticle-vert.glsl";
import char2DFrag from "../shaders/glsl/newParticle-frag.glsl";

import * as math from "gl-matrix";

import AniRender from "../source/aniRender.js";
import Grid from "../source/grid.js";

import { getMouseScreenPos, world2Boundary } from "../source/generatorHelper.js";
import { $invProjView } from "../source/common/commonHelper.js";



export function initGridAni(gl, canvas, camera) {

    const gridParams = {
        gridCol: 10,
        gridRow: 10,
        gridUnitSize: 1,
    }
    const gridNum = [gridParams.gridCol, gridParams.gridRow];

    const aniTexParams = {
        texSize: [1152, 384],
        texBoundarySize: [1, 2],
        texCellSize: 48,
        scale: 1
    }

    const particleParams = {
        count: 1,
        duration: 20,
        lifeTime: 20,
    }

    const boidsParams = {
        flowWeight: 3.0,
        stopDist: 0.1,
        separationRad: 2.0,
        separationWeight: 6.0,
        neighborRad: 1.0,
        dampScalar: 0.97,
        maxSpeed: 10.0,
        cohesionWeight: 0.0,
        alignmentWeight: 0.0
    }

    const time = new Time();
    const emitterSize = 10;
    const emitterTexSize = sqrtFloor(particleParams.count);
    const emitterCorner = [-emitterSize / 2, -emitterSize / 2];

    // --- init wavefront solver ---
    const wavefrontShader = new Shader('wavefrontShader', {
        vertexSource: screenQuadVert,
        fragmentSource: wavefrontFrag,
    });
    wavefrontShader.initialize({ gl });

    const wavefrontMaterial = new Material('wavefrontMaterial', {
        shader: wavefrontShader,
    });
    wavefrontMaterial.initialize({ gl });
    wavefrontMaterial.setUniform('uGridSize', gridConfig.gridSize);

    const wavefrontShape = new Shape('wavefrontShape', {
        count: 6, schema: readAttrSchema(screenQuadVert.input)
    });
    wavefrontShape.initialize({ gl });

    const wavefrontSolver = new FrameSolver('wavefrontSolver', {
        shape: wavefrontShape, material: wavefrontMaterial,
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode: 1,
    });
    wavefrontSolver.initialize({ gl });

    const initGridTexture = new Texture2D('initGridTexture', {
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        scaleDown: 'NEAREST', scaleUp: 'NEAREST',
    })
    initGridTexture.initialize({ gl });
    initGridTexture.setData(gl, genWavefrontInitDataJSON(gridConfig));
    wavefrontMaterial.setTexture('uInitGridTexture', initGridTexture);

    wavefrontSolver.Mode = FrameSolver.MODE.init;

    // --- init gradient solver ---
    const gradientShader = new Shader('gradientShader', {
        vertexSource: screenQuadVert,
        fragmentSource: gradientFrag,
    });
    gradientShader.initialize({ gl });

    const gradientMaterial = new Material('gradientMaterial', {
        shader: gradientShader,
    });
    gradientMaterial.initialize({ gl });
    gradientMaterial.setUniform('uGridSize', gridConfig.gridSize);

    const gradientShape = new Shape('gradientShape', {
        count: 6, schema: readAttrSchema(screenQuadVert.input)
    });
    gradientShape.initialize({ gl });

    const gradientSolver = new FrameSolver('gradientSolver', {
        shape: gradientShape, material: gradientMaterial,
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode: 1,
    });
    gradientSolver.initialize({ gl });

    // -- init boids --
    const emitterTexture = new Texture2D('emitterTexture', {
        width: emitterTexSize, height: emitterTexSize,
        scaleDown: 'NEAREST',
        // data: texDataArr[genIndex],
        scaleUp: 'NEAREST'
    });
    emitterTexture.initialize({ gl });
    emitterTexture.setData(gl,
        genRectHaltonPos(emitterSize, emitterCorner, emitterTexSize, particleParams.minSize, particleParams.maxSize, particleParams.duration, gridConfig));

    // boids solver
    const boidsShader = new Shader('boidsShader', {
        vertexSource: screenQuadVert,
        fragmentSource: slowFrag,
    });
    boidsShader.initialize({ gl });

    const boidsMaterial = new Material('boidsMaterial', {
        shader: boidsShader,
    });
    boidsMaterial.initialize({ gl });
    boidsMaterial.setUniform('uEmitterTexSize', emitterTexSize);
    boidsMaterial.setUniform('uEmitterSize', emitterSize);
    boidsMaterial.setUniform('uGridSize', gridConfig.gridSize);
    boidsMaterial.setUniform('uGoal', [gridConfig.goal[0], gridConfig.goal[1]]);
    boidsMaterial.setUniform('uWake', 0.0);

    boidsMaterial.setUniform('uDuration', particleParams.duration);
    boidsMaterial.setUniform('uLifeTime', particleParams.lifeTime);

    boidsMaterial.setTexture('uEmitterTexture', emitterTexture);

    const boidsShape = new Shape('boidsShape', {
        count: 6, schema: readAttrSchema(screenQuadVert.input)
    });
    boidsShape.initialize({ gl });

    const boidsSolver = new FrameSolver('boidsSolver', {
        shape: boidsShape, material: boidsMaterial,
        width: emitterTexSize, height: emitterTexSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode: 1,
    });
    boidsSolver.initialize({ gl });

    // --- init renderer ---
    const grid = new Grid('grid', {});
    grid.initialize({
        gl: gl, mode: 2048,
        gridUnitSize: gridParams.gridUnitSize, col: gridParams.gridCol, row: gridParams.gridRow
    });

    const charShader = new Shader('charShader', {
        vertexSource: char2DVert,
        fragmentSource: char2DFrag
    });
    charShader.initialize({ gl });

    const colTexImg = new Image();
    colTexImg.src = '../resources/kitty4.png';
    colTexImg.onload = _ => {

        const aniTexture = new Texture2D('aniTexture', {
            image: colTexImg,
            scaleDown: 'LINEAR',
            scaleUp: 'LINEAR'
        });
        aniTexture.initialize({ gl });

        const charMaterial = new Material('charMaterial', {
            shader: charShader, blend: 0
        });

        const charShape = new Shape('charShape', {
            count: 1,
            schema: readAttrSchema(char2DVert.input)
        });

        const aniRender = new AniRender('aniRender', {
            texBoundarySize: aniTexParams.texBoundarySize, texCellSize: aniTexParams.texCellSize,
            scale: aniTexParams.scale, canvasMode: 2048,
        });
        aniRender.initialize({ gl }, {
            material: charMaterial, shape: charShape, aniTex: aniTexture
        });


        canvas.addEventListener('mousedown', (e) => {
            const clickPos = getMouseScreenPos(e, canvas);

            const invProjView = $invProjView(math.mat4.create(), camera);
            const [worldX, worldY, worldZ] = camera.screen2World(gl, clickPos, invProjView);
            const startPos = [worldX, worldY];
            const boundary = world2Boundary(startPos, startPos, gridNum, gridParams.gridUnitSize);
            const selection = [];
            selection.push(boundary);

            if (grid)
                grid.SelBoundary = selection;

            const newData = genWavefrontDataClick(gridConfig, clickPos);
            initGridTexture.setData(gl, newData);
            wavefrontMaterial.setTexture('uInitGridTexture', initGridTexture);
            wavefrontSolver.Mode = FrameSolver.MODE.init;

            boidsMaterial.setUniform('uGoal', [boundary[0], boundary[1]]);
            boidsMaterial.setUniform('uWake', 1.0);
        });

        function drawGridAni() {

            requestAnimationFrame(drawGridAni);

            // --- wavefront solver update ---
            wavefrontMaterial.setUniform('uState', wavefrontSolver.mode);
            wavefrontSolver.update(gl);

            if (wavefrontSolver.Mode === FrameSolver.MODE.init) {
                wavefrontSolver.Mode = FrameSolver.MODE.play;
            }

            time.update();

            // --- gradient solver update ---
            gradientMaterial.setTexture('uWavefrontTexture', wavefrontSolver.frontBuffer.textures[0]);
            gradientSolver.update(gl);

            // --- boids solver update ---
            boidsMaterial.setUniform('uTime', time.ElapsedTime);
            boidsMaterial.setUniform('uDeltaTime', time.Interval);
            boidsMaterial.setTexture('uGradientTexture', gradientSolver.frontBuffer.textures[0]);

            boidsMaterial.setUniform('uFlowWeight', boidsParams.flowWeight);
            boidsMaterial.setUniform('uStopDist', boidsParams.stopDist);
            boidsMaterial.setUniform('uSeparationRad', boidsParams.separationRad);
            boidsMaterial.setUniform('uSeparationWeight', boidsParams.separationWeight);
            boidsMaterial.setUniform('uNeighborRad', boidsParams.neighborRad);
            boidsMaterial.setUniform('uDampScalar', boidsParams.dampScalar);
            boidsMaterial.setUniform('uMaxSpeed', boidsParams.maxSpeed);
            boidsMaterial.setUniform('uCohesionWeight', boidsParams.cohesionWeight);
            boidsMaterial.setUniform('uAlignmentWeight', boidsParams.alignmentWeight);

            boidsSolver.update(gl);
            boidsMaterial.setUniform('uWake', 0.0);

            if (boidsSolver.Mode === FrameSolver.MODE.init) {
                boidsSolver.Mode = FrameSolver.MODE.play;
            }

            // render
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.2, 0.2, 0.2, 1.0);
            gl.colorMask(true, true, true, true);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            grid.preDraw(gl, camera);
            grid.draw(gl);
            grid.postDraw(gl);

            charMaterial.setTexture('uBoidsTexture0', boidsSolver.frontBuffer.textures[0]);
            charMaterial.setTexture('uBoidsTexture1', boidsSolver.frontBuffer.textures[1]);
            charMaterial.setUniform('uTime', time.ElapsedTime);
            aniRender.preDraw(gl, camera);
            aniRender.draw(gl, camera);
            aniRender.postDraw(gl);
        }
        drawGridAni();
    }
}