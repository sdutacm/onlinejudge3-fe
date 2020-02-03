import ReactGA from 'react-ga';

ReactGA.initialize('UA-91335628-7', {
  titleCase: false,
});

let tracker = ReactGA;
if (process.env.NODE_ENV === 'development') {
  const genVoidLogger = (type: string) => (...args: any[]) => console.log(`[tracker] [${type}]`, ...args);
  tracker.initialize = genVoidLogger('initialize');
  // @ts-ignore
  tracker.ga = genVoidLogger('ga');
  tracker.resetCalls = genVoidLogger('resetCalls');
  tracker.set = genVoidLogger('set');
  tracker.send = genVoidLogger('send');
  tracker.pageview = genVoidLogger('pageview');
  tracker.modalview = genVoidLogger('modalview');
  tracker.timing = genVoidLogger('timing');
  tracker.event = genVoidLogger('event');
  tracker.exception = genVoidLogger('exception');
  tracker.outboundLink = genVoidLogger('outboundLink');
}

export default tracker;
