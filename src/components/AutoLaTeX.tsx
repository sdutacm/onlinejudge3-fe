import React from 'react';
import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/dist/contrib/auto-render';

interface Props {
  content: string;
}

interface State {
}

class AutoLaTeX extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  container: HTMLElement = null;

  renderLaTeX = () => {
    if (!this.container) {
      return;
    }
    renderMathInElement(
      this.container,
      {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\\\[", right: "\\\\]", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\\\(", right: "\\\\)", display: false },
        ],
      },
    );
  };

  componentDidMount(): void {
    this.renderLaTeX();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    this.renderLaTeX();
  }

  render() {
    return (
      <div ref={container => this.container = container} dangerouslySetInnerHTML={{ __html: this.props.content }}></div>
    );
  }
}

export default AutoLaTeX;
