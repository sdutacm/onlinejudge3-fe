import React from 'react';
import { Skeleton, Table } from 'antd';
import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import { numberToAlphabet } from '@/utils/format';
import classNames from 'classnames';
import 'katex/dist/katex.min.css';
import AutoLaTeX from 'react-autolatex';
import ProblemDifficulty from './ProblemDifficulty';

export interface Props {
  loading: boolean;
  data: IProblem;
  problemIndex?: number;
}

class ProblemContent extends React.Component<Props> {
  componentDidMount() {
    this.execScript(this.props.data);
  }

  componentWillReceiveProps(np: Props) {
    const p = this.props;
    if (np.data !== p.data) {
      this.execScript(np.data);
    }
  }

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

  render() {
    const { loading, data, problemIndex } = this.props;
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

    const description = (data.description || '').replace(/^&nbsp;/, '');
    const input = (data.input || '').replace(/^&nbsp;/, '');
    const output = (data.output || '').replace(/^&nbsp;/, '');
    const hint = (data.hint || '').replace(/^&nbsp;/, '');
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
          {Number.isInteger(problemIndex)
            ? `${numberToAlphabet(problemIndex)} - ${data.title}`
            : data.title}
        </h2>

        {description && (
          <>
            <h3>Description</h3>
            <AutoLaTeX>{data.description}</AutoLaTeX>
          </>
        )}

        {input && (
          <>
            <h3>Input</h3>
            <AutoLaTeX>{input}</AutoLaTeX>
          </>
        )}

        {output && (
          <>
            <h3>Output</h3>
            <AutoLaTeX>{output}</AutoLaTeX>
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
                      Output <CopyToClipboardButton text={sample.in} addNewLine />
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
            <AutoLaTeX>{hint}</AutoLaTeX>
          </>
        )}
      </div>
    );
  }
}

export default ProblemContent;
