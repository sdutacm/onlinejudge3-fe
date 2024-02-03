import React from 'react';
import ReactPlayer from 'react-player/file';
import { Button } from 'antd';

export interface AutoVideoScreenProps {
  url: string;
  allowSkip?: boolean;
  background?: string;
  onFinished?: () => any;
  onError?: (err: any, data?: any) => any;
}

interface State {
  mouseHidden: boolean;
}

export default class AutoVideoScreen extends React.Component<AutoVideoScreenProps, State> {
  containerRef: HTMLElement | null;
  lastSceneRef: HTMLElement | null;
  mouseMoveTimer = null;

  constructor(props: AutoVideoScreenProps) {
    super(props);
    this.state = {
      mouseHidden: true,
    };
  }

  handleMouseMove = () => {
    clearTimeout(this.mouseMoveTimer);
    this.setState({ mouseHidden: false });
    this.mouseMoveTimer = setTimeout(() => {
      this.setState({ mouseHidden: true });
    }, 2000);
  };

  skip = () => {
    this.props.onFinished?.();
  };

  componentDidMount() {
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  componentWillUnmount() {
    clearTimeout(this.mouseMoveTimer);
    document.removeEventListener('mousemove', this.handleMouseMove);
  }

  render() {
    return (
      <div
        className={this.state.mouseHidden ? 'deep-cursor-none' : ''}
        style={{
          width: '100%',
          height: '100%',
          background: this.props.background,
        }}
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
        <Button
          type="ghost"
          onClick={this.skip}
          style={{
            color: '#d9d9d9',
            position: 'fixed',
            top: '30px',
            right: '30px',
            opacity: this.state.mouseHidden ? 0 : 1,
          }}
        >
          跳过
        </Button>
      </div>
    );
  }
}
