/**
 * TESTES DO DESIGN SYSTEM
 * Garante que tipografia, spacing e contraste seguem as regras
 */

import { colors, typography, typeScale, spacing, radius } from '../src/theme';

describe('Type Scale', () => {
  const scales = Object.entries(typeScale);

  test.each(scales)('%s tem fontSize multiplo de 2', (name, style) => {
    expect(style.fontSize % 2).toBe(0);
  });

  test.each(scales)('%s tem lineHeight multiplo de 4', (name, style) => {
    expect(style.lineHeight % 4).toBe(0);
  });

  test.each(scales)('%s lineHeight >= fontSize + 4', (name, style) => {
    expect(style.lineHeight).toBeGreaterThanOrEqual(style.fontSize + 4);
  });

  test.each(scales)('%s tem fontFamily definido', (name, style) => {
    expect(style.fontFamily).toBeTruthy();
    expect(typeof style.fontFamily).toBe('string');
  });

  test('hero e o maior, caption e o menor', () => {
    expect(typeScale.hero.fontSize).toBeGreaterThan(typeScale.h1.fontSize);
    expect(typeScale.caption.fontSize).toBeLessThan(typeScale.bodySm.fontSize);
  });
});

describe('Spacing Grid (4px)', () => {
  const spacings = Object.entries(spacing);

  test.each(spacings)('spacing.%s (%d) e multiplo de 4', (name, value) => {
    expect(value % 4).toBe(0);
  });

  test('spacing cresce monotonicamente', () => {
    const values = Object.values(spacing);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

describe('Contraste WCAG AA', () => {
  // Funcao para calcular luminancia relativa
  function luminance(hex: string): number {
    const rgb = hex.replace('#', '').match(/.{2}/g)!.map(c => {
      const v = parseInt(c, 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  function contrastRatio(fg: string, bg: string): number {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  test('textPrimary em bg passa WCAG AA (>= 4.5:1)', () => {
    const ratio = contrastRatio(colors.textPrimary, colors.bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('textSecondary em bg passa WCAG AA (>= 4.5:1)', () => {
    const ratio = contrastRatio(colors.textSecondary, colors.bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('green em bg passa WCAG AA para texto normal', () => {
    const ratio = contrastRatio(colors.green, colors.bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('gold em bg passa WCAG AA', () => {
    const ratio = contrastRatio(colors.gold, colors.bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('textPrimary em bgCard passa WCAG AA', () => {
    const ratio = contrastRatio(colors.textPrimary, colors.bgCard);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('textSecondary em bgCard passa WCAG AA', () => {
    const ratio = contrastRatio(colors.textSecondary, colors.bgCard);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('Typography tokens existem', () => {
  test('todos os fontFamily sao strings', () => {
    Object.values(typography).forEach(t => {
      expect(typeof t.fontFamily).toBe('string');
      expect(t.fontFamily.length).toBeGreaterThan(0);
    });
  });

  test('radius.full e grande o suficiente para pills', () => {
    expect(radius.full).toBeGreaterThanOrEqual(999);
  });
});
