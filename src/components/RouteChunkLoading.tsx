import React from 'react';
import { beginRouteProgress, finishRouteProgress } from '@/runtime/routeProgress';

interface Props {
  error?: Error | null;
  isLoading?: boolean;
}

const RouteChunkLoading: React.FC<Props> = ({ error, isLoading = true }) => {
  const progressTokenRef = React.useRef({});

  React.useEffect(() => {
    if (isLoading && !error) {
      beginRouteProgress(progressTokenRef.current);
      return () => finishRouteProgress(progressTokenRef.current);
    }

    finishRouteProgress(progressTokenRef.current);
    return undefined;
  }, [error, isLoading]);

  return null;
};

export default RouteChunkLoading;
