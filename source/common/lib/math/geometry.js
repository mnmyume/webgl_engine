function xy(x,y){
    this.x = x;
    this.y = y;
};
function polygon(vertices, edges){
    this.vertex = vertices;
    this.edge = edges;
};
//include appropriate test case code.
export function sat(polygonA, polygonB){
    var perpendicularLine = null;
    var dot = 0;
    var perpendicularStack = [];
    var amin = null;
    var amax = null;
    var bmin = null;
    var bmax = null;
    for(var i = 0; i < polygonA.edge.length; i++){
        perpendicularLine = new xy(-polygonA.edge[i].y,
            polygonA.edge[i].x);
        perpendicularStack.push(perpendicularLine);
    }
    for(var i = 0; i < polygonB.edge.length; i++){
        perpendicularLine = new xy(-polygonB.edge[i].y,
            polygonB.edge[i].x);
        perpendicularStack.push(perpendicularLine);
    }
    for(var i = 0; i < perpendicularStack.length; i++){
        amin = null;
        amax = null;
        bmin = null;
        bmax = null;
        for(var j = 0; j < polygonA.vertex.length; j++){
            dot = polygonA.vertex[j].x *
                perpenddicularStack[i].x +
                polygonA.vertex[j].y *
                perpendicularStack[i].y;
            if(amax === null || dot < amin){
                amax = dot;
            }
            if(amin === null || dot < amin){
                amin = dot;
            }
        }
        for(var j = 0; j < polygonB.vertex.length; j++){
            dot = polygonB.vertex[j].x *
                perpendicularStack[i].x +
                polygonB.vertex[j].y *
                perpendicularStack[i].y;
            if(bmax === null || dot > bmax){
                bmax = dot;
            }
            if(bmin === null || dot < bmin){
                bmin = dot;
            }
        }
        if((amin < bmax && amin > bmin) ||
            (bmin < amax && bmin > amin)){
            continue;
        }
        else {
            return false;
        }
    }
    return true;
}

//https://gamedev.stackexchange.com/questions/18436/most-efficient-aabb-vs-ray-collision-algorithms
//https://tavianator.com/2011/ray_box.html
//https://tavianator.com/2015/ray_box_nan.html



export function geoIntersectRayAABB(origin, dir, aabb, dirfrac = []){

    if(dirfrac.length === 0){
        // r.dir is unit direction vector of ray
        dirfrac[0] = 1.0 / dir[0];
        dirfrac[1] = 1.0 / dir[1];
        dirfrac[2] = 1.0 / dir[2];
    }



    const   bMin = [aabb[0],aabb[1],aabb[2]],
            bMax = [aabb[0] + aabb[3],aabb[1] + aabb[4],aabb[2] + aabb[5]];


    const isInside = origin[0]>=bMin[0]&&origin[0]<=bMax[0] &&
        origin[1]>=bMin[1]&&origin[1]<=bMax[1] &&
        origin[2]>=bMin[2]&&origin[2]<=bMax[2];
    if(isInside) return true;


    let t1 = (bMin[0] - origin[0])*dirfrac[0],
        t2 = (bMax[0] - origin[0])*dirfrac[0];

    let tmin = Math.min(t1, t2), tmax = Math.max(t1, t2);

    for (let i = 1; i < 3; ++i) {
        t1 = (bMin[i] - origin[i])*dirfrac[i];
        t2 = (bMax[i] - origin[i])*dirfrac[i];


        tmin = Math.max(tmin, Math.min(t1, t2));
        tmax = Math.min(tmax, Math.max(t1, t2));

    }

    return tmax > Math.max(tmin, 0.0);
}
