// 中文语言包
export default {
  // 游戏标题
  gameTitle: '股市卡牌大师',
  gameSubtitle: '用策略征服市场波动',
  systemOnline: 'Insider Loop v1.0 系统在线',

  // 卡牌属性
  attributes: {
    monkey: { label: '猴', combo: '连击：有概率翻转红绿' },
    bear: { label: '熊', combo: '连击：跌幅更深' },
    bull: { label: '牛', combo: '连击：涨幅更大' },
  },

  // 特殊规则
  specialRules: {
    none: '无',
    echo: '上一张同色时有50%概率额外±2%',
    swing: '上一张异色时有50%概率额外±3%',
    booster: '有50%概率使波动额外增加25%',
    brake: '有50%概率使波动额外减少25%',
    reverseNext: '有50%概率反转下一张涨跌方向',
    doubleNext: '有50%概率使下一张波动翻倍',
    split: '本张60%立即生效，40%在下一张后追加',
    buffer: '本张70%立即生效，30%在日终追加',
    ghost: '50%概率本张不生效，但下一张追加±2%',
    shield: '若下一张异色，下一张幅度×0.85',
    latch: '若下一张同色，下一张幅度×1.15',
  },

  // 卡牌名称
  cards: {
    // 绿色卡牌
    'g-bull-uptick': '上冲电讯',
    'g-bull-volume': '成交量激增',
    'g-bull-steady': '稳步买单',
    'g-bull-insider': '内线推力',
    'g-bull-climb': '攀升回路',
    'g-monkey-echo': '镜像买单',
    'g-monkey-glitch': '故障尖刺',
    'g-bear-relief': '空头回补',
    'g-bear-cover': '空头平仓',
    'g-monkey-feint': '猴子佯攻',
    'g-bull-ramp': '拉升信号',
    'g-bull-loop': '绿色回路',
    'g-monkey-pulse': '脉冲跳涨',
    'g-bear-calm': '平静回补',
    'g-monkey-tilt': '倾斜上冲',
    'g-quantum-boost': '量子提速',
    'g-darkpool-accumulate': '暗池吸筹',
    'g-lightcone-guard': '光锥护盘',
    'g-mirror-flicker': '镜像闪烁',
    'g-mainnet-merge': '主网聚合',
    'g-particle-arch': '微粒上拱',
    'g-protocol-heat': '协议热区',
    'g-tunnel-calibrate': '隧穿校准',
    'g-lattice-lift': '晶格缓升',
    'g-bull-beacon': '多头信标',
    // 红色卡牌
    'r-bear-dump': '红色抛压',
    'r-bear-slip': '滑落线',
    'r-bear-crush': '碾压卖单',
    'r-bear-drain': '抽干抛售',
    'r-bear-hammer': '重锤下压',
    'r-monkey-flip': '翻转陷阱',
    'r-monkey-glitch': '故障下挫',
    'r-monkey-feint': '猴子佯攻',
    'r-bull-trick': '牛市诡计',
    'r-bull-leak': '泄漏下行',
    'r-bull-fade': '衰减出货',
    'r-monkey-tilt': '倾斜下压',
    'r-bear-bleed': '失血下跌',
    'r-bull-shake': '震荡洗盘',
    'r-monkey-pinch': '卡位下落',
    'r-bear-break': '破位下行',
    'r-bull-sink': '牛市下沉',
    'r-monkey-jam': '阻塞下压',
    'r-bear-knife': '下坠飞刀',
    'r-phase-drop': '相位下挫',
    'r-darknet-vent': '黑网泄压',
    'r-entropy-retrace': '熵增回撤',
    'r-noise-collapse': '噪声塌陷',
    'r-reverse-drift': '逆向漂移',
    'r-fault-slide': '断层滑移',
    'r-bandwidth-choke': '带宽窒息',
    'r-darkline-diffuse': '暗线扩散',
    'r-cooldown-fall': '冷却坠落',
    'r-yaw-slide': '偏航下滑',
  },

  // 事件
  events: {
    'short-only': { name: '只能做空', desc: '只有下跌才盈利' },
    'circuit-breaker': { name: '熔断', desc: '每张卡最大波动 8%' },
    'dry-liquidity': { name: '流动性枯竭', desc: '所有波动降低 30%' },
    'bull-run': { name: '牛市冲刺', desc: '第一张绿卡额外 +5%' },
    'bear-bite': { name: '熊咬', desc: '第一张红卡额外 -5%' },
    'monkey-glitch': { name: '猴子故障', desc: '猴连击更易触发反转' },
    'media-frenzy': { name: '媒体狂热', desc: '所有波动提高 30%' },
    'audit-tax': { name: '审计税', desc: '盈利部分额外扣 10%' },
    'mid-reshuffle': { name: '中段重排', desc: '第5张执行后重洗剩余牌序' },
    'freeze-beat': { name: '冻结一拍', desc: '第4张牌效果被强制为0' },
    'tail-echo': { name: '尾奏回声', desc: '最后一张牌追加40%同向效果' },
    'mirror-noise': { name: '镜像噪声', desc: '第2张的50%效果在第6张再次出现' },
    'soft-retrace': { name: '软性回撤', desc: '当日涨跌幅超±8%时回补20%幅度' },
  },

  // 游戏阶段
  phases: {
    setup: '准备',
    arrange: '排序',
    running: '执行中',
    summary: '结算中',
    win: '通关',
    gameover: '失败',
  },

  // UI 文本
  ui: {
    // 状态栏
    week: '第 {n} 周',
    day: '第 {n} 天',
    cash: '现金',
    status: '状态',

    // 市场面板
    marketTerminal: '市场终端',
    price: '股价',
    shares: '持仓',
    profit: '盈亏',
    target: '目标',
    sharesUnit: '股',
    currentPrice: '当前股价',
    rising: '上涨',
    falling: '下跌',
    crit: '暴击',

    // 卡牌选择
    tradingDeck: '交易卡组',
    attribute: '属性',
    priceRange: '股价',
    specialEffect: '特殊效果',
    used: '已使用',
    reroll: '重抽',
    confirm: '确认',

    // 卡组序列
    deckSequence: '卡组序列',
    startExecution: '开始执行',
    reset: '重置',

    // 执行日志
    executionLog: '执行日志',
    hideLog: '隐藏日志',
    expandLog: '展开日志',
    noRecords: '暂无记录',

    // 模态框
    gameOver: '游戏结束',
    viewChart: '查看本局走势',
    close: '关闭',
    daySummary: '日终总结',
    currentWeekDay: '当前周/日',
    dailyChange: '当日涨跌幅',
    dailyProfit: '当日盈亏',
    currentCash: '当前现金',
    targetAsset: '目标资产',
    confirmContinue: '确认并继续',
    weekComplete: '周目标达成',
    systemAdvancing: '系统推进中...',
    confirmReset: '确认重置',
    resetWarning: '你是否要确认重新开始游戏？这会导致你所有的数据丢失。',
    cancel: '取消',

    // BGM
    bgm: 'BGM',

    // 游戏消息
    firedNoMoney: '被炒：资金不足买 1 股',
    firedNoTarget: '被炒：未达成周目标',
    winMessage: '通关成功/任务完成！您已击败{percent}%的玩家',
    weekPassed: '本周达标',
  },

  // 开始页面
  startPage: {
    title: '股市卡牌大师',
    subtitle: '用策略征服市场波动',
    startGame: '开始游戏',
    credits: '制作人员',
    gameDesign: '游戏设计',
    programming: '程序开发',
    uiDesign: 'UI/UX 设计',
    specialThanks: '特别感谢',
  },

  // 教程
  tutorial: {
    welcome: '欢迎来到股市卡牌大师',
    intro: '这是一款策略卡牌游戏，你需要通过合理安排红色和绿色卡牌来影响股价走势',
    goal: '目标：在规定周数内达到目标资产值',
    selectCards: '选择卡牌',
    selectCardsDesc: '每天开始时，你需要从红色卡牌和绿色卡牌中各选择一张',
    redCard: '红色卡牌',
    greenCard: '绿色卡牌',
    fallEffect: '下跌效果',
    riseEffect: '上涨效果',
    rerollTip: '提示：每天有一次重抽机会',
    arrangeDeck: '排列卡组',
    arrangeDeckDesc: '选择完卡牌后，你可以通过拖拽来调整卡组中的卡牌顺序',
    orderMatters: '卡牌的顺序会影响连击效果和特殊规则',
    executeStrategy: '执行与策略',
    executeDesc: '点击"开始执行"后，卡牌将按顺序生效，影响股价',
    tip1: '持有股票时使用绿色卡牌',
    tip2: '低价买入，高价卖出',
    tip3: '注意每周的目标资产值',
    ready: '准备好了吗？',
    readyDesc: '现在你已经了解了游戏的基本规则',
    goodLuck: '祝你好运，成为真正的股市大师',
    prev: '上一页',
    next: '下一页',
    skipTutorial: '跳过教程',
  },

  // 排行榜
  leaderboard: {
    title: '排行榜',
    loading: '加载中...',
    empty: '暂无记录',
    rank: '排名',
    player: '玩家',
    score: '分数',
    viewLeaderboard: '排行榜',
  },

  // 钱包
  wallet: {
    connect: '连接钱包',
    disconnect: '断开连接',
    connecting: '连接中...',
    uploadScore: '上传成绩',
    uploading: '上传中...',
    uploadSuccess: '上传成功！',
    uploadFailed: '上传失败',
    installPhantom: '请安装 Phantom 钱包',
    confirmTx: '请在钱包中确认交易',
  },
}
