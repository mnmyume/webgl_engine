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

function generateCode(extension,attributes, uniforms, code) {
    return `export default ${JSON.stringify({code,extension, attributes,uniforms, file:Object.fromEntries(__FILE_MAP.entries())})}`;
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
    source = source.replace(/#value[\s]+(.+)/gm, '');
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
    const buffer =  $match( new RegExp(`#${key}[\\s]+(\\S+)[\\s]*:[\\s]*(\\S+)`, 'gm'), source);
    const result = {};
    for(let i = 0; i<buffer.length/3;i++)
        result[buffer[3*i+1]] = buffer[3*i+2];

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

export default function glsl(options = {}) {
    const filter = createFilter(options.include, options.exclude);
    return {
        name: 'glsl',

        transform(sourceRaw, id) {
            console.log(id);
            if (!filter(id)) return;



            const {includes, curFileIndex} = addIncludeFiles(path.dirname(id),sourceRaw);


            const extensionParmas = checkPreprocessor('extension',sourceRaw);
            const source = filterSource(sourceRaw);

            const attributeParmas = {...checkAttrUniformParams('attribute', includes), ...checkAttrUniformParams('attribute', source)};
            const uniformParams = {...checkAttrUniformParams('uniform', includes), ...checkAttrUniformParams('uniform', source)};

            const values = checkPreprocessor('value',sourceRaw);

            assignValues(uniformParams, values);

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
        const buffer = $match(/(\d+),?/gm, input);
        inputLength = buffer.length/2;
        for(let i=0;i<inputLength;i++)
            result[i] = parseFloat(buffer[2*i+1]);
    }
    debugger;

    const padding = [];
    padding.length = Math.max(dim - inputLength, 0);
    padding.fill(0);
    return [...result,...padding];
}

function assignValues(uniformParams, values){

    for(const [key,value] of Object.entries(values)){
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
