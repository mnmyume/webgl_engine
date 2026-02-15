import {$getFiles} from "./headless.js";

export function $assert(condition, info = {
    errorType: 1, //internel err
    msg: `assertion failed`,
    path: null
}) {
    if (!condition) {
        debugger;
        let {msg, errorType, path} = info;

        msg = msg || info;
        if (msg)
            console.error(msg);
        throw new Error(msg);
    }
};

export function $readPath(path) {
    if(path === 'shared') debugger;
    $assert(path && path.startsWith);
    // if(!path.startsWith('/'))
    //     path = '/'+path;
    const buf = path.split('|'),
        attrKeys = buf.slice(1);
    let nakedPath = buf[0];
    if ($isPathID(nakedPath)) {//is id like {23eafwef}
        const file = $getFiles(nakedPath);
        if (file.length === 0) return undefined;
        nakedPath = file[0]['path'];
    }


    const

        paths = nakedPath.split('/'),
        file = paths.pop(),
        [, fileNm, fileExt] = file.match(/(.+)\.([^.]*)$/) ?? [, file, null];
    return {folder: paths.join('/'), fileNm, attrKeys, fileExt, nakedPath, file};
}