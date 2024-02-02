import localStorage from '@/utils/localStorage';
import { merge, omit } from 'lodash';

const initialState = {
  theme: 'auto',
  themeLocked: false,
  color: 'default',
  improveAnimation: true,
  proMode: false,
  useAbsoluteTime: false,
} as ISettings;

function genState() {
  const merged = omit(merge(initialState, localStorage.get('settings')), ['themeLocked']);
  localStorage.set('settings', merged);
  return merged;
}

export default {
  state: genState(),
  reducers: {
    setTheme(state, { payload: { theme, isTemp } }) {
      document.body.classList.remove('auto');
      document.body.classList.remove('dark');
      if (theme === 'auto') {
        document.body.classList.add('auto');
      } else if (theme === 'dark') {
        document.body.classList.add('dark');
      }
      !isTemp && localStorage.set('settings', omit({ ...state, theme }, ['themeLocked']));
      state.theme = theme;
    },
    setThemeLocked(state, { payload: { themeLocked } }) {
      state.themeLocked = themeLocked;
    },
    setColor(state, { payload: { color } }) {
      if (color === 'colorblind-dp') {
        document.body.classList.add('colorblind-dp');
      } else {
        document.body.classList.remove('colorblind-dp');
      }
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
};
