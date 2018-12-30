import * as service from '../services/verifications';
// import less from 'less';

const initialState = {
  theme: 'light',
};

export default {
  state: initialState,
  reducers: {
    setTheme(state, { payload: { theme } }) {
      // less.modifyVars({
      //   '@primary-color': '#e23a36',
      // });
      if (theme === 'dark') {
        document.body.className = 'dark';
      }
      else {
        document.body.className = '';
      }
      state.theme = theme;
    },
  },
  effects: {
  },
};
