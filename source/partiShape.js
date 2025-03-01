import Shape from './shape.js'

export default class PartiShape extends Shape {
    static RENDERSTATE = {triangle:1,line:2,point:3};

    dataBuffer = [];
    constructor(name, params = {}) {
        super(name, params);
        this.data = [];
    }

    initialize({ gl }) {
        super.initialize({ gl });
        for(let ii = 0; ii < this.count; ++ii){
            this.data[ii] = ii;
        }
    }

    update(gl, key, data=this.data, type='STATIC_DRAW') {
        super.update(gl, key, data, type='STATIC_DRAW');
    }

    draw(gl, material) {

        super.draw(gl, material);
    }
}
