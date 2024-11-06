const vertexShaderSource = `
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec3 velocity;

    uniform mat4 uPMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uMMatrix;
    uniform float time;
    
    varying vec2 vTexCoord;

    float random(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float randomRange(vec2 p) {
        float randValue = random(p);  
        return mix(-10.0, 10.0, randValue);  
    }

    void main(void) {
        
        vec2 pX = vec2(position.x, position.y);
        float randValueX = randomRange(pX);
        vec2 pY = vec2(position.y, position.x);
        float randValueY = randomRange(pY);
        
        vec3 acceleration = vec3(randValueX, randValueY, 0.0);

        vec3 offset = vec3(uv, 0.0);
        vec3 position = position + offset;
        vec3 velocity = velocity + acceleration * time;
        position = position + velocity * time + acceleration * time * time;

        gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(position, 1.0);

        vTexCoord = uv;
    }
`;

export default vertexShaderSource;