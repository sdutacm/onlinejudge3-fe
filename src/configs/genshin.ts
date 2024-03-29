export const genshinResourceDirUrl = `${process.env.CDN_URL}/public/genshin-resources`;

/**
 * Genshin characters.
 * @until 4.2
 */
const genshinCharactersRaw = [
  {
    id: 'Albedo',
    nameZh: '阿贝多',
    element: '岩',
    star: 5,
  },
  {
    id: 'Aloy',
    nameZh: '埃洛伊',
    element: '冰',
    star: 5,
  },
  {
    id: 'Alhatham',
    nameZh: '艾尔海森',
    element: '草',
    star: 5,
  },
  {
    id: 'Ambor',
    nameZh: '安柏',
    element: '火',
    star: 4,
  },
  {
    id: 'Yae',
    nameZh: '八重神子',
    element: '雷',
    star: 5,
  },
  {
    id: 'Barbara',
    nameZh: '芭芭拉',
    element: '水',
    star: 4,
  },
  {
    id: 'Baizhuer',
    nameZh: '白术',
    element: '草',
    star: 5,
  },
  {
    id: 'Bennett',
    nameZh: '班尼特',
    element: '火',
    star: 4,
  },
  {
    id: 'Beidou',
    nameZh: '北斗',
    element: '雷',
    star: 4,
  },
  {
    id: 'Chongyun',
    nameZh: '重云',
    element: '冰',
    star: 4,
  },
  {
    id: 'Tartaglia',
    nameZh: '达达利亚',
    element: '水',
    star: 5,
  },
  {
    id: 'Diona',
    nameZh: '迪奥娜',
    element: '冰',
    star: 4,
  },
  {
    id: 'Diluc',
    nameZh: '迪卢克',
    element: '火',
    star: 5,
  },
  {
    id: 'Dehya',
    nameZh: '迪希雅',
    element: '火',
    star: 5,
  },
  {
    id: 'Dori',
    nameZh: '多莉',
    element: '雷',
    star: 4,
  },
  {
    id: 'Faruzan',
    nameZh: '珐露珊',
    element: '风',
    star: 4,
  },
  {
    id: 'Freminet',
    nameZh: '菲米尼',
    element: '冰',
    star: 4,
  },
  {
    id: 'Fischl',
    nameZh: '菲谢尔',
    element: '雷',
    star: 4,
  },
  {
    id: 'Kazuha',
    nameZh: '枫原万叶',
    element: '风',
    star: 5,
  },
  {
    id: 'Furina',
    nameZh: '芙宁娜',
    element: '水',
    star: 5,
  },
  {
    id: 'Ganyu',
    nameZh: '甘雨',
    element: '冰',
    star: 5,
  },
  {
    id: 'Hutao',
    nameZh: '胡桃',
    element: '火',
    star: 5,
  },
  {
    id: 'Itto',
    nameZh: '荒泷一斗',
    element: '岩',
    star: 5,
  },
  {
    id: 'Sara',
    nameZh: '九条裟罗',
    element: '雷',
    star: 4,
  },
  {
    id: 'Shinobu',
    nameZh: '久岐忍',
    element: '雷',
    star: 4,
  },
  {
    id: 'Kaveh',
    nameZh: '卡维',
    element: '草',
    star: 4,
  },
  {
    id: 'Kaeya',
    nameZh: '凯亚',
    element: '冰',
    star: 4,
  },
  {
    id: 'Candace',
    nameZh: '坎蒂丝',
    element: '水',
    star: 4,
  },
  {
    id: 'Collei',
    nameZh: '柯莱',
    element: '草',
    star: 4,
  },
  {
    id: 'Klee',
    nameZh: '可莉',
    element: '火',
    star: 5,
  },
  {
    id: 'Keqing',
    nameZh: '刻晴',
    element: '雷',
    star: 5,
  },
  {
    id: 'Wriothesley',
    nameZh: '莱欧斯利',
    element: '冰',
    star: 5,
  },
  {
    id: 'Layla',
    nameZh: '莱依拉',
    element: '冰',
    star: 4,
  },
  {
    id: 'Shougun',
    nameZh: '雷电将军',
    element: '雷',
    star: 5,
  },
  {
    id: 'Razor',
    nameZh: '雷泽',
    element: '雷',
    star: 4,
  },
  {
    id: 'Lisa',
    nameZh: '丽莎',
    element: '雷',
    star: 4,
  },
  {
    id: 'Liney',
    nameZh: '林尼',
    element: '火',
    star: 5,
  },
  {
    id: 'Linette',
    nameZh: '琳妮特',
    element: '风',
    star: 4,
  },
  {
    id: 'Wanderer',
    nameZh: '流浪者',
    element: '风',
    star: 5,
  },
  {
    id: 'Heizo',
    nameZh: '鹿野院平藏',
    element: '风',
    star: 4,
  },
  {
    id: 'Rosaria',
    nameZh: '罗莎莉亚',
    element: '冰',
    star: 4,
  },
  {
    id: 'Mika',
    nameZh: '米卡',
    element: '冰',
    star: 4,
  },
  {
    id: 'Mona',
    nameZh: '莫娜',
    element: '水',
    star: 5,
  },
  {
    id: 'Neuvillette',
    nameZh: '那维莱特',
    element: '水',
    star: 5,
  },
  {
    id: 'Nahida',
    nameZh: '纳西妲',
    element: '草',
    star: 5,
  },
  {
    id: 'Nilou',
    nameZh: '妮露',
    element: '水',
    star: 5,
  },
  {
    id: 'Ningguang',
    nameZh: '凝光',
    element: '岩',
    star: 4,
  },
  {
    id: 'Noel',
    nameZh: '诺艾尔',
    element: '岩',
    star: 4,
  },
  {
    id: 'Qiqi',
    nameZh: '七七',
    element: '冰',
    star: 5,
  },
  {
    id: 'Momoka',
    nameZh: '绮良良',
    element: '草',
    star: 4,
  },
  {
    id: 'Qin',
    nameZh: '琴',
    element: '风',
    star: 5,
  },
  {
    id: 'Cyno',
    nameZh: '赛诺',
    element: '雷',
    star: 5,
  },
  {
    id: 'Sucrose',
    nameZh: '砂糖',
    element: '风',
    star: 4,
  },
  {
    id: 'Kokomi',
    nameZh: '珊瑚宫心海',
    element: '水',
    star: 5,
  },
  {
    id: 'Shenhe',
    nameZh: '申鹤',
    element: '冰',
    star: 5,
  },
  {
    id: 'Ayaka',
    nameZh: '神里绫华',
    element: '冰',
    star: 5,
  },
  {
    id: 'Ayato',
    nameZh: '神里绫人',
    element: '水',
    star: 5,
  },
  {
    id: 'Tighnari',
    nameZh: '提纳里',
    element: '草',
    star: 5,
  },
  {
    id: 'Tohma',
    nameZh: '托马',
    element: '火',
    star: 4,
  },
  {
    id: 'Venti',
    nameZh: '温迪',
    element: '风',
    star: 5,
  },
  {
    id: 'Gorou',
    nameZh: '五郎',
    element: '岩',
    star: 4,
  },
  {
    id: 'Charlotte',
    nameZh: '夏洛蒂',
    element: '冰',
    star: 4,
  },
  {
    id: 'Xiangling',
    nameZh: '香菱',
    element: '火',
    star: 4,
  },
  {
    id: 'Yoimiya',
    nameZh: '宵宫',
    element: '火',
    star: 5,
  },
  {
    id: 'Xiao',
    nameZh: '魈',
    element: '风',
    star: 5,
  },
  {
    id: 'Xinyan',
    nameZh: '辛焱',
    element: '火',
    star: 4,
  },
  {
    id: 'Xingqiu',
    nameZh: '行秋',
    element: '水',
    star: 4,
  },
  {
    id: 'Feiyan',
    nameZh: '烟绯',
    element: '火',
    star: 4,
  },
  {
    id: 'Yaoyao',
    nameZh: '瑶瑶',
    element: '草',
    star: 4,
  },
  {
    id: 'Yelan',
    nameZh: '夜兰',
    element: '水',
    star: 5,
  },
  {
    id: 'Eula',
    nameZh: '优菈',
    element: '冰',
    star: 5,
  },
  {
    id: 'Yunjin',
    nameZh: '云堇',
    element: '岩',
    star: 4,
  },
  {
    id: 'Sayu',
    nameZh: '早柚',
    element: '风',
    star: 4,
  },
  {
    id: 'Zhongli',
    nameZh: '钟离',
    element: '岩',
    star: 5,
  },
  {
    id: 'PlayerBoy',
    nameZh: '旅行者·空',
    element: '?',
    star: 5,
  },
  {
    id: 'PlayerGirl',
    nameZh: '旅行者·荧',
    element: '?',
    star: 5,
  },
];

export const genshinCharacters = genshinCharactersRaw.map((c) => ({
  ...c,
  avatarIconSideUrl: `${genshinResourceDirUrl}/sprites/UI_AvatarIcon_Side_${c.id}.png`,
}));
