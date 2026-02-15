import Time from "../source/time.js";
import Shader from "../source/shader.js";
import Transform from "../source/transform.js";
import Material from "../source/material.js";
import Shape from "../source/shape.js";
import Texture2D from "../source/texture2d.js";
import FrameSolver from "../source/frameSolver.js";
import Solver from "../source/solver.js";
import SolverShape from "../source/solverShape.js";
import SolverMaterial from "../source/solverMaterial.js";
import {readAttrSchema} from "../source/shapeHelper.js";
import {sqrtFloor} from "../source/mathHelper.js";
import {genQuadUVXY, genInitData, genRectHaltonPos, genWavefrontInitData, genWavefrontInitDataJSON, genWavefrontDataClick, getMouseGridPosition} from "../source/generatorHelper.js";
import gridConfig from './gridHelper/grid_config.json';

import quadVert from "../shaders/glsl/quad-vert.glsl";
import quadFrag from "../shaders/glsl/quad-frag.glsl";
import screenQuadVert from "../shaders/glsl/screenQuad-vert.glsl";
import wavefrontFrag from "../shaders/glsl/wavefront-frag.glsl";
import gradientFrag from "../shaders/glsl/gradient-frag.glsl";
import slowFrag from "../shaders/glsl/newSlow-frag.glsl";
import particleVert from "../shaders/glsl/particle-vert.glsl";
import particleFrag from "../shaders/glsl/particle-frag.glsl";
import obstacleFrag from "../shaders/glsl/obstacle-frag.glsl";

import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';


export function initNewSlowEnemy(gl, canvas, camera) {
    const particleParams = {
        count: 16,
        duration: 20,
        lifeTime: 20,
        minSize: 15,
        maxSize: 15,
        color:[0.85,0.85,0.85],
        alpha:0.8,
    }

    const aniTexParams = {
        texWidth: 1920,
        texHeight: 1440,
        cellWidth: 160,
        cellHeight: 360,
        cellRatio: 360/160,
        numFrames: 12,
        numTypes: 4,
        aniFps: 6,
        accDivisor: 80000,
        accFactor: 2
    }

    const boidsParams = {
        flowWeight: 3.0,
        stopDist: 1.6,
        separationRad: 2.0,
        separationWeight: 6.0,
        neighborRad: 1.0,
        dampScalar: 0.97,
        maxSpeed: 10.0,
        cohesionWeight: 0.0,
        alignmentWeight: 0.0
    }

    const time = new Time();
    const emitterSize = 64;
    const emitterTexSize = sqrtFloor(particleParams.count);
    const emitterCorner = [-emitterSize/2, -emitterSize/2];

    // --- init wavefront solver ---
    const wavefrontShader = new Shader('wavefrontShader', {
        vertexSource: screenQuadVert,
        fragmentSource: wavefrontFrag,
    });
    wavefrontShader.initialize({gl});

    const wavefrontMaterial = new Material('wavefrontMaterial',{
        shader: wavefrontShader,
    });
    wavefrontMaterial.initialize({gl});
    wavefrontMaterial.setUniform('uGridSize', gridConfig.gridSize);

    const wavefrontShape = new Shape('wavefrontShape', {
        count:6, schema: readAttrSchema(screenQuadVert.input)
    });
    wavefrontShape.initialize({gl});

    const wavefrontSolver = new FrameSolver('wavefrontSolver', {
        shape: wavefrontShape, material: wavefrontMaterial,
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode:1,
    });
    wavefrontSolver.initialize({gl});

    const initGridTexture = new Texture2D('initGridTexture', {
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        scaleDown: 'NEAREST', scaleUp: 'NEAREST',
    })
    initGridTexture.initialize({gl});
    initGridTexture.setData(gl, genWavefrontInitDataJSON(gridConfig));
    wavefrontMaterial.setTexture('uInitGridTexture', initGridTexture);

    wavefrontSolver.Mode = FrameSolver.MODE.init;

    // --- init gradient solver ---
    const gradientShader = new Shader('gradientShader', {
        vertexSource: screenQuadVert,
        fragmentSource: gradientFrag,
    });
    gradientShader.initialize({gl});

    const gradientMaterial = new Material('gradientMaterial', {
        shader: gradientShader,
    });
    gradientMaterial.initialize({gl});
    gradientMaterial.setUniform('uGridSize', gridConfig.gridSize);

    const gradientShape = new Shape('gradientShape', {
        count:6, schema: readAttrSchema(screenQuadVert.input)
    });
    gradientShape.initialize({gl});

    const gradientSolver = new FrameSolver('gradientSolver', {
        shape: gradientShape, material: gradientMaterial,
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode:1,
    });
    gradientSolver.initialize({gl});

    // -- init slow enemy solver --
    const emitterTexture = new Texture2D('emitterTexture', {
        width: emitterTexSize, height: emitterTexSize,
        scaleDown: 'NEAREST',
        // data: texDataArr[genIndex],
        scaleUp: 'NEAREST'
    });
    emitterTexture.initialize({gl});
    emitterTexture.setData(gl,
        genRectHaltonPos(emitterSize, emitterCorner, emitterTexSize, particleParams.minSize, particleParams.maxSize, particleParams.duration, gridConfig));

    // boids solver
    const boidsShader = new Shader('boidsShader', {
        vertexSource: screenQuadVert,
        fragmentSource: slowFrag,
    });
    boidsShader.initialize({gl});

    const boidsMaterial = new Material('boidsMaterial', {
        shader: boidsShader,
    });
    boidsMaterial.initialize({gl});
    boidsMaterial.setUniform('uEmitterTexSize', emitterTexSize);
    boidsMaterial.setUniform('uEmitterSize', emitterSize);
    boidsMaterial.setUniform('uGridSize', gridConfig.gridSize);
    boidsMaterial.setUniform('uGoal', [gridConfig.goal[0], gridConfig.goal[1]]);
    boidsMaterial.setUniform('uWake', 0.0);

    boidsMaterial.setUniform('uDuration', particleParams.duration);
    boidsMaterial.setUniform('uLifeTime', particleParams.lifeTime);

    boidsMaterial.setTexture('uEmitterTexture', emitterTexture);

    const boidsShape = new Shape('boidsShape', {
        count:6, schema: readAttrSchema(screenQuadVert.input)
    });
    boidsShape.initialize({gl});

    const boidsSolver = new FrameSolver('boidsSolver', {
        shape: boidsShape, material: boidsMaterial,
        width: emitterTexSize, height: emitterTexSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode:1,
    });
    boidsSolver.initialize({gl});

    // --- init particle renderer ---
    const particleShader = new Shader('particleShader', {
        vertexSource: particleVert,
        fragmentSource: particleFrag
    });
    particleShader.initialize({gl});

    let particleMaterial;

    const colTexImg = new Image();
    colTexImg.src = '../resources/adv_chara.png';
    colTexImg.onload = _ => {
        const colorTexture = new Texture2D('colorTexture', {
            image: colTexImg,
            scaleDown: 'LINEAR',
            scaleUp: 'LINEAR'
        });
        colorTexture.initialize({gl});

        particleMaterial = new Material('particleMaterial',{
            shader: particleShader, blend:0
        });
        particleMaterial.initialize({gl});
        particleMaterial.setUniform('uEmitterTexSize', emitterTexSize)
        particleMaterial.setUniform('uColor', particleParams.color);
        particleMaterial.setTexture('uColorSampler', colorTexture);

        // aniTex
        particleMaterial.setUniform('_uAniTexBoundarySize', [aniTexParams.texWidth, aniTexParams.texHeight]);
        particleMaterial.setUniform('_uAniTexCellSize', [aniTexParams.cellWidth, aniTexParams.cellHeight]);
        particleMaterial.setUniform('_uAniTexNumFrames', aniTexParams.numFrames);
        particleMaterial.setUniform('_uAniTexFps', aniTexParams.aniFps);
        particleMaterial.setUniform('_uAniTexCellRatio', aniTexParams.cellRatio);

        const particleShape = new Shape('particleShape',{
            state: 3, count: particleParams.count,
            schema: readAttrSchema(particleVert.input)
        });

        // --- init emitter quad renderer---
        const quadShader = new Shader('quadShader', {
            vertexSource: quadVert,
            fragmentSource: quadFrag,
        });
        quadShader.initialize({gl});

        const quadMaterial = new Material('quadMaterial', {
            shader: quadShader,
        });
        quadMaterial.initialize({gl});

        const quadData = genQuadUVXY(emitterSize);
        const quadShape = new Shape(
            'quad',
            {verticeCount: 6, schema: readAttrSchema(quadVert.input)});
        quadShape.initialize({gl});
        quadShape.update(gl, 'quadBuffer', {material:quadMaterial, data:quadData});

        // --- init obstacle renderer ---
        const obstacleShader = new Shader('obstacleShader', {
            vertexSource: quadVert,
            fragmentSource: obstacleFrag,
        });
        obstacleShader.initialize({gl});

        const obstacleMaterial = new Material('obstacleMaterial', {
            shader: obstacleShader, blend:1
        });
        obstacleMaterial.initialize({gl});
        obstacleMaterial.setTexture('uInitGridTexture', initGridTexture);

        function drawWavefront() {
            requestAnimationFrame(drawWavefront);
            // update goal from mouse click
            canvas.addEventListener('mousedown', (e) => {
                const clickPos = getMouseGridPosition(e, canvas, gridConfig.gridSize);

                if (!clickPos) return;

                console.log("Click grid:", clickPos);

                const newData = genWavefrontDataClick(gridConfig, clickPos);

                initGridTexture.setData(gl, newData);
                wavefrontMaterial.setTexture('uInitGridTexture', initGridTexture);
                boidsMaterial.setUniform('uGoal', [clickPos.x, clickPos.y]);
                boidsMaterial.setUniform('uWake', 1.0);

                wavefrontSolver.Mode = FrameSolver.MODE.init;
            });

            // --- wavefront solver update ---
            wavefrontMaterial.setUniform('uState', wavefrontSolver.mode);
            wavefrontSolver.update(gl);

            if (wavefrontSolver.Mode === FrameSolver.MODE.init) {
                wavefrontSolver.Mode = FrameSolver.MODE.play;
            }
        }

        function drawGradient() {

            requestAnimationFrame(drawGradient);

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


            // gl
            gl.viewport(0, 0, canvas.width, canvas.height);

            gl.clearColor(0.2, 0.2, 0.2, 1.0);
            gl.colorMask(true, true, true, true);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.blendFunc(gl.ONE, gl.ZERO);

            // --- draw emitter quad ---
            quadMaterial.preDraw(gl, camera);
            quadShape.draw(gl, quadMaterial);
            quadMaterial.postDraw(gl);

            // --- draw obstacle ---
            obstacleMaterial.preDraw(gl, camera);
            quadShape.draw(gl, quadMaterial);
            obstacleMaterial.postDraw(gl);

            // --- draw particle ---
            particleMaterial.setTexture('uBoidsTexture0', boidsSolver.frontBuffer.textures[0]);
            particleMaterial.setTexture('uBoidsTexture1', boidsSolver.frontBuffer.textures[1]);
            particleMaterial.preDraw(gl, camera);
            particleShape.draw(gl, particleMaterial);
            particleMaterial.postDraw(gl);
        }
        drawWavefront();
        drawGradient();
    }
}
