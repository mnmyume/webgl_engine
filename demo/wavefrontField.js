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
import {genQuadUVXZ, genQuadUVXY, genInitData, genRectHaltonPos, genWavefrontInitData, genWavefrontInitDataJSON} from "../source/generatorHelper.js";
import gridConfig from './gridHelper/grid_config.json';

import quadVert from "../shaders/glsl/quad-vert.glsl";
import quadFrag from "../shaders/glsl/quad-frag.glsl";
import bkgVert from "../shaders/glsl/background-vert.glsl";
import bkgFrag from "../shaders/glsl/background-frag.glsl";
import wavefrontFrag from "../shaders/glsl/wavefront-frag.glsl";
import gradientFrag from "../shaders/glsl/gradient-frag.glsl";
import mapVert from "../shaders/glsl/map-vert.glsl";
import mapFrag from "../shaders/glsl/solver-frag.glsl";
import boidsFrag from "../shaders/glsl/solver-frag.glsl";
import particleVert from "../shaders/glsl/particle-vert.glsl";
import particleFrag from "../shaders/glsl/particle-frag.glsl";


export function initWavefrontField(gl, canvas, camera) {

    const time = new Time();
    const STRIDE = 13;
    const particleParams = {
        count: 1000,
        duration: 20,
        lifeTime: 20,
        minSize: 15,
        maxSize: 15,
        startLinVel:[0,0,0],
        color:[0.85,0.85,0.85],
        alpha:0.8,
        emitterSize: 32,
        emitterHeight: 40
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

    const emitterGridSize = sqrtFloor(particleParams.count);
    const emitterGridCorner = [-particleParams.emitterSize/2, -particleParams.emitterSize/2];
    const emitterTransform = new Transform();
    emitterTransform.setPosition(0, 0, 18);

    // --- init wavefront solver ---
    const wavefrontShader = new Shader({
        vertexSource: bkgVert,
        fragmentSource: wavefrontFrag,
    });
    wavefrontShader.initialize({gl});

    const wavefrontMaterial = new Material('wavefrontMaterial',{
        shader: wavefrontShader,
    });
    wavefrontMaterial.initialize({gl});
    wavefrontMaterial.setUniform('uGridSize', gridConfig.gridSize);
    wavefrontMaterial.setUniform('uEmitterSize', particleParams.emitterSize);

    const wavefrontShape = new Shape('wavefrontShape', {
        count:6, schema: readAttrSchema(bkgVert.input)
    });
    wavefrontShape.initialize({gl});

    const wavefrontSolver = new FrameSolver('wavefrontSolver', {
        shape: wavefrontShape, material: wavefrontMaterial,
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode:1,
    });
    wavefrontSolver.initialize({gl});

    const wavefrontTexture = new Texture2D('wavefrontTexture', {
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        scaleDown: 'LINEAR', scaleUp: 'LINEAR',
    })
    wavefrontTexture.initialize({gl});
    wavefrontTexture.setData(gl, genWavefrontInitDataJSON(gridConfig));
    wavefrontMaterial.setTexture('uWavefrontTexture', wavefrontTexture);

    wavefrontSolver.Mode = FrameSolver.MODE.init;

    // --- init gradient solver ---
    const gradientShader = new Shader({
        vertexSource: bkgVert,
        fragmentSource: gradientFrag,
    });
    gradientShader.initialize({gl});

    const gradientMaterial = new Material('gradientMaterial', {
        shader: gradientShader,
    });
    gradientMaterial.initialize({gl});
    gradientMaterial.setUniform('uGridSize', gridConfig.gridSize);

    const gradientShape = new Shape('gradientShape', {
        count:6, schema: readAttrSchema(bkgVert.input)
    });
    gradientShape.initialize({gl});

    const gradientSolver = new FrameSolver('gradientSolver', {
        shape: gradientShape, material: gradientMaterial,
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode:1,
    });
    gradientSolver.initialize({gl});

    // // -- init boids --
    // const boidsShader = new Shader({
    //     vertexSource: bkgVert,
    //     fragmentSource: boidsFrag,
    // })
    // boidsShader.initialize({gl});
    //
    // const boidsMaterial = new Material('boidsMaterial', {
    //     shader: boidsShader,
    // });
    // boidsMaterial.initialize({gl});
    //
    // boidsMaterial.setUniform('uEmitterTransform', emitterTransform.getMatrix());
    // boidsMaterial.setUniform('uEmitterInverseTransform', emitterTransform.getInverseMatrix());
    // boidsMaterial.setUniform('uDuration', particleParams.duration);
    // boidsMaterial.setUniform('uCount', particleParams.count);
    // boidsMaterial.setUniform('uLifeTime', particleParams.lifeTime);
    // boidsMaterial.setUniform('uEmitterSize', particleParams.emitterSize);
    // boidsMaterial.setUniform('uEmitterGridSize', emitterGridSize);
    // boidsMaterial.setUniform('uGradientGridSize', gridConfig.gridSize);
    //
    // const boidsShape = new Shape('boidsShape', {
    //     count:6, schema: readAttrSchema(bkgVert.input)
    // });
    // boidsShape.initialize({gl});
    //
    // const boidsSolver = new FrameSolver('boidsSolver', {
    //     shape: boidsShape, material: boidsMaterial,
    //     width: emitterGridSize, height: emitterGridSize,
    //     screenWidth: canvas.width, screenHeight: canvas.height,
    //     mode:1,
    // });
    // boidsSolver.initialize({gl});

    // --- init map solver ---
    const mapShader = new Shader({
        vertexSource: mapVert,
        fragmentSource: mapFrag,
    });
    mapShader.initialize({gl});

    const mapMaterial = new SolverMaterial('mapMaterial', {
        shader: mapShader,
    });
    mapMaterial.initialize({gl});

    mapMaterial.setUniform('uEmitterTransform', emitterTransform.getMatrix());
    mapMaterial.setUniform('uEmitterInverseTransform', emitterTransform.getInverseMatrix());
    mapMaterial.setUniform('uDuration', particleParams.duration);
    mapMaterial.setUniform('uCount', particleParams.count);
    mapMaterial.setUniform('uLifeTime', particleParams.lifeTime);
    mapMaterial.setUniform('uEmitterSize', particleParams.emitterSize);
    mapMaterial.setUniform('uEmitterGridSize', emitterGridSize);
    mapMaterial.setUniform('uGradientGridSize', gridConfig.gridSize);

    const initData = genInitData(particleParams.count, STRIDE);
    const mapShape = new SolverShape('mapShape', {
        count:particleParams.count, schema: readAttrSchema(mapVert.input)
    });
    mapShape.initialize({gl});

    const mapSolver = new Solver('mapSolver',{
        shape: mapShape, material: mapMaterial,
        count: particleParams.count, mode:1, loop:true, stride:STRIDE,
        data: initData
    });
    mapSolver.initialize({gl},'particleBuffer');

    const emitterTexture = new Texture2D('emitterTexture', {
        width: emitterGridSize, height: emitterGridSize,
        scaleDown: 'NEAREST',
        // data: texDataArr[genIndex],
        scaleUp: 'NEAREST'
    });
    emitterTexture.initialize({gl});
    emitterTexture.setData(gl,
        genRectHaltonPos(particleParams.emitterSize, emitterGridCorner, emitterGridSize, particleParams.minSize, particleParams.maxSize, particleParams.duration));
    mapMaterial.setTexture('uEmitterTexture', emitterTexture);

    // --- init renderer ---
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

        particleMaterial.setUniform('uColor', particleParams.color);
        particleMaterial.setTexture('uColorSampler', colorTexture);

        // aniTex
        particleMaterial.setUniform('_uAniTexBoundarySize', [aniTexParams.texWidth, aniTexParams.texHeight]);
        particleMaterial.setUniform('_uAniTexCellSize', [aniTexParams.cellWidth, aniTexParams.cellHeight]);
        particleMaterial.setUniform('_uAniTexNumFrames', aniTexParams.numFrames);
        particleMaterial.setUniform('_uAniTexFps', aniTexParams.aniFps)

        const particleShape = new Shape('particleShape',{
            state: 3, count: particleParams.count, vaos: mapShape.VAOS,
            schema: readAttrSchema(particleVert.input)
        });

        // --- init emitter quad ---
        const quadShader = new Shader({
            vertexSource: quadVert,
            fragmentSource: quadFrag,
        });
        quadShader.initialize({gl});

        const quadMaterial = new Material('quadMaterial', {
            shader: quadShader,
        });
        quadMaterial.initialize({gl});

        const quadData = genQuadUVXY(particleParams.emitterSize);
        const quadShape = new Shape(
            'quad',
            {verticeCount: 6, schema: readAttrSchema(quadVert.input)});
        quadShape.initialize({gl});
        quadShape.update(gl, 'quadBuffer', {material:quadMaterial, data:quadData});

        function drawWavefront() {
            requestAnimationFrame(drawWavefront);
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

            // --- map solver update ---
            mapMaterial.setUniform('uTime', time.ElapsedTime);
            mapMaterial.setUniform('uDeltaTime', time.Interval);
            mapMaterial.setUniform('uState', mapSolver.mode);
            mapMaterial.setTexture('uGradientTexture', gradientSolver.frontBuffer.textures[0]);
            mapSolver.update(gl);

            if (mapSolver.Mode === Solver.MODE.init) {
                mapSolver.Mode = Solver.MODE.play;
            }

            // gl
            gl.viewport(0, 0, canvas.width, canvas.height);

            gl.clearColor(0.2, 0.2, 0.2, 1.0);
            gl.colorMask(true, true, true, true);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // --- draw emitter quad ---
            quadMaterial.preDraw(gl, camera);
            quadShape.draw(gl, quadMaterial);
            quadMaterial.postDraw(gl);

            // --- draw particle ---
            particleMaterial.preDraw(gl, camera);
            particleShape.draw(gl, particleMaterial);
            particleMaterial.postDraw(gl);
        }

        // for(let i = 0; i < 50; i++) {
        //     drawWavefront()
        // }
        drawWavefront();
        drawGradient();
    }
}