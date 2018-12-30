// export default () => (
//   <div className="x">
//     <div className="x-header">OnlineJudge <span className="x-ver">3</span></div>
//     <div className="x-section">
//       <span className="x-sub" style={{ textAlign: 'right', visibility: 'hidden' }}>Dynamic</span> • <span className="x-sub" style={{ textAlign: 'left' }}>Humanized</span>
//     </div>
//   </div>
// );
import Markdown from 'react-markdown';

const content = `
# 欢迎来到 Online Judge 3 内测

## 内测守则

请遵守以下 OJ 守则。SDUTACM 有权在违反守则时注销您的 OJBK 并保留解释权利。

- 禁止任何形式的租借、买卖、赠送以及分享 OJBK
- 允许在多台自己的设备上激活 OJBK。但禁止在激活 OJBK 的设备上向他人提供内测体验
- 禁止对外公开界面截图、功能等。小范围的轻量「剧透」是允许的，但请帮助我们保持 OJ 3 的神秘感
- 禁止使用 OJ 3 参与任何比赛或测验
- 禁止利用 OJ 3 的漏洞进行非法操作

## 反馈与建议

在内测期间，你可以随时体验 OJ 3。我们设置了内测的问题反馈与跟进平台。如果你发现任何问题或建议，请及时提出，以帮助我们进一步完善。

问题反馈与跟进：[点击进入](https://github.com/sdutacm/onlinejudge3-issues)

请至少拥有一个 GitHub 帐号，按照上方链接中的指引参与问题反馈。

`;

export default () => (
  <div className="content-view-sm" style={{ marginTop: '60px' }}>
    <Markdown source={content} linkTarget="_blank" />
  </div>
);
