const initialState = {};

const scrollToTopIgnoreList = [
  /^\/topics\/\d/,
];

export default {
  state: initialState,
  reducers: {
  },
  effects: {
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen((location, action) => {
        let ignored = false;
        for (const r of scrollToTopIgnoreList) {
          if (r.test(location.pathname)) {
            ignored = true;
            break;
          }
        }
        if (!ignored && (action === 'PUSH' || action === 'REPLACE')) {
          window.scrollTo(0, 0);
        }
      });
    },
  },
};
