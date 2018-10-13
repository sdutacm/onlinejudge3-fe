import * as service from '../services/verifications';

export default {
  state: {},
  reducers: {
  },
  effects: {
    * getEmailCode({ payload: data }, { call }) {
      return yield call(service.fetchEmailCode, data);
    },
  },
};
