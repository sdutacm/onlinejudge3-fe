import React from 'react';
import { Link } from 'react-router-dom';
import { Collapse, Divider, Spin } from 'antd';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';
import moment from 'moment';
import msg from '@/utils/msg';
import { filterXSS as xss } from 'xss';
import { ReduxProps } from '@/@types/props';
import SendMessageModal from '@/components/SendMessageModal';
import tracker from '@/utils/tracker';

interface Props extends ReduxProps {
  count: number;
  rows: IMessage[];
  type?: 'received' | 'sent';
}

interface State {
}

class MessageList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    type: 'received',
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { count, rows, type, loading, dispatch } = this.props;
    if (!count) {
      return (
        <div>
          <div className="text-center" style={{ lineHeight: '60px' }}>No New Message</div>
          <Divider style={{ margin: '0' }} />
        </div>
      );
    }
    return (
      <Spin spinning={loading}>
        <Collapse bordered={false} className="message-list" onChange={(panels) => {
          if (panels.length) {
            tracker.event({
              category: 'messages',
              action: 'expand',
            });
          } else {
            tracker.event({
              category: 'messages',
              action: 'fold',
            });
          }
        }}>
          {rows.map(m => <Collapse.Panel
            showArrow={false}
            key={`${m.messageId}`}
            header={<div>
              <div style={{ opacity: type === 'received' && m.read ? 0.4 : 1 }}>
                <a className="normal-text-link">{m.title}</a>
              </div>
              <div className="message-footer">
                {type === 'received' ?
                  (m.from && m.from.userId ?
                    <Link
                      to={urlf(pages.users.detail, { param: { id: m.from.userId } })}
                      className="normal-text-link"
                      onClick={e => e.stopPropagation()}
                    >{m.from.nickname}</Link> :
                    <span>{m.anonymous ? 'Anonymous' : 'System'}</span>) :
                  (m.to && m.to.userId ?
                    <Link
                      to={urlf(pages.users.detail, { param: { id: m.to.userId } })}
                      className="normal-text-link"
                      onClick={e => e.stopPropagation()}
                    >{m.to.nickname}</Link> :
                    <span>Unknown</span>)
                }
                <span className="ml-md-lg">{moment(m.createdAt * 1000).fromNow()}</span>
                {type === 'received' && !m.read &&
                <a className="ml-md-lg mark-as-read" onClick={e => {
                  e.stopPropagation();
                  dispatch({
                    type: 'messages/markRead',
                    payload: {
                      id: m.messageId,
                      read: true,
                    },
                  }).then(ret => {
                    msg.auto(ret);
                    tracker.event({
                      category: 'messages',
                      action: 'markAsRead',
                    });
                  });
                }}>Mark as read</a>}
                {type === 'received' && m.from && m.from.userId &&
                <SendMessageModal toUserId={m.from.userId}>
                  <span className="ml-md-lg mark-as-read">Reply</span>
                </SendMessageModal>}
              </div>
            </div>}>
            <div
              dangerouslySetInnerHTML={{ __html: xss(m.content.replace(/\n/g, '<br />')) }}
              style={{ wordWrap: 'break-word' }}
            />
          </Collapse.Panel>
          )}
        </Collapse>
      </Spin>
    );
  }
}

export default MessageList;
