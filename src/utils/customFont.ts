export function loadCustomFont(customFontFamily: string) {
  switch (customFontFamily) {
    case 'Teyvat Black ASEncrypted': {
      return import('@/assets/fonts/Teyvat_Black_ASEncrypted/style.css');
    }
  }
  return Promise.resolve();
}

export function getCustomFontStyleForReact(customFontFamily: string) {
  let style: React.CSSProperties = {};
  if (customFontFamily) {
    style.fontFamily = customFontFamily;
    // @ts-ignore
    style.fontDisplay = 'block';
  }
  return style;
}
