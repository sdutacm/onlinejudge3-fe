import React from 'react';
import { Skeleton } from 'antd';
import { filterXSS as xss } from 'xss';
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

        {data.description && <h3>Description</h3>}
        <AutoLaTeX>{data.description}</AutoLaTeX>

        {data.input && <h3>Input</h3>}
        <AutoLaTeX>{data.input}</AutoLaTeX>

        {data.output && <h3>Output</h3>}
        <AutoLaTeX>{data.output}</AutoLaTeX>

        {(data.sampleInput || data.sampleOutput) && <h3>Sample</h3>}
        {data.sampleInput && (
          <h4 className="problem-content-sub-section-header">
            Input&nbsp;
            <CopyToClipboardButton text={data.sampleInput} addNewLine />
          </h4>
        )}
        {data.sampleInput && <pre>{data.sampleInput}</pre>}
        {data.sampleOutput && (
          <h4 className="problem-content-sub-section-header">
            Output&nbsp;
            <CopyToClipboardButton text={data.sampleOutput} addNewLine />
          </h4>
        )}
        {data.sampleOutput && <pre>{data.sampleOutput}</pre>}

        {data.hint && <h3>Hint</h3>}
        <AutoLaTeX>{data.hint}</AutoLaTeX>
      </div>
    );
  }
}

export default ProblemContent;
