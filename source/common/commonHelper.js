import * as math from "./lib/math/index.js";

export function $assert(condition,msg){
    if(!condition){

        if(msg)
            for(const line of msg.replaceAll('\x00','').split('\n')){
                if(line)
                    console.warn(line);
            }
        else
            debugger;

        throw new Error(msg);
    }
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

export function $getShaderInfo(name,gl, shader, file){

    const msg =  gl.getShaderInfoLog(shader);
    if(!msg) return "";


    const [,fileIndex,lineNum] =  $match(/ERROR: ([0-9]+):([0-9]+):/gm, msg);
    return msg.replace(/ERROR: (.+):[0-9]+:/gm, `file:"${file[fileIndex]}" line:${lineNum}`);

}


function $isNumber(input) {
    return input != null && (Number(input) || Number(input) == 0) ? true : false;
};

export function $convert2NDC(point,resolution){
    point = [point[0]/resolution[0], 1 - point[1]/resolution[1]]; //map [0-1]
    point = [point[0]*2-1,   point[1]*2-1,]; //map -1 to 1
    return point;
}

export function $projView(mat, cam){

    const viewMat = math.mat4.create();
    // math.mat3d.toMat4(viewMat, cam.viewMatrix);
    math.mat4.mul(mat, cam.projectionMatrix,viewMat);
    return mat;
}

export function $invProjView(invMat, cam){

    $projView(invMat, cam);
    math.mat4.invert(invMat, invMat);
    return invMat;
}

export function isNum(input) {
    return input != null && (Number(input) || Number(input) == 0) ? true : false;
};

Number.prototype.clamp = function(min, max) {
    if(max<min)
        max = min;
    return Math.min(Math.max(this, min), max);
};