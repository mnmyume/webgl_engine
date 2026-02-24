export function readAttrSchema(attr) {
    const result = [];
    for(const [key, {value, name, type}] of Object.entries(attr)) {
        let finder = result.find(ele=>ele.name === name);
        if(!finder) {
            finder = {name,value:[]};
            result.push(finder);
        }
        finder.value.push({...value,attribute:key});
    }
    return result;
}

export function quad(width, height, z = 0){

    width = width||1;
    height = height||1;

    const data = {};

    data.vertice = [-0.5*width,0.5*height,z,
        -0.5*width,-0.5*height,z,
        0.5*width,0.5*height,z,
        0.5*width,-0.5*height,z];
    data.uvs =[0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0];

    data.indice = [0,1,2,1,3,2];
    data.normals = [0,0,1,
        0,0,1,
        0,0,1,
        0,0,1];
    debugger;
    return data;
}

export function grid(range = [10,10], params = { mode : 'strip', flipY : false}){

    const {mode = 'strip', flipY = false} = params;
    const [X_MAX,Y_MAX] = range;

    if(mode === 'strip')
        return [
            0,      flipY?0:Y_MAX,                   0, flipY?0:1,
            0,      flipY?-Y_MAX:0,                  0, flipY?1:0,
            X_MAX,  flipY?0:Y_MAX,                   1, flipY?0:1,
            X_MAX,  flipY?-Y_MAX:0,                  1, flipY?1:0
        ];
    else if(mode === 'quad')
        return [
            0,      flipY ? 0 : Y_MAX,         0, flipY ? 0 : 1,
            0,      flipY ? -Y_MAX : 0,        0, flipY ? 1 : 0,
            X_MAX,  flipY ? 0 : Y_MAX,         1, flipY ? 0 : 1,
            X_MAX,  flipY ? 0 : Y_MAX,         1, flipY ? 0 : 1,
            0,      flipY ? -Y_MAX : 0,        0, flipY ? 1 : 0,
            X_MAX,  flipY ? -Y_MAX : 0,        1, flipY ? 1 : 0
        ]
    else{
        const data = {};
        data.vertex = [ 0,      Y_MAX,
            0,      0,
            X_MAX,  Y_MAX,
            X_MAX,  0,          ];

        data.uv =[  0.0, flipY?0:1,
            0.0, flipY?1:0,
            1.0, flipY?0:1,
            1.0, flipY?1:0];

        data.index = [0,1,2,1,3,2];
        data.normal = [ 0,0,1,
            0,0,1,
            0,0,1,
            0,0,1];
        return data;
    }
}