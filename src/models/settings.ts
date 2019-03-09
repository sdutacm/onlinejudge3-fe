import localStorage from '@/utils/localStorage';
import { merge } from 'lodash';

const initialState = {
  theme: 'light',
  color: 'default',
  improveAnimation: false,
} as ISettings;

export default {
  state: merge(initialState, localStorage.get('settings')),
  reducers: {
    setTheme(state, { payload: { theme } }) {
      if (theme === 'dark') {
        document.body.classList.add('dark');
      }
      else {
        document.body.classList.remove('dark');
      }
      localStorage.set('settings', { ...state, theme });
      state.theme = theme;
    },
    setColor(state, { payload: { color } }) {
      if (color === 'colorblind-dp') {
        document.body.classList.add('colorblind-dp');
      }
      else {
        document.body.classList.remove('colorblind-dp');
      }
      localStorage.set('settings', { ...state, color });
      state.color = color;
    },
    setImproveAnimation(state, { payload: { improveAnimation } }) {
      localStorage.set('settings', { ...state, improveAnimation });
      state.improveAnimation = improveAnimation;
    },
  },
  effects: {
  },
};
