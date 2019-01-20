import React from 'react';
import { Link } from 'react-router-dom';
import { Collapse, Divider } from 'antd';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';
import moment from 'moment';
import msg from '@/utils/msg';
import xss from 'xss';
import { ReduxProps } from '@/@types/props';

interface Props extends ReduxProps {
  count: number;
  rows: IMessage[];
}

interface State {
}

class MessageList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { count, rows, dispatch } = this.props;
    if (!count) {
      return (
        <div>
          <div className="text-center" style={{ lineHeight: '60px' }}>No New Message</div>
          <Divider style={{ margin: '0' }} />
        </div>
      );
    }
    return (
      <Collapse bordered={false} className="message-list">
        {rows.map(m =>
          <Collapse.Panel showArrow={false}
                          key={`${m.messageId}`}
                          header={<div>
                            <div style={{ opacity: m.read ? 0.4 : 1 }}><a className="normal-text-link">{m.title}</a></div>
                            <div className="message-footer">
                              {m.from && m.from.userId ?
                                <Link to={urlf(pages.users.detail, { param: { id: m.from.userId } })}
                                      className="normal-text-link"
                                      onClick={e => e.stopPropagation()}
                                >{m.from.nickname}</Link> :
                                <span>System</span>
                              }
                              <span className="ml-md-lg">{moment(m.createdAt * 1000).fromNow()}</span>
                              {!m.read &&
                              <a className="ml-md-lg mark-as-read" onClick={e => {
                                e.stopPropagation();
                                dispatch({
                                  type: 'messages/markRead',
                                  payload: {
                                    id: m.messageId,
                                    read: true,
                                  },
                                }).then(ret => msg.auto(ret));
                              }}>Mark as read</a>}
                            </div>
                          </div>}>
            <div dangerouslySetInnerHTML={{ __html: xss(m.content.replace(/\n/g, '<br />')) }} />
          </Collapse.Panel>
        )}
      </Collapse>
    );
  }
}

export default MessageList;
