import React from 'react';
import { Skeleton } from 'antd';
import { filterXSS as xss } from 'xss';
import styles from './ProblemContent.less';
import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import { numberToAlphabet } from '@/utils/format';
import classNames from 'classnames';
import 'katex/dist/katex.min.css';
import AutoLaTeX from 'react-autolatex';

export interface Props {
  loading: boolean;
  data: IProblem;
  problemIndex?: number;
}

const ProblemContent: React.StatelessComponent<Props> = ({ loading, data, problemIndex }) => {
  if (loading) {
    return (
      <div>
        <Skeleton
          active
          paragraph={{ rows: 0 }} title={{ width: '100%' }}
          className={styles.problemContentSkeletonTitle} />
        <Skeleton active paragraph={{ rows: 4 }} title={{ width: '31.5%' }} />
        <Skeleton active paragraph={{ rows: 3 }} title={{ width: '14%' }} />
        <Skeleton active paragraph={{ rows: 3 }} title={{ width: '19%' }} />
      </div>
    );
  }
  return (
    <div className={classNames(styles.problemContent, 'problem-content', 'content-area')}>
      <h2 className="text-center">{Number.isInteger(problemIndex) ? `${numberToAlphabet(problemIndex)} - ${data.title}` : data.title}</h2>

      {data.description && <h3>Description</h3>}
      <AutoLaTeX>{xss(data.description)}</AutoLaTeX>

      {data.input && <h3>Input</h3>}
      <AutoLaTeX>{xss(data.input)}</AutoLaTeX>

      {data.output && <h3>Output</h3>}
      <AutoLaTeX>{xss(data.output)}</AutoLaTeX>

      {(data.sampleInput || data.sampleOutput) && <h3>Sample</h3>}
      {data.sampleInput && <h4 className={styles.problemSubSectionHeader}>Input&nbsp;<CopyToClipboardButton text={data.sampleInput} addNewLine /></h4>}
      {data.sampleInput && <pre>{data.sampleInput}</pre>}
      {data.sampleOutput && <h4 className={styles.problemSubSectionHeader}>Output&nbsp;<CopyToClipboardButton text={data.sampleOutput} addNewLine /></h4>}
      {data.sampleOutput && <pre>{data.sampleOutput}</pre>}

      {data.hint && <h3>Hint</h3>}
      <AutoLaTeX>{xss(data.hint)}</AutoLaTeX>
    </div>
  );
};

export default ProblemContent;
