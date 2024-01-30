import React from 'react';
import { Skeleton, Table } from 'antd';
import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import { numberToAlphabet } from '@/utils/format';
import classNames from 'classnames';
import 'katex/dist/katex.min.css';
import AutoLaTeX from 'react-autolatex';
import ProblemDifficulty from './ProblemDifficulty';
import { IProblemSpConfig } from '@/common/interfaces/problem';
import { loadCustomFont, getCustomFontStyleForReact } from '@/utils/customFont';
import ReactPlayer from 'react-player/file';
import { userActiveEmitter, UserActiveEvents } from '@/events/userActive';
import { randomlyPickOne } from '@/utils/misc';

export interface Props {
  loading: boolean;
  data: IProblem;
  problemIndex?: number;
  problemAlias?: string;
}

export interface State {
  audioPlaying: boolean;
}

class ProblemContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      audioPlaying: false,
    };
  }

  componentDidMount() {
    this.handleProblem(this.props.data);
  }

  componentWillReceiveProps(np: Props) {
    const p = this.props;
    if (np.data !== p.data) {
      this.handleProblem(np.data);
    }
  }

  componentWillUnmount() {
    userActiveEmitter.off(UserActiveEvents.UserHasBeenActive, this.playAudio);
  }

  handleProblem(data: IProblem) {
    this.execScript(data);
    this.handleFont(data);
  }

  handleFont = (detail: IProblem) => {
    const spConfig = detail?.spConfig || ({} as IProblemSpConfig);
    loadCustomFont(spConfig.customFontFamily);
  };

  getFontStyle = () => {
    const spConfig = this.props.data?.spConfig || ({} as IProblemSpConfig);
    return getCustomFontStyleForReact(spConfig.customFontFamily);
  };

  execScript = (data) => {
    try {
      const hint = data?.hint;
      const script = /<script>([\s\S]*)<\/script>/.exec(hint)?.[1];
      if (script) {
        // eslint-disable-next-line no-eval
        eval(script);
      }
    } catch (e) {}
  };

  handleAudioReady = () => {
    if (
      // @ts-ignore
      ('userActivation' in navigator && navigator.userActivation.hasBeenActive) ||
      // @ts-ignore
      window._userHasBeenActive
    ) {
      this.playAudio();
    } else {
      userActiveEmitter.on(UserActiveEvents.UserHasBeenActive, this.playAudio);
    }
  };

  playAudio = () => {
    console.log('Play on entered audio');
    this.setState({
      audioPlaying: true,
    });
  };

  renderContent = (html: string) => {
    return (
      <div style={this.getFontStyle()}>
        <AutoLaTeX>{html}</AutoLaTeX>
      </div>
    );
  };

  render() {
    const { loading, data, problemIndex, problemAlias } = this.props;
    if (loading) {
      return (
        <div>
          <Skeleton
            active
            paragraph={{ rows: 0 }}
            title={{ width: '100%' }}
            className="problem-content-skeleton-title"
          />
          <Skeleton active paragraph={{ rows: 4 }} title={{ width: '31.5%' }} />
          <Skeleton active paragraph={{ rows: 3 }} title={{ width: '14%' }} />
          <Skeleton active paragraph={{ rows: 3 }} title={{ width: '19%' }} />
        </div>
      );
    }

    const spConfig = (data.spConfig || {}) as IProblemSpConfig;
    const description = (data.description || '').replace(/^&nbsp;/, '');
    const input = (data.input || '').replace(/^&nbsp;/, '');
    const output = (data.output || '').replace(/^&nbsp;/, '');
    const hint = (data.hint || '').replace(/^&nbsp;/, '');
    const titlePrefix =
      typeof problemAlias === 'string'
        ? `${problemAlias} - `
        : problemIndex && Number.isInteger(problemIndex)
        ? `${numberToAlphabet(problemIndex)} - `
        : null;

    const audioConf = spConfig.onEnteredAudio;
    const urls = audioConf?.urls || [];
    const toUseOnEnteredAudioUrl = audioConf?.playMode === 'random' ? randomlyPickOne(urls) : urls[0];

    return (
      <div
        className={classNames(
          'problem-content',
          'content-area',
          'problem-content',
          'content-loaded',
        )}
      >
        <h2
          className="text-center"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <ProblemDifficulty difficulty={data.difficulty} className="mr-md-lg" />
          <span>
            {titlePrefix}
            <span style={this.getFontStyle()}>{data.title}</span>
          </span>
        </h2>

        {description && (
          <>
            <h3>Description</h3>
            {this.renderContent(data.description)}
          </>
        )}

        {input && (
          <>
            <h3>Input</h3>
            {this.renderContent(input)}
          </>
        )}

        {output && (
          <>
            <h3>Output</h3>
            {this.renderContent(output)}
          </>
        )}

        {data.samples && (
          <>
            <h3>Samples</h3>
            {data.samples.map((sample, index) => (
              <div key={`sample-${index}`} className="problem-sample-block">
                <h4 className="problem-content-sub-section-header">Sample #{index + 1}</h4>
                <div className="problem-sample-block-grid">
                  <div className="problem-sample-block-grid-item">
                    <h5 className="problem-sample-block-title">
                      Input <CopyToClipboardButton text={sample.in} addNewLine />
                    </h5>
                  </div>
                  <div className="problem-sample-block-grid-item">
                    <h5 className="problem-sample-block-title">
                      Output <CopyToClipboardButton text={sample.out} addNewLine />
                    </h5>
                  </div>
                  <div className="problem-sample-block-grid-item">
                    <pre>{sample.in}</pre>
                  </div>
                  <div className="problem-sample-block-grid-item">
                    <pre>{sample.out}</pre>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {hint && (
          <>
            <h3>Hint</h3>
            {this.renderContent(hint)}
          </>
        )}

        {!!toUseOnEnteredAudioUrl && (
          <ReactPlayer
            url={toUseOnEnteredAudioUrl}
            playing={this.state.audioPlaying}
            onReady={this.handleAudioReady}
            onError={console.error}
            style={{ display: 'none' }}
          />
        )}
      </div>
    );
  }
}

export default ProblemContent;
