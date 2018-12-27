export default function setStatePromise(state: any): Promise<any> {
  return new Promise(resolve => {
    this.setState(state, resolve);
  });
}
