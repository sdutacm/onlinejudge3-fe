import React from 'react';
import ReactPlayer from 'react-player/file';

export interface AutoVideoScreenProps {
  url: string;
  allowSkip?: boolean;
  background?: string;
  onFinished?: () => any;
  onError?: (err: any, data?: any) => any;
}

interface State {}

export default class AutoVideoScreen extends React.Component<AutoVideoScreenProps, State> {
  containerRef: HTMLElement | null;
  lastSceneRef: HTMLElement | null;

  constructor(props: AutoVideoScreenProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div
        style={{ width: '100%', height: '100%', background: this.props.background }}
        ref={(ref) => {
          this.containerRef = ref;
        }}
      >
        <ReactPlayer
          url={this.props.url}
          playing
          onProgress={console.log}
          onError={this.props.onError}
          onEnded={this.props.onFinished}
          width="100%"
          height="100%"
        />
        {/* TODO a skip button */}
        {/* TODO hide cursor */}
      </div>
    );
  }
}
