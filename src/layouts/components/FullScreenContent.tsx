import React from 'react';

export interface IFullScreenContentProps {}

export default class FullScreenContent extends React.Component<IFullScreenContentProps> {
  render() {
    return (
      <div
        id="full-screen-standalone"
        style={{
          position: 'fixed',
          height: '100%',
          width: '100%',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'none',
        }}
      />
    );
  }
}
