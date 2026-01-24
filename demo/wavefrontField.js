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
import mapVert from "../shaders/glsl/map-vert.glsl";
import mapFrag from "../shaders/glsl/map-frag.glsl";
import boidsFrag from "../shaders/glsl/boids-frag.glsl";
import particleVert from "../shaders/glsl/particle-vert.glsl";
import particleFrag from "../shaders/glsl/particle-frag.glsl";
import obstacleFrag from "../shaders/glsl/obstacle-frag.glsl";

import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';


export function initWavefrontField(gl, canvas) {
    const particleParams = {
        count: 1600,
        duration: 20,
        lifeTime: 20,
        minSize: 15,
        maxSize: 15,
        color:[0.85,0.85,0.85],
        alpha:0.8,
        emitterSize: 2,
    }

    const aniTexParams = {
        texWidth: 384,
        texHeight: 32,
        cellWidth: 32,
        cellHeight: 32,
        numFrames: 12,
        numTypes: 4,
        aniFps: 6,
        accDivisor: 80000,
        accFactor: 2
    }

    const boidsParams = {
        maxSpeed: 20,
        maxForce: 1,
        perceptionRadius: 5.0,
        checkCount: 8,
        separationWeight: 2.0,
        alignmentWeight: 1.5,
        cohesionWeight: 1.5,
        flowWeight: 1.0,
        avoidWeight: 10.0,
        dampScalar: 0.8
    }

    const aspect = canvas.width / canvas.height;
    const time = new Time();
    const emitterSize = 2;
    const emitterTexSize = sqrtFloor(particleParams.count);
    const emitterCorner = [-emitterSize/2, -emitterSize/2];

    // --- GUI SETUP ---
    const gui = new GUI({ title: 'Wavefront Settings' });

    // 1. Particle Folder
    const fParticles = gui.addFolder('Particles');
    fParticles.add(particleParams, 'count', 100, 5000, 100).name('Count'); // min, max, step
    fParticles.add(particleParams, 'duration', 1, 100).name('Duration');
    fParticles.add(particleParams, 'lifeTime', 1, 100).name('Life Time');
    fParticles.add(particleParams, 'minSize', 1, 100).name('Min Size');
    fParticles.add(particleParams, 'maxSize', 1, 100).name('Max Size');
    fParticles.add(particleParams, 'alpha', 0, 1).name('Alpha');

    // Colors handle [r,g,b] arrays automatically (make sure your renderer handles 0-1 range)
    fParticles.addColor(particleParams, 'color').name('Color');

    // 2. Animation Texture Folder
    const fAni = gui.addFolder('Animation Texture');
    fAni.add(aniTexParams, 'numFrames', 1, 64, 1).name('Num Frames');
    fAni.add(aniTexParams, 'aniFps', 1, 60, 1).name('FPS');
    fAni.add(aniTexParams, 'accFactor', 0, 10).name('Acc Factor');
    fAni.close(); // Start closed to save space

    // 3. Boids Folder
    const fBoids = gui.addFolder('Boids Physics');
    fBoids.add(boidsParams, 'maxSpeed', 0, 50).name('Max Speed');
    fBoids.add(boidsParams, 'maxForce', 0, 5).name('Max Force');
    fBoids.add(boidsParams, 'checkCount', 0, 100).name('Check Count');
    fBoids.add(boidsParams, 'perceptionRadius', 0, 20).name('Radius');
    fBoids.add(boidsParams, 'separationWeight', 0, 10).name('Separation');
    fBoids.add(boidsParams, 'alignmentWeight', 0, 10).name('Alignment');
    fBoids.add(boidsParams, 'cohesionWeight', 0, 10).name('Cohesion');
    fBoids.add(boidsParams, 'flowWeight', 0, 10).name('Flow');
    fBoids.add(boidsParams, 'avoidWeight', 0, 20).name('Avoid');
    fBoids.add(boidsParams, 'dampScalar', 0.8, 1.0).name('Damping');

    // --- init wavefront solver ---
    const wavefrontShader = new Shader({
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
    const gradientShader = new Shader({
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

    // -- init boids --
    // store the pos and vel in framebuffer for avg pos and vel in boids
    const emitterTexture = new Texture2D('emitterTexture', {
        width: emitterTexSize, height: emitterTexSize,
        scaleDown: 'NEAREST',
        // data: texDataArr[genIndex],
        scaleUp: 'NEAREST'
    });
    emitterTexture.initialize({gl});
    emitterTexture.setData(gl,
        genRectHaltonPos(emitterSize, emitterCorner, emitterTexSize, particleParams.minSize, particleParams.maxSize, particleParams.duration, gridConfig));

    const mapShader = new Shader({
        vertexSource: mapVert,
        fragmentSource: mapFrag,
    });
    mapShader.initialize({gl});

    const mapMaterial = new Material('mapMaterial', {
       shader: mapShader,
    });
    mapMaterial.initialize({gl});
    // mapMaterial.setTexture('uEmitterTexture', emitterTexture);
    mapMaterial.setUniform('uEmitterTexSize', emitterTexSize);

    const mapShape = new Shape('mapShape', {
        state: 3,
        count:particleParams.count, schema: readAttrSchema(mapVert.input)
    });
    mapShape.initialize({gl});

    const mapSolver = new FrameSolver('mapSolver', {
        shape: mapShape, material: mapMaterial,
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode:1, blendState:FrameSolver.BLENDSTATE.add
    });
    mapSolver.initialize({gl});

    // boids solver
    const boidsShader = new Shader({
        vertexSource: screenQuadVert,
        fragmentSource: boidsFrag,
    });
    boidsShader.initialize({gl});

    const boidsMaterial = new Material('boidsMaterial', {
        shader: boidsShader,
    });
    boidsMaterial.initialize({gl});
    boidsMaterial.setUniform('uGridSize', gridConfig.gridSize);
    boidsMaterial.setUniform('uEmitterTexSize', emitterTexSize);
    boidsMaterial.setUniform('uEmitterSize', emitterSize);

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
    const particleShader = new Shader({
        vertexSource: particleVert,
        fragmentSource: particleFrag
    });
    particleShader.initialize({gl});

    let particleMaterial;

    const colTexImg = new Image();
    colTexImg.src = '../resources/leaf/leaf-Sheet-5.png';
    colTexImg.onload = _ => {
        const colorTexture = new Texture2D('colorTexture', {
            image: colTexImg,
            scaleDown: 'LINEAR',
            scaleUp: 'LINEAR'
        });
        colorTexture.initialize({gl});

        particleMaterial = new Material('particleMaterial',{
            shader: particleShader, blend:1
        });
        particleMaterial.initialize({gl});
        particleMaterial.setUniform('uEmitterTexSize', emitterTexSize)
        particleMaterial.setUniform('uColor', particleParams.color);
        particleMaterial.setUniform('uAspect', aspect);
        particleMaterial.setTexture('uColorSampler', colorTexture);

        // aniTex
        particleMaterial.setUniform('_uAniTexBoundarySize', [aniTexParams.texWidth, aniTexParams.texHeight]);
        particleMaterial.setUniform('_uAniTexCellSize', [aniTexParams.cellWidth, aniTexParams.cellHeight]);
        particleMaterial.setUniform('_uAniTexNumFrames', aniTexParams.numFrames);
        particleMaterial.setUniform('_uAniTexFps', aniTexParams.aniFps)

        const particleShape = new Shape('particleShape',{
            state: 3, count: particleParams.count,
            schema: readAttrSchema(particleVert.input)
        });

        // --- init emitter quad renderer---
        const quadShader = new Shader({
            vertexSource: quadVert,
            fragmentSource: quadFrag,
        });
        quadShader.initialize({gl});

        const quadMaterial = new Material('quadMaterial', {
            shader: quadShader,
        });
        quadMaterial.initialize({gl});
        quadMaterial.setUniform('uAspect', aspect);

        const quadData = genQuadUVXY(emitterSize);
        const quadShape = new Shape(
            'quad',
            {verticeCount: 6, schema: readAttrSchema(quadVert.input)});
        quadShape.initialize({gl});
        quadShape.update(gl, 'quadBuffer', {material:quadMaterial, data:quadData});

        // --- init obstacle renderer ---
        const obstacleShader = new Shader({
            vertexSource: quadVert,
            fragmentSource: obstacleFrag,
        });
        obstacleShader.initialize({gl});

        const obstacleMaterial = new Material('obstacleMaterial', {
            shader: obstacleShader, blend:1
        });
        obstacleMaterial.initialize({gl});
        obstacleMaterial.setTexture('uInitGridTexture', initGridTexture);
        obstacleMaterial.setUniform('uAspect', aspect);

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
            boidsMaterial.setTexture('uMapTexture', mapSolver.frontBuffer.textures[0]);

            boidsMaterial.setUniform('uMaxSpeed', boidsParams.maxSpeed);
            boidsMaterial.setUniform('uMaxForce', boidsParams.maxForce);
            boidsMaterial.setUniform('uPercepRadius', boidsParams.perceptionRadius);
            boidsMaterial.setUniform('uCheckCount', boidsParams.checkCount);
            boidsMaterial.setUniform('uSepaWeight', boidsParams.separationWeight);
            boidsMaterial.setUniform('uAligWeight', boidsParams.alignmentWeight);
            boidsMaterial.setUniform('uCoheWeight', boidsParams.cohesionWeight);
            boidsMaterial.setUniform('uFlowWeight', boidsParams.flowWeight);
            boidsMaterial.setUniform('uAvoidWeight', boidsParams.avoidWeight);
            boidsMaterial.setUniform('uDampScalar', boidsParams.dampScalar);

            boidsSolver.update(gl);

            if (boidsSolver.Mode === FrameSolver.MODE.init) {
                boidsSolver.Mode = FrameSolver.MODE.play;
            }

            mapMaterial.setTexture('uBoidsTexture', boidsSolver.frontBuffer.textures[0]);
            mapSolver.update(gl);

            // gl
            gl.viewport(0, 0, canvas.width, canvas.height);

            gl.clearColor(0.2, 0.2, 0.2, 1.0);
            gl.colorMask(true, true, true, true);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.blendFunc(gl.ONE, gl.ZERO);

            // --- draw emitter quad ---
            quadMaterial.preDraw(gl);
            quadShape.draw(gl, quadMaterial);
            quadMaterial.postDraw(gl);

            // --- draw obstacle ---
            obstacleMaterial.preDraw(gl);
            quadShape.draw(gl, quadMaterial);
            obstacleMaterial.postDraw(gl);

            // --- draw particle ---
            particleMaterial.setTexture('uBoidsTexture', boidsSolver.frontBuffer.textures[0]);
            particleMaterial.preDraw(gl);
            particleShape.draw(gl, particleMaterial);
            particleMaterial.postDraw(gl);
        }
        drawWavefront();
        drawGradient();
    }
}
