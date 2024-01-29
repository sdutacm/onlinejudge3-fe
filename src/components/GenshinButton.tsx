import React from 'react';
import style from './GenshinButton.less'
import classNames from 'classnames';

export interface IGenshinButtonProps {
  text: string;
  iconType?: "default" | "cancel" | "complete";
}

interface State { }

class GenshinButton extends React.Component<IGenshinButtonProps, State> {
  constructor(props: IGenshinButtonProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { text, iconType = "default" } = this.props;

    return (
      <div className={style.genshinButton}>
        <div className={classNames(
          style.icon,
          `genshin-btn-${iconType}`
        )} ></div>
        <span className={style.text}>{text}</span>
      </div>
    )
  }
}

export default GenshinButton;
