/* eslint-disable import/no-unresolved */
// @ts-ignore
import themeDark from '../src/theme_dark.useable.scss';
// @ts-ignore
import themeLight from '../src/theme_light.useable.scss';

export function switchTheme(theme: string) {
  switch (theme) {
    case 'light':
      themeDark.unuse();
      themeLight.use();
      return;
    case 'dark':
      themeLight.unuse();
      themeDark.use();
      return;
  }
}
