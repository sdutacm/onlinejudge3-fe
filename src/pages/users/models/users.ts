import * as service from '../services/users';

const initialState = {
  list: [],
  one: {},
};

export default {
  state: initialState,
  reducers: {
    reset() {
      return { ...initialState };
    },
  },
  effects: {
    // * getRegisterVerificationCode({ payload: data }, { call, put }) {
    //   return yield call(service.getRegisterVerificationCode, data);
    // },
    * register({ payload: data }, { call, put }) {
      return yield call(service.register, data);
    },

    * forgotPassword({ payload: data }, { call, put }) {
      return yield call(service.forgotPassword, data);
    },
  },
};
