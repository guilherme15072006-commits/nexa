import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

describe('Estrutura do projeto', () => {
  const expectedDirs = [
    'src/screens',
    'src/components',
    'src/store',
    'src/services',
    'src/theme',
    'src/navigation',
    'src/utils',
  ];

  test.each(expectedDirs)('%s existe', (dir) => {
    expect(fs.existsSync(path.join(ROOT, dir))).toBe(true);
  });

  const expectedFiles = [
    'App.tsx',
    'tsconfig.json',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    'package.json',
    'src/screens/FeedScreen.tsx',
    'src/screens/ApostasScreen.tsx',
    'src/screens/RankingScreen.tsx',
    'src/screens/PerfilScreen.tsx',
    'src/screens/OnboardingScreen.tsx',
    'src/components/ui.tsx',
    'src/components/Logo.tsx',
    'src/store/nexaStore.ts',
    'src/services/analytics.ts',
    'src/services/api.ts',
    'src/services/linear.ts',
    'src/theme/index.ts',
    'src/navigation/TabNavigator.tsx',
    'src/utils/index.ts',
  ];

  test.each(expectedFiles)('%s existe', (file) => {
    expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
  });
});

describe('Imports resolvem corretamente', () => {
  function extractImports(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = /from ['"](\.[^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  }

  function resolveImport(fromFile: string, importPath: string): boolean {
    const dir = path.dirname(fromFile);
    const resolved = path.resolve(dir, importPath);
    const candidates = [
      resolved,
      resolved + '.ts',
      resolved + '.tsx',
      path.join(resolved, 'index.ts'),
      path.join(resolved, 'index.tsx'),
    ];
    return candidates.some(c => fs.existsSync(c));
  }

  const sourceFiles = [
    'App.tsx',
    ...fs.readdirSync(path.join(SRC, 'screens')).map(f => `src/screens/${f}`),
    ...fs.readdirSync(path.join(SRC, 'components')).map(f => `src/components/${f}`),
    ...fs.readdirSync(path.join(SRC, 'navigation')).map(f => `src/navigation/${f}`),
    ...fs.readdirSync(path.join(SRC, 'store')).map(f => `src/store/${f}`),
    ...fs.readdirSync(path.join(SRC, 'services')).map(f => `src/services/${f}`),
  ];

  for (const file of sourceFiles) {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) continue;

    const imports = extractImports(fullPath);
    for (const imp of imports) {
      test(`${file}: import '${imp}' resolve`, () => {
        expect(resolveImport(fullPath, imp)).toBe(true);
      });
    }
  }
});

describe('Bugs corrigidos', () => {
  function readAll(dir: string): string {
    let content = '';
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) content += readAll(full);
      else if (f.name.endsWith('.ts') || f.name.endsWith('.tsx')) {
        content += fs.readFileSync(full, 'utf-8');
      }
    }
    return content;
  }

  const allCode = readAll(SRC);

  test('zero Easing.sine (deve ser Easing.sin)', () => {
    expect(allCode).not.toContain('Easing.sine');
  });

  test('zero __DEV__ sem typeof guard', () => {
    const lines = allCode.split('\n');
    const unguarded = lines.filter(l =>
      l.includes('__DEV__') &&
      !l.includes('typeof __DEV__') &&
      !l.includes('// ')
    );
    expect(unguarded).toHaveLength(0);
  });

  test('api.ts importa de ../store/nexaStore', () => {
    const apiCode = fs.readFileSync(path.join(SRC, 'services/api.ts'), 'utf-8');
    expect(apiCode).toContain("from '../store/nexaStore'");
    expect(apiCode).not.toContain("from './nexaStore'");
  });
});
