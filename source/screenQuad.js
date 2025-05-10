import Shape from './shape.js'

export default class ScreenQuad extends Shape {
    static RENDERSTATE = {triangle:1,line:2,point:3};

    dataBuffer = [];
    constructor(name, params = {}) {
        super(name, params);
        this.data = [
            -1,-1,      1,-1,       -1,1,
            -1,1,       1,-1,       1,1
        ];
    }

    initialize({ gl }) {
        super.initialize({ gl });
    }

    update(gl, key, data=this.data, type='STATIC_DRAW') {
        super.update(gl, key, data, type='STATIC_DRAW');
    }

    draw(gl, material) {

        super.draw(gl, material);
    }
}
