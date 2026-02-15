import {
    $readPath,
} from "./helper.js";
import {$assert} from "./common.js";

export const $getFiles = function (input) {
    if(__files === null) return [];
    const files = Array.from(__files, ([,value])=>value);
    $assert(files);
    if (!input) return files;

    const result = [];
    if(Array.isArray(input)){
        for(const searchPath of input)
            result.push(...filterFiles(searchPath,files));
    }else
        result.push(...filterFiles(input,files));
    return result;

}
export const $getAttr= (path)=> _checkoutFile(path,'read');
export const $updateAttr= (path)=> _checkoutFile(path,'write');
function _checkoutFile(path, operation = 'read') {
    // if (!path) path = $getKeanuPath();
    $assert(path);
    if (!$readPath(path)) return undefined;


    const
        {nakedPath, attrKeys} = $readPath(path),
        [file] = $getFiles(nakedPath);

    if (!file) return undefined;



    const data = file.data;

    $assert(data);

    if(operation === 'write'){
        file.version = '';
        file.state |= HEADLESS_FILE_STATE.update;
    }


    const    res = attrKeys.length === 0 ?data: _getJSON(data, attrKeys);

    if(!res)
        return res;
    return  operation === 'read'&&
    ( res.constructor.name === 'Object' ||  res.constructor.name === 'Array')
        ? Object.freeze(deepClone(res)):res;
};