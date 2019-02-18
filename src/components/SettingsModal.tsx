import React from 'react';
import { connect } from 'dva';
import { Radio, Modal } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';

interface Props extends ReduxProps, RouteProps {
  settings: ISettings;
}

interface State {
  visible: boolean;
}

class SettingsModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handleShowModel = e => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ visible: true });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  handleThemeChange = (e) => {
    this.props.dispatch({
      type: 'settings/setTheme',
      payload: { theme: e.target.value },
    });
  };

  handleColorChange = (e) => {
    this.props.dispatch({
      type: 'settings/setColor',
      payload: { color: e.target.value },
    });
  };

  render() {
    const { children, settings } = this.props;

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Settings"
          visible={this.state.visible}
          onOk={this.handleHideModel}
          onCancel={this.handleHideModel}
        >
          <div className="settings-item">
            <span>Theme</span>
            <Radio.Group onChange={this.handleThemeChange}
                         defaultValue={settings.theme}
                         size="small"
                         className="float-right"
            >
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="dark">Dark</Radio.Button>
            </Radio.Group>
          </div>
          <div className="settings-item">
            <span>Color</span>
            <Radio.Group onChange={this.handleColorChange}
                         defaultValue={settings.color}
                         size="small"
                         className="float-right"
            >
              <Radio.Button value="default">Default</Radio.Button>
              <Radio.Button value="colorful">Colorful</Radio.Button>
              <Radio.Button value="colorblind-dp">Colorblind</Radio.Button>
            </Radio.Group>
          </div>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    settings: state.settings,
  };
}

export default connect(mapStateToProps)(SettingsModal);
