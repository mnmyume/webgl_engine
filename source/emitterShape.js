import Shape from './shape.js';
import {$assert} from "./common.js";


export default class EmitterShape extends Shape {
    constructor(name, params = {}) {
        super(name, params);
        this.vao = [];
    }

    initialize({ gl }) {
        for(const {name, value} of this.schema){
            this.dataBuffer.push({buffer:gl.createBuffer(),name,value, data:null, type:'STATIC_DRAW'});
            this.dataBuffer.push({buffer:gl.createBuffer(),name,value, data:null, type:'STATIC_DRAW'});
        }

        this.vao = [gl.createVertexArray(), gl.createVertexArray()];
    }

    update(gl, key, {material, data, type='STATIC_DRAW'}) {
        const finder = [];
        for(let i=0; i<this.vao.length; i++) {
            finder[i] = this.dataBuffer.find(ele=>ele.name === key);
            $assert(finder[i]);
            if(!finder[i]) return;

            finder[i].data = data;


            gl.bindVertexArray(this.vao[i]);

            gl.bindBuffer(gl.ARRAY_BUFFER, finder[i].buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl[type]);

            for(const [key,value] of Object.entries(material.dataLocation.attributes)){
                $assert(value>=0);
                gl.enableVertexAttribArray(value);
                const dataBuffer = this.dataBuffer.find(ele=>ele.value.find(({attribute})=>attribute === key));
                const {size,stride,offset} = dataBuffer.value.find(({attribute})=>attribute === key);
                gl.vertexAttribPointer(value,parseInt(size), gl.FLOAT, false, parseInt(stride), parseInt(offset));
            }
            gl.bindVertexArray(null);
        }
    }

    delete(gl) {

    }

    draw(gl, material) {

    }
}