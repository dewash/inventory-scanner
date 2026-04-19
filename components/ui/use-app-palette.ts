import { useMemo } from 'react';

import { palette, type ColorSchemeName } from '@/constants/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useAppPalette() {
  const scheme = useColorScheme() ?? 'dark';
  const name: ColorSchemeName = scheme === 'light' ? 'light' : 'dark';

  return useMemo(() => palette[name], [name]);
}
