export function LoadImage(gl: WebGL2RenderingContext, image: ImageData): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);     //default
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); //(target , level , internal format , format , type , source);
    gl.generateMipmap(gl.TEXTURE_2D);   //because we used only the largest mip
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  //linear to give blurry(smooth) feeling not sharp
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    return texture;
}

type Size = [number, number];
type Color = [number, number, number, number];

export function CheckerBoard(gl: WebGL2RenderingContext, imageSize: Size, cellSize: Size, color0: Color, color1: Color): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    let data = Array(imageSize[0] * imageSize[1] * 4);
    for (let j = 0; j < imageSize[1]; j++) {
        for (let i = 0; i < imageSize[0]; i++) {
            data[i + j * imageSize[0]] = (Math.floor(i / cellSize[0]) + Math.floor(j / cellSize[1])) % 2 == 0 ? color0 : color1;
        }
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, imageSize[0], imageSize[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.flat()));
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

export function SingleColor(gl: WebGL2RenderingContext, color: Color = [255, 255, 255, 255]): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(color));
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

export function RenderTexture(gl: WebGL2RenderingContext, size: Size, internalFormat: number, levels: number = 1){
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if(levels == 0) levels = Math.ceil(1 + Math.log2(Math.max(size[0], size[1])));
    gl.texStorage2D(gl.TEXTURE_2D, levels, internalFormat, size[0], size[1]);
    return texture;
}