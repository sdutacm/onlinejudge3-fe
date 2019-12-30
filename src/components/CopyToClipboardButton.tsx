import React from 'react';
import { Tooltip, Icon } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import tracker from '@/utils/tracker';

export interface Props {
  text: string; // text to copy
  addNewLine: boolean; // whether auto-add '\n' at the end of the text
}

interface State {
  textToCopy: string;
  copied: boolean;
}

class CopyToClipboardButton extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    text: '',
    addNewLine: false,
  };

  constructor(props) {
    super(props);
    let textToCopy = props.text;
    while (props.addNewLine && !textToCopy.endsWith('\n\n')) {
      textToCopy += '\n';
    }
    this.state = {
      textToCopy,
      copied: false,
    };
  }

  render() {
    return (
      <Tooltip
        title="Copied!" visible={this.state.copied}
        onVisibleChange={(visible) => !visible && this.setState({ copied: false })}>
        <CopyToClipboard
          text={this.state.textToCopy}
          onCopy={(text: string, result: boolean) => {
            if (result) {
              this.setState({ copied: true });
              tracker.event({
                category: 'component.CopyToClipboardButton',
                action: 'copy',
              });
            }
          }}>
          <Icon type="copy" theme="outlined" className="pointer" />
        </CopyToClipboard>
      </Tooltip>
    );
  }
}

export default CopyToClipboardButton;
