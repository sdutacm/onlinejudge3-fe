import React from 'react';
import style from './GenshinButton.less';
import classNames from 'classnames';

export interface IGenshinButtonProps {
  buttonType?: 'default' | 'text' | 'icon' | 'auto';
  theme?: 'light' | 'dark';
  text?: string;
  iconType?: 'default' | 'cancel' | 'complete' | 'help';
  loading?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
}

interface State { }

class GenshinButton extends React.Component<IGenshinButtonProps, State> {
  static defaultProps: Partial<IGenshinButtonProps> = {
    buttonType: 'default',
    theme: 'dark',
    iconType: 'default',
    disabled: false,
  };

  constructor(props: IGenshinButtonProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      buttonType,
      theme,
      text,
      iconType,
      loading,
      disabled,
    } = this.props;

    return (
      <div
        className={classNames(
          style.genshinButton,
          theme === 'light' ? style.light : null,
          buttonType === 'auto' ? style.autoLayout : null,
          buttonType === 'icon' ? style.iconLayout : null,
          disabled || loading ? style.disabled : null
        )}
        style={this.props?.style}
        onClick={(e) => {
          if (this.props.onClick && !loading && !disabled) {
            this.props.onClick(e);
          }
        }}
      >
        {buttonType !== 'text' &&
          <div className={classNames(style.icon, `genshin-btn-${iconType}`)} />}
        {buttonType !== 'icon' &&
          <span className={style.text}>{text}</span>}
      </div>
    );
  }
}

export default GenshinButton;
