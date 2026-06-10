import localStorage from '@/utils/localStorage';
import { merge, omit } from 'lodash-es';

const initialState = {
  theme: 'auto',
  themeLocked: false,
  color: 'default',
  improveAnimation: true,
  proMode: false,
  useAbsoluteTime: false,
} as ISettings;

function shouldDeferClientStorageRead() {
  return typeof window !== 'undefined' && !!(window as any).g_useSSR;
}

function genState({ forceClientStorage = false } = {}) {
  const shouldReadClientStorage = forceClientStorage || !shouldDeferClientStorageRead();
  const storedSettings = shouldReadClientStorage ? localStorage.get('settings') : null;
  const merged = omit(merge({}, initialState, storedSettings), ['themeLocked']);
  if (shouldReadClientStorage) {
    localStorage.set('settings', merged);
  }
  return {
    ...merged,
    themeLocked: false,
  };
}

function applyThemeClass(theme: ISettingsTheme) {
  if (typeof document === 'undefined') {
    return;
  }
  document.body.classList.remove('auto');
  document.body.classList.remove('dark');
  if (theme === 'auto') {
    document.body.classList.add('auto');
  } else if (theme === 'dark') {
    document.body.classList.add('dark');
  }
}

function applyColorClass(color: string) {
  if (typeof document === 'undefined') {
    return;
  }
  if (color === 'colorblind-dp') {
    document.body.classList.add('colorblind-dp');
  } else {
    document.body.classList.remove('colorblind-dp');
  }
}

export default {
  state: genState(),
  reducers: {
    hydrateFromLocalStorage(state) {
      const settings = genState({ forceClientStorage: true });
      applyThemeClass(settings.theme);
      applyColorClass(settings.color);
      Object.assign(state, settings);
    },
    setTheme(state, { payload: { theme, isTemp } }) {
      applyThemeClass(theme);
      !isTemp && localStorage.set('settings', omit({ ...state, theme }, ['themeLocked']));
      state.theme = theme;
    },
    setThemeLocked(state, { payload: { themeLocked } }) {
      state.themeLocked = themeLocked;
    },
    setColor(state, { payload: { color } }) {
      applyColorClass(color);
      localStorage.set('settings', omit({ ...state, color }, ['themeLocked']));
      state.color = color;
    },
    setImproveAnimation(state, { payload: { improveAnimation } }) {
      localStorage.set('settings', omit({ ...state, improveAnimation }, ['themeLocked']));
      state.improveAnimation = improveAnimation;
    },
    setProMode(state, { payload: { proMode } }) {
      localStorage.set('settings', omit({ ...state, proMode }, ['themeLocked']));
      state.proMode = proMode;
    },
    setUseAbsoluteTime(state, { payload: { useAbsoluteTime } }) {
      localStorage.set('settings', omit({ ...state, useAbsoluteTime }, ['themeLocked']));
      state.useAbsoluteTime = useAbsoluteTime;
    },
  },
  effects: {},
  subscriptions: {
    setup({ dispatch }) {
      if (typeof window === 'undefined') {
        return;
      }
      const hydrate = () => dispatch({ type: 'hydrateFromLocalStorage' });
      if ((window as any).g_useSSR) {
        window.setTimeout(hydrate, 0);
        return;
      }
      hydrate();
    },
  },
};
