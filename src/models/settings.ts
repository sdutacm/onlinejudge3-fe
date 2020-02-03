import localStorage from '@/utils/localStorage';
import { merge } from 'lodash';

const initialState = {
  theme: 'auto',
  color: 'default',
  improveAnimation: true,
  proMode: false,
} as ISettings;

function genState() {
  const merged = merge(initialState, localStorage.get('settings'));
  localStorage.set('settings', merged);
  return merged;
}

export default {
  state: genState(),
  reducers: {
    setTheme(state, { payload: { theme } }) {
      document.body.classList.remove('auto');
      document.body.classList.remove('dark');
      if (theme === 'auto') {
        document.body.classList.add('auto');
      } else if (theme === 'dark') {
        document.body.classList.add('dark');
      }
      localStorage.set('settings', { ...state, theme });
      state.theme = theme;
    },
    setColor(state, { payload: { color } }) {
      if (color === 'colorblind-dp') {
        document.body.classList.add('colorblind-dp');
      } else {
        document.body.classList.remove('colorblind-dp');
      }
      localStorage.set('settings', { ...state, color });
      state.color = color;
    },
    setImproveAnimation(state, { payload: { improveAnimation } }) {
      localStorage.set('settings', { ...state, improveAnimation });
      state.improveAnimation = improveAnimation;
    },
    setProMode(state, { payload: { proMode } }) {
      localStorage.set('settings', { ...state, proMode });
      state.proMode = proMode;
    },
  },
  effects: {
  },
};
