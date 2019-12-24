import { History } from 'history';
import tracker from '@/utils/tracker';

function genInitialState() {
  return {};
}

export default {
  state: genInitialState(),
  reducers: {
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
