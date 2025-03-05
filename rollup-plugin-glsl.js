import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string'
import path from 'path';
import fs from "fs";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
function compressShader(source) {
    let needNewline = false;
    return source.replace(/\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/g, "").split(/\n+/).reduce((result, line) => {
        line = line.trim().replace(/\s{2,}|\t/, " ");
        if (line[0] === '#') {
            if (needNewline) {
                result.push("\n");
            }

            result.push(line, "\n");
            needNewline = false
        } else {
            result.push(line
                .replace(/\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|\-|!|;)\s*/g, "$1"))
            needNewline = true;
        }
        return result;
    }, []).join('').replace(/\n+/g, "\n");
}

function $match(regex, str) {
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

function generateCode(extension,attribute, uniform, code) {
    return `export default ${JSON.stringify({code,extension, attribute,uniform, file:Object.fromEntries(__FILE_MAP.entries())})}`;
}

function addingLineNum(curFileIndex,srcPath, srcText){
    srcPath = `./${path.relative(__dirname, srcPath)}`;
    __FILE_MAP.set(curFileIndex,srcPath);
    const lines = srcText.split('\n');
    for(const index in lines){
        lines[index] = `#line ${parseInt(index)+1} ${curFileIndex} \n  ${lines[index]} \n`;//${srcPath}\n
    }
    return lines.join('');
}

function filterSource(source){
    source = source.replace(/#include[\s]+(.+)/gm, '');
    source = source.replace(  /#value[\s]+(.+)/gm, '');
    source = source.replace( /#buffer[\s]+(.+)/gm, '');
    return source.replace(/#extension[\s]+(.+)/gm, '');
}

function addIncludeFiles(srcPath,source){
    const reg = /#include[\s]+"(.+)"/gm;
    const buffer =  $match(reg,source);

    const result = [];


    let fileIndex = 0;
    for(let i=0; i<buffer.length/2;i+=2){
        const location = path.join(srcPath, buffer[i+1]) ;

        const file = fs.readFileSync(location, 'utf8');
        ++fileIndex;
        result.push(addingLineNum(fileIndex,location,file));
    }

    return {
        includes: result.join(),
        curFileIndex:++fileIndex,
    }
}
function checkPreprocessor(key,source){
    const buffer =  $match( new RegExp(`#${key}[\\s]+(.+)`, 'gm'), source);
    const result = [];

    for(let i = 0; i<buffer.length/2;i++){
        const params = $match( new RegExp(`(\\S+)[\\s]*:[\\s]*(\\S+)`, 'gm'), buffer[2*i+1]);
        const pair = {};
        for(let j=0; j<params.length/3;j++){

            const key = params[3*j+1];
            pair[key] = params[3*j+2];
        }
        result.push(pair);
    }


    //(\S+)[\s]*:[\s]*(\S+)
    return result;

}
function checkAttrUniformParams(key, source){
    const buffer =  $match( new RegExp(`${key}[\\s]+(\\S+)[\\s]+(\\S+)[\\s]*;`, 'gm'), source);
    const result = {};
    for(let i = 0; i<buffer.length/3;i++)
        result[buffer[3*i+2]] = {type:buffer[3*i+1], value:null};

    return buffer.length?result:null;

}
const __FILE_MAP = new Map();

function initUniforms(uniformParams, values){
    for(const entry of values)
        for(const [key,value] of Object.entries(entry))
            uniformParams[key].value = value;
}

function initExtension(extensionParmas, extensions){
    for(const entry of extensions)
        for(const [key,value] of Object.entries(entry))
            extensionParmas[key] = value;
}

function initAttributes(attributeParmas, buffers){

    for(const [key,value] of Object.entries(attributeParmas)){
        const finder = buffers.find(ele=>ele[key]);

        if(!finder) continue;

        const name = finder[key];
        delete finder[key];
        attributeParmas[key].name = name;
        attributeParmas[key].value = {...finder};
    }

}

export default function glsl(options = {}) {
    const filter = createFilter(options.include, options.exclude);
    return {
        name: 'glsl',

        transform(sourceRaw, id) {
            console.log(id);
            if (!filter(id)) return;



            const {includes, curFileIndex} = addIncludeFiles(path.dirname(id),sourceRaw);


            const extensions = checkPreprocessor('extension',sourceRaw);
            const source = filterSource(sourceRaw);

            const extensionParmas = {};
            const attributeParmas = {...checkAttrUniformParams('attribute', includes), ...checkAttrUniformParams('attribute', source)};
            const uniformParams = {...checkAttrUniformParams('uniform', includes), ...checkAttrUniformParams('uniform', source)};

            const values = checkPreprocessor('value',sourceRaw);
            const buffers = checkPreprocessor('buffer',sourceRaw);
            checkPreprocessor('buffer',sourceRaw);
            initExtension(extensionParmas, extensions);
            initUniforms(uniformParams, values);
            debugger;
            assignValues(uniformParams, values);
            initAttributes(attributeParmas, buffers);

            const glslSrc = `${includes}\n${addingLineNum(curFileIndex,id,source)}`;
            const code = generateCode(extensionParmas,attributeParmas, uniformParams, glslSrc),
                magicString = new MagicString(code);
            return { code: magicString.toString() };
        }
    };
}

function parseVec(input,dim=2){
    const result = [];
    let inputLength = 0;
    if(typeof input === 'string'){
        const buffer = input.match(new RegExp(`vec${dim}\\((.+)\\)`))
        buffer[1].split(',').forEach((value,i)=>result[i] = parseFloat(value))
    }

    return result;
    // const padding = [];
    // padding.length = Math.max(dim - inputLength, 0);
    // padding.fill(0);
    // return [...result,...padding];
}

function assignValues(uniformParams, values){

    for(const obj of values){
        for(const [key, value] of Object.entries(obj)){
            const {type} = uniformParams[key];
            switch (type){
                case "sampler2D":
                    uniformParams[key].value = parseInt(value);
                    break;
                case "float":
                    uniformParams[key].value = parseFloat(value);
                    break;
                case "vec2":
                    uniformParams[key].value = parseVec(value,2);
                    break;

                case "vec3":
                    uniformParams[key].value = parseVec(value,3);
                    break;
                case "vec4":
                    uniformParams[key].value = parseVec(value,4);
                    break;



                // mat2(
                //     float, float,   // first column
                //     float, float);  // second column
                //

                // mat3(
                //     vec2, float,    // first column
                //     vec2, float,    // second column
                //     vec2, float);   // third column


                // mat4(
                //     vec4,           // first column
                //     vec4,           // second column
                //     vec4,           // third column
                //     vec4);          // fourth column
                //
                case "mat2":
                    break;
                case "mat3":
                    break;
                case "mat4":
                    break;


            }
        }

    }
}