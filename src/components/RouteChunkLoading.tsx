import React from 'react';
import { beginRouteProgress, finishRouteProgress } from '@/runtime/routeProgress';

interface Props {
  error?: Error | null;
  isLoading?: boolean;
  retry?: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 72,
  left: '50%',
  zIndex: 10000,
  width: 'calc(100vw - 32px)',
  maxWidth: 460,
  transform: 'translateX(-50%)',
  padding: '16px 20px',
  border: '1px solid #ffa39e',
  borderRadius: 4,
  background: '#fff1f0',
  boxShadow: '0 4px 12px rgba(0,0,0,.15)',
  color: '#a8071a',
  lineHeight: 1.5,
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginTop: 12,
};

const buttonStyle: React.CSSProperties = {
  height: 32,
  padding: '0 14px',
  border: '1px solid #d9d9d9',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  borderColor: '#e23a36',
  background: '#e23a36',
  color: '#fff',
};

const RouteChunkLoading: React.FC<Props> = ({ error, isLoading = true, retry }) => {
  const progressTokenRef = React.useRef({});

  React.useEffect(() => {
    if (isLoading && !error) {
      beginRouteProgress(progressTokenRef.current);
      return () => finishRouteProgress(progressTokenRef.current);
    }

    finishRouteProgress(progressTokenRef.current);
    return undefined;
  }, [error, isLoading]);

  if (error) {
    const reloadPage = () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    };

    return (
      <div role="alert" style={overlayStyle}>
        <strong>Page resources failed to load.</strong>
        <div>Please retry, or reload the page if the site was just updated.</div>
        <div style={actionsStyle}>
          {retry && (
            <button type="button" style={primaryButtonStyle} onClick={retry}>
              Retry
            </button>
          )}
          <button type="button" style={buttonStyle} onClick={reloadPage}>
            Reload page
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default RouteChunkLoading;
