import React from 'react';

export interface GenshinStartScreenProps {
  onLastSceneFinished?: () => any;
  onFinished?: () => any;
}

interface State {}

export default class GenshinStartScreen extends React.Component<GenshinStartScreenProps, State> {
  containerRef: HTMLElement | null;
  lastSceneRef: HTMLElement | null;

  constructor(props: GenshinStartScreenProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.lastSceneRef.addEventListener('animationend', this.handleLastSceneFinished);
    this.containerRef.addEventListener('animationend', this.handleFinished);
  }

  componentWillUnmount() {
    this.lastSceneRef.removeEventListener('animationend', this.handleLastSceneFinished);
    this.containerRef.removeEventListener('animationend', this.handleFinished);
  }

  handleLastSceneFinished = (e) => {
    if (e.target === this.lastSceneRef && e.animationName === 'genshinFadeOut') {
      this.props.onLastSceneFinished?.();
    }
  };

  handleFinished = (e) => {
    if (e.target === this.containerRef && e.animationName === 'genshinKeepUntilEnd') {
      this.props.onFinished?.();
    }
  };

  render() {
    return (
      <div
        className="sp-genshin-start-container"
        ref={(ref) => {
          this.containerRef = ref;
        }}
      >
        <div className="sp-genshin-start-s1" />
        <div className="sp-genshin-start-s2" />
        <div
          className="sp-genshin-start-s3"
          ref={(ref) => {
            this.lastSceneRef = ref;
          }}
        />
      </div>
    );
  }
}
