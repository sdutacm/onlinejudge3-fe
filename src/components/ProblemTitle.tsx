import React from 'react';
import { loadCustomFont, getCustomFontStyleForReact } from '@/utils/customFont';
import { IProblemSpConfig } from '@/common/interfaces/problem';

export interface Props {
  problem: IProblem | IProblemLite;
  fallback?: React.ReactNode | null;
}

export default class ProblemTitle extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    loadCustomFont(
      ((this.props.problem as IProblem).spConfig as IProblemSpConfig)?.customFontFamily,
    );
  }

  componentWillReceiveProps(nextProps: Readonly<Props>): void {
    if (this.props.problem !== nextProps.problem && nextProps.problem) {
      loadCustomFont(
        ((nextProps.problem as IProblem).spConfig as IProblemSpConfig)?.customFontFamily,
      );
    }
  }

  render() {
    const { problem, fallback } = this.props;
    if (!problem) {
      return fallback || null;
    }
    return (
      <span style={getCustomFontStyleForReact((problem as IProblem).spConfig?.customFontFamily)}>
        {problem.title}
      </span>
    );
  }
}
