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
        localStorage.set('settings', { ...state, theme });
      }
      else {
        document.body.classList.remove('dark');
        localStorage.set('settings', { ...state, theme });
      }
      state.theme = theme;
    },
  },
  effects: {
  },
};
