
import * as glMatrix from "./common.js"
export function create() {
  let out = new glMatrix.ARRAY_TYPE(12);
  if(glMatrix.ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[9] = 0;
    out[10] = 0;
    out[11] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

/**
 * Inverts a mat3d
 *
 * @param {mat3d} out the receiving matrix
 * @param {mat3d} a the source matrix
 * @returns {mat3d} out
 */
export function invert(out, a) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = 0;
  let a10 = a[3], a11 = a[4], a12 = a[5], a13 = 0;
  let a20 = a[6], a21 = a[7], a22 = a[8], a23 = 0;
  let a30 = a[9], a31 = a[10], a32 = a[11], a33 = 1;

  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }
  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  // out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[3] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  // out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[6] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[7] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  // out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[9] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[10] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[11] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  // out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return out;
}


/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3d} out the receiving 3x4 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
export function fromMat4(out, a) {
  out[0] = a[0]; out[3] = a[4]; out[6] = a[8]; out[9] = a[12];
  out[1] = a[1]; out[4] = a[5]; out[7] = a[9]; out[10] = a[13];
  out[2] = a[2]; out[5] = a[6]; out[8] = a[10]; out[11] = a[14];

  return out;
}
export function toMat4(out, a) {
  out[0] = a[0]; out[4] = a[3]; out[8] = a[6]; out[12] = a[9];
  out[1] = a[1]; out[5] = a[4]; out[9] = a[7]; out[13] = a[10];
  out[2] = a[2]; out[6] = a[5]; out[10] = a[8]; out[14] = a[11];
  out[3] = 0;    out[7] = 0;    out[11] = 0;    out[15] = 1;
  return out;
}




/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
export function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  return out;
}


/**
 * Multiplies two mat3's
 *
 * @param {mat3d} out the receiving matrix
 * @param {mat3d} a the first operand
 * @param {mat3d} b the second operand
 * @returns {mat3d} out
 */
export function multiply(out, a, b) {

  let a00,    a01,  a02,  a03,
      a10,    a11,  a12,  a13,
      a20,    a21,  a22,  a23,
      a30 = 0,a31=0,a32=0,a33=1;

  if(a.length == 12){
    a00 = a[0], a01 = a[3], a02 = a[6], a03 = a[9],
    a10 = a[1], a11 = a[4], a12 = a[7], a13 = a[10],
    a20 = a[2], a21 = a[5], a22 = a[8], a23 = a[11];
  }else if(a.length == 16)
    [a00, a10,a20,a30,
      a01,a11,a21,a31,
      a02,a12,a22,a32,
      a03,a13,a23,a33] = a;


  let b00,    b01,  b02,  b03,
      b10,    b11,  b12,  b13,
      b20,    b21,  b22,  b23,
      b30 = 0,b31=0,b32=0,b33=1;

  if(b.length == 12){
    b00 = b[0], b01 = b[3], b02 = b[6], b03 = b[9],
        b10 = b[1], b11 = b[4], b12 = b[7], b13 = b[10],
        b20 = b[2], b21 = b[5], b22 = b[8], b23 = b[11];
  }else if(b.length == 16)
    [b00, b10,b20,b30,
      b01,b11,b21,b31,
      b02,b12,b22,b32,
      b03,b13,b23,b33] = b;




  if(out.length == 12){
    out[0] = a00*b00 + a01*b10 + a02*b20;
    out[1] = a10*b00 + a11*b10 + a12*b20;
    out[2] = a20*b00 + a21*b10 + a22*b20;

    out[3] = a00*b01 + a01*b11 + a02*b21;
    out[4] = a10*b01 + a11*b11 + a12*b21;
    out[5] = a20*b01 + a21*b11 + a22*b21;

    out[6] = a00*b02 + a01*b12 + a02*b22;
    out[7] = a10*b02 + a11*b12 + a12*b22;
    out[8] = a20*b02 + a21*b12 + a22*b22;

    out[9] = a00*b03 + a01*b13 + a02*b23;
    out[10] = a10*b03 + a11*b13 + a12*b23;
    out[11] = a20*b03 + a21*b13 + a22*b23;
  }else{
    out[0] = a00*b00 + a01*b10 + a02*b20 + a03*b30;
    out[1] = a10*b00 + a11*b10 + a12*b20 + a13*b30;
    out[2] = a20*b00 + a21*b10 + a22*b20 + a23*b30;
    out[3] = a30*b00 + a31*b10 + a32*b20 + a33*b30;

    out[4] = a00*b01 + a01*b11 + a02*b21 + a03*b31;
    out[5] = a10*b01 + a11*b11 + a12*b21 + a13*b31;
    out[6] = a20*b01 + a21*b11 + a22*b21 + a23*b31;
    out[7] = a30*b01 + a31*b11 + a32*b21 + a33*b31;


    out[8] = a00*b02 + a01*b12 + a02*b22 + a03*b32;
    out[9] = a10*b02 + a11*b12 + a12*b22 + a13*b32;
    out[10] = a20*b02 + a21*b12 + a22*b22 + a23*b32;
    out[11] = a30*b02 + a31*b12 + a32*b22 + a33*b32;



    out[12] = a00*b03 + a01*b13 + a02*b23 + a03*b33;
    out[13] = a10*b03 + a11*b13 + a12*b23 + a13*b33;
    out[14] = a20*b03 + a21*b13 + a22*b23 + a23*b33;
    out[15] = a30*b03 + a31*b13 + a32*b23 + a33*b33;
  }
  return out;
}
export const mul = multiply;