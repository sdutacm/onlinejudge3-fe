import localStorage from '@/utils/localStorage';

const initialState = {
  theme: 'light',
  color: 'default',
} as ISettings;

export default {
  state: {
    ...initialState,
    ...localStorage.get('settings'),
  },
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
  },
  effects: {
  },
};
