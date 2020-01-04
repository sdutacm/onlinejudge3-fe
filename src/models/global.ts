import { History } from 'history';
import tracker from '@/utils/tracker';
import constants from '@/configs/constants';

function genInitialState() {
  return {
    mobile: false,
    viewportWidth: 0,
    viewportHeight: 0,
  };
}

export default {
  state: genInitialState(),
  reducers: {
    setViewport(state, { payload: { viewportWidth, viewportHeight } }) {
      state.mobile = viewportWidth < constants.mobileBreakPoint;
      state.viewportWidth = viewportWidth;
      state.viewportHeight = viewportHeight;
    },
  },
  effects: {
  },
  subscriptions: {
    setup({ dispatch, history }: { dispatch: Function; history: History }) {
      return history.listen((location) => {
        tracker.pageview(location.pathname + location.search);
      });
    },
  },
};
