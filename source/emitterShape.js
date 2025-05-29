import Shape from "./shape.js";

export default class EmitterShape extends Shape {
    constructor(name, params = {}) {
        super(name, params);
    }

    initialize({ gl }) {
        for(const {name, value} of this.schema)
            this.dataBuffer.push({buffer:gl.createBuffer(),name,value, data:null, type:'STATIC_DRAW'});

        this.vao = gl.createVertexArray();
    }


}