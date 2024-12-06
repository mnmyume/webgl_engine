import {$assert} from "./common.js";

function preprocess({vertex='',fragment='',init={}}){
    const shaders = {};
    shaders['vertex'] = addingLineNum(vertex);
    shaders['fragment'] = addingLineNum(fragment);
    
    const attributes = {};
    let buffer =  $match(/attribute (\S+) (\S+);/g, vertex);
    for(let i = 0; i<buffer.length/3;i++)
        attributes[buffer[3*i+2]] = {type:buffer[3*i+1], value:null};

    const uniforms = {};
    buffer =   $match(/uniform (\S+) (\S+);/g, `${vertex}\n${fragment}`);
    for(let i = 0; i<buffer.length/3;i++)
        uniforms[buffer[3*i+2]] = {type:buffer[3*i+1], value:null};

    shaders['attributes'] = attributes;
    shaders['uniforms'] = uniforms;

    for (let [key, value] of Object.entries(init)) {
        uniforms[key].value = value;
    }

    return shaders;
};

function addingLineNum(srcText){

    const lines = srcText.split('\n');
    for(const index in lines){
        lines[index] = `#line ${index}\n  ${lines[index]} \n`;
    }
    return lines.join('');
}

export function $match(regex, str) {
    let m, result = [];
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            // console.log(`Found match, group ${groupIndex}: ${match}`);
            result.push(match);
        });
    }
    return result;
}

export default class Shader {
    constructor(params = {}) {
        this.name = params.name ?? 'defaultShader';
        this.vertSrc = params.vertexSource ?? null;
        this.fragSrc = params.fragmentSource ?? null;
        this.initValues = params.initValues ?? {};
        this.dataLocation = { attributes: {}, uniforms: {} };
        this.params = params;
    }

    initialize ({ gl }) {

        // const shaders = preprocess({
        //     vertex:this.vertSrc,
        //     fragment:this.fragSrc,
        //     init:this.initValues,
        // });

        const attributes = this.vertSrc.attributes;
        const uniforms = {...this.vertSrc.uniforms, ...this.fragSrc.uniforms};

        this.fragment = gl.createShader(gl.FRAGMENT_SHADER);
        this.vertex =gl.createShader(gl.VERTEX_SHADER);

        this.attributes = attributes;
        this.uniforms = uniforms;
        this.compile(gl, this.params);
    }               

    compile(gl,params){
        var params = params || {};
        var directives = [
            '#version 100',
            // '#extension GL_EXT_draw_buffers:require',
            // 'precision mediump float;'
        ];

        for(var i in (params.defines || [])){
            directives.push('#define ' + params.defines[i]);
        }
        directives = directives.join('\n') + '\n';

        const shaders = [
            {shader:this.fragment, source:this.fragSrc},
            {shader:this.vertex,source:this.vertSrc}
        ];
        // const src = [this.fragSrc,this.vertSrc];
        for(let {shader,source} of shaders){

            for(const key in params.values || {}){
                // var re = new RegExp('#define ' + name + ' \\w+', 'm');
                // source = source.replace(re, '#define ' + name + ' ' + params.values[name]);
            }
            gl.shaderSource(shader, directives + source);
            gl.compileShader(shader);

            $assert(gl.getShaderParameter(shader, gl.COMPILE_STATUS), `shader ${this.name} compile error, ${gl.getShaderInfoLog(shader)}`);
        }
    };
}
