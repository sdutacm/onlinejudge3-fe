import React from 'react';
import style from './GenshinButton.less';
import classNames from 'classnames';

export interface IGenshinButtonProps {
  buttonType?: 'default' | 'text' | 'icon';
  theme?: 'light' | 'dark';
  text?: string;
  iconType?: 'default' | 'cancel' | 'complete' | 'help';
  loading?: boolean;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
}

interface State {}

class GenshinButton extends React.Component<IGenshinButtonProps, State> {
  constructor(props: IGenshinButtonProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { text, buttonType, iconType = 'default', theme = 'dark' } = this.props;

    const width = buttonType === 'icon' ? '36px' : '220px';
    const height = '36px';

    return (
      <div
        className={classNames(style.genshinButton, theme === 'light' ? style.light : null)}
        style={{ width, height, ...this.props?.style }}
        onClick={(e) => {
          if (this.props.onClick && !this.props.loading) {
            this.props.onClick(e);
          }
        }}
      >
        {buttonType !== 'text' && (
          <div
            className={classNames(style.icon, `genshin-btn-${iconType}`)}
            style={{
              top: '50%',
              left: buttonType === 'icon' ? '50%' : '2px',
              transform: buttonType === 'icon' ? 'translate(-50%, -50%)' : 'translate(0, -50%)',
            }}
          />
        )}
        {buttonType !== 'icon' && <span className={style.text}>{text}</span>}
      </div>
    );
  }
}

export default GenshinButton;
