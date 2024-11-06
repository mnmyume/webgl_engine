const vertexShaderSource = `

    attribute vec3 gridIndex;
    attribute vec2 uv;

    uniform float uCellSize;
    uniform mat4 uPMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uMMatrix;
    
    varying vec2 vTexCoord;

    float random(float seed) {
        return fract(sin(seed) * 43758.5453);
    }

    void main(void) {
        
        float cellSize = random(gridIndex.x * 10.0 + gridIndex.y * 100.0 + gridIndex.z);
        cellSize = mix(1.0, 10.0, cellSize);
        mat3 gridIndex2World = mat3(
            vec3(cellSize * 0.5, -cellSize * 0.25, 0.0),
            vec3(-cellSize * 0.5, -cellSize * 0.25, 0.0),
            vec3(0.0, 0.0, 1.0));
        
        vec3 origin = gridIndex2World * gridIndex;
        vec3 offset = vec3(cellSize * uv.x, -cellSize * uv.y, 0);
        vec3 position = origin + offset;

        gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(position, 1.0);
        vTexCoord = uv;
    }
`;

export default vertexShaderSource;
