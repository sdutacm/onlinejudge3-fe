import localStorage from '@/utils/localStorage';

const initialState = {
  theme: 'light',
};

export default {
  state: {
    ...initialState,
    ...localStorage.get('settings'),
  },
  reducers: {
    setTheme(state, { payload: { theme } }) {
      if (theme === 'dark') {
        document.body.className = 'dark';
        localStorage.set('settings', { ...state, theme });
      }
      else {
        document.body.className = '';
        localStorage.set('settings', { ...state, theme });
      }
      state.theme = theme;
    },
  },
  effects: {
  },
};
