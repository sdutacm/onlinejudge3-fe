import msg from './msg';

export default function(prevState, nextState, autoDisplayMessage = true) {
  if (!prevState.result && nextState.result) {
    if (autoDisplayMessage) {
      msg.auto(nextState);
    }
    return true;
  }
  return false;
}
