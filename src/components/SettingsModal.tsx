import React from 'react';
import { connect } from 'dva';
import { Radio, Modal, Switch } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import tracker from '@/utils/tracker';
import Explanation from './Explanation';
import { matchPath, withRouter } from 'react-router';
import pages from '@/configs/pages';

export interface Props extends ReduxProps, RouteProps {
  settings: ISettings;
  onClickShowModal?: React.MouseEventHandler;
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

  handleShowModel = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ visible: true });
    this.props.onClickShowModal && this.props.onClickShowModal(e);
    tracker.event({
      category: 'component.NavMenu',
      action: 'showSettings',
    });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  handleThemeChange = (e) => {
    this.props.dispatch({
      type: 'settings/setTheme',
      payload: { theme: e.target.value },
    });
    tracker.event({
      category: 'settings',
      action: 'changeTheme',
      label: e.target.value,
    });
  };

  handleColorChange = (e) => {
    this.props.dispatch({
      type: 'settings/setColor',
      payload: { color: e.target.value },
    });
    tracker.event({
      category: 'settings',
      action: 'changeColor',
      label: e.target.value,
    });
  };

  handleImproveAnimationChange = (checked) => {
    this.props.dispatch({
      type: 'settings/setImproveAnimation',
      payload: { improveAnimation: checked },
    });
    tracker.event({
      category: 'settings',
      action: 'changeImproveAnimation',
      label: checked ? 'true' : 'false',
    });
  };

  handleProMode = (checked) => {
    this.props.dispatch({
      type: 'settings/setProMode',
      payload: { proMode: checked },
    });
    tracker.event({
      category: 'settings',
      action: 'changeProMode',
      label: checked ? 'true' : 'false',
    });
  };

  handleUseAbsoluteTime = (checked) => {
    this.props.dispatch({
      type: 'settings/setUseAbsoluteTime',
      payload: { useAbsoluteTime: checked },
    });
    tracker.event({
      category: 'settings',
      action: 'changeUseAbsoluteTime',
      label: checked ? 'true' : 'false',
    });
  };

  render() {
    const { children, settings, location } = this.props;
    // const matchForceDarkPage = matchPath(location.pathname, {
    //   path: pages.competitions.public.intro,
    //   // exact: true,
    // });
    const matchForceDarkPage = false;

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Settings"
          visible={this.state.visible}
          onOk={this.handleHideModel}
          onCancel={this.handleHideModel}
          footer={null}
        >
          <div className="settings-item">
            <span>Theme</span>
            <Radio.Group
              onChange={this.handleThemeChange}
              value={settings.theme}
              size="small"
              className="float-right"
              disabled={!!matchForceDarkPage}
            >
              <Radio.Button value="auto">Auto</Radio.Button>
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="dark">Dark</Radio.Button>
            </Radio.Group>
          </div>
          <div className="settings-item">
            <span>
              Color
              <Explanation className="ml-sm-md">
                The setting effects color style of problem status bar, solution result and ranklist.
              </Explanation>
            </span>
            <Radio.Group
              onChange={this.handleColorChange}
              defaultValue={settings.color}
              size="small"
              className="float-right"
            >
              <Radio.Button value="default">Default</Radio.Button>
              <Radio.Button value="colorful">Colorful</Radio.Button>
              <Radio.Button value="colorblind-dp">Colorblind</Radio.Button>
            </Radio.Group>
          </div>
          <div className="settings-item">
            <span>
              Improve Animation
              <Explanation className="ml-sm-md">
                The setting effects animation.
                <br />
                If "Improve Animation" is enabled, more animation effects will be displayed.
              </Explanation>
            </span>
            <Switch
              className="float-right"
              defaultChecked={settings.improveAnimation}
              onChange={this.handleImproveAnimationChange}
            />
          </div>
          <div className="settings-item">
            <span>
              Pro Mode
              <Explanation className="ml-sm-md">
                The setting effects some pro features.
                <br />
                If "Pro Mode" is enabled, more features like "ID View" and "Force Refresh" will be
                available.
              </Explanation>
            </span>
            <Switch
              className="float-right"
              defaultChecked={settings.proMode}
              onChange={this.handleProMode}
            />
          </div>
          <div className="settings-item">
            <span>
              Use Absolute Time
              <Explanation className="ml-sm-md">
                The setting effects time display.
                <br />
                If "Use Absolute Time" is enabled, OJ will use absolute time instead of relative time to display.
              </Explanation>
            </span>
            <Switch
              className="float-right"
              defaultChecked={settings.useAbsoluteTime}
              onChange={this.handleUseAbsoluteTime}
            />
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

export default connect(mapStateToProps)(withRouter(SettingsModal));
