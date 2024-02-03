import React, { Children } from 'react';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table/interface';

export interface IGenshinTableProps<T> extends TableProps<T> { }

interface State { }


export default class GenshinTable<T> extends React.Component<IGenshinTableProps<T>, State> {
  constructor(props: IGenshinTableProps<T>) {
    super(props);
    this.state = {};
  }

  handleGenshinTableRowClick = () => {
    const sound = new Howl({
      src: [`${process.env.PUBLIC_PATH}assets/music/Genshin_UIAudio_ThirdParty_ItemClick.mp3`],
    });
    sound.play();
  };

  componentDidMount(): void {
    const genshinTableRowEle = document.querySelectorAll('.genshin-section-table-row');
    genshinTableRowEle.forEach((el) => {
      el.addEventListener('click', this.handleGenshinTableRowClick);
    });
  }

  componentWillUpdate(nextProps: Readonly<IGenshinTableProps<T>>, nextState: Readonly<State>, nextContext: any): void {
    const genshinTableRowEle = document.querySelectorAll('.genshin-section-table-row');
    genshinTableRowEle.forEach((el) => {
      el.removeEventListener('click', this.handleGenshinTableRowClick);
    });
  }

  componentDidUpdate(prevProps: Readonly<IGenshinTableProps<T>>, prevState: Readonly<State>, snapshot?: any): void {
    const genshinTableRowEle = document.querySelectorAll('.genshin-section-table-row');
    genshinTableRowEle.forEach((el) => {
      el.addEventListener('click', this.handleGenshinTableRowClick);
    });
  }

  componentWillUnmount(): void {
    const genshinTableRowEle = document.querySelectorAll('.genshin-section-table-row');
    genshinTableRowEle.forEach((el) => {
      el.removeEventListener('click', this.handleGenshinTableRowClick);
    });
  }

  render(): React.ReactNode {
    const {
      children,
      ...restProps
    } = this.props;

    return (
      <>
        <Table {...restProps}>
          {children}
        </Table>
      </>
    )
  }
}