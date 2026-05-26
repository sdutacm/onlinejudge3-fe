import { History, Location } from 'history';

function genInitialState() {
  return {
    location: {
      pathname: '/',
      search: '',
      hash: '',
      state: undefined,
    },
  };
}

export default {
  state: genInitialState(),
  reducers: {
    updateLocation(state, { payload: { location } }: { payload: { location: Location } }) {
      state.location = location;
    },
  },
  subscriptions: {
    setup({ dispatch, history }: { dispatch: Function; history: History }) {
      dispatch({
        type: 'updateLocation',
        payload: { location: history.location },
      });
      return history.listen((location) => {
        dispatch({
          type: 'updateLocation',
          payload: { location },
        });
      });
    },
  },
};
