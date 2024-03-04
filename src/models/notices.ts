import localStorage from '@/utils/localStorage';
import { merge } from 'lodash-es';

const initialState = {
  read: {},
} as INotices;

function genState() {
  const merged = merge(initialState, localStorage.get('notices'));
  localStorage.set('notices', merged);
  return merged;
}

export default {
  state: genState(),
  reducers: {
    setNoticeRead(state, { payload: { noticeId } }: { payload: { noticeId: string } }) {
      const read = {
        ...state.read,
        [noticeId]: true,
      };
      localStorage.set('notices', { ...state, read });
      state.read = read;
    },
  },
  effects: {},
};
