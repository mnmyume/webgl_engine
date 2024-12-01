// Usage:
// for (let i = 0; i < pixels.length; i++) {
//     const t = pixels[i] * 255.;
//     pixels[i] = t;
// }
// savePixelsAsPNG(pixels, 8, 8);

export default function savePixelsAsPNG(pixels, width, height) {
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const imageData = ctx.createImageData(width, height);
    
    for (let i = 0; i < pixels.length; i += 4) {
        const index = i / 4;
        imageData.data[i] = pixels[i];        // Red
        imageData.data[i + 1] = pixels[i + 1]; // Green
        imageData.data[i + 2] = pixels[i + 2]; // Blue
        imageData.data[i + 3] = 255;           // Alpha
    }

    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'texture.png';
        link.click();

        URL.revokeObjectURL(url);
    });
}
