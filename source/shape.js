import { $assert } from './common.js';

const __DEBUG__ = true;

export default class Shape {
    static RENDERSTATE = {triangle:1,line:2,point:3};
    
    dataBuffer = [];
    constructor(name, params={}) {
        this.name = name;
        this.schema = params.schema??[];
        this.state = params.state?? Shape.RENDERSTATE.triangle;
        this.count = params.count??4;
    }

    initialize({ gl }) {
        for(const {name, value} of this.schema)
            this.dataBuffer.push({buffer:gl.createBuffer(),name,value, data:null, type:'STATIC_DRAW'});
    };

    update(gl, key, data, type='STATIC_DRAW') {


        const finder = this.dataBuffer.find(ele=>ele.name === key);
        $assert(finder);
        if(!finder) return;

        finder.data = data;

        gl.bindBuffer(gl.ARRAY_BUFFER, finder.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl[type]);

    }

    draw(gl, material) {

        for (const {name,data,type} of this.dataBuffer.filter(ele=>ele.type === 'DYNAMIC_DRAW')){
            $assert(data);
            this.update(gl, name, data,type);
        }


        for(const [key,value] of Object.entries(material.dataLocation.attributes)){
            gl.enableVertexAttribArray(value);
            const dataBuffer = this.dataBuffer.find(ele=>ele.value.find(({attribute})=>attribute === key));
            const {size,stride,offset} = dataBuffer.value.find(({attribute})=>attribute === key);
            gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer.buffer);
            gl.vertexAttribPointer(value,size, gl.FLOAT, false, stride, offset);
        }


        if (this.state == Shape.RENDERSTATE.triangle) {
            // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            // gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

            gl.drawArrays(gl.TRIANGLES, 0 , this.count);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

        } 
        if (this.state == Shape.RENDERSTATE.line) {
            // //gl.drawArrays(gl.LINES, 0, this.vertexBuffer.numItems);
            // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            // gl.drawElements(gl.LINES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
        if (this.state == Shape.RENDERSTATE.point) {
            // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            // gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

            gl.drawArrays(gl.POINTS, 0 , this.count);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

    };

}
