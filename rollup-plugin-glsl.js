import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string'
import path from 'path';
import fs from "fs";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
function compressShader(source) {
    debugger;
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

function generateCode(attributes, uniforms, code) {
    return `export default ${JSON.stringify({code,attributes,uniforms, file:Object.fromEntries(__FILE_MAP.entries())})}`;
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

function addIncludeFiles(srcPath,source){
    const reg = /#include[\s]+"(.+)"/gm;
    const buffer =  $match(reg,source);
    source = source.replace(reg, '');

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
        modifiedSource: source,
        curFileIndex:++fileIndex,
    }
}

function checkKeyWordParams(key, source){
    const buffer =  $match( new RegExp(`${key} (\\S+) (\\S+);`, 'g'), source);
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

        transform(source, id) {
            console.log(id);
            if (!filter(id)) return;
            const {includes, modifiedSource,curFileIndex} = addIncludeFiles(path.dirname(id),source);

            const attributeParmas = {...checkKeyWordParams('attribute', includes), ...checkKeyWordParams('attribute', modifiedSource)};
            const uniformParams = {...checkKeyWordParams('uniform', includes), ...checkKeyWordParams('uniform', modifiedSource)};
            const glslSrc = `${includes}\n${addingLineNum(curFileIndex,id,modifiedSource)}`;
            const code = generateCode(attributeParmas, uniformParams, glslSrc),
                    magicString = new MagicString(code);
            return { code: magicString.toString() };
        }
    };
}
