const initialState = {};

export default {
  state: initialState,
  reducers: {
  },
  effects: {
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen((location, action) => {
        if (action === 'PUSH' || action === 'REPLACE') {
          window.scrollTo(0, 0);
        }
      });
    },
  },
};
