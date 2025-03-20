import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string'
import path from 'path';
import fs from "fs";
import {fileURLToPath} from 'url';
import {$assert} from "./source/common.js";

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
    const buffer =  $match( new RegExp(`^(?!\\/\\/).*?#${key}[\\s]+([^\\/\\r\\n]+)`, 'gm'), source);
    const result = [];

    for(let i = 0; i<buffer.length/2;i++){
        const params = $match( /(\S+)[\s]*:[\s]*(vec\d\([^\)]*\)|mat\d\([^\)]*\)|\[[^\]]*\]|[^,\s]+)/gm, buffer[2*i+1]);
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
    const buffer =  $match( new RegExp(`^(?!\\/\\/)${key}[\\s]+(\\S+)[\\s]+(\\S+)[\\s]*;`, 'gm'), source);
    const result = {};
    for(let i = 0; i<buffer.length/3;i++) {
        let varName = buffer[3*i+2];
        const isArr = /\[[^\]]*\]/.test(varName);
        if(isArr)
            varName = varName.match(/(.+)\[[^\]]*\]/)[1];
        const type = buffer[3 * i + 1];
        result[varName] = {type:isArr?`${type}[]`:type , value: null};

    }
    return buffer.length?result:null;

}
const __FILE_MAP = new Map();

function initUniforms(uniformParams, values){

    const clearGrp = [];
    for(const entry of values)
        for(const [key,value] of Object.entries(entry)) {
            const isArr = /\[[^\]]*\]/.test(key);
            if(isArr) {
                const [,varNm, index] = $match(/(.+)\[(\d+)\]/gm,key),
                        finder = clearGrp.find(({key})=>key===varNm);
                if(!finder)
                    clearGrp.push({key:varNm,children:[key]});
                else
                    finder.children.push(key);

                uniformParams[key] = {type:uniformParams[varNm].type,value};
            }else
                uniformParams[key].value = value;
        }


    for(let [key,{type,value}] of Object.entries(uniformParams)) {
        if(!value) continue;

        // if(/(.+)\[\]\[\]$/.test(type))//double arr
        //     uniformParams[key].value = JSON.parse(`[${value.join()}]`);

        const isVecMat = input=>/vec/.test(input) || /mat/.test(input),
                isArrStr = input=>/^\[[-.,\d\s]+\]$/.test(input)

       if(/(.+)\[\]$/.test(type)){//arr
           if(isVecMat(value))
               uniformParams[key].value = parseVecMat(value);
           else if(isArrStr(value))
                uniformParams[key].value = JSON.parse(value);
           else
               $assert(false);
        }else  if(type === 'sampler2D' || type === 'int'){
            uniformParams[key].value = parseInt(value);
        }else if(type === 'float')
            uniformParams[key].value = parseFloat(value);
        else if(isVecMat(type))
            uniformParams[key].value = parseVecMat(value);
    }


    for(const {key,children} of clearGrp){

        const maxIndex = children.reduce((acc,cur)=>{
            const index = parseInt($match(/\[(\d+)\]/gm, cur)[1]);
            return Math.max(acc, index);
        },0)

        uniformParams[key].value = uniformParams[key].value??[];

        for(let i=0;i<maxIndex;i++){
            const childEntry = uniformParams[`${key}[${i}]`];
            if(childEntry)
                uniformParams[key].value[i] = childEntry.value;
            else
                uniformParams[key].value[i] = null;
        }

        for(const child of children)
            delete uniformParams[child];
    }

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

            if(/solver-frag/.test(id)){
                debugger;

            }
            initUniforms(uniformParams, values);
            initAttributes(attributeParmas, buffers);

            const glslSrc = `${includes}\n${addingLineNum(curFileIndex,id,source)}`;
            const code = generateCode(extensionParmas,attributeParmas, uniformParams, glslSrc),
                magicString = new MagicString(code);
            return { code: magicString.toString() };
        }
    };
}

function parseVecMat(input){//
    const result = [];
    const buffer = $match(/\b(?:vec|mat)(\d+)\(([-\d,.\s]+)\)/gm, input); //mat(1.0)
    let [, dim, arrayStr] = buffer;
    if(!arrayStr) debugger;
    arrayStr.split(',').forEach((value,i)=>result[i] = parseFloat(value));


    if(result.length === 1){
        if(/mat/.test(input)){
            for(let row=0; row<dim; row++)
                for(let col=0; col<dim; col++) {
                    const i = col + row * dim;
                    if (row === col)
                        result[i] = result[0];
                    else
                        result[i] = 0;
                }

        } else if(/vec/.test(input)){
            for(let i=1; i<dim; i++)
                result[i] = result[0];
        }

    }
    return result;
}

function assignValues(uniformParams, values){

    for(const obj of values){
        for(let [key, value] of Object.entries(obj)){


            const isValueArr = /\[[^\]]*\]/.test(value);
            const isKeyArr = /\[[^\]]*\]/.test(key);
            if(isKeyArr){

            }else{

                const {type} = uniformParams[key];

                if(isValueArr){
                    try{
                        value =  JSON.parse(value);
                    }catch (e){
                        console.error(e, `cannot parse ${value}`);
                    }
                }


                if(type === 'sampler2D' || type === 'int'){
                    uniformParams[key].value = isValueArr?value:parseInt(value);
                }else if(type === 'float')
                    uniformParams[key].value = isValueArr?value:parseFloat(value);
                else if(/vec/.test(type) || /mat/.test(type))
                    uniformParams[key].value = isValueArr?value:parseVecMat(value);
            }

        }

    }
}