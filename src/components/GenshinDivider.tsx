import React from 'react';
import style from './GenshinDivider.less'

const GenshinDivider: React.FC = () => (
  <div className={style.genshinDivider}>
    <div className={style.left}></div>
    <div className={style.line}></div>
    <div className={style.right}></div>
  </div>
)

export default GenshinDivider;
