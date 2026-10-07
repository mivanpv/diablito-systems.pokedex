import { capitalize, convert, formatCurrency, padId } from './format';

const rates = { USD: 1, MXN: 20, EUR: 0.8 };

describe('convert', () => {
  it('returns the same amount for the same currency', () => {
    expect(convert(10, 'MXN', 'MXN', rates)).toBe(10);
  });

  it('converts from the base currency', () => {
    expect(convert(2, 'USD', 'MXN', rates)).toBe(40);
  });

  it('converts between two non-base currencies (cross rate)', () => {
    expect(convert(8, 'EUR', 'MXN', rates)).toBeCloseTo(200);
  });

  it('returns null for unknown currencies', () => {
    expect(convert(1, 'XYZ', 'MXN', rates)).toBeNull();
  });
});

describe('formatting helpers', () => {
  it('formats currency with the es-MX locale', () => {
    expect(formatCurrency(1234.5, 'MXN')).toContain('1,234.50');
  });

  it('capitalizes hyphenated names', () => {
    expect(capitalize('mr-mime')).toBe('Mr Mime');
  });

  it('pads Pokédex numbers', () => {
    expect(padId(25)).toBe('#0025');
  });
});
