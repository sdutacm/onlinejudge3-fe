import React, { Children } from 'react';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table/interface';
import { Howl } from 'howler';

export interface IGenshinTableProps<T> extends TableProps<T> {}

interface State {}

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

  handleGenshinWindowResize = () => {
    const genshinSectionHeaderEle = document.querySelector(
      '.genshin-section-header',
    ) as HTMLElement;
    if (!genshinSectionHeaderEle) {
      return;
    }
    const genshinSectionHeaderWidth = genshinSectionHeaderEle.offsetWidth;
    const genshinTableTitleColumnWidth = genshinSectionHeaderWidth - 460 + 'px';
    // console.log('!header width', genshinSectionHeaderWidth, 'Column width', genshinTableTitleColumnWidth)
    const genshinTableRowTitleEle = document.querySelectorAll(
      '.genshin-section-table-title a span',
    ) as NodeListOf<HTMLElement>;
    genshinTableRowTitleEle.forEach((el) => {
      el.style.maxWidth = genshinTableTitleColumnWidth;
    });
  };

  componentDidMount(): void {
    const genshinTableRowEle = document.querySelectorAll('.genshin-section-table-row');
    genshinTableRowEle.forEach((el) => {
      el.addEventListener('click', this.handleGenshinTableRowClick);
    });
    this.handleGenshinWindowResize();
    window.addEventListener('resize', this.handleGenshinWindowResize);
  }

  componentWillUpdate(
    nextProps: Readonly<IGenshinTableProps<T>>,
    nextState: Readonly<State>,
    nextContext: any,
  ): void {
    const genshinTableRowEle = document.querySelectorAll('.genshin-section-table-row');
    genshinTableRowEle.forEach((el) => {
      el.removeEventListener('click', this.handleGenshinTableRowClick);
    });
    window.removeEventListener('resize', this.handleGenshinWindowResize);
  }

  componentDidUpdate(
    prevProps: Readonly<IGenshinTableProps<T>>,
    prevState: Readonly<State>,
    snapshot?: any,
  ): void {
    const genshinTableRowEle = document.querySelectorAll('.genshin-section-table-row');
    genshinTableRowEle.forEach((el) => {
      el.addEventListener('click', this.handleGenshinTableRowClick);
    });
    this.handleGenshinWindowResize();
    window.addEventListener('resize', this.handleGenshinWindowResize);
  }

  componentWillUnmount(): void {
    const genshinTableRowEle = document.querySelectorAll('.genshin-section-table-row');
    genshinTableRowEle.forEach((el) => {
      el.removeEventListener('click', this.handleGenshinTableRowClick);
    });
    window.removeEventListener('resize', this.handleGenshinWindowResize);
  }

  render(): React.ReactNode {
    const { children, ...restProps } = this.props;

    return <Table {...restProps}>{children}</Table>;
  }
}
