import { contrast, ensureContrast, isLightSurface, luminance, mix, parseHex, pickOnColor, toHex, toRgb } from './color.utils';

describe('color.utils', () => {
  describe('parseHex', () => {
    it('normaliza #RRGGBB a mayúsculas', () => expect(parseHex('#0866ff')).toBe('#0866FF'));
    it('expande #RGB', () => expect(parseHex('#abc')).toBe('#AABBCC'));
    it('acepta sin #', () => expect(parseHex('0866FF')).toBe('#0866FF'));
    it('recorta espacios', () => expect(parseHex('  #0866FF ')).toBe('#0866FF'));
    it('rechaza inválidos', () => {
      for (const v of ['', 'blue', '#12', '#GGGGGG', '#1234567', null, undefined]) {
        expect(parseHex(v as string)).withContext(String(v)).toBeNull();
      }
    });
  });

  it('toRgb/toHex son inversos', () => {
    expect(toRgb('#0866FF')).toEqual([8, 102, 255]);
    expect(toHex([8, 102, 255])).toBe('#0866FF');
    expect(toHex([300, -5, 127.6])).toBe('#FF0080');
  });

  it('luminance de blanco y negro', () => {
    expect(luminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(luminance('#000000')).toBeCloseTo(0, 5);
  });

  it('contrast según WCAG', () => {
    expect(contrast('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrast('#0866FF', '#FFFFFF')).toBeCloseTo(4.82, 1);
  });

  it('mix interpola hacia el objetivo', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF');
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });

  describe('pickOnColor', () => {
    it('blanco sobre azul GMV', () => expect(pickOnColor('#0866FF')).toBe('#FFFFFF'));
    it('oscuro sobre amarillo', () => expect(pickOnColor('#FACC15')).toBe('#101828'));
    it('oscuro sobre cian', () => expect(pickOnColor('#06B6D4')).toBe('#101828'));
    it('blanco sobre negro', () => expect(pickOnColor('#000000')).toBe('#FFFFFF'));
    it('oscuro sobre blanco', () => expect(pickOnColor('#FFFFFF')).toBe('#101828'));
  });

  it('isLightSurface', () => {
    expect(isLightSurface('#FFFFFF')).toBeTrue();
    expect(isLightSurface('#12161F')).toBeFalse();
  });

  describe('ensureContrast', () => {
    it('devuelve el mismo color si ya cumple', () => expect(ensureContrast('#0866FF', '#FFFFFF')).toBe('#0866FF'));
    it('oscurece amarillo sobre blanco hasta 4.5:1', () => {
      const c = ensureContrast('#FACC15', '#FFFFFF');
      expect(c).not.toBe('#FACC15');
      expect(contrast(c, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    });
    it('aclara azul sobre superficie oscura hasta 4.5:1', () => {
      const c = ensureContrast('#0866FF', '#12161F');
      expect(contrast(c, '#12161F')).toBeGreaterThanOrEqual(4.5);
    });
    it('cae al texto por defecto si no alcanza', () => {
      expect(ensureContrast('#FFFFFF', '#FFFFFF', 21)).toBe('#101828');
      expect(ensureContrast('#000000', '#000000', 21)).toBe('#FFFFFF');
    });
  });
});
