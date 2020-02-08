import React from 'react';
import { connect } from 'dva';
import { Badge, Popover } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import tracker from '@/utils/tracker';

export interface Props extends ReduxProps, RouteProps {
  difficulty: number;
  color: ISettings['color'];
  className?: string;
  style?: React.CSSProperties;
}

interface State {
  visible: boolean;
}

const difficultyPrompt = {
  1: 'Lv.1: Beginning',
  2: 'Lv.2: Basic Programming',
  3: 'Lv.3: Primary Data Structures',
  4: 'Lv.4: Data Structures and Algorithm',
  5: 'Lv.5: almost Regional',
  6: 'Lv.6: Regional Bronze',
  7: 'Lv.7: Regional Silver',
  8: 'Lv.8: Regional Gold',
  9: 'Lv.9: Final',
  10: 'Lv.10: Supreme',
};

class ProblemDifficulty extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  render() {
    const { difficulty, color, className = '', style } = this.props;
    if (!difficulty) {
      return null;
    }

    return (
      <Popover
        title="Difficulty"
        content={difficultyPrompt[difficulty]}
        onVisibleChange={(visible) => {
          if (visible) {
            tracker.event({
              category: 'component.ProblemDifficulty',
              action: 'showPopover',
            });
          }
        }}
      >
        <Badge
          count={difficulty}
          title={`Difficulty: Lv.${difficulty}`}
          className={'problem-difficulty user-select-none ' + className}
          style={style}
        />
      </Popover>
    );
  }
}

function mapStateToProps(state) {
  return {
    color: state.settings.color,
  };
}

export default connect(mapStateToProps)(ProblemDifficulty);
