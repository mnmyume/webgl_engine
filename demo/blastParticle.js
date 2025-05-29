import Shader from "../source/shader.js";
import {particle2dVert, particleFrag} from "../shaders/output.js";
import Transform from "../source/transform.js";
import Texture2D from "../source/texture2d.js";
import {generateCirclePosVelRandom} from "../source/generatorHelper.js";
import _particleMaterial from "../source/_particleMaterial.js";
import _staticEmitter from "../source/_staticEmitter.js";

export function initBlastParticle(gl, camera) {

    const particleParams = {
        numGen: 1,
        rate: 1,
        duration: 20,
        lifeTime: 10,   // 2
        startSize: 70,  // 50
        endSize: 150,    // 90
        velocity: [0, 0, 0],   // [0, 60, 0]
        velocityRange: [0, 0, 0],    // [15, 15, 15]
    }
    const partiCount = particleParams.duration * particleParams.rate;

    // init particle shader
    const particleShader = new Shader({
        vertexSource: particle2dVert,
        fragmentSource: particleFrag,
    });
    particleShader.initialize({gl});

    // init particle transform
    const particleTransform = new Transform();
    particleTransform.setPosition(0, 0, 0);

    // init particle texture
    const rampTexture = new Texture2D('rampTexture', {
        width: 5, height: 1,
        data: new Float32Array([1, 1, 0, 1,
            1, 0, 0, 1,
            0, 0, 0, 1,
            0, 0, 0, 0.5,
            0, 0, 0, 0
        ])
    });
    rampTexture.initialize({gl});

    const colTexImg = new Image();
    colTexImg.src = '../resources/fire/7761.png';
    colTexImg.onload = _ => {
        const colorTexture = new Texture2D('colorTexture', {
            image: colTexImg,
            scaleDown: 'LINEAR',
            scaleUp: 'LINEAR'
        });
        colorTexture.initialize({gl});

        const posPixels = generateCirclePosVelRandom(
            partiCount, particleParams.startSize, particleParams.endSize);
        const initPosVelTexture = new Texture2D('initPosVelTexture', {
            width: partiCount * 2, height: particleParams.numGen,
            data: new Float32Array(posPixels)
        });
        initPosVelTexture.initialize({gl});

        const particleMaterial = new _particleMaterial({
            shader: particleShader,
            tileSize: 128,
            texWidth: 768,
            texHeight: 768,
            numFrames: 36,
            aniFps: 36,
            partiCount,
            ...particleParams,
        });
        particleMaterial.initialize({gl});
        particleMaterial.setTexture('uRampSampler', rampTexture);
        particleMaterial.setTexture('uColorSampler', colorTexture);
        particleMaterial.setTexture('uGeneratorSampler', initPosVelTexture);

        const particleShape = new _staticEmitter({
            data: {...particleParams, partiCount: partiCount}
        });
        particleShape.initialize({gl});

        function drawParticles() {
            time.update();
            gl.clearColor(0.3, 0.3, 0.3, 1.0);
            gl.colorMask(true, true, true, true);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.colorMask(true, true, true, false);

            particleMaterial.preDraw(gl, time, camera, particleTransform);

            particleShape.draw(gl, particleMaterial);

            particleMaterial.postDraw(gl);

            requestAnimationFrame(drawParticles);
        }

        drawParticles();
    }

}