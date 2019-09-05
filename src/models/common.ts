import * as service from '../services/common';

const initialState = {
};

export default {
  state: initialState,
  reducers: {
  },
  effects: {
    * uploadMedia({ payload: data }, { call }) {
      return yield call(service.uploadMedia, data);
    },
  },
  subscriptions: {
  },
};
