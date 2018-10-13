export default function setStatePromise(state) {
  return new Promise(resolve => {
    this.setState(state, resolve);
  });
}
