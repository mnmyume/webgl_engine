import {$assert, $getShaderInfo} from "./common.js";




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
            const {attributes, uniforms, code, file} = source
            for(const key in params.values || {}){
                // var re = new RegExp('#define ' + name + ' \\w+', 'm');
                // source = source.replace(re, '#define ' + name + ' ' + params.values[name]);
            }
            debugger;
            gl.shaderSource(shader, code);
            gl.compileShader(shader);

            $assert(gl.getShaderParameter(shader, gl.COMPILE_STATUS), $getShaderInfo(this.name,gl,shader,file));
        }
    };
}
