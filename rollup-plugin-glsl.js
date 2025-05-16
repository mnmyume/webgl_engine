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

function generateCode(version,extension,attribute, uniform, code) {
    return `export default ${JSON.stringify({version,code,extension, attribute,uniform, file:Object.fromEntries(__FILE_MAP.entries())})}`;
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
        // result.push(addingLineNum(fileIndex,location,file));
        result.push(file);
    }

    return {
        includes: result.join(),
        curFileIndex:++fileIndex,
    }
}

const VERSIONS = {
    'GLSL_ES1':'GLSL ES 1.00',
    'GLSL_ES3':'GLSL ES 3.00',
}

const _VER = {
    '100':'GLSL ES 1.00',
    '300 es':'GLSL ES 3.00',
}


function checkVersion(source){
    let verValue = '100';
    const buffer = $match(/^(?!\/\/).*?#version[\s]+([^\/\r\n]+)/gm, source);
    if(buffer.length)
        verValue = buffer[1]

    return _VER[verValue];
}

function checkPreprocessor(key,source){
    const buffer =  $match( new RegExp(`^(?!\\/\\/).*?#${key}[\\s]+([^\\/\\r\\n]+)`, 'gm'), source);
    const result = [];

    for(let i = 0; i<buffer.length/2;i++){
        const params = $match( /(\S+)[\s]*:[\s]*(uvec\d\([^\)]*\)|ivec\d\([^\)]*\)|vec\d\([^\)]*\)|mat\d\([^\)]*\)|\[[^\]]*\]|[^,\s]+)/gm, buffer[2*i+1]);
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
function $isNumber(input) {
    return input != null && (Number(input) || Number(input) == 0) ? true : false;
}

const getDefineValue = (varName, source)=>$match( new RegExp(`^(?!\\/\\/).*?#define[\\s]+${varName}[\\s]+([^\\/\\r\\n]+)`, 'gm'), source);
function checkUniformParams( source){

    const buffer =  $match(/^(?!\/\/)[\s]*uniform[\s]+(\S+)[\s]+(\S+)[\s]*;/gm, source);

    const result = {};
    for(let i = 0; i<buffer.length/3;i++) {
        let varName = buffer[3*i+2];
        const isArr = /\[[^\]]*\]/.test(varName);

        const type = buffer[3*i+1];
        if(isArr){

            const [,varName, GEN_SIZE_NAME] =  $match(/(.+)\[([^\]]*)\]/gm, varName);
            const [,GEN_SIZE] = getDefineValue(GEN_SIZE_NAME, source);

            let length = 1;
            if(/mat/.test(type)){
                length = Number(type.match(/mat(\d+)/)[1]);
                length *= length;
            }else if(/vec/.test(type))
                length = Number(type.match(/vec(\d+)/)[1]);


            $assert($isNumber(length), `cannot find definition of ${length} from ${varName}`);

            result[varName] = {type:`${type}[]` , value: null,length};
        }else
            result[varName] = {type , value: null};

    }
    return buffer.length?result:null;

}

function checkAttrParams(key, source){

    const buffer =  $match( new RegExp(`^(?!\\/\\/)[\\s]*(layout[\\s]*\\([^\\)]+\\)[\\s])*${key}[\\s]+(\\S+)[\\s]+(\\S+)[\\s]*;`, 'gm'), source);

    const result = {};
    for(let i = 0; i<buffer.length/4;i++) {
        let varName = buffer[4*i+3];
        const isArr = /\[[^\]]*\]/.test(varName);
        const layout = {};
        const layoutInfo = buffer[4 * i + 1];
        if(layoutInfo) {
            let [, layoutParams] = $match(/layout\((.+)\)/gm, layoutInfo);
            layoutParams = layoutParams.split(',')
            layoutParams.reduce((prev, cur)=>{
                // const [key, value = true] = cur.split('=');

                let key, value = true;
                if(cur.includes('='))
                    [,key,value=true] = $match(/(\S+)[\s]*=[\s]*(\S+)/gm, cur);
                else
                    key = cur;


                if(!$isNumber(value))
                    [,value] = getDefineValue(value,source);

                $assert($isNumber(value));

                prev[key] = value;
                return prev;
            },layout);
        }
        const type = buffer[4 * i + 2];

        result[varName] = {type , value: null, layout};

    }
    return buffer.length?result:null;

}
const __FILE_MAP = new Map();

function initUniforms(uniformParams, values){

    for(const entry of values)
        for(const [key,value] of Object.entries(entry))
                uniformParams[key].value = value;


    for(let [key,{type,value}] of Object.entries(uniformParams)) {
        if(!value) continue;

        // if(/(.+)\[\]\[\]$/.test(type))//double arr
        //     uniformParams[key].value = JSON.parse(`[${value.join()}]`);

        const isVecMat = input=>/vec/.test(input) || /mat/.test(input),
                isArrStr = input=>/^\[[-.,\d\s]+\]$/.test(input)

       if(/(.+)\[\]$/.test(type)){//arr
           if(isVecMat(value))
               uniformParams[key].value = parseVecMat(type,value);
           else if(isArrStr(value))
                uniformParams[key].value = JSON.parse(value);
           else
               $assert(false);
        }else  if(type === 'sampler2D' || type === 'int'){
            uniformParams[key].value = parseInt(value);
        }else if(type === 'float')
            uniformParams[key].value = parseFloat(value);
        else if(isVecMat(type))
            uniformParams[key].value = parseVecMat(type,value);
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


            const version = checkVersion(sourceRaw);

            debugger;


            const extensions = checkPreprocessor('extension',sourceRaw);
            const source = filterSource(sourceRaw);


            let attributeParmas, vertexAttri;

            if(version === VERSIONS.GLSL_ES1)
                attributeParmas = {...checkAttrParams('attribute', `${includes}\r\n${source}`)};
            else if(version === VERSIONS.GLSL_ES3)
                attributeParmas = {...checkAttrParams('in', `${includes}\r\n${source}`)};


            const uniformParams = {...checkUniformParams( `${includes}\r\n${source}`)};



            const values = checkPreprocessor('value',sourceRaw);
            const buffers = checkPreprocessor('buffer',sourceRaw);
            checkPreprocessor('buffer',sourceRaw);
            const extensionParmas = {};
            initExtension(extensionParmas, extensions);

            console.log(sourceRaw);
            console.log(attributeParmas);
            console.log(uniformParams);

            initUniforms(uniformParams, values);
            initAttributes(attributeParmas, buffers);

            const glslSrc = `${includes}\n${addingLineNum(curFileIndex,id,source)}`;
            const code = generateCode(version, extensionParmas,attributeParmas, uniformParams, glslSrc),
                magicString = new MagicString(code);
            return { code: magicString.toString() };
        }
    };
}
function spreadVecMat(raw, dim, arrData){
    if(arrData.length === 1){
        if(/mat/.test(raw)){
            for(let row=0; row<dim; row++)
                for(let col=0; col<dim; col++) {
                    const i = col + row * dim;
                    if (row === col)
                        arrData[i] = arrData[0];
                    else
                        arrData[i] = 0;
                }

        } else if(/vec/.test(raw)){
            for(let i=1; i<dim; i++)
                arrData[i] = arrData[0];
        }

    }
}
function parseVecMat(type,input){

    let arrData = [], dim = 0, raw = input;
    const buff = $match( /\b(?:ivec|uvec|vec|mat)(\d+)\(([-\d,.\s]+)\)/gm, input);
    if(buff.length === 3){
        [raw, dim, arrData] = buff;
        arrData = arrData.split(',').map(value=> parseFloat(value));
        spreadVecMat(raw, dim, arrData);
        if(/mat/.test(type))
            dim *= dim;
        $assert(arrData.length == dim, `${input} length is not matching with type ${type}`);
    }else{
        // ["vec2(1, 2)", "2", "1, 2", "vec2(3, 4)", "2", "3, 4", "vec2(5, 6)", "2", "5, 6"]

        dim = [], raw = [];
        for(let i=0;i<buff.length/3;i++){
            raw.push(buff[3*i])
            dim.push(buff[3*i+1]);
            arrData.push(buff[3*i+2]);

        }

        arrData =  arrData.map(ele=>ele.split(',').map(value=> parseFloat(value)));

        for(const index in arrData){
            const subData = arrData[index],
                    subRaw = raw[index],
                    subDim =  dim[index];
            spreadVecMat(subRaw, subDim, subData);
            $assert(subData.length == subDim, `${input} length is not matching with type ${type}`);
            arrData[index] = subData;
        }
        arrData = arrData.flat();
    }


    console.log(input, arrData);
    return arrData;
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
