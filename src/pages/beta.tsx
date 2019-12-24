/* eslint-disable */
import React from 'react';
import { connect } from 'dva';
import { Form, Button, Row, Col, Card, Icon, Carousel, Table, Pagination, Avatar, Select, Radio, Popover, Tag, Switch, Input, Modal } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import setStatePromise from '@/utils/setStatePromise';
import PageTitle from '@/components/PageTitle';
import classNames from 'classnames';
import ProblemContent from '@/components/ProblemContent';
import styles from '@/components/ProblemDetailPage.less';
import ProblemBar from '@/components/ProblemBar';
import UserBar from '@/components/UserBar';
import { ContestTypes } from '@/configs/contestTypes';
import ResultBar from '@/components/ResultBar';
import langs, { langsMap } from '@/configs/solutionLanguages';
import TimeBar from '@/components/TimeBar';
import limits from '@/configs/limits';
import ToDetailCard from '@/components/ToDetailCard';
import FilterCard from '@/components/FilterCard';
import Results from '@/configs/results/resultsEnum';
import results from '@/configs/results';
import moment from 'moment';
import TimeStatusBadge from '@/components/TimeStatusBadge';
import { toLongTs, numberToAlphabet, formatAvatarUrl } from '@/utils/format';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import SolutionResultStats from '@/components/SolutionResultStats';
import { filterXSS as xss } from 'xss';
import constants from '@/configs/constants';
import SolutionCalendar from '@/components/SolutionCalendar';
import Rating from '@/components/Rating';
import userStyles from './users/$id.less';
import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight, atomOneDark } from 'react-syntax-highlighter/styles/hljs';
import request from '@/utils/request';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import throttle from 'lodash.throttle';

const NAME = 'OnlineJudge 3';
const loading = false;
const session = { loggedIn: true, user: { "userId": 1, "username": "root", "nickname": "hack", "avatar": "\/UploadFile\/Image\/1291789239.gif", "permission": 3 } };
const demoData = {
  problemDetail: { "problemId": 1000, "title": "A+B Problem", "description": "<p>Calculate a+b.<\/p>\r\n", "input": "<p>Two integer a, b (0 &lt;= a, b &lt;= 10).<\/p>\r\n", "output": "<p>Output a+b.<\/p>\r\n", "sampleInput": "1 2", "sampleOutput": "3", "hint": "", "source": "", "author": "1", "timeLimit": 1000, "memoryLimit": 65536, "difficulty": 0, "createdAt": 1285246719, "spj": false, "updatedAt": 0 },
  contest: {
    detail: { "contestId": 2100, "title": "SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a", "type": 2, "category": 0, "intro": "", "description": "<p>&nbsp;&nbsp;&nbsp;&nbsp;要求：诚信、自律、主动、专注、努力，请大家认真完成题目，加油！</p>", "password": "", "startAt": 1491053400, "endAt": 1491060600, "frozenLength": 0, "registerStartAt": 1490617800, "registerEndAt": 1490975999, "team": false, "ended": false, "createdAt": 0, "updatedAt": 0 },
    problems: { "count": 8, "rows": [{ "problemId": 3859, "title": "No response", "description": "<p><\/p>", "input": "", "output": "<p><img alt=\"No response\" src=\"\/image\/no_response.jpg\" style=\"height:178px; width:178px\" \/><\/p>\r\n", "sampleInput": "", "sampleOutput": "", "hint": "", "source": "\u3010SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a\u3011by MLE_kenan", "author": "", "timeLimit": 1000, "memoryLimit": 65536, "createdAt": 1490535614, "spj": false, "updatedAt": 0 }, { "problemId": 3860, "title": "\u7b80\u5355\u65f6\u95f4\u8f6c\u6362", "description": "<p>\u8fd9\u9053\u9898\u5f88\u7b80\u5355\uff0c\u4f60\u53ea\u9700\u8981\u5b8c\u6210\u5206\u548c\u79d2\u4e4b\u95f4\u7684\u8f6c\u6362\u5373\u53ef\u3002<\/p>\r\n\r\n<p>\u4fdd\u8bc1\u8f93\u5165\u8f93\u51fa\u6570\u636e\u5747\u4e3a\u6b63\u6574\u6570\uff0c\u4e14\u5728 int \u8303\u56f4\u5185\u3002<\/p>\r\n", "input": "<p>\u4e00\u4e2a\u6574\u6570\uff0c\u8868\u793a\u79d2\u3002<\/p>\r\n", "output": "<p>\u4e00\u4e2a\u6574\u6570\uff0c\u8868\u793a\u5206\u3002<\/p>\r\n", "sampleInput": "120", "sampleOutput": "2", "hint": "<script>\r\n$(function () {\r\n\tvar input = $(\"h4:eq(1)\").html();\r\n\tvar output = $(\"h4:eq(2)\").html();\r\n\tvar sampleInput = $(\"h4:eq(3)\").html();\r\n\tvar sampleOutput = $(\"h4:eq(4)\").html();\r\n\t$(\"h4:eq(1)\").html(output);\r\n\t$(\"h4:eq(2)\").html(input);\r\n\t$(\"h4:eq(3)\").html(sampleOutput);\r\n\t$(\"h4:eq(4)\").html(sampleInput);\r\n\tvar input = $(\".prob-content:eq(1)\").html();\r\n\tvar output = $(\".prob-content:eq(2)\").html();\r\n\tvar sampleInput = $(\".prob-content:eq(3)\").html();\r\n\tvar sampleOutput = $(\".prob-content:eq(4)\").html();\r\n\t$(\".prob-content:eq(1)\").html(output);\r\n\t$(\".prob-content:eq(2)\").html(input);\r\n\t$(\".prob-content:eq(3)\").html(sampleOutput);\r\n\t$(\".prob-content:eq(4)\").html(sampleInput);\r\n});\r\n<\/script>", "source": "\u3010SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a\u3011by bLue", "author": "", "timeLimit": 1000, "memoryLimit": 65536, "createdAt": 1490535629, "spj": false, "updatedAt": 0 }, { "problemId": 3866, "title": "\u7834\u574f\u961f\u5f62", "description": "<p>\uff08\u8fd9\u53ef\u80fd\u662f\u672c\u573a\u6bd4\u8d5b\u91cc\u552f\u4e00\u7684\u9898\u9762\u65e0\u5751\u70b9\u4e14\u597d\u505a\u7684\u9898\u4e86 2333\uff09<\/p>\r\n\r\n<p>\u6c34\u7fa4\u662f\u9752\u5c11\u5e74\u559c\u95fb\u4e50\u89c1\u7684\u5a31\u4e50\u6d3b\u52a8\uff0c\u5728\u7fa4\u804a\u4e2d\uff0c\u7ecf\u5e38\u80fd\u770b\u5230\u591a\u6761\u76f8\u540c\u4e14\u8fde\u7eed\u7684\u804a\u5929\u4fe1\u606f\uff0c\u6211\u4eec\u79f0\u4e4b\u4e3a\u300c\u961f\u5f62\u300d\uff0c\u800c\u5f80\u5f80\u4f1a\u6709\u4e00\u4e2a\u4eba\u51fa\u73b0\uff0c\u53d1\u4e00\u6761\u4e0e\u524d\u9762\u961f\u5f62\u4e0d\u540c\u7684\u6d88\u606f\uff0c\u8fd9\u79cd\u884c\u4e3a\u6211\u4eec\u79f0\u4e4b\u4e3a\u300c\u7834\u574f\u961f\u5f62\u300d\u3002<\/p>\r\n\r\n<p>\u73b0\u5728\uff0c\u7ed9\u4f60\u4e00\u6bb5\u6309\u65f6\u95f4\u987a\u5e8f\u7684\u7fa4\u804a\u8bb0\u5f55\uff0c\u8bf7\u4f60\u7edf\u8ba1\u6700\u957f\u7684\u961f\u5f62\u53ca\u5176\u957f\u5ea6\uff0c\u5982\u679c\u6700\u957f\u961f\u5f62\u88ab\u7834\u574f\uff0c\u8fd8\u8981\u8f93\u51fa\u7834\u574f\u961f\u5f62\u7684\u4eba\u662f\u8c01\u3002<\/p>\r\n\r\n<p>\u6ce8\u610f\uff1a\u5fc5\u987b\u6709\u81f3\u5c11 2 \u6761\u76f8\u540c\u4e14\u8fde\u7eed\u7684\u6d88\u606f\uff0c\u624d\u80fd\u770b\u505a\u961f\u5f62\u3002<\/p>\r\n", "input": "<p>\u8f93\u5165\u6570\u636e\u6709\u591a\u7ec4\uff08\u6570\u636e\u7ec4\u6570\u4e0d\u8d85\u8fc7 100\uff09\uff0c\u5230 EOF \u7ed3\u675f\u3002<\/p>\r\n\r\n<p>\u5bf9\u4e8e\u6bcf\u7ec4\u8f93\u5165\uff0c\u9996\u5148\u8f93\u5165 1 \u884c\uff0c\u5305\u542b 1 \u4e2a\u6574\u6570 n (1 &lt;= n &lt;= 100)\uff0c\u8868\u793a\u6d88\u606f\u6761\u6570\u3002<\/p>\r\n\r\n<p>\u63a5\u4e0b\u6765\u6709 n \u884c\uff0c\u6bcf\u884c\u5305\u542b 2 \u4e2a\u4ee5\u7a7a\u683c\u9694\u5f00\u7684\u5b57\u7b26\u4e32\uff08\u4e0d\u542b\u7a7a\u683c\u4e14\u957f\u5ea6\u4e0d\u8d85\u8fc7 30\uff09\uff0c\u5206\u522b\u8868\u793a\u6d88\u606f\u7684\u53d1\u9001\u8005\u548c\u6d88\u606f\u5185\u5bb9\u3002<\/p>\r\n", "output": "<p>\u5bf9\u4e8e\u6bcf\u7ec4\u6570\u636e\uff1a<\/p>\r\n\r\n<ul>\r\n\t<li>\u5982\u679c\u804a\u5929\u4e2d\u6ca1\u6709\u51fa\u73b0\u961f\u5f62\uff0c\u5219\u8f93\u51fa\u4e00\u884c &quot;None&quot;<\/li>\r\n\t<li>\u5982\u679c\u804a\u5929\u4e2d\u51fa\u73b0\u4e86\u961f\u5f62\uff0c\u4e14\u6700\u957f\u961f\u5f62\u672a\u88ab\u7834\u574f\uff0c\u5219\u8f93\u51fa\u4e00\u884c&nbsp;&quot;s&nbsp;(xn)&quot; \uff08s \u8868\u793a\u961f\u5f62\u7684\u5185\u5bb9\uff0cn \u8868\u793a\u961f\u5f62\u957f\u5ea6\uff09<\/li>\r\n\t<li>\u5982\u679c\u804a\u5929\u4e2d\u51fa\u73b0\u4e86\u961f\u5f62\uff0c\u4e14\u6700\u957f\u961f\u5f62\u5df2\u88ab\u7834\u574f\uff0c\u5219\u8f93\u51fa\u4e00\u884c&nbsp;&quot;s&nbsp;(xn)&nbsp;destroyed by p&quot; \uff08s \u8868\u793a\u961f\u5f62\u7684\u5185\u5bb9\uff0cn \u8868\u793a\u961f\u5f62\u957f\u5ea6\uff0cp \u8868\u793a\u7834\u574f\u961f\u5f62\u8005\u7684\u540d\u5b57\uff09<\/li>\r\n<\/ul>\r\n\r\n<p>\u6ce8\u610f\uff1a\u8f93\u51fa\u5747\u4e0d\u5305\u542b\u5f15\u53f7\u3002\u5982\u679c\u7b54\u6848\u6709\u5e76\u5217\uff0c\u5219\u8f93\u51fa\u65f6\u95f4\u6700\u9760\u524d\u7684\uff08\u8f93\u5165\u987a\u5e8f\u6700\u5148\u51fa\u73b0\u7684\uff09\u3002<\/p>\r\n", "sampleInput": "3\r\nQAQ I'mNotFitToDoTarining\r\ncyk I'mNotFitToDoTarining\r\nJohsnows I'mNotFitToDoTarining\r\n2\r\ncyk QAQ'sPower!\r\nQAQ ???\r\n7\r\nldq yxcWillWin\r\nljf yxcWillWin\r\nyxc1 ???\r\nly yxcWillWin\r\nldq yxcWillWin\r\nldq yxcWillWin\r\nyxc2 ???\r\n6\r\nxry huaji.jpg\r\nqsz huaji.jpg\r\nlxh WillBeRemoved,PleaseCooperate\r\nlq huaji.png\r\nzhy huaji.png\r\ntxc huaji.png\r\n", "sampleOutput": "I'mNotFitToDoTarining (x3)\r\nNone\r\nyxcWillWin (x3) destroyed by yxc2\r\nhuaji.png (x3)", "hint": "<p>\u672c\u9898\u7684\u9898\u53f7\u662f 3866\uff0c\u8fd9\u4e2a\u9898\u53f7\u4e5f\u53ef\u4ee5\u5728\u5730\u5740\u680f\u4e2d\u770b\u5230\u3002<\/p>\r\n<script>\r\n$(function () {\r\n\t$(\".btn:eq(0)\").remove();\r\n});\r\n<\/script>", "source": "\u3010SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a\u3011by bLue", "author": "", "timeLimit": 1000, "memoryLimit": 65536, "createdAt": 1490620195, "spj": false, "updatedAt": 0 }, { "problemId": 3864, "title": "Legion Commander", "description": "<p>Welcome to Dota 2! Let&rsquo;s recommend a fantastic hero to you.<\/p>\r\n\r\n<p>Tresdin&nbsp;the&nbsp;Legion Commander&nbsp;is a&nbsp;melee&nbsp;Strength&nbsp;hero&nbsp;fitting the role of&nbsp;carry. A highly mobile and predatory hero, her skillset and gameplay revolves mainly around successfully killing off targets with her ultimate, Duel. Accomplishing this grants Tresdin permanent bonus damage. Though she is extremely skilled in &quot;fair&quot; one-on-one fights, Tresdin suffers when outnumbered and must choose her engagements carefully. A successful midgame sees her roaming the map collecting kills and becoming a very dangerous carry, whilst in lategame she ideally will no longer rely on Duel to win her fights and simply destroy any enemies that come too close to her. Though potentially an extremely powerful hero, she must be played with premeditation and good decision-making to reach her full potential.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>There are four skills of Legion Commander:<\/p>\r\n\r\n<p>1. Overwhelming Odds<\/p>\r\n\r\n<p>Turns the enemies&#39; numbers against them, dealing damage and granting you bonus movement speed per unit or per hero. Deals bonus damage to illusions and summoned units as a percent of their current health.<\/p>\r\n\r\n<p>2. Press the Attack<\/p>\r\n\r\n<p>Removes debuffs and disables from the target friendly unit, and grants bonus attack speed and health regen for a short time.<\/p>\r\n\r\n<p>3. Moment of Courage<\/p>\r\n\r\n<p>When attacked, Legion Commander has a chance to immediately counterattack with bonus lifesteal.<\/p>\r\n\r\n<p>4. Duel<\/p>\r\n\r\n<p>Legion Commander and the target enemy hero are forced to attack each other for a short duration. Neither hero can use items nor abilities. If either hero dies during the duration, the hero winning the Duel gains permanent bonus (exctly 15) damage.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Besides,there are details of Legion Commander&rsquo;s nature:<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<table border=\"0\" cellpadding=\"1\" cellspacing=\"1\" style=\"width:360px\">\r\n\t<tbody>\r\n\t\t<tr>\r\n\t\t\t<td>Health<\/td>\r\n\t\t\t<td>200<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>H. Regen<\/td>\r\n\t\t\t<td>0.25<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Mana<\/td>\r\n\t\t\t<td>50<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>M. Regen<\/td>\r\n\t\t\t<td>0.01<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Damage<\/td>\r\n\t\t\t<td>35<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Armor<\/td>\r\n\t\t\t<td>0<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Spell Dmg<\/td>\r\n\t\t\t<td>0%<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Att \/ Sec<\/td>\r\n\t\t\t<td>0.58<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Movement Speed<\/td>\r\n\t\t\t<td>320<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Turn Rate<\/td>\r\n\t\t\t<td>0.5<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Vision Range<\/td>\r\n\t\t\t<td>1800\/800<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Attack Range<\/td>\r\n\t\t\t<td>150<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Projectile Speed<\/td>\r\n\t\t\t<td>Instant<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Attack Animation<\/td>\r\n\t\t\t<td>0.46+0.64<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Base Attack Time<\/td>\r\n\t\t\t<td>1.7<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Magic resistance<\/td>\r\n\t\t\t<td>25%<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Collision Size<\/td>\r\n\t\t\t<td>24<\/td>\r\n\t\t<\/tr>\r\n\t\t<tr>\r\n\t\t\t<td>Legs<\/td>\r\n\t\t\t<td>2<\/td>\r\n\t\t<\/tr>\r\n\t<\/tbody>\r\n<\/table>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>General strategy:<br \/>\r\nEven though Legion Commander is technically a carry, she needs to also gank early to increase her bonus damage from Duel.<br \/>\r\nBe sure to take advantage of any ganking opportunities, instead of farming endlessly away from your team.<br \/>\r\nLegion Commander works best in coordinated teams that can effectively soften and disable a target for her to kill with Duel, and thus snowball as a carry.<br \/>\r\nDuring early to mid-game, try targeting the softer casters or supports, like Crystal Maiden and Shadow Shaman. This way, if you were to lose a Duel and they gain the bonus attack damage, it won&#39;t affect your team in the late-game as these heroes rely more on their spells than their attacks.<br \/>\r\nDuel allows her to build a large amount of attack damage, meaning that to amplify her damage, it&#39;s most cost-effective to build items that reduce the enemy&#39;s armor or increases her attack speed, rather than buying items which add more damage.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>There are some heros that Legion Commander are diffcult to beat:<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Alchemist<br \/>\r\nWhen Alchemist is in&nbsp;Chemical Rage\u200b, he has an insane amount of health regeneration, making it hard to kill him within a single Duel.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Bane<br \/>\r\nEnfeeble\u200b, Nightmare\u200b, and&nbsp;Fiend&#39;s Grip\u200b can prevent Legion Commander from winning a Duel against Bane&#39;s teammate, especially when Bane has&nbsp;Blink Dagger.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Dazzle<br \/>\r\nShallow Grave\u200b prevents Legion Commander from killing her opponents within the Duel time frame.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Dragon Knight<br \/>\r\nDragon Knight&#39;s high natural armor and health regeneration with his&nbsp;Dragon Blood\u200b passive, making it harder to kill him.<br \/>\r\nA long stun or attack damage reduction from&nbsp;Breathe Fire\u200b, Dragon Tail\u200b might save his ally (or himself).<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Oracle<br \/>\r\nFalse Promise\u200b will delay target&#39;s death for up to 7 seconds, preventing Legion Commander from winning her Duel and gaining bonus damage.<br \/>\r\nFate&#39;s Edict\u200b can be cast on Legion Commander to prevent her from auto attacking for a few seconds, potentially saving Oracle&#39;s ally.<br \/>\r\nFortune&#39;s End\u200b can be cast on Legion Commander or her allies to purge off the Press the Attack buff and heal.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Omniknight<br \/>\r\nOmniknight&#39;s&nbsp;Purification\u200b will heal his dueled teammate and deals pure damage to Legion Commander which makes winning Duel much harder.<br \/>\r\nOmniknight&#39;s ultimate Guardian Angel\u200b completely fools a Duel and when upgraded with&nbsp;Aghanim&#39;s Scepter, Omniknight can save his teammates anywhere on the map against a Duel.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Phantom Assassin<br \/>\r\nPhantom Assassin&#39;s Blur\u200b and&nbsp;Coup de Grace\u200b are useful for winning\/surviving Duels if Legion Commander has no Monkey King Bar or&nbsp;Silver Edge.<br \/>\r\nBlade Mail can supply Legion with extra damage, making Coup de Grace\u200b bad news for both duelists.<br \/>\r\nMoment of Courage can miss on evasion.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Vengeful Spirit<br \/>\r\nVengeful Spirit&#39;s&nbsp;Wave of Terror\u200b can reduce Legion Commander&#39;s armor, decreasing her survivability during a Duel.<br \/>\r\nVengeful Spirit can stun Legion Commander with&nbsp;Magic Missile\u200b during a Duel.<br \/>\r\nVengeful Spirit&#39;s&nbsp;Nether Swap\u200b, can disrupt the Duel.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Winter Wyvern<br \/>\r\nWinter Wyvern&#39;s Cold Embrace\u200b can prevent her ally from dying during Duel.<br \/>\r\nWinter&#39;s Curse\u200b can make Legion Commander&#39;s team attack Legion Commander instead of Winter Wyvern&#39;s ally.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Ursa<br \/>\r\nEnrage\u200b instant cast time and can easily launch it whenever he sees a threatening Legion Commander right in front of him, making him almost immune to any damage while being dueled.<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>Now Legion Commander think she is more aggressive (which means a bigger number of damages) than&nbsp;Drow Ranger, you are told the duels that Legion Commander had made (include the result), and the Drow Ranger&rsquo;s damage, please tell Legion Commander if she is more aggressive.<\/p>\r\n", "input": "<p>The first line contain a interger <em>t<\/em>&nbsp;(1 &lt;= <em>t<\/em> &lt;= 100), which means the number of case.<\/p>\r\n\r\n<p>The first line of every case contain a interger <em>n<\/em> (1 &lt; <em>n<\/em> &lt;= 1000), <em>m<\/em> (1 &lt; <em>m<\/em> &lt; 50) which means the damage of Drow Ranger, and the number of duels that Legion Commander had made.<\/p>\r\n\r\n<p>Follow m line of each case contain a string&nbsp;(no white space, the length is smaller than 15, and not include Drow Ranger) represent the name of opponent in the duel,&nbsp;and number <em>x<\/em> means the result of the duel, 1 means Legion Commander won, 0 means she losed.<\/p>\r\n", "output": "<p>If Legion Commander is more aggressive (include equivalent), print &ldquo;So powerful a carry you are!&rdquo;, if not, print &quot;sorry, you are not strong enough&rdquo; (without quotes).<\/p>\r\n", "sampleInput": "1\r\n100 2\r\nUrsa 1\r\nBeastmaster 0", "sampleOutput": "sorry, you are not strong enough", "hint": "", "source": "\u3010SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a\u3011by Johsnows", "author": "", "timeLimit": 1000, "memoryLimit": 65536, "createdAt": 1490539740, "spj": false, "updatedAt": 0 }, { "problemId": 3865, "title": "\u73c8\u767e\u7483\u7684\u5815\u843d", "description": "<p><img alt=\"3865-1\" src=\"\/image\/3865-1.png\" style=\"height:391px; width:462px\" \/><\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>\u4e4b\u524d\u4eba\u89c1\u4eba\u7231\u5973\u795e\u7ea7\u7684\u73c8\u767e\u7483\u6700\u7ec8\u56e0\u4e3a\u4e00\u4e0d\u5c0f\u5fc3\u6253\u5f00\u4e86\u6e38\u620f\uff0c\u800c\u6700\u7ec8\u8d70\u4e0a\u4e86\u6c2a\u91d1\u5815\u843d\u7684\u9053\u8def\uff0c\u4f5c\u4e3a ACM \u7684\u4e00\u5458\u6211\u4eec\u5f53\u7136\u8981\u6df1\u77e5\u6c2a\u91d1\u7206\u809d\u7684\u5371\u5bb3\uff0c\u4e0d\u80fd\u8d70\u4e0a\u6c89\u8ff7\u6e38\u620f\u81ea\u7518\u5815\u843d\u7684\u9053\u8def\u3002<\/p>\r\n\r\n<p>\u73b0\u5728\u73c8\u767e\u7483\u6b63\u5728\u6e38\u620f\u4e16\u754c\u4e2d\u5145\u5f53\u7740\u4e00\u4e2a\u5976\u5988\u7684\u89d2\u8272\uff0c\u73b0\u5728\u7684\u5979\u83b7\u5f97\u4e86\u4e00\u4e2a\u795e\u5947\u7684\u88c5\u5907\uff0c\u8fd9\u4ef6\u88c5\u5907\u7684\u6548\u679c\u5c31\u662f\u77ac\u95f4\u53ef\u4ee5\u6ee1\u8840\uff0c\u800c\u4e14\u662f\u5168\u4f53\u7684\uff0c\u5f53\u7136\u8fd9\u4e48\u5f3a\u5927\u7684\u88c5\u5907\u81ea\u7136\u662f\u6709\u9650\u5236\u7684\uff0c\u4ee4\u73c8\u767e\u7483\u975e\u5e38\u4e0d\u5f00\u5fc3\u7684\u4e00\u70b9\u5c31\u662f\u8fd9\u4ef6\u88c5\u5907\u6bcf\u5929\u90fd\u4f1a\u51cf\u5c11 1 \u70b9 MP \u7684\u503c\uff0c\u7136\u540e\u5c31\u662f\u73c8\u767e\u7483\u6bcf\u6b21\u4f7f\u7528\u4e4b\u524d\uff0c\u5f53\u524d MP \u7684\u503c\u5fc5\u987b\u786e\u5b9a\u662f 233 \u7684\u500d\u6570\uff0c\u8fd9\u4e2a\u88c5\u5907\u6709\u4e2a\u6bd4\u8f83\u7279\u6b8a\u7684\u798f\u5229\uff0c\u5c31\u662f\u5f53 MP \u4e3a\u7a7a\u7684\u65f6\u5019\u4e5f\u53ef\u4ee5\u53d1\u52a8\uff0c\u73c8\u767e\u7483\u6bcf\u6b21\u53d1\u73b0\u4e0d\u6ee1\u8db3\u8fd9\u4e2a\u6761\u4ef6\u7684\u65f6\u5019\u5c31\u4f1a\u6c2a\u91d1\u8865\u5145 MP\uff08\u73c8\u767e\u7483\u53ef\u771f\u662f\u8d25\u5bb6\u554a\uff09\uff0c\u73b0\u5728\u7ed9\u4f60\u73c8\u767e\u7483\u4eca\u5929\u521a\u4e0a\u7ebf\u663e\u793a\u7684 MP \u7684\u6570\u503c\uff0c\u7136\u540e\u73b0\u5728\u8981\u6c42\u4f60\u8ba1\u7b97\u73c8\u767e\u7483\u4eca\u5929\u6700\u5c11\u9700\u8981\u6c2a\u591a\u5c11\u91d1\uff1f\uff08\u8fd9\u91cc\u4e3a\u4e86\u65b9\u4fbf\u76f4\u63a5\u8f93\u51fa\u9700\u8981\u7684\u6700\u5c11\u7684 MP \u7684\u6570\u503c\u5c31\u53ef\u4ee5\u4e86\uff09<\/p>\r\n", "input": "<p><img alt=\"3865-2\" src=\"\/image\/3865-2.png\" style=\"height:211px; width:189px\" \/><\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>\u591a\u7ec4\u8f93\u5165\u3002<\/p>\r\n\r\n<p>\u6bcf\u7ec4\u5305\u542b 1 \u4e2a\u6574\u6570 n\uff08\u4ee3\u8868\u73c8\u767e\u7483\u4e0a\u7ebf\u6240\u62e5\u6709\u7684\u7684MP\u503c\uff09\u3002<\/p>\r\n", "output": "<p><img alt=\"3865-3\" src=\"\/image\/3865-3.png\" style=\"height:239px; width:197px\" \/><\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>\u6bcf\u7ec4\u8f93\u51fa\u4e00\u4e2a\u6574\u6570\uff0c\u8868\u793a\u73c8\u767e\u7483\u9700\u8981\u7684\u6700\u5c11\u7684 MP \u7684\u503c\u3002<\/p>\r\n", "sampleInput": "1\r\n234\r\n", "sampleOutput": "232\r\n232\r\n", "hint": "", "source": "\u3010SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a\u3011by UMR", "author": "", "timeLimit": 1000, "memoryLimit": 65536, "createdAt": 1490620185, "spj": false, "updatedAt": 0 }, { "problemId": 3861, "title": "\u6697\u8272\u4e3b\u9898", "description": "<p>\u547d\u9898\u7ec4\u6700\u8fd1\u8c03\u8bd5\u6697\u8272\u4e3b\u9898\u65f6\u51fa\u4e86\u67d0\u4e9b\u4e8b\u6545\uff0c\u5bfc\u81f4\u6682\u65f6\u5e9f\u5f03\u4e86\u6b64\u9898\uff0c\u9898\u9762\u4e5f\u5148\u79fb\u9664\u6389\u4e86\u3002Mark \u4e00\u4e0b\uff0c\u611a\u4eba\u8282\u4e4b\u524d\u56de\u6765\u4fee\u3002<\/p>\r\n\r\n<p>\u5bf9\u4e86\uff0c\u5982\u679c\u4f60\u662f OJ \u540e\u53f0\u7ba1\u7406\u4eba\u5458\uff0c\u80fd\u770b\u5230\u8fd9\u6bb5\u8bdd\u5c31\u8bf4\u660e\u547d\u9898\u7ec4\u5df2\u7ecf\u628a\u8fd9\u4e2a\u4e8b\u7ed9\u5fd8\u4e86\uff0c\u8bf7\u52a1\u5fc5\u63d0\u9192\u4e00\u4e0b\u547d\u9898\u7ec4\u5c3d\u5feb\u628a\u4e3b\u9898\u5f04\u597d\u3002<\/p>\r\n\r\n<p>&mdash;&mdash; \u547d\u9898\u7ec4\u81ea\u7559\u7684\u5907\u5fd8\u5f55<img alt=\"\" src=\"\/image\/3861.png\" style=\"height:280px; width:280px\" \/><\/p>\r\n", "input": "", "output": "", "sampleInput": "", "sampleOutput": "", "hint": "<p>\u611a\u4eba\u8282\u4e13\u573a\u63d0\u793a\uff1a\u901a\u8fc7\u4e4b\u540e\u53ef\u4ee5\u6309\u7167\u8f93\u51fa\u5185\u5bb9\u7684\u610f\u601d\u9886\u53d6\u9690\u85cf\u5956\u52b1\u3002<\/p>\r\n<script>\r\n\/\/ Extra CSS\r\n\/\/ by bLue\r\nvar extraStyle = '\\\r\n<style>\\\r\nbody {\\\r\n\tbackground: #000;\\\r\n\tcolor: #fff;\\\r\n}\\\r\n.navbar {\\\r\n\tbackground: rgba(0, 0, 0, 0.4);\\\r\n}\\\r\n.navbar-default .navbar-brand {\\\r\n\tcolor: #fff;\\\r\n}\\\r\n.navbar-default .navbar-brand:focus, .navbar-default .navbar-brand:hover {\\\r\n\tcolor: #337AB7;\\\r\n}\\\r\n.navbar-default .navbar-nav>li>a {\\\r\n\tcolor: #fff;\\\r\n}\\\r\n.navbar-default .navbar-nav>li>a:focus, .navbar-default .navbar-nav>li>a:hover {\\\r\n\tcolor: #337AB7;\\\r\n}\\\r\n.navbar-default, .navbar-default .navbar-collapse, .navbar-default .navbar-form {\\\r\n\tborder-color: #FAFAFA;\\\r\n}\\\r\n.istyle {\\\r\n\tbackground: rgba(0, 0, 0, 0.25);\\\r\n}\\\r\nh4 {\\\r\n\tcolor: #fff;\\\r\n}\\\r\n.prob-content {\\\r\n\tborder-top: 0px;\\\r\n}\\\r\npre {\\\r\n\tbackground: rgba(0, 0, 0, 0.2);\\\r\n\tcolor: #FAFAFA;\\\r\n\tborder-color: #fff;\\\r\n}\\\r\n.footer {\\\r\n\tbackground: rgba(0, 0, 0, 0);\\\r\n\tcolor: #fff;\\\r\n}\\\r\nh3.problem-header {\\\r\n\tcolor: #fff;\\\r\n}\\\r\na {\\\r\n\tcolor: #278DF2;\\\r\n}\\\r\na:focus, a:hover {\\\r\n\tcolor: #337AB7;\\\r\n}\\\r\nblockquote {\\\r\n\tborder-left: 5px solid #fff;\\\r\n}\\\r\n<\/style>\\\r\n';\r\nvar head = document.head || document.getElementsByTagName('head')[0];\r\nhead.insertAdjacentHTML(\"beforeEnd\", extraStyle);\r\n<\/script>\r\n<script>\r\n\/\/ by bLue\r\n\/\/ Only for fun ^_^\r\nfunction initUI() {\r\n\t$(\".block\").removeClass(\"block-success\");\r\n\t$(\".block\").removeClass(\"block\");\r\n\t\/\/ Footer\r\n\t$(\".col-sm-11\").attr(\"class\", \"col-sm-12 text-center\");\r\n\t$(\".col-sm-12:eq(0)\").html(\"SDUTACM\u8fd0\u7ef4\u6280\u672f\u4e2d\u5fc3\");\r\n\t$(\".col-sm-12:eq(0)\").prepend('Special Event Version. Redesigned by <a href=\"https:\/\/dreamer.blue\" target=\"_blank\">bLue<\/a><br \/>');\r\n\t\/\/ Buttons\r\n\tvar pid = $(\".btn:eq(0)\").attr(\"href\").split(\"pid\/\")[1].split(\".html\")[0];\r\n\tif($(\".btn\").length != 3)\r\n\t\t$(\".form-group\").append('<a class=\"btn btn-default btn-sm\" href=\"\/onlinejudge2\/index.php\/Home\/Discuss\/discusslist\/pid\/' + pid + '\">Discuss<\/a>');\r\n}\r\n$(function () {\r\n\tinitUI();\r\n});\r\n<\/script>", "source": "\u3010SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a\u3011by bLue", "author": "", "timeLimit": 1000, "memoryLimit": 65536, "createdAt": 1490539685, "spj": false, "updatedAt": 0 }, { "problemId": 3862, "title": "\u5b66\u4e60\u65b0\u8bed\u8a00", "description": "<p>\u547d\u9898\u7ec4\u6700\u8fd1\u8ff7\u4e0a\u4e86\u4e00\u95e8\u65b0\u7684\u7f16\u7a0b\u8bed\u8a00\uff0c\u7531\u4e8e\u592a exciting\uff0c\u6839\u672c\u987e\u4e0d\u5f97\u5f04\u6697\u8272\u4e3b\u9898\u4e86\uff08\u5176\u5b9e\u8fd9\u624d\u662f\u771f\u76f8\uff09\u3002<\/p>\r\n\r\n<p>\u73b0\u5728\u8ddd\u79bb\u611a\u4eba\u8282\u53ea\u6709 2 \u5929\u4e86\uff0c\u6211\u5f88\u62c5\u5fc3\u4e3b\u9898\u8fd8\u80fd\u4e0d\u80fd\u8d76\u5b8c\uff0c\u4f46\u662f\u4ed6\u4eec\u90fd\u6c89\u8ff7\u5b66\u8bed\u8a00\u4e0d\u80fd\u81ea\u62d4\u3002\u6ca1\u529e\u6cd5\uff0c\u6211\u53ea\u597d\u5148\u5f00\u4e2a\u9898 Mark \u4e00\u4e0b\uff0c\u63d0\u9192\u4ed6\u4eec\u5c3d\u5feb\u628a\u6697\u8272\u4e3b\u9898\u5f04\u5b8c\u3002<\/p>\r\n\r\n<p>&nbsp;<\/p>\r\n\r\n<p>&mdash;&mdash;\u547d\u9898\u7ec4\u81ea\u7559\u7684\u5907\u5fd8\u5f55<\/p>\r\n", "input": "", "output": "", "sampleInput": "   \t     \t\r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t     \r\n\t\r\n     \t  \t  \t\r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t\t\t \t  \r\n\t\r\n     \t\t  \t \t\r\n\t\r\n     \t\t  \t\t\t\r\n\t\r\n     \t\t  \t \t\r\n\t\r\n     \t\t\t  \t \r\n\t\r\n     \t     \r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t     \r\n\t\r\n     \t \t   \r\n\t\r\n     \t\t   \t\r\n\t\r\n     \t     \r\n\t\r\n     \t\t\t\t  \r\n\t\r\n     \t\t\t\t \t\r\n\t\r\n     \t     \r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t     \r\n\t\r\n     \t\t\t\t  \r\n\t\r\n     \t\t\t\t \t\r\n\t\r\n     \t     \r\n\t\r\n     \t\t   \t\r\n\t\r\n     \t\t    \r\n\t\r\n     \t \t\t\t\t \r\n\t\r\n     \t\t \t\t \r\n\t\r\n     \t \t  \t\r\n\t\r\n     \t \t\t\t \r\n\t\r\n     \t \t \r\n\t\r\n  \r\n\r\n\r\n\r\n", "sampleOutput": "   \t     \t\r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t     \r\n\t\r\n     \t  \t  \t\r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t\t\t \t  \r\n\t\r\n     \t\t  \t \t\r\n\t\r\n     \t\t  \t\t\t\r\n\t\r\n     \t\t  \t \t\r\n\t\r\n     \t\t\t  \t \r\n\t\r\n     \t     \r\n\t\r\n     \t\t  \t  \r\n\t\r\n     \t\t  \t \t\r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t\t \t\t\t\t\r\n\t\r\n     \t\t\t \t  \r\n\t\r\n     \t\t \t  \t\r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t\t  \t\t\t\r\n\t\r\n     \t     \r\n\t\r\n     \t\t\t \t  \r\n\t\r\n     \t\t \t   \r\n\t\r\n     \t\t  \t \t\r\n\t\r\n     \t     \r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t\t\t \t \t\r\n\t\r\n     \t\t \t\t \t\r\n\t\r\n     \t\t   \t \r\n\t\r\n     \t\t  \t \t\r\n\t\r\n     \t\t\t  \t \r\n\t\r\n     \t     \r\n\t\r\n     \t\t \t\t\t\t\r\n\t\r\n     \t\t  \t\t \r\n\t\r\n     \t     \r\n\t\r\n     \t\t\t    \r\n\t\r\n     \t\t\t  \t \r\n\t\r\n     \t\t \t  \t\r\n\t\r\n     \t\t \t\t \t\r\n\t\r\n     \t\t  \t \t\r\n\t\r\n     \t     \r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t\t\t \t \t\r\n\t\r\n     \t\t \t\t \t\r\n\t\r\n     \t\t   \t \r\n\t\r\n     \t\t  \t \t\r\n\t\r\n     \t\t\t  \t \r\n\t\r\n     \t\t\t  \t\t\r\n\t\r\n     \t     \r\n\t\r\n     \t\t \t  \t\r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t     \r\n\t\r\n     \t\t\t  \t \r\n\t\r\n     \t\t    \t\r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t\t  \t\t\t\r\n\t\r\n     \t\t  \t \t\r\n\t\r\n     \t     \r\n\t\r\n     \t \t\t \t\t\r\n\t\r\n     \t\t   \t\r\n\t\r\n     \t \t\t  \r\n\t\r\n     \t     \r\n\t\r\n     \t\t \t\t\t \r\n\t\r\n     \t \t\t\t \t\r\n\t\r\n     \t \t\t\t \r\n\t\r\n     \t \t \r\n\t\r\n  \r\n\r\n\r\n\r\n", "hint": "<script>\r\n$(function () {\r\n\t$(\"h4:eq(3)\").text($(\"h4:eq(1)\").text());\r\n\t$(\"h4:eq(4)\").text($(\"h4:eq(2)\").text());\r\n\t$(\"h4:eq(1)\").remove();\r\n\t$(\"h4:eq(1)\").remove();\r\n\t$(\".prob-content:eq(1)\").remove();\r\n\t$(\".prob-content:eq(1)\").remove();\r\n});\r\n<\/script>", "source": "\u3010SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a\u3011by bLue", "author": "", "timeLimit": 1000, "memoryLimit": 65536, "createdAt": 1490539696, "spj": false, "updatedAt": 0 }, { "problemId": 3863, "title": "PBH\u7684\u5c0f\u706b\u7bad", "description": "<p>PBH \u6709\u4e94\u4e2a\u5c0f\u706b\u7bad\uff0c\u4ed6\u4ece\u4e2d\u9009\u62e9\u4e00\u4e9b\u706b\u7bad\u6392\u6210\u4e00\u6761\u7ebf\uff0c\u5e76\u51b3\u5b9a\u6309\u7167\u4e00\u5b9a\u89c4\u5219\u53d1\u5c04\u5b8c\u6240\u6709\u7684\u706b\u7bad\u3002<\/p>\r\n\r\n<p>\u9996\u5148\u7b2c\u4e00\u8f6e\u4ed6\u4f1a\u53d1\u5c04\u6700\u5de6\u7aef\u548c\u6700\u53f3\u7aef\u7684\u706b\u7bad\uff0c\u4e4b\u540e\u6bcf\u8f6e\u53d1\u5c04\u65f6\u4ed6\u90fd\u4f1a\u5728\u6bcf\u4e2a\u975e\u7a7a\u533a\u95f4\uff08\u975e\u7a7a\u533a\u95f4\u6307\u533a\u95f4 [l, r] \u5185\u7684\u706b\u7bad\u5747\u672a\u53d1\u5c04\uff0c\u4e14 l-1, r+1 \u5904\u7684\u706b\u7bad\u5747\u5df2\u53d1\u5c04\u7684\u4e00\u4e2a\u533a\u95f4\uff09\u4e2d\u968f\u673a\u9009\u62e9\u4e00\u4e2a\u706b\u7bad\u53d1\u5c04\u3002\u6bcf\u4e24\u8f6e\u53d1\u5c04\u4e4b\u95f4\u95f4\u9694 10 \u79d2\u3002<\/p>\r\n\r\n<p>\u73b0\u5728\u4ed6\u60f3\u77e5\u9053\u53d1\u5c04\u5b8c\u6240\u6709\u706b\u7bad\u7684\u671f\u671b\u65f6\u95f4\u662f\u591a\u5c11\u3002<\/p>\r\n", "input": "<p>\u8f93\u5165\u6570\u636e\u6709\u591a\u7ec4\uff08\u6570\u636e\u7ec4\u6570\u4e0d\u8d85\u8fc7 400\uff09\uff0c\u5230 EOF \u7ed3\u675f\u3002<\/p>\r\n\r\n<p>\u6bcf\u7ec4\u8f93\u5165\u4e00\u4e2a\u6574\u6570 n (3 &lt;= n &lt;= 400)\uff0c\u8868\u793a\u8981\u53d1\u5c04\u7684\u5c0f\u706b\u7bad\u6570\u91cf\u3002<\/p>\r\n", "output": "<p>\u5bf9\u4e8e\u6bcf\u7ec4\u6570\u636e\uff0c\u8f93\u51fa\u4e00\u4e2a\u5b9e\u6570\uff0c\u8868\u793a\u7b54\u6848\uff0c\u4fdd\u7559 10 \u4f4d\u5c0f\u6570\u3002<\/p>\r\n", "sampleInput": "3\r\n5\r\n4", "sampleOutput": "10.0000000000\r\n26.6666666667\r\n20.0000000000", "hint": "", "source": "\u3010SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a\u3011by bLue", "author": "", "timeLimit": 1000, "memoryLimit": 65536, "createdAt": 1490539717, "spj": false, "updatedAt": 0 }] },
    userProblemResultStats: { "acceptedProblemIds": [], "attemptedProblemIds": [] },
    problemResultStats: { "3859": { "accepted": 64, "submitted": 228 }, "3860": { "accepted": 63, "submitted": 222 }, "3866": { "accepted": 2, "submitted": 50 }, "3864": { "accepted": 1, "submitted": 32 }, "3865": { "accepted": 1, "submitted": 137 }, "3861": { "accepted": 60, "submitted": 307 }, "3862": { "accepted": 3, "submitted": 207 }, "3863": { "accepted": 22, "submitted": 52 } }
  },
  userDetail: {
    "userId": 2242, "username": "lxh", "nickname": "raincloud", "avatar": "5c28ed57a2168.jpg", "bannerImage": "rc_banner_compressed.jpg", "school": "\u5c71\u4e1c\u7406\u5de5\u5927\u5b66", "college": "\u8ba1\u7b97\u673a\u5b66\u9662", "major": "\u8ba1\u7b97\u673a\u79d1\u5b66\u4e0e\u6280\u672f", "class": "", "site": "", "rating": 1806,
    accepted: 226,
    submitted: 1609,
    solutionCalendar: [{ "date": "2018-09-26", "count": 10 }, { "date": "2018-09-27", "count": 2 }, { "date": "2018-10-06", "count": 12 }, { "date": "2018-10-07", "count": 8 }, { "date": "2018-10-08", "count": 4 }, { "date": "2018-10-09", "count": 3 }, { "date": "2018-10-11", "count": 2 }, { "date": "2018-10-12", "count": 6 }, { "date": "2018-10-14", "count": 5 }, { "date": "2018-10-15", "count": 1 }, { "date": "2018-10-16", "count": 10 }, { "date": "2018-10-17", "count": 3 }, { "date": "2018-10-18", "count": 2 }, { "date": "2018-10-19", "count": 4 }, { "date": "2018-10-24", "count": 2 }, { "date": "2018-10-28", "count": 5 }, { "date": "2018-10-29", "count": 6 }, { "date": "2018-10-31", "count": 7 }, { "date": "2018-11-02", "count": 2 }, { "date": "2018-11-04", "count": 4 }, { "date": "2018-11-05", "count": 3 }, { "date": "2018-11-06", "count": 3 }, { "date": "2018-11-07", "count": 6 }, { "date": "2018-11-10", "count": 4 }, { "date": "2018-11-11", "count": 6 }, { "date": "2018-11-14", "count": 1 }, { "date": "2018-11-18", "count": 10 }, { "date": "2018-11-19", "count": 10 }, { "date": "2018-11-20", "count": 2 }, { "date": "2018-11-21", "count": 9 }, { "date": "2018-11-26", "count": 2 }, { "date": "2018-11-27", "count": 1 }, { "date": "2018-11-28", "count": 9 }, { "date": "2018-12-05", "count": 2 }, { "date": "2018-12-09", "count": 3 }, { "date": "2018-12-11", "count": 2 }, { "date": "2018-12-12", "count": 4 }, { "date": "2018-12-15", "count": 1 }, { "date": "2018-12-17", "count": 2 }, { "date": "2018-12-18", "count": 4 }, { "date": "2018-12-19", "count": 1 }, { "date": "2018-12-22", "count": 1 }, { "date": "2018-12-24", "count": 8 }, { "date": "2018-12-25", "count": 4 }, { "date": "2018-12-26", "count": 5 }, { "date": "2018-12-27", "count": 2 }, { "date": "2018-12-28", "count": 1 }, { "date": "2019-01-02", "count": 2 }, { "date": "2019-01-03", "count": 2 }, { "date": "2019-01-04", "count": 3 }, { "date": "2019-01-07", "count": 2 }, { "date": "2019-01-08", "count": 4 }, { "date": "2019-01-09", "count": 4 }, { "date": "2019-01-10", "count": 7 }, { "date": "2019-01-11", "count": 2 }, { "date": "2019-01-15", "count": 1 }, { "date": "2019-01-17", "count": 13 }, { "date": "2019-01-18", "count": 9 }, { "date": "2019-01-19", "count": 10 }, { "date": "2019-01-20", "count": 5 }, { "date": "2019-01-21", "count": 3 }, { "date": "2019-01-22", "count": 9 }, { "date": "2019-01-23", "count": 9 }, { "date": "2019-01-24", "count": 1 }, { "date": "2019-02-15", "count": 3 }, { "date": "2019-02-16", "count": 6 }, { "date": "2019-02-17", "count": 7 }, { "date": "2019-02-18", "count": 3 }, { "date": "2019-02-19", "count": 1 }, { "date": "2019-02-20", "count": 7 }, { "date": "2019-02-21", "count": 6 }, { "date": "2019-02-26", "count": 2 }, { "date": "2019-03-06", "count": 1 }, { "date": "2019-03-07", "count": 2 }, { "date": "2019-03-14", "count": 1 }, { "date": "2019-04-01", "count": 2 }, { "date": "2019-04-03", "count": 1 }, { "date": "2019-04-04", "count": 1 }, { "date": "2019-04-21", "count": 1 }, { "date": "2019-04-22", "count": 4 }, { "date": "2019-04-23", "count": 2 }, { "date": "2019-04-25", "count": 1 }, { "date": "2019-04-26", "count": 5 }, { "date": "2019-04-28", "count": 4 }, { "date": "2019-04-29", "count": 1 }, { "date": "2019-05-11", "count": 4 }, { "date": "2019-05-16", "count": 1 }, { "date": "2019-05-17", "count": 5 }, { "date": "2019-05-18", "count": 3 }, { "date": "2019-05-19", "count": 4 }, { "date": "2019-05-25", "count": 4 }, { "date": "2019-07-23", "count": 14 }, { "date": "2019-07-24", "count": 6 }, { "date": "2019-07-25", "count": 2 }, { "date": "2019-07-27", "count": 12 }, { "date": "2019-07-28", "count": 4 }, { "date": "2019-08-27", "count": 1 }, { "date": "2019-09-01", "count": 4 }, { "date": "2019-09-02", "count": 4 }, { "date": "2019-09-04", "count": 1 }, { "date": "2019-09-05", "count": 1 }, { "date": "2019-09-11", "count": 3 }, { "date": "2019-09-12", "count": 1 }, { "date": "2019-09-15", "count": 1 }, { "date": "2019-09-19", "count": 4 }, { "date": "2019-09-20", "count": 6 }, { "date": "2019-09-22", "count": 1 }, { "date": "2019-09-24", "count": 1 }, { "date": "2019-09-26", "count": 1 }, { "date": "2019-09-27", "count": 2 }, { "date": "2019-09-28", "count": 5 }, { "date": "2019-10-10", "count": 1 }, { "date": "2019-10-19", "count": 3 }, { "date": "2019-10-20", "count": 5 }, { "date": "2019-10-22", "count": 1 }, { "date": "2019-10-23", "count": 2 }, { "date": "2019-10-25", "count": 9 }, { "date": "2019-11-04", "count": 2 }, { "date": "2019-11-12", "count": 1 }, { "date": "2019-11-14", "count": 7 }, { "date": "2019-11-15", "count": 9 }, { "date": "2019-11-18", "count": 2 }, { "date": "2019-12-09", "count": 2 }],
    ratingHistory: [{ "contest": { "contestId": 2401, "title": "SDUT Round #4 - 2018 \u65b0\u6625\u5927\u4f5c\u6218" }, "rank": 21, "rating": 1568, "ratingChange": 68, "date": "2018-02-15" }, { "contest": { "contestId": 2481, "title": "SDUT Round #5 - 2018 \u611a\u4eba\u8282\u4e13\u573a" }, "rank": 24, "rating": 1625, "ratingChange": 57, "date": "2018-04-01" }, { "contest": { "contestId": 2627, "title": "SDUT Round #6 [\u91cd\u805a--SDUTACM\u5341\u5468\u5e74\u5e86\u5178\u4e13\u573a\u8d5b--\u73b0\u573a\u8d5b]" }, "rank": 7, "rating": 1702, "ratingChange": 77, "date": "2018-10-14" }, { "contest": { "contestId": 2764, "title": "SDUT Round #7 2019-\u65b0\u6625\u5927\u4f5c\u6218" }, "rank": 10, "rating": 1709, "ratingChange": 7, "date": "2019-02-04" }, { "contest": { "contestId": 2913, "title": "SDUT Round #8 2019 \u611a\u4eba\u8282\u4e13\u573a\u8d5b" }, "rank": 2, "rating": 1806, "ratingChange": 97, "date": "2019-04-01" }]
  },
  tags: { "count": 14, "rows": [{ "tagId": 6, "hidden": false, "createdAt": 1545753600, "name": { "en": "Sortings", "zhHans": "排序", "zhHant": "排序" } }, { "tagId": 10, "hidden": false, "createdAt": 1545753600, "name": { "en": "Greedy", "zhHans": "贪心", "zhHant": "貪婪" } }, { "tagId": 11, "hidden": false, "createdAt": 1545753600, "name": { "en": "DP", "zhHans": "动态规划", "zhHant": "動態規劃" } }, { "tagId": 13, "hidden": false, "createdAt": 1545753600, "name": { "en": "Data Structures", "zhHans": "数据结构", "zhHant": "資料結構" } }, { "tagId": 15, "hidden": false, "createdAt": 1545753600, "name": { "en": "Linked List", "zhHans": "链表", "zhHant": "連結串列" } }, { "tagId": 18, "hidden": false, "createdAt": 1545753600, "name": { "en": "Binary Tree", "zhHans": "二叉树", "zhHant": "二元樹" } }, { "tagId": 25, "hidden": false, "createdAt": 1545753600, "name": { "en": "DFS", "zhHans": "深度优先搜索", "zhHant": "深度優先搜尋" } }, { "tagId": 26, "hidden": false, "createdAt": 1545753600, "name": { "en": "BFS", "zhHans": "广度优先搜索", "zhHant": "廣度優先搜尋" } }, { "tagId": 23, "hidden": false, "createdAt": 1545753600, "name": { "en": "Brute Force", "zhHans": "暴力", "zhHant": "暴力" } }, { "tagId": 27, "hidden": false, "createdAt": 1545753600, "name": { "en": "Math", "zhHans": "数学", "zhHant": "數學" } }, { "tagId": 32, "hidden": false, "createdAt": 1545753600, "name": { "en": "Hashing", "zhHans": "哈希", "zhHant": "哈希" } }, { "tagId": 33, "hidden": false, "createdAt": 1545753600, "name": { "en": "Graphs", "zhHans": "图论", "zhHant": "圖論" } }, { "tagId": 37, "hidden": false, "createdAt": 1545753600, "name": { "en": "Games", "zhHans": "博弈", "zhHant": "博弈" } }, { "tagId": 49, "hidden": false, "createdAt": 1545753600, "name": { "en": "FFT", "zhHans": "快速傅里叶变换", "zhHant": "快速傅立葉變換" } }] },
  notes: { "count": 4, "rows": [{ "noteId": 27, "type": "", "target": { "url": "https:\/\/acm.sdut.edu.cn\/onlinejudge3\/", "location": { "pathname": "\/", "search": "", "query": [], "hash": "" } }, "content": "\u56de\u53bb\u770b\u9a6c\u8001\u5e08\u7b2c\u516d\u7ae0", "createdAt": 1577148845, "updatedAt": 1577148845 }, { "noteId": 25, "type": "problem", "target": { "problemId": 1018, "title": "\u9aa8\u724c\u94fa\u65b9\u683c" }, "content": "\u76ee\u524d\u60f3\u5230\u5e94\u8be5\u7528\u9012\u63a8\uff0c\u5403\u5b8c\u996d\u56de\u53bb\u63a8\u4e00\u4e0b", "createdAt": 1577148602, "updatedAt": 1577148602 }, { "noteId": 24, "type": "solution", "target": { "solutionId": 2491137, "problem": { "problemId": 3864, "title": "Legion Commander" }, "contest": { "contestId": 2100, "title": "SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a", "type": 2, "problemIndex": 3 }, "result": 1 }, "content": "\u8fd9\u9898\u7684\u552f\u4e00\u6b63\u786e\u89e3\u6cd5\uff0c\u5b66\u4e60\u4e86", "createdAt": 1577148516, "updatedAt": 1577148516 }, { "noteId": 23, "type": "problem", "target": { "problemId": 3860, "title": "\u7b80\u5355\u65f6\u95f4\u8f6c\u6362", "contest": { "contestId": 2100, "title": "SDUT Round #3 - 2017 \u611a\u4eba\u8282\u4e13\u573a", "problemIndex": 1 } }, "content": "\u8fd9\u9898\u8f93\u5165\u8f93\u51fa\u5f88\u5751", "createdAt": 1577148457, "updatedAt": 1577148457 }] },
  solutionDetail: { "solutionId": 5253918, "result": 1, "time": 0, "memory": 152, "language": "g++", "codeLength": 134, "createdAt": 1546229131, "shared": true, "user": { "userId": 1, "username": "root", "nickname": "hack", "avatar": "", "bannerImage": "" }, "problem": { "problemId": 1000, "title": "A+B Problem", "timeLimit": 1000 }, "code": "#include <bits\/stdc++.h>\nusing namespace std;\nint main()\n{\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}" },
}

interface IntroProps {
  theme: ISettingsTheme;
  requestThemeChange: (theme: ISettingsTheme) => void;
}

interface IntroState {
  solutionCalendarPeriod: number | null;
  solutionList: IList<ISolution>;
}

class Intro extends React.Component<IntroProps, IntroState> {
  private _mockSolutionRefreshTimer = 0;

  constructor(props) {
    super(props);
    this.state = {
      solutionCalendarPeriod: null,
      solutionList: {
        "page": 1, "count": 7381684, "limit": 8, "rows": [
          { "solutionId": 8, "result": 0, "time": 0, "memory": 0, "language": "g++", "codeLength": 2333, "createdAt": 1576979088, "shared": false, "user": { "userId": 18947, "username": "bLue", "nickname": "bLue", "avatar": "5c28ecf39f2a6.jpg", "bannerImage": "5c4f1a0f0c2d9.png" }, "problem": { "problemId": 1000, "title": "A+B Problem", "timeLimit": 14000 } },
          { "solutionId": 7, "result": 4, "time": 0, "memory": 152, "language": "gcc", "codeLength": 262, "createdAt": 1576979086, "shared": false, "user": { "userId": 1, "username": "root", "nickname": "hack", "avatar": "", "bannerImage": "" }, "problem": { "problemId": 1180, "title": "C\u8bed\u8a00\u5b9e\u9a8c\u2014\u2014\u5355\u8bcd\u7edf\u8ba1", "timeLimit": 1000 } },
          { "solutionId": 6, "result": 4, "time": 0, "memory": 144, "language": "gcc", "codeLength": 324, "createdAt": 1576979075, "shared": false, "user": { "userId": 1, "username": "root", "nickname": "hack", "avatar": "", "bannerImage": "" }, "problem": { "problemId": 2746, "title": "\u5927\u5c0f\u5199\u8f6c\u6362", "timeLimit": 1000 } },
          { "solutionId": 5, "result": 1, "time": 76, "memory": 148, "language": "gcc", "codeLength": 402, "createdAt": 1576979067, "shared": false, "user": { "userId": 2242, "username": "lxh", "nickname": "raincloud", "avatar": "5c28ed57a2168.jpg", "bannerImage": "5c298248e00c9.jpg" }, "problem": { "problemId": 2761, "title": "\u7f16\u7801", "timeLimit": 1000 } },
          { "solutionId": 4, "result": 1, "time": 88, "memory": 144, "language": "gcc", "codeLength": 254, "createdAt": 1576979066, "shared": false, "user": { "userId": 1, "username": "root", "nickname": "hack", "avatar": "", "bannerImage": "" }, "problem": { "problemId": 1178, "title": "C\u8bed\u8a00\u5b9e\u9a8c\u2014\u2014\u6570\u7ec4\u9006\u5e8f", "timeLimit": 1000 } },
          { "solutionId": 3, "result": 2, "time": 1010, "memory": 0, "language": "gcc", "codeLength": 586, "createdAt": 1576979060, "shared": false, "user": { "userId": 2242, "username": "lxh", "nickname": "raincloud", "avatar": "5c28ed57a2168.jpg", "bannerImage": "5c298248e00c9.jpg" }, "problem": { "problemId": 1018, "title": "\u9aa8\u724c\u94fa\u65b9\u683c", "timeLimit": 1000 } },
          { "solutionId": 2, "result": 3, "time": 851, "memory": 65536, "language": "java", "codeLength": 1285, "createdAt": 1576979039, "shared": false, "user": { "userId": 2242, "username": "lxh", "nickname": "raincloud", "avatar": "5c28ed57a2168.jpg", "bannerImage": "5c298248e00c9.jpg" }, "problem": { "problemId": 1004, "title": "Packets", "timeLimit": 1000 } },
          { "solutionId": 1, "result": 5, "time": 0, "memory": 0, "language": "gcc", "codeLength": 589, "createdAt": 1576979036, "shared": false, "user": { "userId": 2242, "username": "lxh", "nickname": "raincloud", "avatar": "5c28ed57a2168.jpg", "bannerImage": "5c298248e00c9.jpg" }, "problem": { "problemId": 1004, "title": "Packets", "timeLimit": 1000 } }
        ]
      },
    }
  }

  componentDidMount() {
    // @ts-ignore
    this._mockSolutionRefreshTimer = setTimeout(() => {
      this.setState({
        solutionList: {
          "page": 1, "count": 7381684, "limit": 8, "rows": [
            { "solutionId": 8, "result": 1, "time": 252, "memory": 180, "language": "g++", "codeLength": 2333, "createdAt": 1576979088, "shared": false, "user": { "userId": 18947, "username": "bLue", "nickname": "bLue", "avatar": "5c28ecf39f2a6.jpg", "bannerImage": "5c4f1a0f0c2d9.png" }, "problem": { "problemId": 1000, "title": "A+B Problem", "timeLimit": 14000 } },
            { "solutionId": 7, "result": 4, "time": 0, "memory": 152, "language": "gcc", "codeLength": 262, "createdAt": 1576979086, "shared": false, "user": { "userId": 1, "username": "root", "nickname": "hack", "avatar": "", "bannerImage": "" }, "problem": { "problemId": 1180, "title": "C\u8bed\u8a00\u5b9e\u9a8c\u2014\u2014\u5355\u8bcd\u7edf\u8ba1", "timeLimit": 1000 } },
            { "solutionId": 6, "result": 4, "time": 0, "memory": 144, "language": "gcc", "codeLength": 324, "createdAt": 1576979075, "shared": false, "user": { "userId": 1, "username": "root", "nickname": "hack", "avatar": "", "bannerImage": "" }, "problem": { "problemId": 2746, "title": "\u5927\u5c0f\u5199\u8f6c\u6362", "timeLimit": 1000 } },
            { "solutionId": 5, "result": 1, "time": 76, "memory": 148, "language": "gcc", "codeLength": 402, "createdAt": 1576979067, "shared": false, "user": { "userId": 2242, "username": "lxh", "nickname": "raincloud", "avatar": "5c28ed57a2168.jpg", "bannerImage": "5c298248e00c9.jpg" }, "problem": { "problemId": 2761, "title": "\u7f16\u7801", "timeLimit": 1000 } },
            { "solutionId": 4, "result": 1, "time": 88, "memory": 144, "language": "gcc", "codeLength": 254, "createdAt": 1576979066, "shared": false, "user": { "userId": 1, "username": "root", "nickname": "hack", "avatar": "", "bannerImage": "" }, "problem": { "problemId": 1178, "title": "C\u8bed\u8a00\u5b9e\u9a8c\u2014\u2014\u6570\u7ec4\u9006\u5e8f", "timeLimit": 1000 } },
            { "solutionId": 3, "result": 2, "time": 1010, "memory": 0, "language": "gcc", "codeLength": 586, "createdAt": 1576979060, "shared": false, "user": { "userId": 2242, "username": "lxh", "nickname": "raincloud", "avatar": "5c28ed57a2168.jpg", "bannerImage": "5c298248e00c9.jpg" }, "problem": { "problemId": 1018, "title": "\u9aa8\u724c\u94fa\u65b9\u683c", "timeLimit": 1000 } },
            { "solutionId": 2, "result": 3, "time": 851, "memory": 65536, "language": "java", "codeLength": 1285, "createdAt": 1576979039, "shared": false, "user": { "userId": 2242, "username": "lxh", "nickname": "raincloud", "avatar": "5c28ed57a2168.jpg", "bannerImage": "5c298248e00c9.jpg" }, "problem": { "problemId": 1004, "title": "Packets", "timeLimit": 1000 } },
            { "solutionId": 1, "result": 5, "time": 0, "memory": 0, "language": "gcc", "codeLength": 589, "createdAt": 1576979036, "shared": false, "user": { "userId": 2242, "username": "lxh", "nickname": "raincloud", "avatar": "5c28ed57a2168.jpg", "bannerImage": "5c298248e00c9.jpg" }, "problem": { "problemId": 1004, "title": "Packets", "timeLimit": 1000 } }
          ]
        },
      })
    }, 14000);
  }

  componentWillUnmount() {
    clearTimeout(this._mockSolutionRefreshTimer);
  }

  shouldComponentUpdate(nextProps: Readonly<IntroProps>, nextState: Readonly<IntroState>) {
    if (nextProps.theme !== this.props.theme) {
      return true;
    }
    if (nextProps.requestThemeChange !== this.props.requestThemeChange) {
      return true;
    }
    if (nextState.solutionCalendarPeriod !== this.state.solutionCalendarPeriod) {
      return true;
    }
    if (nextState.solutionList !== this.state.solutionList) {
      return true;
    }
    return false;
  }

  renderProblemDetailDemo = () => {
    const data = demoData.problemDetail;
    return (
      <div style={{ display: 'flex' }}>
        <Row gutter={16} className="content-view">
          <Col xs={24} md={18} xxl={18}>
            <Card bordered={false}>
              <ProblemContent loading={loading} data={data} />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={6}>
            <Card bordered={false} className={styles.buttonSeries}>
              <Button type="primary" block>Submit</Button>
              <Button block disabled={loading} className={styles.buttonMt}>Solutions</Button>
              <Button block disabled={loading} className={styles.buttonMt}>Topics</Button>
              <Button.Group className={styles.buttonMt} style={{ width: '100%' }}>
                <Button className="text-ellipsis" style={{ width: '50%' }} title="Star">
                  <Icon type="star" theme="outlined" />
                </Button>
                <Button className="text-ellipsis" style={{ width: '50%' }} title="Share">
                  <Icon type="share-alt" theme="outlined" />
                </Button>
              </Button.Group>
            </Card>
            <Card bordered={false} className={styles.infoBoard}>
              <table>
                <tbody>
                  <tr>
                    <td>Time Limit</td>
                    <td>{data.timeLimit || 0} ms</td>
                  </tr>
                  <tr>
                    <td>Mem. Limit</td>
                    <td>{data.memoryLimit || 0} KiB</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  renderSolutionListDemo = () => {
    const { count, page, rows } = this.state.solutionList;
    const isDetail = false;
    const contestId = undefined;
    const problemList = [];
    const showPagination = true;
    return (
      <Row gutter={16}>
        <Col xs={24} lg={18}>
          <Card bordered={false} className="list-card">
            <Table
              dataSource={rows}
              rowKey="solutionId"
              loading={loading}
              pagination={false}
              className={classNames(
                'responsive-table',
                {
                  'click-table': !isDetail,
                  'single-row-table': isDetail,
                }
              )}
            >
              {isDetail && <Table.Column
                title="ID"
                key="ID"
                render={(text, record: ISolution) => (
                  <span>{record.solutionId}</span>
                )}
              />}
              <Table.Column
                title="User"
                key="User"
                render={(text, record: ISolution) => (
                  <UserBar user={record.user} isContestUser={record.contest && record.contest.type === ContestTypes.Register} disableJump />
                )}
              />
              <Table.Column
                title="Prob."
                key="Problem"
                render={(text, record: ISolution) => {
                  let contestProblem = null;
                  if (contestId && problemList) {
                    for (const problem of problemList) {
                      if (problem.problemId === record.problem.problemId) {
                        contestProblem = problem;
                        break;
                      }
                    }
                  }
                  return <ProblemBar
                    problem={contestProblem || record.problem}
                    contestId={contestId}
                    index={contestProblem ? contestProblem.index : undefined}
                    disableJump
                  />;
                }}
              />
              <Table.Column
                title="Res."
                key="Result"
                dataIndex="solutionId"
                className="result-bar"
                render={(text, record: ISolution) => (
                  <ResultBar percent={0} timeLimit={record.problem.timeLimit} result={record.result} />
                )}
              />
              <Table.Column
                title="Time"
                key="Time"
                className="near-result-bar"
                render={(text, record: ISolution) => (
                  <span>{record.time}</span>
                )}
              />
              <Table.Column
                title="Mem."
                key="Memory"
                render={(text, record: ISolution) => (
                  <span>{record.memory}</span>
                )}
              />
              <Table.Column
                title="Len."
                key="Length"
                render={(text, record: ISolution) => (
                  <span>{record.codeLength}</span>
                )}
              />
              <Table.Column
                title="Lang."
                key="Language"
                render={(text, record: ISolution) => (
                  <span>{langsMap[record.language] ? langsMap[record.language].displayShortName : record.language}</span>
                )}
              />
              <Table.Column
                title="At"
                key="At"
                render={(text, record: ISolution) => (
                  <TimeBar time={record.createdAt * 1000} />
                )}
              />
              {!isDetail && <Table.Column
                title=""
                key=""
                className="float-btn"
                render={(text, record: ISolution) => {
                  return (
                    <Icon type="ellipsis" theme="outlined" />
                  );
                }}
              />}
            </Table>
            {showPagination ? <Pagination
              className="ant-table-pagination"
              total={count}
              current={page}
              pageSize={limits.solutions.list}
            /> : <div />}
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card bordered={false}>
            <ToDetailCard
              label="Go to Solution"
              placeholder="Solution ID"
              disableActionTrigger
            />
          </Card>
          <Card bordered={false}>
            <FilterCard fields={[
              { displayName: 'Owner User ID', fieldName: 'userId' },
              { displayName: 'Problem ID', fieldName: 'problemId' },
              {
                displayName: 'Language', fieldName: 'language', options: langs.map(lang => {
                  return { fieldName: lang.fieldName, displayName: lang.displayShortName };
                }),
              },
              {
                displayName: 'Result', fieldName: 'result', options: results.filter(res => {
                  return res.id !== Results.WT && res.id !== Results.JG;
                }).map(res => {
                  return { fieldName: res.id, displayName: res.fullName };
                }),
              },
            ]} disableActionTrigger />
          </Card>
        </Col>
      </Row>
    );
  }

  renderContestOverviewDemo = () => {
    const {
      detail, problems, problemResultStats: contestProblemResultStats, userProblemResultStats,
    } = demoData.contest;
    const problemsLoading = false;
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    const { acceptedProblemIds, attemptedProblemIds } = userProblemResultStats;

    return (
      <div style={{ display: 'flex' }}>
        <Row gutter={16} className="content-view">
          <Col xs={24}>
            <Card bordered={false}>
              <h2 className="text-center">{detail.title}</h2>
              <p className="text-center" style={{ marginBottom: '5px' }}>
                <span>{moment(startTime).format('YYYY-MM-DD HH:mm')} ~ {moment(endTime).format('YYYY-MM-DD HH:mm')}</span>
              </p>
              <p className="text-center">
                <TimeStatusBadge start={startTime} end={endTime} cur={currentTime} />
              </p>
              <div
                dangerouslySetInnerHTML={{ __html: xss(detail.description) }}
                className="content-area"
                style={{ marginTop: '15px' }}
              />
            </Card>
            {timeStatus !== 'Pending' &&
              <Card bordered={false} className="list-card">
                <Table
                  // @ts-ignore
                  dataSource={problems.rows}
                  rowKey="problemId"
                  loading={problemsLoading}
                  pagination={false}
                  className="responsive-table"
                  rowClassName={(record: IProblem) => classNames(
                    'problem-result-mark-row',
                    { 'accepted': ~acceptedProblemIds.indexOf(record.problemId) },
                    { 'attempted': ~attemptedProblemIds.indexOf(record.problemId) }
                  )}
                >
                  <Table.Column
                    title=""
                    key="Index"
                    render={(text, record: IProblem, index) => (
                      <div>{numberToAlphabet(index)}</div>
                    )}
                  />
                  <Table.Column
                    title="Title"
                    key="Title"
                    render={(text, record: IProblem, index) => (
                      <div>
                        <a>{record.title}</a>
                      </div>
                    )}
                  />
                  <Table.Column
                    title="Stats"
                    key="Statistics"
                    className="no-wrap"
                    render={(text, record: IProblem) => {
                      if (!contestProblemResultStats[record.problemId]) {
                        return null;
                      }
                      return (
                        <SolutionResultStats
                          accepted={contestProblemResultStats[record.problemId].accepted}
                          submitted={contestProblemResultStats[record.problemId].submitted}
                        />
                      );
                    }}
                  />
                </Table>
              </Card>}
          </Col>
        </Row>
      </div>
    );
  }

  handleSolutionCalendarPeriodChange = value => {
    this.setState({ solutionCalendarPeriod: value });
  };

  renderUserDetailDemo = () => {
    // @ts-ignore
    const data = demoData.userDetail as IUser;
    const solutionCalendarYears = new Set();
    (data.solutionCalendar || []).forEach(d => {
      const year = +d.date.split('-')[0];
      solutionCalendarYears.add(year);
    });
    const bannerImageLoading = false;
    const { solutionCalendarPeriod } = this.state;

    return (
      <div>
        <div className={classNames('u-bbg', { thumb: bannerImageLoading, 'no-banner': !data.bannerImage })} style={{
          backgroundImage: data.bannerImage ? `url(${constants.bannerImageUrlPrefix}${data.bannerImage})` : undefined,
          marginTop: 0,
          height: '416px',
        }} />
        <div className="content-view" style={{ position: 'relative' }}>
          <div className="u-header" style={{ height: '60px' }}>
            <span className="u-avatar">
              <Avatar size={120} icon="user" src={formatAvatarUrl(data.avatar)} />
            </span>
            <span className="u-info">
              <h1>{data.nickname}</h1>
            </span>
          </div>

          <div className="u-content">
            <Row gutter={16}>
              <Col xs={24} md={18} xxl={18}>
                <Card bordered={false}>
                  <h3>Rating</h3>
                  <Rating rating={data.rating} ratingHistory={data.ratingHistory || []} loading={loading} />
                </Card>

                <Card bordered={false}>
                  <h3>
                    AC Calendar
                    <Select
                      defaultValue={null}
                      className="float-right"
                      size="small"
                      onChange={this.handleSolutionCalendarPeriodChange}
                    >
                      {(Array.from(solutionCalendarYears) as number[]).map(y =>
                        <Select.Option key={`${y}`} value={y}>{y}</Select.Option>
                      )}
                      <Select.Option value={null}>Recent</Select.Option>
                    </Select>
                  </h3>
                  <SolutionCalendar
                    data={data.solutionCalendar}
                    startDate={solutionCalendarPeriod ? `${solutionCalendarPeriod}-01-01` : undefined}
                    endDate={solutionCalendarPeriod ? `${solutionCalendarPeriod}-12-31` : undefined}
                  />
                </Card>
              </Col>
              <Col xs={24} md={6} xxl={6}>
                <Card bordered={false}>
                  <div style={{ width: '100%' }}>
                    <a className="normal-text-link">
                      <div style={{ display: 'block', width: '50%', float: 'left', textAlign: 'center' }}>
                        <p style={{ marginBottom: '4px', fontSize: '16px', height: '25px' }}><strong>{data.accepted}</strong></p>
                        <p style={{ fontSize: '12px' }}>AC</p>
                      </div>
                    </a>
                    <a className="normal-text-link">
                      <div style={{ display: 'block', width: '50%', float: 'left', textAlign: 'center' }} className="card-block-divider">
                        <p style={{ marginBottom: '4px', fontSize: '16px', height: '25px' }}><strong>{data.submitted}</strong></p>
                        <p style={{ fontSize: '12px' }}>Submitted</p>
                      </div>
                    </a>
                  </div>
                </Card>
                <Card bordered={false} className={userStyles.infoBoard}>
                  <table>
                    <tbody>
                      <tr>
                        <td>School</td>
                        <td>{xss(data.school)}</td>
                      </tr>
                      <tr>
                        <td>College</td>
                        <td>{xss(data.college)}</td>
                      </tr>
                      <tr>
                        <td>Major</td>
                        <td>{xss(data.major)}</td>
                      </tr>
                      {data.class ?
                        <tr>
                          <td>Class</td>
                          <td>{xss(data.class)}</td>
                        </tr> : null}
                      {data.site ?
                        <tr>
                          <td>Site</td>
                          <td><a href={xss(data.site)} target="_blank">{xss(data.site)}</a></td>
                        </tr> : null}
                    </tbody>
                  </table>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }

  handleThemeChange = (e) => {
    this.props.requestThemeChange(e.target.value);
  }

  renderFavorite = () => {
    return (
      <div style={{ maxWidth: '270px' }}>
        <Card bordered={false} className={styles.buttonSeries}>
          <Button disabled type="primary" block>Submit</Button>
          <Button disabled block className={styles.buttonMt}>Solutions</Button>
          <Button disabled block className={styles.buttonMt}>Topics</Button>
          <Button.Group className={styles.buttonMt} style={{ width: '100%' }}>
            <Button className="text-ellipsis" style={{ width: '50%' }} title="Star">
              <Icon type="star" theme="outlined" />
            </Button>
            <Button disabled className="text-ellipsis" style={{ width: '50%' }} title="Share">
              <Icon type="share-alt" theme="outlined" />
            </Button>
          </Button.Group>
        </Card>
      </div>
    );
  }

  renderTagList = () => {
    const tagList = demoData.tags;
    return (
      <Card bordered={false} style={{ maxWidth: '250px' }}>
        <div className="tags">
          {tagList.rows.map(tag =>
            <Popover key={tag.tagId} content={`${tag.name.en} / ${tag.name.zhHans} / ${tag.name.zhHant}`}>
              <a><Tag color={null}>{tag.name.en}</Tag></a>
            </Popover>
          )}
        </div>
      </Card>
    );
  }

  renderIdeaNotes = () => {
    return (
      <div className="ant-popover menu-popover inner-content-scroll-md ant-popover-placement-bottom" style={{ position: 'relative' }}>
        <div className="ant-popover-content">
          <div className="ant-popover-arrow"></div>
          <div className="ant-popover-inner" role="tooltip">
            <div>
              <div className="ant-popover-title">Idea Notes</div>
              <div className="ant-popover-inner-content">
                <div className="IdeaNotes__container___-DK-A">
                  <form className="ant-form ant-form-vertical ant-form-hide-required-mark">
                    <div className="ant-row ant-form-item" style={{ marginBottom: '0px' }}>
                      <div className="ant-form-item-control-wrapper">
                        <div className="ant-form-item-control">
                          <span className="ant-form-item-children">
                            <textarea
                              placeholder="Type new idea..." id="content" className="ant-input"
                              style={{ height: '52px', minHeight: '52px', maxHeight: '136px', overflowY: 'hidden' }}></textarea>
                          </span>
                        </div>
                      </div>
                    </div>
                  </form><button type="button" className="ant-btn ant-btn-primary ant-btn-block"
                    style={{ marginTop: '4px', marginBottom: '12px' }}>
                    <span>Save </span><i className="anticon anticon-bulb"><svg
                      viewBox="64 64 896 896" className="" data-icon="bulb" width="1em" height="1em" fill="currentColor"
                      aria-hidden="true" focusable="false">
                      <path
                        d="M632 888H392c-4.4 0-8 3.6-8 8v32c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32v-32c0-4.4-3.6-8-8-8zM512 64c-181.1 0-328 146.9-328 328 0 121.4 66 227.4 164 284.1V792c0 17.7 14.3 32 32 32h264c17.7 0 32-14.3 32-32V676.1c98-56.7 164-162.7 164-284.1 0-181.1-146.9-328-328-328zm127.9 549.8L604 634.6V752H420V634.6l-35.9-20.8C305.4 568.3 256 484.5 256 392c0-141.4 114.6-256 256-256s256 114.6 256 256c0 92.5-49.4 176.3-128.1 221.8z">
                      </path>
                    </svg></i></button>
                  <div className="ant-list ant-list-sm ant-list-split">
                    <div className="ant-spin-nested-loading">
                      <div className="ant-spin-container">
                        <div className="ant-list-item IdeaNotes__item___bx5b3">
                          <div className="ant-list-item-meta">
                            <div className="ant-list-item-meta-content">
                              <h4 className="ant-list-item-meta-title">
                                <pre>回去看马老师第六章</pre>
                              </h4>
                              <div className="ant-list-item-meta-description">
                                <div>
                                  <p className="IdeaNotes__footer___h6Ray"><span className="no-wrap">2 minutes ago</span></p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ant-list-item IdeaNotes__item___bx5b3">
                          <div className="ant-list-item-meta">
                            <div className="ant-list-item-meta-content">
                              <h4 className="ant-list-item-meta-title">
                                <pre>目前想到应该用递推，吃完饭回去推一下</pre>
                              </h4>
                              <div className="ant-list-item-meta-description">
                                <div><a>
                                  <div className="ant-tag">骨牌铺方格</div>
                                </a>
                                  <p className="IdeaNotes__footer___h6Ray"><span className="no-wrap">9 minutes ago</span></p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ant-list-item IdeaNotes__item___bx5b3">
                          <div className="ant-list-item-meta">
                            <div className="ant-list-item-meta-content">
                              <h4 className="ant-list-item-meta-title">
                                <pre>这题的唯一正确解法，学习了</pre>
                              </h4>
                              <div className="ant-list-item-meta-description">
                                <div><a>
                                  <div className="ant-tag">AC / SDUT Round #3 - 2017... / D - Legion Commander</div>
                                </a>
                                  <p className="IdeaNotes__footer___h6Ray"><span className="no-wrap">21 minutes ago</span></p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ant-list-item IdeaNotes__item___bx5b3">
                          <div className="ant-list-item-meta">
                            <div className="ant-list-item-meta-content">
                              <h4 className="ant-list-item-meta-title">
                                <pre>这题输入输出很坑</pre>
                              </h4>
                              <div className="ant-list-item-meta-description">
                                <div><a>
                                  <div className="ant-tag">SDUT Round #3 - 2017... / B - 简单时间转换</div>
                                </a>
                                  <p className="IdeaNotes__footer___h6Ray"><span className="no-wrap">50 minutes ago</span></p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCodeShare = () => {
    const theme = this.props.theme;
    const data = demoData.solutionDetail;
    const langsMap4Hljs = {
      'gcc': 'cpp',
      'g++': 'cpp',
      'java': 'java',
      'python2': 'python',
      'python3': 'python',
      'c#': 'cs',
    };

    const highlighterLineNumberStyle = {
      float: 'left',
      paddingRight: '20px',
      textAlign: 'right',
      opacity: '.5',
    };

    return (
      <Card bordered={false}>
        <div style={{ width: '360px' }}>
          <div style={{ height: '32px' }}>
            <div className="float-left">
              <span>Share Code</span>
              <Switch
                checked={data.shared} disabled={loading} loading={false}
                className="ml-lg" />
            </div>
            <div className="float-right"><CopyToClipboardButton text={data.code} addNewLine={false} /></div>
          </div>
          <SyntaxHighlighter
            language={langsMap4Hljs[data.language]}
            showLineNumbers
            style={theme === 'dark' ? atomOneDark : atomOneLight}
            lineNumberContainerStyle={highlighterLineNumberStyle}
          >
            {data.code}
          </SyntaxHighlighter>
        </div>
      </Card>
    );
  }

  render() {
    const { theme } = this.props;

    return (
      <>
        <div className="block full-block">
          <div className="header">全新，焕然一新</div>
          <p className="desc">{NAME} 带来了全新的视觉改动。仅是初见，秩序和动感的结合，已跃然屏上。</p>

          <Card bordered={false} className="demo">
            <Carousel autoplay autoplaySpeed={3000}>
              {this.renderProblemDetailDemo()}
              {this.renderSolutionListDemo()}
              {this.renderContestOverviewDemo()}
            </Carousel>
          </Card>
        </div>

        <div className="block full-block">
          <div className="header">你的主页，本应由你定制</div>
          <p className="desc">自制头像以及极具冲击力的巨幅，配合 Rating 和 AC 日历，个性从未如此释放。</p>
          <Card bordered={false} className="demo">
            {this.renderUserDetailDemo()}
          </Card>
        </div>

        <div className="block full-block">
          <div className="header">黑，真的黑</div>
          <p className="desc">作为可能是*最早支持 Dark Mode 的 OJ，反复调整的配色设计，深邃，而不失优雅。</p>
          <div className="flex-center" style={{ marginBottom: '45px' }}>
            <Radio.Group
              onChange={this.handleThemeChange}
              defaultValue={theme}
            >
              <Radio.Button value="light">Light Mode</Radio.Button>
              <Radio.Button value="dark">Dark Mode</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        <div className="block side-block">
          <div className="intro">
            <div className="header">收藏夹，存你所好</div>
            <p className="desc">遇到有价值的内容，只需轻点，即可存储到个人收藏。</p>
          </div>
          <div className="demo">
            {this.renderFavorite()}
          </div>
        </div>

        <div className="block side-block">
          <div className="intro">
            <div className="header">题目标签，选你所想</div>
            <p className="desc">现在，按知识点查找题目从未如此轻松。</p>
          </div>
          <div className="demo">
            {this.renderTagList()}
          </div>
        </div>

        <div className="block side-block">
          <div className="intro">
            <div className="header">闪念笔记</div>
            <div className="desc">
              <p>无论何时何地，记录即刻想法。</p>
              <p>闪念笔记会在记录时智慧关联你正在浏览的题目、提交或比赛，需要回看时，轻点即可返回保存点。</p>
            </div>
          </div>
          <div className="demo">
            {this.renderIdeaNotes()}
          </div>
        </div>

        <div className="block side-block">
          <div className="intro">
            <div className="header">代码共享</div>
            <p className="desc">公开代码分享你的见解，或是从他人身上学习。</p>
          </div>
          <div className="demo">
            {this.renderCodeShare()}
          </div>
        </div>
      </>
    );
  }
}

interface Props extends FormProps, ReduxProps {
  settings: ISettings;
}

interface State {
  submitting: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

class Beta extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};
  private _mountedAt: number = 0;
  setStatePromise = setStatePromise.bind(this);

  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      viewportWidth: 0,
      viewportHeight: 0,
    };
  }

  componentDidMount() {
    this._mountedAt = Date.now();
    this.saveViewportDimensions();
    window.addEventListener('resize', this.saveViewportDimensions);
    window.addEventListener('orientationchange', this.saveViewportDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.saveViewportDimensions);
    window.removeEventListener('orientationchange', this.saveViewportDimensions);
  }

  private saveViewportDimensions = throttle(() => {
    this.setState({
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
  }, 250);

  handleThemeChange = (theme: ISettingsTheme) => {
    this.props.dispatch({
      type: 'settings/setTheme',
      payload: { theme },
    });
    tracker.event({
      category: 'beta',
      action: 'setTheme',
      label: theme,
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        tracker.event({
          category: 'beta',
          action: 'preorder',
        });
        tracker.timing({
          category: 'beta',
          variable: 'viewToPreorder',
          value: Date.now() - this._mountedAt,
        });
        try {
          this.setState({
            submitting: true,
          });
          await request('https://acm.sdut.edu.cn/web-activities/oj3-intro/join', {
            method: 'post',
            data: values,
          });
          this.props.form.resetFields();
          Modal.success({
            content: '预约成功',
            okText: 'OJBK',
          });
          tracker.event({
            category: 'beta',
            action: 'preorderDone',
          });
        } catch (e) {
          console.error('preorder error.', e);
          msg.error('请求发生错误，请重试');
          tracker.event({
            category: 'beta',
            action: 'preorderError',
          });
          tracker.exception({
            description: e.toString(),
          });
        } finally {
          this.setState({
            submitting: false,
          });
        }
      }
    });
  }

  renderExtLink = (href: string, inner: React.ReactNode) => {
    return (
      <a
        className="normal-text-link"
        href={href}
        target="_blank"
        onClick={() => {
          tracker.event({
            category: 'beta',
            action: 'extLink',
            label: href,
          });
        }}
      >{inner}</a>
    );
  }

  render() {
    const { settings } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { submitting, viewportWidth, viewportHeight } = this.state;
    const isUnsupportedMobile = viewportWidth < 724;

    if (isUnsupportedMobile) {
      return (
        <PageTitle title="OnlineJudge 3">
          <div className="beta" style={{ padding: '100px 30px 30px' }}>
            <h3>很抱歉，你的设备的分辨率暂未支持</h3>
            <p style={{ marginBottom: '45px' }}>not supported: {viewportWidth}x{viewportHeight}</p>
            <p>如果是移动设备，请尝试横屏或使用桌面设备。</p>
            <p>如果是桌面设备，请尝试将浏览器窗口放大。</p>
          </div>
        </PageTitle>
      );
    }

    return (
      <PageTitle title="OnlineJudge 3">
        <div className="beta">
          {/* <div style={{ position: 'fixed' }}>
            <Button onClick={() => {
              this.props.dispatch({
                type: 'settings/setTheme',
                payload: { theme: 'light' },
              })
            }}>Light</Button>
            <Button onClick={() => {
              this.props.dispatch({
                type: 'settings/setTheme',
                payload: { theme: 'dark' },
              })
            }}>Dark</Button>
          </div> */}

          <div className="ultra-banner">
            <p className="title">{NAME}</p>
          </div>

          <div className="content">
            <Intro theme={settings.theme} requestThemeChange={this.handleThemeChange} />

            <div className="block full-block" style={{ marginTop: '60px' }}>
              <div className="header">公测在即，即刻预约</div>
              <p className="desc">{NAME} 即将正式开启公测，现在预约，提前获知最新动态。</p>
              <div className="center-form" style={{ marginBottom: '60px' }}>
                <Form layout="vertical" hideRequiredMark={true} onSubmit={this.handleSubmit}>
                  <Form.Item label="电子邮箱">
                    {getFieldDecorator('email', {
                      rules: [{
                        type: 'email', message: '请输入有效的电子邮箱地址',
                      }, {
                        required: true, message: '请输入电子邮箱',
                      }],
                    })(<Input />)}
                  </Form.Item>

                  <Form.Item label="OJ 用户名（选填）">
                    {getFieldDecorator('username', {
                      rules: [{ required: false }],
                    })(<Input />)}
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" block htmlType="submit" loading={submitting}>提交</Button>
                  </Form.Item>
                </Form>
              </div>
            </div>

            <div className="footer">
              <div className="block">
              <div className="header">资源</div>
                <p className="item">
                  {this.renderExtLink(`https://acm.sdut.edu.cn/sdutacm_files/onlinejudge3/OnlineJudge3_poster_${settings.theme}_1080p.png`, <span><Icon type="download" /> {NAME} 主题壁纸</span>)}
                </p>
                <p className="item">
                  {this.renderExtLink('https://acm.sdut.edu.cn/sdutacm_files/onlinejudge3/OnlineJudge%203%20%E5%8F%91%E5%B8%83%E4%BC%9A%E4%B8%BB%E9%A2%98%E6%BC%94%E8%AE%B2%E5%9B%9E%E9%A1%BE.pdf', <span><Icon type="download" /> 2018 年 10 月 18 日 / {NAME} 发布会主题演讲幻灯片</span>)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageTitle>
    );
  }
}

function mapStateToProps(state) {
  return {
    settings: state.settings,
  };
}

export default connect(mapStateToProps)(Form.create()(Beta));
