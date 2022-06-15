export const isHexCode = (text: string) => {
  return /#[0-9a-f]{6}|#[0-9a-f]{3}/gi.test(text)
}

export const isImageUrl = (text: string) => {
  return text.match(/\.(jpeg|jpg|gif|png)/) != null
}

const componentToHex = (c: number) => {
  var hex = c.toString(16)
  return hex.length === 1 ? "0" + hex : hex
}

export const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}
