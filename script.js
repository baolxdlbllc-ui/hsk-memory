/* ============================================================
   HSK MEMORY — Học HSK4–HSK5 cho người Việt
   Stack: Vanilla JS. Lưu state vào localStorage.
   Cấu trúc file:
     1. CONST + DATA      (VOCABULARY, GRAMMAR, QUIZZES, CONFUSING_WORDS, TOPICS)
     2. STATE + STORAGE   (load/save localStorage)
     3. HELPER — Data     (lọc, tìm kiếm)
     4. HELPER — Progress (spaced repetition đơn giản)
     5. HELPER — Speech   (Web Speech API tiếng Trung)
     6. RENDERERS         (mỗi section một hàm)
     7. EVENT HANDLERS    (navigation, filter, flashcard, quiz...)
     8. INIT
   ============================================================ */

'use strict';

/* ============================================================
   1. CONST + DATA
   ============================================================ */

const STORAGE_KEY = 'hsk_memory_v1';

const TOPIC_NAMES = [
  'Công việc', 'Gia đình', 'Sức khỏe', 'Du lịch', 'Cảm xúc',
  'Học tập', 'Thi cử', 'Mua sắm', 'Xã hội', 'Công nghệ', 'Giao tiếp hằng ngày'
];

const STATUS_LABEL = {
  new: 'Từ mới',
  learning: 'Đang học',
  review: 'Cần ôn',
  remembered: 'Đã nhớ',
  difficult: 'Hay quên',
  mastered: 'Thành thạo'
};

/* ---------- VOCABULARY: 60 từ (30 HSK4 + 30 HSK5) ---------- */

const VOCABULARY = [
  // ========== HSK4 (30) ==========
  { id:'hsk4_001', hanzi:'影响', pinyin:'yǐngxiǎng', pinyinNumber:'ying3 xiang3', pinyinPlain:'yingxiang',
    vietnamese:'ảnh hưởng', english:'influence; affect', level:'HSK4', topic:'Xã hội', wordType:'động từ / danh từ',
    simpleExplanation:'Dùng khi một người, sự việc hoặc quyết định tác động đến kết quả, suy nghĩ hoặc hành động.',
    commonPhrases:['影响很大','受到影响','对……有影响'],
    examples:[{cn:'这件事影响了我的决定。', pinyin:'Zhè jiàn shì yǐngxiǎng le wǒ de juédìng.', vi:'Việc này đã ảnh hưởng đến quyết định của tôi.'}],
    confusingWords:['印象','形象'], tags:['abstract','common','exam'], difficulty:3, audioUrl:'', audioText:'影响' },

  { id:'hsk4_002', hanzi:'经验', pinyin:'jīngyàn', pinyinNumber:'jing1 yan4', pinyinPlain:'jingyan',
    vietnamese:'kinh nghiệm', english:'experience', level:'HSK4', topic:'Công việc', wordType:'danh từ',
    simpleExplanation:'Những điều đã từng làm và rút ra bài học. Khác với 经历 (sự việc đã trải qua).',
    commonPhrases:['有经验','工作经验','积累经验'],
    examples:[{cn:'他有很多工作经验。', pinyin:'Tā yǒu hěn duō gōngzuò jīngyàn.', vi:'Anh ấy có nhiều kinh nghiệm làm việc.'}],
    confusingWords:['经历'], tags:['work','common'], difficulty:2, audioUrl:'', audioText:'经验' },

  { id:'hsk4_003', hanzi:'责任', pinyin:'zérèn', pinyinNumber:'ze2 ren4', pinyinPlain:'zeren',
    vietnamese:'trách nhiệm', english:'responsibility', level:'HSK4', topic:'Xã hội', wordType:'danh từ',
    simpleExplanation:'Việc một người phải làm và phải chịu hậu quả của hành động của mình.',
    commonPhrases:['负责任','有责任','责任感'],
    examples:[{cn:'每个人都有自己的责任。', pinyin:'Měi gè rén dōu yǒu zìjǐ de zérèn.', vi:'Mỗi người đều có trách nhiệm của mình.'}],
    confusingWords:[], tags:['abstract','common'], difficulty:3, audioUrl:'', audioText:'责任' },

  { id:'hsk4_004', hanzi:'决定', pinyin:'juédìng', pinyinNumber:'jue2 ding4', pinyinPlain:'jueding',
    vietnamese:'quyết định', english:'decide; decision', level:'HSK4', topic:'Giao tiếp hằng ngày', wordType:'động từ / danh từ',
    simpleExplanation:'Chọn một hành động sau khi đã suy nghĩ. Có thể dùng làm danh từ chỉ chính sự lựa chọn đó.',
    commonPhrases:['做决定','下决定','重要的决定'],
    examples:[{cn:'我决定每天学习中文。', pinyin:'Wǒ juédìng měi tiān xuéxí Zhōngwén.', vi:'Tôi quyết định mỗi ngày đều học tiếng Trung.'}],
    confusingWords:[], tags:['common','daily'], difficulty:2, audioUrl:'', audioText:'决定' },

  { id:'hsk4_005', hanzi:'机会', pinyin:'jīhuì', pinyinNumber:'ji1 hui4', pinyinPlain:'jihui',
    vietnamese:'cơ hội', english:'opportunity', level:'HSK4', topic:'Công việc', wordType:'danh từ',
    simpleExplanation:'Thời điểm hoặc điều kiện cho phép làm một việc gì đó.',
    commonPhrases:['有机会','抓住机会','失去机会'],
    examples:[{cn:'这是一个很好的机会。', pinyin:'Zhè shì yí gè hěn hǎo de jīhuì.', vi:'Đây là một cơ hội rất tốt.'}],
    confusingWords:['机遇'], tags:['work','abstract','common'], difficulty:2, audioUrl:'', audioText:'机会' },

  { id:'hsk4_006', hanzi:'适合', pinyin:'shìhé', pinyinNumber:'shi4 he2', pinyinPlain:'shihe',
    vietnamese:'phù hợp với', english:'suitable for', level:'HSK4', topic:'Giao tiếp hằng ngày', wordType:'động từ',
    simpleExplanation:'Dùng cho việc nào đó hợp với một người hoặc một hoàn cảnh. Đứng trước tân ngữ: A 适合 B.',
    commonPhrases:['很适合','不适合','适合我'],
    examples:[{cn:'这份工作很适合你。', pinyin:'Zhè fèn gōngzuò hěn shìhé nǐ.', vi:'Công việc này rất phù hợp với bạn.'}],
    confusingWords:['合适'], tags:['common'], difficulty:3, audioUrl:'', audioText:'适合' },

  { id:'hsk4_007', hanzi:'了解', pinyin:'liǎojiě', pinyinNumber:'liao3 jie3', pinyinPlain:'liaojie',
    vietnamese:'biết, nắm thông tin về', english:'understand; know about', level:'HSK4', topic:'Giao tiếp hằng ngày', wordType:'động từ',
    simpleExplanation:'Biết tình hình, thông tin về ai/việc gì. Nhấn vào việc nắm được thông tin chứ không phải hiểu sâu.',
    commonPhrases:['了解情况','互相了解','深入了解'],
    examples:[{cn:'我了解他的情况。', pinyin:'Wǒ liǎojiě tā de qíngkuàng.', vi:'Tôi biết tình hình của anh ấy.'}],
    confusingWords:['理解'], tags:['common'], difficulty:3, audioUrl:'', audioText:'了解' },

  { id:'hsk4_008', hanzi:'理解', pinyin:'lǐjiě', pinyinNumber:'li3 jie3', pinyinPlain:'lijie',
    vietnamese:'hiểu sâu, thông cảm', english:'comprehend; sympathize', level:'HSK4', topic:'Cảm xúc', wordType:'động từ',
    simpleExplanation:'Hiểu ý nghĩa, suy nghĩ hoặc cảm xúc. Nhấn vào sự thông cảm, hiểu bản chất.',
    commonPhrases:['互相理解','不能理解','请理解'],
    examples:[{cn:'我理解你的意思。', pinyin:'Wǒ lǐjiě nǐ de yìsi.', vi:'Tôi hiểu ý của bạn.'}],
    confusingWords:['了解'], tags:['emotion','common'], difficulty:3, audioUrl:'', audioText:'理解' },

  { id:'hsk4_009', hanzi:'保护', pinyin:'bǎohù', pinyinNumber:'bao3 hu4', pinyinPlain:'baohu',
    vietnamese:'bảo vệ', english:'protect', level:'HSK4', topic:'Xã hội', wordType:'động từ',
    simpleExplanation:'Giữ cho ai đó hoặc cái gì đó không bị tổn hại.',
    commonPhrases:['保护环境','保护自己','受到保护'],
    examples:[{cn:'我们要保护环境。', pinyin:'Wǒmen yào bǎohù huánjìng.', vi:'Chúng ta phải bảo vệ môi trường.'}],
    confusingWords:['保证'], tags:['common'], difficulty:2, audioUrl:'', audioText:'保护' },

  { id:'hsk4_010', hanzi:'提高', pinyin:'tígāo', pinyinNumber:'ti2 gao1', pinyinPlain:'tigao',
    vietnamese:'nâng cao', english:'raise; improve', level:'HSK4', topic:'Học tập', wordType:'động từ',
    simpleExplanation:'Làm cho mức độ, trình độ, chất lượng trở nên cao hơn.',
    commonPhrases:['提高水平','提高能力','提高成绩'],
    examples:[{cn:'我想提高我的中文水平。', pinyin:'Wǒ xiǎng tígāo wǒ de Zhōngwén shuǐpíng.', vi:'Tôi muốn nâng cao trình độ tiếng Trung của mình.'}],
    confusingWords:['增加'], tags:['study','common'], difficulty:2, audioUrl:'', audioText:'提高' },

  { id:'hsk4_011', hanzi:'经历', pinyin:'jīnglì', pinyinNumber:'jing1 li4', pinyinPlain:'jingli',
    vietnamese:'trải qua; sự trải nghiệm', english:'experience (events)', level:'HSK4', topic:'Công việc', wordType:'động từ / danh từ',
    simpleExplanation:'Việc đã từng xảy ra với mình. Khác 经验 (kết quả rút ra từ việc đã làm).',
    commonPhrases:['经历过','人生经历','工作经历'],
    examples:[{cn:'我经历过很多困难。', pinyin:'Wǒ jīnglì guò hěn duō kùnnán.', vi:'Tôi đã trải qua rất nhiều khó khăn.'}],
    confusingWords:['经验'], tags:['work','common'], difficulty:3, audioUrl:'', audioText:'经历' },

  { id:'hsk4_012', hanzi:'印象', pinyin:'yìnxiàng', pinyinNumber:'yin4 xiang4', pinyinPlain:'yinxiang',
    vietnamese:'ấn tượng', english:'impression', level:'HSK4', topic:'Xã hội', wordType:'danh từ',
    simpleExplanation:'Cảm nhận đầu tiên về ai/việc gì lưu lại trong đầu mình.',
    commonPhrases:['第一印象','留下印象','印象深刻'],
    examples:[{cn:'她给我留下了很好的印象。', pinyin:'Tā gěi wǒ liú xià le hěn hǎo de yìnxiàng.', vi:'Cô ấy để lại cho tôi ấn tượng rất tốt.'}],
    confusingWords:['影响','形象'], tags:['abstract','common'], difficulty:3, audioUrl:'', audioText:'印象' },

  { id:'hsk4_013', hanzi:'方法', pinyin:'fāngfǎ', pinyinNumber:'fang1 fa3', pinyinPlain:'fangfa',
    vietnamese:'phương pháp', english:'method', level:'HSK4', topic:'Học tập', wordType:'danh từ',
    simpleExplanation:'Cách làm có tính hệ thống, mang tính lý luận hơn 办法.',
    commonPhrases:['学习方法','好方法','一种方法'],
    examples:[{cn:'你的学习方法很好。', pinyin:'Nǐ de xuéxí fāngfǎ hěn hǎo.', vi:'Phương pháp học của bạn rất tốt.'}],
    confusingWords:['办法'], tags:['study','common'], difficulty:2, audioUrl:'', audioText:'方法' },

  { id:'hsk4_014', hanzi:'办法', pinyin:'bànfǎ', pinyinNumber:'ban4 fa3', pinyinPlain:'banfa',
    vietnamese:'cách (giải quyết)', english:'way; solution', level:'HSK4', topic:'Giao tiếp hằng ngày', wordType:'danh từ',
    simpleExplanation:'Cách giải quyết vấn đề cụ thể trong tình huống thực tế. Khẩu ngữ hơn 方法.',
    commonPhrases:['想办法','没办法','有办法'],
    examples:[{cn:'我们一起想办法。', pinyin:'Wǒmen yìqǐ xiǎng bànfǎ.', vi:'Chúng ta cùng nhau nghĩ cách.'}],
    confusingWords:['方法'], tags:['daily','common'], difficulty:2, audioUrl:'', audioText:'办法' },

  { id:'hsk4_015', hanzi:'认为', pinyin:'rènwéi', pinyinNumber:'ren4 wei2', pinyinPlain:'renwei',
    vietnamese:'cho rằng (chắc chắn)', english:'think; consider', level:'HSK4', topic:'Xã hội', wordType:'động từ',
    simpleExplanation:'Đưa ra ý kiến mình tin là đúng, mang tính khẳng định.',
    commonPhrases:['我认为','大家认为','一致认为'],
    examples:[{cn:'我认为这个办法很好。', pinyin:'Wǒ rènwéi zhège bànfǎ hěn hǎo.', vi:'Tôi cho rằng cách này rất tốt.'}],
    confusingWords:['以为'], tags:['common'], difficulty:3, audioUrl:'', audioText:'认为' },

  { id:'hsk4_016', hanzi:'以为', pinyin:'yǐwéi', pinyinNumber:'yi3 wei2', pinyinPlain:'yiwei',
    vietnamese:'cứ tưởng (sai)', english:'thought wrongly', level:'HSK4', topic:'Giao tiếp hằng ngày', wordType:'động từ',
    simpleExplanation:'Trước đây nghĩ một đằng nhưng thực tế lại khác. Mang ý "tưởng nhầm".',
    commonPhrases:['我以为','原以为','本以为'],
    examples:[{cn:'我以为你不会来。', pinyin:'Wǒ yǐwéi nǐ bú huì lái.', vi:'Tôi cứ tưởng bạn sẽ không đến.'}],
    confusingWords:['认为'], tags:['daily','common'], difficulty:3, audioUrl:'', audioText:'以为' },

  { id:'hsk4_017', hanzi:'突然', pinyin:'tūrán', pinyinNumber:'tu1 ran2', pinyinPlain:'turan',
    vietnamese:'đột nhiên (khẩu ngữ)', english:'suddenly', level:'HSK4', topic:'Giao tiếp hằng ngày', wordType:'phó từ / tính từ',
    simpleExplanation:'Việc xảy ra rất nhanh, không có dấu hiệu báo trước. Có thể làm tính từ (这件事很突然).',
    commonPhrases:['突然下雨','突然想起','感到突然'],
    examples:[{cn:'他突然站了起来。', pinyin:'Tā tūrán zhàn le qǐlái.', vi:'Anh ấy đột nhiên đứng dậy.'}],
    confusingWords:['忽然'], tags:['daily','common'], difficulty:2, audioUrl:'', audioText:'突然' },

  { id:'hsk4_018', hanzi:'仍然', pinyin:'réngrán', pinyinNumber:'reng2 ran2', pinyinPlain:'rengran',
    vietnamese:'vẫn còn', english:'still', level:'HSK4', topic:'Giao tiếp hằng ngày', wordType:'phó từ',
    simpleExplanation:'Tình trạng cũ chưa thay đổi. Tương đương 还是 nhưng trang trọng hơn.',
    commonPhrases:['仍然存在','仍然不变','仍然喜欢'],
    examples:[{cn:'下了雨，他仍然来了。', pinyin:'Xià le yǔ, tā réngrán lái le.', vi:'Trời mưa, anh ấy vẫn đến.'}],
    confusingWords:['依然'], tags:['common'], difficulty:3, audioUrl:'', audioText:'仍然' },

  { id:'hsk4_019', hanzi:'健康', pinyin:'jiànkāng', pinyinNumber:'jian4 kang1', pinyinPlain:'jiankang',
    vietnamese:'sức khỏe; khỏe mạnh', english:'healthy; health', level:'HSK4', topic:'Sức khỏe', wordType:'tính từ / danh từ',
    simpleExplanation:'Cơ thể không bệnh tật. Có thể là danh từ chỉ trạng thái khỏe mạnh.',
    commonPhrases:['身体健康','保持健康','健康的生活'],
    examples:[{cn:'多运动对健康有好处。', pinyin:'Duō yùndòng duì jiànkāng yǒu hǎochù.', vi:'Tập thể dục nhiều có lợi cho sức khỏe.'}],
    confusingWords:[], tags:['health','common'], difficulty:2, audioUrl:'', audioText:'健康' },

  { id:'hsk4_020', hanzi:'锻炼', pinyin:'duànliàn', pinyinNumber:'duan4 lian4', pinyinPlain:'duanlian',
    vietnamese:'rèn luyện (thể chất)', english:'exercise; train', level:'HSK4', topic:'Sức khỏe', wordType:'động từ',
    simpleExplanation:'Tập luyện cơ thể để khỏe hơn. Cũng dùng cho rèn luyện ý chí, năng lực.',
    commonPhrases:['锻炼身体','坚持锻炼','锻炼意志'],
    examples:[{cn:'每天早上他都去锻炼身体。', pinyin:'Měi tiān zǎoshang tā dōu qù duànliàn shēntǐ.', vi:'Mỗi sáng anh ấy đều đi tập thể dục.'}],
    confusingWords:[], tags:['health','common'], difficulty:2, audioUrl:'', audioText:'锻炼' },

  { id:'hsk4_021', hanzi:'旅游', pinyin:'lǚyóu', pinyinNumber:'lü3 you2', pinyinPlain:'lvyou',
    vietnamese:'du lịch', english:'travel; tour', level:'HSK4', topic:'Du lịch', wordType:'động từ / danh từ',
    simpleExplanation:'Đi đến nơi khác để tham quan, nghỉ ngơi.',
    commonPhrases:['去旅游','旅游景点','出国旅游'],
    examples:[{cn:'我们打算去日本旅游。', pinyin:'Wǒmen dǎsuàn qù Rìběn lǚyóu.', vi:'Chúng tôi định đi du lịch Nhật Bản.'}],
    confusingWords:[], tags:['travel','common'], difficulty:1, audioUrl:'', audioText:'旅游' },

  { id:'hsk4_022', hanzi:'风景', pinyin:'fēngjǐng', pinyinNumber:'feng1 jing3', pinyinPlain:'fengjing',
    vietnamese:'phong cảnh', english:'scenery', level:'HSK4', topic:'Du lịch', wordType:'danh từ',
    simpleExplanation:'Cảnh thiên nhiên hoặc đô thị có thể ngắm nhìn.',
    commonPhrases:['美丽的风景','看风景','风景区'],
    examples:[{cn:'这里的风景非常美。', pinyin:'Zhèlǐ de fēngjǐng fēicháng měi.', vi:'Phong cảnh ở đây rất đẹp.'}],
    confusingWords:[], tags:['travel'], difficulty:2, audioUrl:'', audioText:'风景' },

  { id:'hsk4_023', hanzi:'购物', pinyin:'gòuwù', pinyinNumber:'gou4 wu4', pinyinPlain:'gouwu',
    vietnamese:'mua sắm', english:'shopping', level:'HSK4', topic:'Mua sắm', wordType:'động từ',
    simpleExplanation:'Đi mua hàng. Trang trọng hơn 买东西.',
    commonPhrases:['网上购物','购物中心','喜欢购物'],
    examples:[{cn:'周末我喜欢去购物。', pinyin:'Zhōumò wǒ xǐhuān qù gòuwù.', vi:'Cuối tuần tôi thích đi mua sắm.'}],
    confusingWords:[], tags:['shopping','common'], difficulty:2, audioUrl:'', audioText:'购物' },

  { id:'hsk4_024', hanzi:'价格', pinyin:'jiàgé', pinyinNumber:'jia4 ge2', pinyinPlain:'jiage',
    vietnamese:'giá cả', english:'price', level:'HSK4', topic:'Mua sắm', wordType:'danh từ',
    simpleExplanation:'Số tiền phải trả để mua một món hàng hay dịch vụ.',
    commonPhrases:['价格便宜','价格合理','降低价格'],
    examples:[{cn:'这个手机的价格不贵。', pinyin:'Zhège shǒujī de jiàgé bú guì.', vi:'Giá chiếc điện thoại này không đắt.'}],
    confusingWords:[], tags:['shopping','common'], difficulty:2, audioUrl:'', audioText:'价格' },

  { id:'hsk4_025', hanzi:'同事', pinyin:'tóngshì', pinyinNumber:'tong2 shi4', pinyinPlain:'tongshi',
    vietnamese:'đồng nghiệp', english:'colleague', level:'HSK4', topic:'Công việc', wordType:'danh từ',
    simpleExplanation:'Người làm việc cùng cơ quan, công ty.',
    commonPhrases:['好同事','同事关系','新同事'],
    examples:[{cn:'我和同事关系很好。', pinyin:'Wǒ hé tóngshì guānxì hěn hǎo.', vi:'Tôi và đồng nghiệp có quan hệ rất tốt.'}],
    confusingWords:[], tags:['work','common'], difficulty:1, audioUrl:'', audioText:'同事' },

  { id:'hsk4_026', hanzi:'父母', pinyin:'fùmǔ', pinyinNumber:'fu4 mu3', pinyinPlain:'fumu',
    vietnamese:'cha mẹ', english:'parents', level:'HSK4', topic:'Gia đình', wordType:'danh từ',
    simpleExplanation:'Ba và mẹ. Trang trọng hơn 爸爸妈妈.',
    commonPhrases:['孝顺父母','照顾父母','父母的爱'],
    examples:[{cn:'我要好好照顾父母。', pinyin:'Wǒ yào hǎohǎo zhàogù fùmǔ.', vi:'Tôi phải chăm sóc cha mẹ thật tốt.'}],
    confusingWords:[], tags:['family','common'], difficulty:1, audioUrl:'', audioText:'父母' },

  { id:'hsk4_027', hanzi:'准备', pinyin:'zhǔnbèi', pinyinNumber:'zhun3 bei4', pinyinPlain:'zhunbei',
    vietnamese:'chuẩn bị', english:'prepare', level:'HSK4', topic:'Học tập', wordType:'động từ',
    simpleExplanation:'Làm trước những việc cần thiết để sẵn sàng.',
    commonPhrases:['准备考试','准备好了','做好准备'],
    examples:[{cn:'我正在准备明天的考试。', pinyin:'Wǒ zhèngzài zhǔnbèi míngtiān de kǎoshì.', vi:'Tôi đang chuẩn bị cho kỳ thi ngày mai.'}],
    confusingWords:[], tags:['study','common'], difficulty:1, audioUrl:'', audioText:'准备' },

  { id:'hsk4_028', hanzi:'考试', pinyin:'kǎoshì', pinyinNumber:'kao3 shi4', pinyinPlain:'kaoshi',
    vietnamese:'kỳ thi; thi', english:'exam; take exam', level:'HSK4', topic:'Thi cử', wordType:'động từ / danh từ',
    simpleExplanation:'Bài kiểm tra để đánh giá kiến thức, kỹ năng.',
    commonPhrases:['HSK考试','参加考试','考试通过'],
    examples:[{cn:'下周我要参加HSK考试。', pinyin:'Xià zhōu wǒ yào cānjiā HSK kǎoshì.', vi:'Tuần sau tôi sẽ thi HSK.'}],
    confusingWords:[], tags:['exam','common'], difficulty:1, audioUrl:'', audioText:'考试' },

  { id:'hsk4_029', hanzi:'完成', pinyin:'wánchéng', pinyinNumber:'wan2 cheng2', pinyinPlain:'wancheng',
    vietnamese:'hoàn thành', english:'complete; finish', level:'HSK4', topic:'Giao tiếp hằng ngày', wordType:'động từ',
    simpleExplanation:'Làm xong việc gì đó theo đúng yêu cầu/mục tiêu.',
    commonPhrases:['完成任务','完成作业','顺利完成'],
    examples:[{cn:'我已经完成了今天的工作。', pinyin:'Wǒ yǐjīng wánchéng le jīntiān de gōngzuò.', vi:'Tôi đã hoàn thành công việc hôm nay.'}],
    confusingWords:['结束'], tags:['common'], difficulty:2, audioUrl:'', audioText:'完成' },

  { id:'hsk4_030', hanzi:'继续', pinyin:'jìxù', pinyinNumber:'ji4 xu4', pinyinPlain:'jixu',
    vietnamese:'tiếp tục', english:'continue', level:'HSK4', topic:'Giao tiếp hằng ngày', wordType:'động từ',
    simpleExplanation:'Làm tiếp việc đang làm dở. Có thể tạm dừng rồi quay lại.',
    commonPhrases:['继续努力','继续学习','继续下去'],
    examples:[{cn:'我们继续学习吧。', pinyin:'Wǒmen jìxù xuéxí ba.', vi:'Chúng ta tiếp tục học đi.'}],
    confusingWords:['连续'], tags:['common'], difficulty:2, audioUrl:'', audioText:'继续' },

  // ========== HSK5 (30) ==========
  { id:'hsk5_001', hanzi:'形象', pinyin:'xíngxiàng', pinyinNumber:'xing2 xiang4', pinyinPlain:'xingxiang',
    vietnamese:'hình tượng; hình ảnh (đại diện)', english:'image; figure', level:'HSK5', topic:'Xã hội', wordType:'danh từ / tính từ',
    simpleExplanation:'Hình ảnh bên ngoài của một người, thương hiệu, nhân vật. Khác 印象 (cảm nhận bên trong).',
    commonPhrases:['公司形象','个人形象','形象生动'],
    examples:[{cn:'他在公司里的形象很好。', pinyin:'Tā zài gōngsī lǐ de xíngxiàng hěn hǎo.', vi:'Hình ảnh của anh ấy ở công ty rất tốt.'}],
    confusingWords:['印象','影响'], tags:['abstract'], difficulty:4, audioUrl:'', audioText:'形象' },

  { id:'hsk5_002', hanzi:'机遇', pinyin:'jīyù', pinyinNumber:'ji1 yu4', pinyinPlain:'jiyu',
    vietnamese:'cơ duyên (lớn, hiếm)', english:'opportunity (rare)', level:'HSK5', topic:'Công việc', wordType:'danh từ',
    simpleExplanation:'Cơ hội lớn, quan trọng, ít gặp. Trang trọng hơn 机会.',
    commonPhrases:['抓住机遇','难得的机遇','发展机遇'],
    examples:[{cn:'这是一次难得的机遇。', pinyin:'Zhè shì yí cì nándé de jīyù.', vi:'Đây là một cơ duyên hiếm có.'}],
    confusingWords:['机会'], tags:['work','formal'], difficulty:4, audioUrl:'', audioText:'机遇' },

  { id:'hsk5_003', hanzi:'合适', pinyin:'héshì', pinyinNumber:'he2 shi4', pinyinPlain:'heshi',
    vietnamese:'thích hợp', english:'suitable', level:'HSK5', topic:'Giao tiếp hằng ngày', wordType:'tính từ',
    simpleExplanation:'Là tính từ, đứng độc lập sau chủ ngữ: A 很合适. Không dùng 合适 + tân ngữ.',
    commonPhrases:['很合适','不太合适','合适的时间'],
    examples:[{cn:'这件衣服很合适。', pinyin:'Zhè jiàn yīfu hěn héshì.', vi:'Bộ quần áo này rất hợp.'}],
    confusingWords:['适合'], tags:['common'], difficulty:3, audioUrl:'', audioText:'合适' },

  { id:'hsk5_004', hanzi:'增加', pinyin:'zēngjiā', pinyinNumber:'zeng1 jia1', pinyinPlain:'zengjia',
    vietnamese:'tăng thêm (số lượng)', english:'increase', level:'HSK5', topic:'Xã hội', wordType:'động từ',
    simpleExplanation:'Làm cho số lượng/khối lượng nhiều hơn. Khác 提高 (làm cho mức độ cao hơn).',
    commonPhrases:['增加收入','增加难度','人口增加'],
    examples:[{cn:'公司决定增加员工的工资。', pinyin:'Gōngsī juédìng zēngjiā yuángōng de gōngzī.', vi:'Công ty quyết định tăng lương cho nhân viên.'}],
    confusingWords:['提高'], tags:['abstract'], difficulty:3, audioUrl:'', audioText:'增加' },

  { id:'hsk5_005', hanzi:'忽然', pinyin:'hūrán', pinyinNumber:'hu1 ran2', pinyinPlain:'huran',
    vietnamese:'đột nhiên (văn viết)', english:'suddenly (literary)', level:'HSK5', topic:'Giao tiếp hằng ngày', wordType:'phó từ',
    simpleExplanation:'Tương đương 突然 nhưng chỉ làm phó từ, không làm tính từ. Hơi văn vẻ.',
    commonPhrases:['忽然想到','忽然下雨','忽然明白'],
    examples:[{cn:'我忽然想起了一件事。', pinyin:'Wǒ hūrán xiǎng qǐ le yí jiàn shì.', vi:'Tôi đột nhiên nhớ ra một việc.'}],
    confusingWords:['突然'], tags:['common','formal'], difficulty:3, audioUrl:'', audioText:'忽然' },

  { id:'hsk5_006', hanzi:'依然', pinyin:'yīrán', pinyinNumber:'yi1 ran2', pinyinPlain:'yiran',
    vietnamese:'vẫn như cũ', english:'still; as before', level:'HSK5', topic:'Cảm xúc', wordType:'phó từ',
    simpleExplanation:'Tương đương 仍然 nhưng văn vẻ hơn, hay dùng cho cảm xúc lâu dài.',
    commonPhrases:['依然喜欢','依然存在','依然如故'],
    examples:[{cn:'多年过去了，我依然记得她。', pinyin:'Duō nián guòqù le, wǒ yīrán jìdé tā.', vi:'Nhiều năm trôi qua, tôi vẫn nhớ cô ấy.'}],
    confusingWords:['仍然'], tags:['emotion','formal'], difficulty:4, audioUrl:'', audioText:'依然' },

  { id:'hsk5_007', hanzi:'保证', pinyin:'bǎozhèng', pinyinNumber:'bao3 zheng4', pinyinPlain:'baozheng',
    vietnamese:'bảo đảm', english:'guarantee; ensure', level:'HSK5', topic:'Xã hội', wordType:'động từ',
    simpleExplanation:'Cam đoan chắc chắn việc gì đó sẽ xảy ra hoặc đúng. Khác 保护 (giữ an toàn).',
    commonPhrases:['保证质量','我保证','无法保证'],
    examples:[{cn:'我保证按时完成任务。', pinyin:'Wǒ bǎozhèng ànshí wánchéng rènwù.', vi:'Tôi đảm bảo hoàn thành nhiệm vụ đúng giờ.'}],
    confusingWords:['保护'], tags:['formal','common'], difficulty:3, audioUrl:'', audioText:'保证' },

  { id:'hsk5_008', hanzi:'发生', pinyin:'fāshēng', pinyinNumber:'fa1 sheng1', pinyinPlain:'fasheng',
    vietnamese:'xảy ra', english:'happen; occur', level:'HSK5', topic:'Xã hội', wordType:'động từ',
    simpleExplanation:'Sự việc, sự cố diễn ra. Chủ ngữ là sự kiện, không phải người.',
    commonPhrases:['发生事故','发生变化','发生在……'],
    examples:[{cn:'昨天发生了一件大事。', pinyin:'Zuótiān fāshēng le yí jiàn dàshì.', vi:'Hôm qua đã xảy ra một việc lớn.'}],
    confusingWords:['发现'], tags:['common'], difficulty:2, audioUrl:'', audioText:'发生' },

  { id:'hsk5_009', hanzi:'发现', pinyin:'fāxiàn', pinyinNumber:'fa1 xian4', pinyinPlain:'faxian',
    vietnamese:'phát hiện', english:'discover', level:'HSK5', topic:'Học tập', wordType:'động từ',
    simpleExplanation:'Nhìn thấy/biết được điều mà trước đây chưa biết. Chủ ngữ là người.',
    commonPhrases:['发现问题','重大发现','突然发现'],
    examples:[{cn:'我发现他的中文进步了。', pinyin:'Wǒ fāxiàn tā de Zhōngwén jìnbù le.', vi:'Tôi phát hiện tiếng Trung của anh ấy tiến bộ rồi.'}],
    confusingWords:['发生'], tags:['common'], difficulty:2, audioUrl:'', audioText:'发现' },

  { id:'hsk5_010', hanzi:'证明', pinyin:'zhèngmíng', pinyinNumber:'zheng4 ming2', pinyinPlain:'zhengming',
    vietnamese:'chứng minh', english:'prove; certificate', level:'HSK5', topic:'Xã hội', wordType:'động từ / danh từ',
    simpleExplanation:'Đưa ra bằng chứng để xác nhận điều gì đó đúng. Cũng là giấy chứng nhận.',
    commonPhrases:['证明身份','开证明','事实证明'],
    examples:[{cn:'事实证明他是对的。', pinyin:'Shìshí zhèngmíng tā shì duì de.', vi:'Sự thật chứng minh anh ấy đúng.'}],
    confusingWords:['说明'], tags:['formal'], difficulty:3, audioUrl:'', audioText:'证明' },

  { id:'hsk5_011', hanzi:'说明', pinyin:'shuōmíng', pinyinNumber:'shuo1 ming2', pinyinPlain:'shuoming',
    vietnamese:'giải thích; cho thấy', english:'explain; show', level:'HSK5', topic:'Giao tiếp hằng ngày', wordType:'động từ / danh từ',
    simpleExplanation:'Diễn giải để người khác hiểu, hoặc tài liệu hướng dẫn.',
    commonPhrases:['说明情况','使用说明','这说明……'],
    examples:[{cn:'请你说明一下情况。', pinyin:'Qǐng nǐ shuōmíng yíxià qíngkuàng.', vi:'Xin bạn giải thích tình hình một chút.'}],
    confusingWords:['证明'], tags:['common'], difficulty:2, audioUrl:'', audioText:'说明' },

  { id:'hsk5_012', hanzi:'结束', pinyin:'jiéshù', pinyinNumber:'jie2 shu4', pinyinPlain:'jieshu',
    vietnamese:'kết thúc', english:'end; finish', level:'HSK5', topic:'Giao tiếp hằng ngày', wordType:'động từ',
    simpleExplanation:'Đến lúc dừng lại, không tiếp tục nữa. Khác 完成 (hoàn thành đạt mục tiêu).',
    commonPhrases:['会议结束','结束工作','结束关系'],
    examples:[{cn:'会议已经结束了。', pinyin:'Huìyì yǐjīng jiéshù le.', vi:'Cuộc họp đã kết thúc rồi.'}],
    confusingWords:['完成'], tags:['common'], difficulty:2, audioUrl:'', audioText:'结束' },

  { id:'hsk5_013', hanzi:'连续', pinyin:'liánxù', pinyinNumber:'lian2 xu4', pinyinPlain:'lianxu',
    vietnamese:'liên tục (không nghỉ)', english:'continuously', level:'HSK5', topic:'Giao tiếp hằng ngày', wordType:'phó từ / tính từ',
    simpleExplanation:'Diễn ra không bị gián đoạn. Khác 继续 (tiếp tục, có thể tạm dừng).',
    commonPhrases:['连续工作','连续三天','连续不断'],
    examples:[{cn:'他连续工作了十个小时。', pinyin:'Tā liánxù gōngzuò le shí gè xiǎoshí.', vi:'Anh ấy làm việc liên tục mười tiếng đồng hồ.'}],
    confusingWords:['继续'], tags:['common'], difficulty:3, audioUrl:'', audioText:'连续' },

  { id:'hsk5_014', hanzi:'经济', pinyin:'jīngjì', pinyinNumber:'jing1 ji4', pinyinPlain:'jingji',
    vietnamese:'kinh tế', english:'economy', level:'HSK5', topic:'Xã hội', wordType:'danh từ',
    simpleExplanation:'Hoạt động sản xuất và tiêu dùng của một xã hội.',
    commonPhrases:['经济发展','经济条件','世界经济'],
    examples:[{cn:'这个国家的经济发展很快。', pinyin:'Zhège guójiā de jīngjì fāzhǎn hěn kuài.', vi:'Kinh tế quốc gia này phát triển rất nhanh.'}],
    confusingWords:[], tags:['society','formal'], difficulty:3, audioUrl:'', audioText:'经济' },

  { id:'hsk5_015', hanzi:'文化', pinyin:'wénhuà', pinyinNumber:'wen2 hua4', pinyinPlain:'wenhua',
    vietnamese:'văn hóa', english:'culture', level:'HSK5', topic:'Xã hội', wordType:'danh từ',
    simpleExplanation:'Tập hợp giá trị, phong tục, nghệ thuật của một cộng đồng.',
    commonPhrases:['中国文化','传统文化','文化交流'],
    examples:[{cn:'我对中国文化很感兴趣。', pinyin:'Wǒ duì Zhōngguó wénhuà hěn gǎn xìngqù.', vi:'Tôi rất hứng thú với văn hóa Trung Quốc.'}],
    confusingWords:[], tags:['society','common'], difficulty:2, audioUrl:'', audioText:'文化' },

  { id:'hsk5_016', hanzi:'环境', pinyin:'huánjìng', pinyinNumber:'huan2 jing4', pinyinPlain:'huanjing',
    vietnamese:'môi trường', english:'environment', level:'HSK5', topic:'Xã hội', wordType:'danh từ',
    simpleExplanation:'Có thể là môi trường tự nhiên hoặc môi trường sống/làm việc xung quanh.',
    commonPhrases:['保护环境','学习环境','工作环境'],
    examples:[{cn:'这里的工作环境很好。', pinyin:'Zhèlǐ de gōngzuò huánjìng hěn hǎo.', vi:'Môi trường làm việc ở đây rất tốt.'}],
    confusingWords:[], tags:['society','common'], difficulty:2, audioUrl:'', audioText:'环境' },

  { id:'hsk5_017', hanzi:'污染', pinyin:'wūrǎn', pinyinNumber:'wu1 ran3', pinyinPlain:'wuran',
    vietnamese:'ô nhiễm', english:'pollution; pollute', level:'HSK5', topic:'Xã hội', wordType:'động từ / danh từ',
    simpleExplanation:'Làm cho không khí, nước, đất bị bẩn, có hại.',
    commonPhrases:['空气污染','污染严重','减少污染'],
    examples:[{cn:'这个城市的空气污染很严重。', pinyin:'Zhège chéngshì de kōngqì wūrǎn hěn yánzhòng.', vi:'Ô nhiễm không khí ở thành phố này rất nghiêm trọng.'}],
    confusingWords:[], tags:['society'], difficulty:3, audioUrl:'', audioText:'污染' },

  { id:'hsk5_018', hanzi:'质量', pinyin:'zhìliàng', pinyinNumber:'zhi4 liang4', pinyinPlain:'zhiliang',
    vietnamese:'chất lượng', english:'quality', level:'HSK5', topic:'Mua sắm', wordType:'danh từ',
    simpleExplanation:'Mức độ tốt xấu của sản phẩm, dịch vụ.',
    commonPhrases:['质量好','保证质量','生活质量'],
    examples:[{cn:'这家公司的产品质量很好。', pinyin:'Zhè jiā gōngsī de chǎnpǐn zhìliàng hěn hǎo.', vi:'Chất lượng sản phẩm của công ty này rất tốt.'}],
    confusingWords:[], tags:['shopping','common'], difficulty:2, audioUrl:'', audioText:'质量' },

  { id:'hsk5_019', hanzi:'服务', pinyin:'fúwù', pinyinNumber:'fu2 wu4', pinyinPlain:'fuwu',
    vietnamese:'dịch vụ; phục vụ', english:'service; serve', level:'HSK5', topic:'Mua sắm', wordType:'động từ / danh từ',
    simpleExplanation:'Cung cấp tiện ích cho khách hàng. Cũng là từ chỉ ngành nghề.',
    commonPhrases:['服务态度','客户服务','为人民服务'],
    examples:[{cn:'这家餐厅的服务很周到。', pinyin:'Zhè jiā cāntīng de fúwù hěn zhōudào.', vi:'Dịch vụ của nhà hàng này rất chu đáo.'}],
    confusingWords:[], tags:['shopping','common'], difficulty:2, audioUrl:'', audioText:'服务' },

  { id:'hsk5_020', hanzi:'老板', pinyin:'lǎobǎn', pinyinNumber:'lao3 ban3', pinyinPlain:'laoban',
    vietnamese:'sếp; chủ', english:'boss; owner', level:'HSK5', topic:'Công việc', wordType:'danh từ',
    simpleExplanation:'Người đứng đầu công ty, cửa hàng. Khẩu ngữ phổ biến.',
    commonPhrases:['我的老板','老板娘','当老板'],
    examples:[{cn:'我们的老板对我们很好。', pinyin:'Wǒmen de lǎobǎn duì wǒmen hěn hǎo.', vi:'Sếp của chúng tôi đối xử với chúng tôi rất tốt.'}],
    confusingWords:[], tags:['work','common'], difficulty:1, audioUrl:'', audioText:'老板' },

  { id:'hsk5_021', hanzi:'招聘', pinyin:'zhāopìn', pinyinNumber:'zhao1 pin4', pinyinPlain:'zhaopin',
    vietnamese:'tuyển dụng', english:'recruit; hire', level:'HSK5', topic:'Công việc', wordType:'động từ',
    simpleExplanation:'Công ty đăng tuyển nhân viên mới.',
    commonPhrases:['招聘广告','招聘人才','正在招聘'],
    examples:[{cn:'我们公司正在招聘新员工。', pinyin:'Wǒmen gōngsī zhèngzài zhāopìn xīn yuángōng.', vi:'Công ty chúng tôi đang tuyển dụng nhân viên mới.'}],
    confusingWords:[], tags:['work'], difficulty:3, audioUrl:'', audioText:'招聘' },

  { id:'hsk5_022', hanzi:'面试', pinyin:'miànshì', pinyinNumber:'mian4 shi4', pinyinPlain:'mianshi',
    vietnamese:'phỏng vấn', english:'interview', level:'HSK5', topic:'Công việc', wordType:'động từ / danh từ',
    simpleExplanation:'Buổi gặp mặt để đánh giá ứng viên xin việc.',
    commonPhrases:['参加面试','面试官','通过面试'],
    examples:[{cn:'明天我要去面试。', pinyin:'Míngtiān wǒ yào qù miànshì.', vi:'Ngày mai tôi sẽ đi phỏng vấn.'}],
    confusingWords:[], tags:['work','common'], difficulty:2, audioUrl:'', audioText:'面试' },

  { id:'hsk5_023', hanzi:'简历', pinyin:'jiǎnlì', pinyinNumber:'jian3 li4', pinyinPlain:'jianli',
    vietnamese:'sơ yếu lý lịch (CV)', english:'résumé; CV', level:'HSK5', topic:'Công việc', wordType:'danh từ',
    simpleExplanation:'Tài liệu tóm tắt thông tin cá nhân, học vấn, kinh nghiệm để xin việc.',
    commonPhrases:['写简历','投简历','个人简历'],
    examples:[{cn:'请把你的简历发给我。', pinyin:'Qǐng bǎ nǐ de jiǎnlì fā gěi wǒ.', vi:'Xin gửi sơ yếu lý lịch của bạn cho tôi.'}],
    confusingWords:[], tags:['work'], difficulty:3, audioUrl:'', audioText:'简历' },

  { id:'hsk5_024', hanzi:'网络', pinyin:'wǎngluò', pinyinNumber:'wang3 luo4', pinyinPlain:'wangluo',
    vietnamese:'mạng (internet)', english:'network; internet', level:'HSK5', topic:'Công nghệ', wordType:'danh từ',
    simpleExplanation:'Hệ thống kết nối giữa các máy tính, đặc biệt là internet.',
    commonPhrases:['上网络','网络速度','网络问题'],
    examples:[{cn:'这里的网络速度很快。', pinyin:'Zhèlǐ de wǎngluò sùdù hěn kuài.', vi:'Tốc độ mạng ở đây rất nhanh.'}],
    confusingWords:[], tags:['tech','common'], difficulty:2, audioUrl:'', audioText:'网络' },

  { id:'hsk5_025', hanzi:'软件', pinyin:'ruǎnjiàn', pinyinNumber:'ruan3 jian4', pinyinPlain:'ruanjian',
    vietnamese:'phần mềm', english:'software', level:'HSK5', topic:'Công nghệ', wordType:'danh từ',
    simpleExplanation:'Chương trình chạy trên máy tính hoặc điện thoại.',
    commonPhrases:['手机软件','下载软件','软件更新'],
    examples:[{cn:'这个学习软件非常有用。', pinyin:'Zhège xuéxí ruǎnjiàn fēicháng yǒuyòng.', vi:'Phần mềm học tập này rất hữu ích.'}],
    confusingWords:[], tags:['tech','common'], difficulty:2, audioUrl:'', audioText:'软件' },

  { id:'hsk5_026', hanzi:'信息', pinyin:'xìnxī', pinyinNumber:'xin4 xi1', pinyinPlain:'xinxi',
    vietnamese:'thông tin', english:'information', level:'HSK5', topic:'Công nghệ', wordType:'danh từ',
    simpleExplanation:'Dữ liệu, tin tức mà chúng ta nhận được.',
    commonPhrases:['信息技术','重要信息','发短信息'],
    examples:[{cn:'我需要更多的信息。', pinyin:'Wǒ xūyào gèng duō de xìnxī.', vi:'Tôi cần nhiều thông tin hơn.'}],
    confusingWords:[], tags:['tech','common'], difficulty:2, audioUrl:'', audioText:'信息' },

  { id:'hsk5_027', hanzi:'紧张', pinyin:'jǐnzhāng', pinyinNumber:'jin3 zhang1', pinyinPlain:'jinzhang',
    vietnamese:'căng thẳng; hồi hộp', english:'nervous; tense', level:'HSK5', topic:'Cảm xúc', wordType:'tính từ',
    simpleExplanation:'Cảm thấy lo lắng, áp lực hoặc tình hình căng thẳng.',
    commonPhrases:['很紧张','感到紧张','工作紧张'],
    examples:[{cn:'考试前我很紧张。', pinyin:'Kǎoshì qián wǒ hěn jǐnzhāng.', vi:'Trước kỳ thi tôi rất hồi hộp.'}],
    confusingWords:['轻松'], tags:['emotion','common'], difficulty:2, audioUrl:'', audioText:'紧张' },

  { id:'hsk5_028', hanzi:'轻松', pinyin:'qīngsōng', pinyinNumber:'qing1 song1', pinyinPlain:'qingsong',
    vietnamese:'nhẹ nhàng; thoải mái', english:'relaxed; easy', level:'HSK5', topic:'Cảm xúc', wordType:'tính từ',
    simpleExplanation:'Trái nghĩa của 紧张. Không áp lực, dễ chịu.',
    commonPhrases:['很轻松','轻松一下','轻松的工作'],
    examples:[{cn:'周末我想轻松一下。', pinyin:'Zhōumò wǒ xiǎng qīngsōng yíxià.', vi:'Cuối tuần tôi muốn thư giãn một chút.'}],
    confusingWords:['紧张'], tags:['emotion','common'], difficulty:2, audioUrl:'', audioText:'轻松' },

  { id:'hsk5_029', hanzi:'复习', pinyin:'fùxí', pinyinNumber:'fu4 xi2', pinyinPlain:'fuxi',
    vietnamese:'ôn tập', english:'review (study)', level:'HSK5', topic:'Thi cử', wordType:'động từ',
    simpleExplanation:'Học lại nội dung đã học để ghi nhớ chắc chắn hơn.',
    commonPhrases:['复习课文','认真复习','复习考试'],
    examples:[{cn:'考试前一定要好好复习。', pinyin:'Kǎoshì qián yídìng yào hǎohǎo fùxí.', vi:'Trước kỳ thi nhất định phải ôn tập kỹ.'}],
    confusingWords:[], tags:['exam','study','common'], difficulty:1, audioUrl:'', audioText:'复习' },

  { id:'hsk5_030', hanzi:'工资', pinyin:'gōngzī', pinyinNumber:'gong1 zi1', pinyinPlain:'gongzi',
    vietnamese:'lương', english:'salary; wage', level:'HSK5', topic:'Công việc', wordType:'danh từ',
    simpleExplanation:'Tiền nhận được hàng tháng khi đi làm.',
    commonPhrases:['发工资','涨工资','工资高'],
    examples:[{cn:'他的工资比我的高。', pinyin:'Tā de gōngzī bǐ wǒ de gāo.', vi:'Lương của anh ấy cao hơn lương của tôi.'}],
    confusingWords:[], tags:['work','common'], difficulty:1, audioUrl:'', audioText:'工资' }
];

/* ---------- GRAMMAR: 20 mục (10 HSK4 + 10 HSK5) ---------- */

const GRAMMAR = [
  // HSK4
  { id:'g_hsk4_001', title:'虽然……但是……', level:'HSK4', meaning:'Tuy... nhưng...',
    structure:'虽然 + mệnh đề 1, 但是 + mệnh đề 2',
    simpleExplanation:'Dùng để nối hai ý trái ngược nhau. 但是 có thể đổi thành 可是, 不过.',
    examples:[{cn:'虽然今天很忙，但是我还是学习中文。', pinyin:'Suīrán jīntiān hěn máng, dànshì wǒ háishì xuéxí Zhōngwén.', vi:'Tuy hôm nay rất bận, nhưng tôi vẫn học tiếng Trung.'}],
    commonMistakes:['Không bỏ 但是 trong câu viết (khác tiếng Anh).','Không dùng 但是 khi đầu câu không có 虽然 (sai cấu trúc).'],
    practice:[{type:'fill_blank', question:'____今天下雨，____我还是去学校。', answer:'虽然 / 但是', explanation:'Quan hệ tuy... nhưng...'}] },

  { id:'g_hsk4_002', title:'因为……所以……', level:'HSK4', meaning:'Vì... cho nên...',
    structure:'因为 + nguyên nhân, 所以 + kết quả',
    simpleExplanation:'Diễn đạt quan hệ nhân quả. Có thể bỏ 因为 nếu nhân quả rõ ràng.',
    examples:[{cn:'因为下雨，所以我们没去公园。', pinyin:'Yīnwèi xià yǔ, suǒyǐ wǒmen méi qù gōngyuán.', vi:'Vì trời mưa nên chúng tôi không đi công viên.'}],
    commonMistakes:['Không nên dùng cả 因为 và 所以 cùng 但是 trong cùng một câu.'],
    practice:[{type:'fill_blank', question:'____我感冒了，____今天不上班。', answer:'因为 / 所以', explanation:'Quan hệ nhân quả.'}] },

  { id:'g_hsk4_003', title:'不但……而且……', level:'HSK4', meaning:'Không những... mà còn...',
    structure:'不但 + ý 1, 而且 + ý 2 (mức độ tăng tiến)',
    simpleExplanation:'Dùng cho hai vế cùng chiều, vế sau nhấn mạnh hơn vế trước.',
    examples:[{cn:'她不但漂亮，而且很聪明。', pinyin:'Tā búdàn piàoliang, érqiě hěn cōngmíng.', vi:'Cô ấy không những đẹp mà còn rất thông minh.'}],
    commonMistakes:['Hai vế phải cùng chiều (cùng tốt hoặc cùng xấu), không trái ngược.'],
    practice:[{type:'fill_blank', question:'他____会说英语，____会说汉语。', answer:'不但 / 而且', explanation:'Hai vế tăng tiến cùng chiều.'}] },

  { id:'g_hsk4_004', title:'只要……就……', level:'HSK4', meaning:'Chỉ cần... thì...',
    structure:'只要 + điều kiện đủ, 就 + kết quả',
    simpleExplanation:'Nêu điều kiện đủ. Có nhiều điều kiện có thể dẫn đến cùng một kết quả.',
    examples:[{cn:'只要你努力，就一定能成功。', pinyin:'Zhǐyào nǐ nǔlì, jiù yídìng néng chénggōng.', vi:'Chỉ cần bạn nỗ lực thì nhất định thành công.'}],
    commonMistakes:['Đừng nhầm với 只有……才…… (chỉ có... mới...).'],
    practice:[{type:'fill_blank', question:'____你来，我____很高兴。', answer:'只要 / 就', explanation:'Điều kiện đủ.'}] },

  { id:'g_hsk4_005', title:'只有……才……', level:'HSK4', meaning:'Chỉ có... mới...',
    structure:'只有 + điều kiện duy nhất, 才 + kết quả',
    simpleExplanation:'Điều kiện duy nhất, không có cách khác để đạt kết quả.',
    examples:[{cn:'只有努力，才能学好中文。', pinyin:'Zhǐyǒu nǔlì, cái néng xué hǎo Zhōngwén.', vi:'Chỉ có nỗ lực mới có thể học giỏi tiếng Trung.'}],
    commonMistakes:['Không thay 才 bằng 就 — sai sắc thái.'],
    practice:[{type:'fill_blank', question:'____多练习，____能进步。', answer:'只有 / 才', explanation:'Điều kiện duy nhất.'}] },

  { id:'g_hsk4_006', title:'一边……一边……', level:'HSK4', meaning:'Vừa... vừa... (hành động đồng thời)',
    structure:'一边 + động từ 1, 一边 + động từ 2',
    simpleExplanation:'Diễn tả hai hành động xảy ra cùng lúc bởi cùng một chủ ngữ.',
    examples:[{cn:'他一边吃饭一边看电视。', pinyin:'Tā yìbiān chī fàn yìbiān kàn diànshì.', vi:'Anh ấy vừa ăn cơm vừa xem TV.'}],
    commonMistakes:['Chỉ dùng cho hành động, không dùng cho tính từ.'],
    practice:[{type:'fill_blank', question:'我喜欢____听音乐____学习。', answer:'一边 / 一边', explanation:'Hai hành động cùng lúc.'}] },

  { id:'g_hsk4_007', title:'越来越……', level:'HSK4', meaning:'Càng ngày càng...',
    structure:'Chủ ngữ + 越来越 + tính từ / động từ tâm lý',
    simpleExplanation:'Tăng dần theo thời gian. Sau 越来越 không cần 很/非常.',
    examples:[{cn:'天气越来越冷了。', pinyin:'Tiānqì yuèláiyuè lěng le.', vi:'Thời tiết càng ngày càng lạnh.'}],
    commonMistakes:['Sai: 越来越很冷. Đúng: 越来越冷.'],
    practice:[{type:'fill_blank', question:'我的中文____好了。', answer:'越来越', explanation:'Tăng dần theo thời gian.'}] },

  { id:'g_hsk4_008', title:'把字句', level:'HSK4', meaning:'Câu chữ 把 — nhấn vào tác động lên đối tượng',
    structure:'Chủ ngữ + 把 + tân ngữ xác định + động từ + thành phần khác',
    simpleExplanation:'Đưa tân ngữ lên trước động từ để nhấn mạnh tác động lên đối tượng đó. Tân ngữ phải xác định (cụ thể).',
    examples:[{cn:'请把门关上。', pinyin:'Qǐng bǎ mén guān shàng.', vi:'Xin hãy đóng cửa lại.'}],
    commonMistakes:['Sau động từ phải có thành phần khác (了, 上, 给, 在……), không thể đứng một mình.'],
    practice:[{type:'fill_blank', question:'我____书放在桌子上了。', answer:'把', explanation:'Tác động cụ thể lên cuốn sách (đối tượng xác định).'}] },

  { id:'g_hsk4_009', title:'被字句', level:'HSK4', meaning:'Câu bị động với 被',
    structure:'Đối tượng + 被 + (chủ thể) + động từ + thành phần khác',
    simpleExplanation:'Diễn đạt bị động. Chủ thể có thể lược bỏ.',
    examples:[{cn:'我的手机被偷了。', pinyin:'Wǒ de shǒujī bèi tōu le.', vi:'Điện thoại của tôi bị trộm mất rồi.'}],
    commonMistakes:['Sau 被 + động từ vẫn cần thành phần khác (了, 走, 掉…).'],
    practice:[{type:'fill_blank', question:'蛋糕____弟弟吃了。', answer:'被', explanation:'Bị động — bánh bị em ăn.'}] },

  { id:'g_hsk4_010', title:'对……感兴趣', level:'HSK4', meaning:'Hứng thú với...',
    structure:'Chủ ngữ + 对 + đối tượng + 感兴趣',
    simpleExplanation:'Diễn tả sự hứng thú/yêu thích với điều gì.',
    examples:[{cn:'我对中国文化很感兴趣。', pinyin:'Wǒ duì Zhōngguó wénhuà hěn gǎn xìngqù.', vi:'Tôi rất hứng thú với văn hóa Trung Quốc.'}],
    commonMistakes:['Không dùng 喜欢 + 感兴趣 cùng nhau (dư nghĩa).'],
    practice:[{type:'fill_blank', question:'他____音乐很感兴趣。', answer:'对', explanation:'Cấu trúc 对……感兴趣.'}] },

  // HSK5
  { id:'g_hsk5_001', title:'既然……就……', level:'HSK5', meaning:'Đã (như vậy) thì...',
    structure:'既然 + tiền đề đã được chấp nhận, 就 + kết luận',
    simpleExplanation:'Dựa trên tiền đề đã rõ để đưa ra kết luận, đề nghị.',
    examples:[{cn:'既然你不舒服，就早点休息吧。', pinyin:'Jìrán nǐ bù shūfu, jiù zǎodiǎn xiūxí ba.', vi:'Đã không khỏe thì nghỉ sớm đi.'}],
    commonMistakes:['Tiền đề phải là sự thật đã biết, không phải giả định mới.'],
    practice:[{type:'fill_blank', question:'____你来了，____多坐一会儿吧。', answer:'既然 / 就', explanation:'Đã đến rồi thì ngồi lâu một chút.'}] },

  { id:'g_hsk5_002', title:'无论……都……', level:'HSK5', meaning:'Bất kể... đều...',
    structure:'无论 + điều kiện thay đổi, 都 + kết quả không đổi',
    simpleExplanation:'Kết quả không bị ảnh hưởng bởi bất kỳ điều kiện nào. Sau 无论 phải có từ nghi vấn hoặc cấu trúc lựa chọn.',
    examples:[{cn:'无论遇到什么困难，他都不放弃。', pinyin:'Wúlùn yùdào shénme kùnnán, tā dōu bú fàngqì.', vi:'Bất kể gặp khó khăn gì, anh ấy đều không bỏ cuộc.'}],
    commonMistakes:['Phải dùng 都 hoặc 也 ở vế sau, không bỏ.'],
    practice:[{type:'fill_blank', question:'____下不下雨，我____要去。', answer:'无论 / 都', explanation:'Kết quả không đổi.'}] },

  { id:'g_hsk5_003', title:'与其……不如……', level:'HSK5', meaning:'Thà... còn hơn...',
    structure:'与其 + lựa chọn A, 不如 + lựa chọn B (B tốt hơn)',
    simpleExplanation:'So sánh hai lựa chọn, khuyên chọn B.',
    examples:[{cn:'与其等待，不如行动。', pinyin:'Yǔqí děngdài, bùrú xíngdòng.', vi:'Thà hành động còn hơn chờ đợi.'}],
    commonMistakes:['Vế sau (不如) là vế được chọn — đừng đảo ngược.'],
    practice:[{type:'fill_blank', question:'____坐车，____走路更健康。', answer:'与其 / 不如', explanation:'Khuyên chọn đi bộ.'}] },

  { id:'g_hsk5_004', title:'宁可……也不……', level:'HSK5', meaning:'Thà... cũng không...',
    structure:'宁可 + lựa chọn A (chấp nhận khó), 也不 + lựa chọn B (từ chối)',
    simpleExplanation:'Sẵn sàng chấp nhận A để tránh B.',
    examples:[{cn:'我宁可加班，也不想做错事。', pinyin:'Wǒ nìngkě jiābān, yě bù xiǎng zuò cuò shì.', vi:'Tôi thà tăng ca chứ không muốn làm sai việc.'}],
    commonMistakes:['Hay nhầm với 与其……不如…… — sắc thái khác.'],
    practice:[{type:'fill_blank', question:'他____饿肚子，____吃不喜欢的菜。', answer:'宁可 / 也不', explanation:'Thà nhịn đói còn hơn ăn món không thích.'}] },

  { id:'g_hsk5_005', title:'之所以……是因为……', level:'HSK5', meaning:'Sở dĩ... là vì...',
    structure:'Chủ ngữ + 之所以 + kết quả, 是因为 + nguyên nhân',
    simpleExplanation:'Đảo trật tự nhân quả: nêu kết quả trước để nhấn mạnh, sau đó mới giải thích.',
    examples:[{cn:'我之所以学中文，是因为我喜欢中国文化。', pinyin:'Wǒ zhīsuǒyǐ xué Zhōngwén, shì yīnwèi wǒ xǐhuān Zhōngguó wénhuà.', vi:'Sở dĩ tôi học tiếng Trung là vì tôi thích văn hóa Trung Quốc.'}],
    commonMistakes:['Vế đầu là kết quả, vế sau là nguyên nhân — ngược với 因为……所以…….'],
    practice:[{type:'fill_blank', question:'他____成功，____他非常努力。', answer:'之所以 / 是因为', explanation:'Đảo trật tự nhân quả.'}] },

  { id:'g_hsk5_006', title:'连……都/也……', level:'HSK5', meaning:'Đến cả... cũng...',
    structure:'连 + đối tượng đặc biệt, 都/也 + động từ/tính từ',
    simpleExplanation:'Nhấn mạnh trường hợp đặc biệt — ngay cả trường hợp này cũng có/không có.',
    examples:[{cn:'他连饭都不想吃。', pinyin:'Tā lián fàn dōu bù xiǎng chī.', vi:'Anh ấy đến cả cơm cũng không muốn ăn.'}],
    commonMistakes:['Sau 连 phải có 都 hoặc 也, không thể bỏ.'],
    practice:[{type:'fill_blank', question:'他____这么简单的字____不认识。', answer:'连 / 都', explanation:'Nhấn mạnh trường hợp cực đoan.'}] },

  { id:'g_hsk5_007', title:'除了……以外', level:'HSK5', meaning:'Ngoài... ra (thêm/loại trừ)',
    structure:'除了 + đối tượng + 以外, 还/都/也 + ...',
    simpleExplanation:'Có hai nghĩa: (1) + 还/也 = bao gồm cả; (2) + 都 = loại trừ.',
    examples:[{cn:'除了苹果以外，我还喜欢吃香蕉。', pinyin:'Chúle píngguǒ yǐwài, wǒ hái xǐhuān chī xiāngjiāo.', vi:'Ngoài táo ra, tôi còn thích ăn chuối.'}],
    commonMistakes:['Phải xác định rõ 还 (thêm) hay 都 (loại trừ).'],
    practice:[{type:'fill_blank', question:'____你以外，大家____知道了。', answer:'除了 / 都', explanation:'Loại trừ "bạn" — mọi người khác đều biết.'}] },

  { id:'g_hsk5_008', title:'由于……', level:'HSK5', meaning:'Do... (trang trọng)',
    structure:'由于 + nguyên nhân, (因此/所以) + kết quả',
    simpleExplanation:'Cùng nghĩa với 因为 nhưng trang trọng, hay dùng trong văn viết.',
    examples:[{cn:'由于天气不好，比赛被取消了。', pinyin:'Yóuyú tiānqì bù hǎo, bǐsài bèi qǔxiāo le.', vi:'Do thời tiết xấu, trận đấu bị hủy.'}],
    commonMistakes:['由于 chỉ đặt đầu vế nguyên nhân, không thay 因为 trong khẩu ngữ.'],
    practice:[{type:'fill_blank', question:'____堵车，我迟到了。', answer:'由于', explanation:'Nguyên nhân trang trọng.'}] },

  { id:'g_hsk5_009', title:'通过……', level:'HSK5', meaning:'Thông qua... / Bằng cách...',
    structure:'通过 + phương tiện/quá trình, + kết quả',
    simpleExplanation:'Dùng để chỉ phương tiện hoặc quá trình đạt kết quả.',
    examples:[{cn:'通过努力学习，他考上了大学。', pinyin:'Tōngguò nǔlì xuéxí, tā kǎoshàng le dàxué.', vi:'Thông qua việc học chăm chỉ, anh ấy đã đỗ đại học.'}],
    commonMistakes:['Đừng nhầm 通过 (qua quá trình) với 经过 (đi qua một nơi/khoảng thời gian).'],
    practice:[{type:'fill_blank', question:'____锻炼，我的身体变好了。', answer:'通过', explanation:'Phương tiện/quá trình đạt kết quả.'}] },

  { id:'g_hsk5_010', title:'对于……来说', level:'HSK5', meaning:'Đối với... mà nói',
    structure:'对于 + đối tượng + 来说, + nhận định',
    simpleExplanation:'Đưa ra góc nhìn từ một đối tượng cụ thể.',
    examples:[{cn:'对于学生来说，学习是最重要的。', pinyin:'Duìyú xuéshēng lái shuō, xuéxí shì zuì zhòngyào de.', vi:'Đối với học sinh mà nói, học tập là quan trọng nhất.'}],
    commonMistakes:['Có thể thay 对于 bằng 对, nhưng 来说 không thể bỏ.'],
    practice:[{type:'fill_blank', question:'____我____，健康最重要。', answer:'对于 / 来说', explanation:'Đưa ra góc nhìn cá nhân.'}] }
];

/* ---------- QUIZZES: ~60 quiz, 5 dạng ---------- */

const QUIZZES = [
  // === A. meaning_choice (15) ===
  { id:'q_meaning_001', type:'meaning_choice', level:'HSK4', question:'影响 có nghĩa là gì?', targetWordId:'hsk4_001',
    options:['ảnh hưởng','kinh nghiệm','trách nhiệm','cơ hội'], answer:'ảnh hưởng',
    explanation:'影响 (yǐngxiǎng) nghĩa là ảnh hưởng, tác động đến điều gì đó.' },
  { id:'q_meaning_002', type:'meaning_choice', level:'HSK4', question:'经验 có nghĩa là gì?', targetWordId:'hsk4_002',
    options:['kinh nghiệm','trải qua','cơ hội','phương pháp'], answer:'kinh nghiệm',
    explanation:'经验 (jīngyàn) chỉ kinh nghiệm rút ra từ việc đã làm.' },
  { id:'q_meaning_003', type:'meaning_choice', level:'HSK4', question:'责任 có nghĩa là gì?', targetWordId:'hsk4_003',
    options:['trách nhiệm','quyết định','tự do','quyền lợi'], answer:'trách nhiệm',
    explanation:'责任 (zérèn) nghĩa là trách nhiệm.' },
  { id:'q_meaning_004', type:'meaning_choice', level:'HSK4', question:'适合 có nghĩa là gì?', targetWordId:'hsk4_006',
    options:['phù hợp với','thích hợp (tính từ)','yêu thích','phối hợp'], answer:'phù hợp với',
    explanation:'适合 là động từ, có thể đi kèm tân ngữ. (合适 mới là tính từ.)' },
  { id:'q_meaning_005', type:'meaning_choice', level:'HSK4', question:'保护 có nghĩa là gì?', targetWordId:'hsk4_009',
    options:['bảo vệ','bảo đảm','giữ gìn','che chở'], answer:'bảo vệ',
    explanation:'保护 là bảo vệ; 保证 mới là bảo đảm.' },
  { id:'q_meaning_006', type:'meaning_choice', level:'HSK4', question:'提高 có nghĩa là gì?', targetWordId:'hsk4_010',
    options:['nâng cao','tăng thêm số lượng','phát triển','mở rộng'], answer:'nâng cao',
    explanation:'提高 nâng cao mức độ/chất lượng; 增加 mới là tăng số lượng.' },
  { id:'q_meaning_007', type:'meaning_choice', level:'HSK4', question:'印象 có nghĩa là gì?', targetWordId:'hsk4_012',
    options:['ấn tượng','ảnh hưởng','hình tượng','sức tưởng tượng'], answer:'ấn tượng',
    explanation:'印象 (yìnxiàng) — cảm nhận lưu lại trong đầu.' },
  { id:'q_meaning_008', type:'meaning_choice', level:'HSK4', question:'同事 có nghĩa là gì?', targetWordId:'hsk4_025',
    options:['đồng nghiệp','bạn cùng lớp','sếp','khách hàng'], answer:'đồng nghiệp',
    explanation:'同事 (tóngshì) — người làm cùng cơ quan.' },
  { id:'q_meaning_009', type:'meaning_choice', level:'HSK4', question:'锻炼 có nghĩa là gì?', targetWordId:'hsk4_020',
    options:['rèn luyện thể chất','khỏe mạnh','thư giãn','nâng cao'], answer:'rèn luyện thể chất',
    explanation:'锻炼 thường dùng cho việc tập thể dục hoặc rèn luyện ý chí.' },
  { id:'q_meaning_010', type:'meaning_choice', level:'HSK5', question:'机遇 có nghĩa là gì?', targetWordId:'hsk5_002',
    options:['cơ duyên (lớn, hiếm)','may mắn','thành công','kế hoạch'], answer:'cơ duyên (lớn, hiếm)',
    explanation:'机遇 là cơ hội lớn, hiếm có, trang trọng hơn 机会.' },
  { id:'q_meaning_011', type:'meaning_choice', level:'HSK5', question:'保证 có nghĩa là gì?', targetWordId:'hsk5_007',
    options:['bảo đảm','bảo vệ','bảo trì','bảo tồn'], answer:'bảo đảm',
    explanation:'保证 — cam đoan chắc chắn, khác với 保护 (bảo vệ).' },
  { id:'q_meaning_012', type:'meaning_choice', level:'HSK5', question:'污染 có nghĩa là gì?', targetWordId:'hsk5_017',
    options:['ô nhiễm','bẩn thỉu','phá hoại','tàn phá'], answer:'ô nhiễm',
    explanation:'污染 (wūrǎn) thường nói về không khí, nước, môi trường.' },
  { id:'q_meaning_013', type:'meaning_choice', level:'HSK5', question:'招聘 có nghĩa là gì?', targetWordId:'hsk5_021',
    options:['tuyển dụng','xin việc','phỏng vấn','bổ nhiệm'], answer:'tuyển dụng',
    explanation:'招聘 — công ty đăng tuyển nhân viên.' },
  { id:'q_meaning_014', type:'meaning_choice', level:'HSK5', question:'紧张 có nghĩa là gì?', targetWordId:'hsk5_027',
    options:['căng thẳng, hồi hộp','nghiêm túc','sợ hãi','tức giận'], answer:'căng thẳng, hồi hộp',
    explanation:'紧张 chỉ trạng thái lo lắng hoặc tình hình gay go.' },
  { id:'q_meaning_015', type:'meaning_choice', level:'HSK5', question:'复习 có nghĩa là gì?', targetWordId:'hsk5_029',
    options:['ôn tập','xem lại phim','luyện tập','học mới'], answer:'ôn tập',
    explanation:'复习 — học lại nội dung đã học.' },

  // === B. listening_choice (12) ===
  { id:'q_listen_001', type:'listening_choice', level:'HSK4', audioText:'影响', audioPinyin:'yǐngxiǎng',
    options:['影响','印象','形象','想象'], answer:'影响', explanation:'yǐngxiǎng = 影响 (ảnh hưởng).' },
  { id:'q_listen_002', type:'listening_choice', level:'HSK4', audioText:'经验', audioPinyin:'jīngyàn',
    options:['经验','经历','经过','经济'], answer:'经验', explanation:'jīngyàn = 经验 (kinh nghiệm).' },
  { id:'q_listen_003', type:'listening_choice', level:'HSK4', audioText:'了解', audioPinyin:'liǎojiě',
    options:['了解','理解','谅解','讲解'], answer:'了解', explanation:'liǎojiě = 了解.' },
  { id:'q_listen_004', type:'listening_choice', level:'HSK4', audioText:'方法', audioPinyin:'fāngfǎ',
    options:['方法','办法','方向','想法'], answer:'方法', explanation:'fāngfǎ = 方法.' },
  { id:'q_listen_005', type:'listening_choice', level:'HSK4', audioText:'决定', audioPinyin:'juédìng',
    options:['决定','规定','一定','肯定'], answer:'决定', explanation:'juédìng = 决定.' },
  { id:'q_listen_006', type:'listening_choice', level:'HSK4', audioText:'健康', audioPinyin:'jiànkāng',
    options:['健康','健身','健全','坚强'], answer:'健康', explanation:'jiànkāng = 健康.' },
  { id:'q_listen_007', type:'listening_choice', level:'HSK4', audioText:'购物', audioPinyin:'gòuwù',
    options:['购物','购买','购置','获得'], answer:'购物', explanation:'gòuwù = 购物.' },
  { id:'q_listen_008', type:'listening_choice', level:'HSK5', audioText:'形象', audioPinyin:'xíngxiàng',
    options:['形象','印象','影响','现象'], answer:'形象', explanation:'xíngxiàng = 形象 (hình tượng).' },
  { id:'q_listen_009', type:'listening_choice', level:'HSK5', audioText:'保证', audioPinyin:'bǎozhèng',
    options:['保证','保护','保持','保留'], answer:'保证', explanation:'bǎozhèng = 保证 (bảo đảm).' },
  { id:'q_listen_010', type:'listening_choice', level:'HSK5', audioText:'发生', audioPinyin:'fāshēng',
    options:['发生','发现','发展','发明'], answer:'发生', explanation:'fāshēng = 发生 (xảy ra).' },
  { id:'q_listen_011', type:'listening_choice', level:'HSK5', audioText:'招聘', audioPinyin:'zhāopìn',
    options:['招聘','招呼','招生','应聘'], answer:'招聘', explanation:'zhāopìn = 招聘.' },
  { id:'q_listen_012', type:'listening_choice', level:'HSK5', audioText:'紧张', audioPinyin:'jǐnzhāng',
    options:['紧张','轻松','严重','认真'], answer:'紧张', explanation:'jǐnzhāng = 紧张.' },

  // === C. fill_blank (15) ===
  { id:'q_fill_001', type:'fill_blank', level:'HSK4', question:'这件事对我有很大的____。',
    options:['影响','经验','责任','机会'], answer:'影响',
    translation:'Việc này có ảnh hưởng rất lớn đến tôi.', explanation:'Cụm thường dùng: 对……有影响.' },
  { id:'q_fill_002', type:'fill_blank', level:'HSK4', question:'我____明天去看电影。',
    options:['决定','决心','坚定','一定'], answer:'决定',
    translation:'Tôi quyết định ngày mai đi xem phim.', explanation:'决定 + động từ = quyết định làm gì.' },
  { id:'q_fill_003', type:'fill_blank', level:'HSK4', question:'这是一个很好的____。',
    options:['机会','机遇','机器','时机'], answer:'机会',
    translation:'Đây là một cơ hội rất tốt.', explanation:'机会 phổ biến hơn 机遇 trong câu hằng ngày.' },
  { id:'q_fill_004', type:'fill_blank', level:'HSK4', question:'这双鞋很____你。',
    options:['适合','合适','合理','满意'], answer:'适合',
    translation:'Đôi giày này rất hợp với bạn.', explanation:'适合 đi kèm tân ngữ; 合适 là tính từ độc lập.' },
  { id:'q_fill_005', type:'fill_blank', level:'HSK4', question:'我们应该____环境。',
    options:['保护','保证','保留','保持'], answer:'保护',
    translation:'Chúng ta nên bảo vệ môi trường.', explanation:'Cụm 保护环境 — bảo vệ môi trường.' },
  { id:'q_fill_006', type:'fill_blank', level:'HSK4', question:'多运动可以____身体素质。',
    options:['提高','增加','上升','增长'], answer:'提高',
    translation:'Tập thể dục nhiều có thể nâng cao thể chất.', explanation:'提高 + mức độ/trình độ.' },
  { id:'q_fill_007', type:'fill_blank', level:'HSK4', question:'她给我留下了很好的____。',
    options:['印象','影响','形象','想象'], answer:'印象',
    translation:'Cô ấy để lại cho tôi ấn tượng rất tốt.', explanation:'留下印象 — cụm cố định.' },
  { id:'q_fill_008', type:'fill_blank', level:'HSK4', question:'考试前我感到很____。',
    options:['紧张','轻松','着急','害怕'], answer:'紧张',
    translation:'Trước kỳ thi tôi cảm thấy rất hồi hộp.', explanation:'紧张 thường dùng cho cảm xúc trước sự kiện quan trọng.' },
  { id:'q_fill_009', type:'fill_blank', level:'HSK4', question:'我____你的工作经验很丰富。',
    options:['了解','理解','明白','知道'], answer:'了解',
    translation:'Tôi biết kinh nghiệm làm việc của bạn rất phong phú.', explanation:'了解 — biết thông tin/tình hình.' },
  { id:'q_fill_010', type:'fill_blank', level:'HSK5', question:'我____按时完成任务。',
    options:['保证','保护','保持','保留'], answer:'保证',
    translation:'Tôi đảm bảo hoàn thành nhiệm vụ đúng giờ.', explanation:'保证 — cam đoan chắc chắn.' },
  { id:'q_fill_011', type:'fill_blank', level:'HSK5', question:'公司决定____员工的工资。',
    options:['增加','提高','增长','上升'], answer:'增加',
    translation:'Công ty quyết định tăng lương cho nhân viên.', explanation:'Tăng số lượng/khối lượng dùng 增加.' },
  { id:'q_fill_012', type:'fill_blank', level:'HSK5', question:'昨天____了一件大事。',
    options:['发生','发现','发展','发明'], answer:'发生',
    translation:'Hôm qua đã xảy ra một việc lớn.', explanation:'发生 — sự việc xảy ra.' },
  { id:'q_fill_013', type:'fill_blank', level:'HSK5', question:'明天我要去公司____。',
    options:['面试','面对','面前','面子'], answer:'面试',
    translation:'Ngày mai tôi sẽ đi phỏng vấn ở công ty.', explanation:'面试 — phỏng vấn xin việc.' },
  { id:'q_fill_014', type:'fill_blank', level:'HSK5', question:'他____工作了十个小时。',
    options:['连续','继续','陆续','持续'], answer:'连续',
    translation:'Anh ấy làm việc liên tục mười tiếng.', explanation:'连续 — không gián đoạn; 继续 — có thể tạm dừng.' },
  { id:'q_fill_015', type:'fill_blank', level:'HSK5', question:'考试前一定要好好____。',
    options:['复习','学习','练习','预习'], answer:'复习',
    translation:'Trước kỳ thi nhất định phải ôn tập kỹ.', explanation:'复习 — ôn lại nội dung đã học.' },

  // === D. sentence_order (8) ===
  { id:'q_order_001', type:'sentence_order', level:'HSK4',
    tokens:['我','决定','每天','学习中文'], answer:['我','决定','每天','学习中文'],
    finalSentence:'我决定每天学习中文。',
    translation:'Tôi quyết định mỗi ngày đều học tiếng Trung.',
    explanation:'Cấu trúc cơ bản: chủ ngữ + động từ + thời gian + hành động.' },
  { id:'q_order_002', type:'sentence_order', level:'HSK4',
    tokens:['这件事','影响了','我的','决定'], answer:['这件事','影响了','我的','决定'],
    finalSentence:'这件事影响了我的决定。',
    translation:'Việc này đã ảnh hưởng đến quyết định của tôi.',
    explanation:'影响了 + tân ngữ.' },
  { id:'q_order_003', type:'sentence_order', level:'HSK4',
    tokens:['我们','一起','去','购物','吧'], answer:['我们','一起','去','购物','吧'],
    finalSentence:'我们一起去购物吧。',
    translation:'Chúng ta cùng đi mua sắm đi.',
    explanation:'Trật tự: chủ ngữ + trạng ngữ + động từ + 吧 (đề nghị).' },
  { id:'q_order_004', type:'sentence_order', level:'HSK4',
    tokens:['请','把','门','关上'], answer:['请','把','门','关上'],
    finalSentence:'请把门关上。',
    translation:'Xin hãy đóng cửa lại.',
    explanation:'Câu chữ 把: chủ ngữ + 把 + tân ngữ + động từ + thành phần khác.' },
  { id:'q_order_005', type:'sentence_order', level:'HSK5',
    tokens:['我','对','中国文化','很','感兴趣'], answer:['我','对','中国文化','很','感兴趣'],
    finalSentence:'我对中国文化很感兴趣。',
    translation:'Tôi rất hứng thú với văn hóa Trung Quốc.',
    explanation:'Cấu trúc: 对 + đối tượng + 感兴趣.' },
  { id:'q_order_006', type:'sentence_order', level:'HSK5',
    tokens:['他','连','饭','都','不想','吃'], answer:['他','连','饭','都','不想','吃'],
    finalSentence:'他连饭都不想吃。',
    translation:'Anh ấy đến cả cơm cũng không muốn ăn.',
    explanation:'Cấu trúc 连……都……: nhấn mạnh trường hợp đặc biệt.' },
  { id:'q_order_007', type:'sentence_order', level:'HSK5',
    tokens:['通过','努力','他','考上了','大学'], answer:['通过','努力','他','考上了','大学'],
    finalSentence:'通过努力，他考上了大学。',
    translation:'Thông qua nỗ lực, anh ấy đã đỗ đại học.',
    explanation:'Cấu trúc 通过 + phương tiện/quá trình.' },
  { id:'q_order_008', type:'sentence_order', level:'HSK5',
    tokens:['无论','遇到','什么','困难','他','都','不','放弃'], answer:['无论','遇到','什么','困难','他','都','不','放弃'],
    finalSentence:'无论遇到什么困难，他都不放弃。',
    translation:'Bất kể gặp khó khăn gì, anh ấy đều không từ bỏ.',
    explanation:'Cấu trúc 无论……都…….' },

  // === E. confusing_choice (10) ===
  { id:'q_confuse_001', type:'confusing_choice', level:'HSK4', question:'我不太____这个问题的意思。',
    options:['了解','理解'], answer:'理解',
    explanation:'Ở đây nói về hiểu ý nghĩa bên trong → dùng 理解.' },
  { id:'q_confuse_002', type:'confusing_choice', level:'HSK4', question:'他有十年的工作____。',
    options:['经验','经历'], answer:'经验',
    explanation:'Bài học/kỹ năng tích lũy từ công việc → 经验; còn 经历 là sự việc đã trải qua.' },
  { id:'q_confuse_003', type:'confusing_choice', level:'HSK4', question:'这双鞋很____。',
    options:['适合','合适'], answer:'合适',
    explanation:'Tính từ độc lập sau chủ ngữ → 合适. (适合 cần đi kèm tân ngữ.)' },
  { id:'q_confuse_004', type:'confusing_choice', level:'HSK4', question:'她给我的第一____非常好。',
    options:['印象','形象'], answer:'印象',
    explanation:'Cảm nhận đầu tiên → 印象. 形象 là hình ảnh đại diện.' },
  { id:'q_confuse_005', type:'confusing_choice', level:'HSK4', question:'我们一起想____吧。',
    options:['方法','办法'], answer:'办法',
    explanation:'Cách giải quyết tình huống cụ thể, khẩu ngữ → 办法.' },
  { id:'q_confuse_006', type:'confusing_choice', level:'HSK4', question:'我____他会同意。',
    options:['认为','以为'], answer:'认为',
    explanation:'Khẳng định ý kiến tin là đúng → 认为. 以为 mang nghĩa "tưởng nhầm".' },
  { id:'q_confuse_007', type:'confusing_choice', level:'HSK4', question:'公司决定____员工的工资。',
    options:['提高','增加'], answer:'增加',
    explanation:'Tăng số lượng tiền → 增加. 提高 dùng cho mức độ/chất lượng.' },
  { id:'q_confuse_008', type:'confusing_choice', level:'HSK5', question:'我____按时完成任务。',
    options:['保护','保证'], answer:'保证',
    explanation:'Cam đoan chắc chắn → 保证. 保护 là giữ an toàn.' },
  { id:'q_confuse_009', type:'confusing_choice', level:'HSK5', question:'昨天____了一件大事。',
    options:['发生','发现'], answer:'发生',
    explanation:'Sự kiện diễn ra → 发生. 发现 là nhìn thấy/biết được điều mới.' },
  { id:'q_confuse_010', type:'confusing_choice', level:'HSK5', question:'我已经____了今天的工作。',
    options:['完成','结束'], answer:'完成',
    explanation:'Hoàn thành mục tiêu/nhiệm vụ → 完成. 结束 chỉ là dừng lại.' }
];

/* ---------- CONFUSING WORDS: 15 nhóm ---------- */

const CONFUSING_WORDS = [
  { id:'cf_001', level:'HSK4', words:['了解','理解'],
    summary:'了解 = biết thông tin; 理解 = hiểu ý nghĩa/cảm xúc bên trong.',
    items:[
      { word:'了解', meaning:'biết, nắm thông tin', usage:'Dùng khi biết tình hình, sự việc.',
        example:{cn:'我了解他的情况。', pinyin:'Wǒ liǎojiě tā de qíngkuàng.', vi:'Tôi biết tình hình của anh ấy.'} },
      { word:'理解', meaning:'hiểu sâu, thông cảm', usage:'Dùng khi hiểu ý nghĩa hay cảm xúc.',
        example:{cn:'我理解你的意思。', pinyin:'Wǒ lǐjiě nǐ de yìsi.', vi:'Tôi hiểu ý của bạn.'} }
    ],
    quickRule:'了解 = biết thông tin → 理解 = hiểu ý nghĩa bên trong.',
    quiz:{question:'我不太____这个问题的意思。', options:['了解','理解'], answer:'理解', explanation:'Hiểu ý nghĩa → 理解.'} },

  { id:'cf_002', level:'HSK4', words:['经历','经验'],
    summary:'经历 = sự việc đã trải qua; 经验 = bài học/kỹ năng rút ra.',
    items:[
      { word:'经历', meaning:'trải qua', usage:'Là sự kiện đã xảy ra với mình.',
        example:{cn:'我经历过很多困难。', pinyin:'Wǒ jīnglì guò hěn duō kùnnán.', vi:'Tôi đã trải qua nhiều khó khăn.'} },
      { word:'经验', meaning:'kinh nghiệm', usage:'Là kết quả/bài học từ việc đã làm.',
        example:{cn:'他有很多工作经验。', pinyin:'Tā yǒu hěn duō gōngzuò jīngyàn.', vi:'Anh ấy có nhiều kinh nghiệm làm việc.'} }
    ],
    quickRule:'经历 = sự việc; 经验 = bài học.',
    quiz:{question:'他有十年的工作____。', options:['经历','经验'], answer:'经验', explanation:'Bài học từ công việc → 经验.'} },

  { id:'cf_003', level:'HSK4', words:['适合','合适'],
    summary:'适合 là động từ (+ tân ngữ); 合适 là tính từ (đứng độc lập).',
    items:[
      { word:'适合', meaning:'phù hợp với (động từ)', usage:'A 适合 B — có thể đi kèm tân ngữ.',
        example:{cn:'这份工作很适合你。', pinyin:'Zhè fèn gōngzuò hěn shìhé nǐ.', vi:'Công việc này rất phù hợp với bạn.'} },
      { word:'合适', meaning:'thích hợp (tính từ)', usage:'A 很合适 — không có tân ngữ phía sau.',
        example:{cn:'这件衣服很合适。', pinyin:'Zhè jiàn yīfu hěn héshì.', vi:'Bộ quần áo này rất hợp.'} }
    ],
    quickRule:'适合 + tân ngữ; 合适 đứng một mình.',
    quiz:{question:'这双鞋很____。', options:['适合','合适'], answer:'合适', explanation:'Tính từ độc lập → 合适.'} },

  { id:'cf_004', level:'HSK4', words:['影响','印象','形象'],
    summary:'影响 = ảnh hưởng (tác động); 印象 = ấn tượng (cảm nhận); 形象 = hình tượng (hình ảnh đại diện).',
    items:[
      { word:'影响', meaning:'ảnh hưởng, tác động', usage:'Tác động đến kết quả hay suy nghĩ.',
        example:{cn:'这件事影响了我。', pinyin:'Zhè jiàn shì yǐngxiǎng le wǒ.', vi:'Việc này đã ảnh hưởng đến tôi.'} },
      { word:'印象', meaning:'ấn tượng', usage:'Cảm nhận đầu tiên lưu lại trong đầu.',
        example:{cn:'她给我留下了好印象。', pinyin:'Tā gěi wǒ liú xià le hǎo yìnxiàng.', vi:'Cô ấy để lại ấn tượng tốt cho tôi.'} },
      { word:'形象', meaning:'hình tượng', usage:'Hình ảnh đại diện công khai của một người/thương hiệu.',
        example:{cn:'他在公司的形象很好。', pinyin:'Tā zài gōngsī de xíngxiàng hěn hǎo.', vi:'Hình ảnh của anh ấy ở công ty rất tốt.'} }
    ],
    quickRule:'影响 = tác động → 印象 = cảm nhận → 形象 = hình ảnh đại diện.',
    quiz:{question:'她给我的第一____很好。', options:['影响','印象','形象'], answer:'印象', explanation:'Cảm nhận đầu tiên → 印象.'} },

  { id:'cf_005', level:'HSK5', words:['机会','机遇'],
    summary:'机会 = cơ hội thông thường; 机遇 = cơ duyên lớn, hiếm.',
    items:[
      { word:'机会', meaning:'cơ hội', usage:'Dùng phổ thông, đời sống.',
        example:{cn:'这是个好机会。', pinyin:'Zhè shì gè hǎo jīhuì.', vi:'Đây là cơ hội tốt.'} },
      { word:'机遇', meaning:'cơ duyên lớn', usage:'Trang trọng, dùng cho cơ hội quan trọng và hiếm.',
        example:{cn:'这是一次难得的机遇。', pinyin:'Zhè shì yí cì nándé de jīyù.', vi:'Đây là một cơ duyên hiếm có.'} }
    ],
    quickRule:'机会 đời thường; 机遇 trang trọng & hiếm.',
    quiz:{question:'这是一次难得的____。', options:['机会','机遇'], answer:'机遇', explanation:'Hiếm, trang trọng → 机遇.'} },

  { id:'cf_006', level:'HSK4', words:['方法','办法'],
    summary:'方法 = phương pháp hệ thống; 办法 = cách giải quyết tình huống cụ thể.',
    items:[
      { word:'方法', meaning:'phương pháp', usage:'Có tính hệ thống, lý luận.',
        example:{cn:'这个学习方法很有效。', pinyin:'Zhège xuéxí fāngfǎ hěn yǒuxiào.', vi:'Phương pháp học này rất hiệu quả.'} },
      { word:'办法', meaning:'cách giải quyết', usage:'Khẩu ngữ, tình huống cụ thể.',
        example:{cn:'我们一起想办法。', pinyin:'Wǒmen yìqǐ xiǎng bànfǎ.', vi:'Chúng ta cùng nghĩ cách.'} }
    ],
    quickRule:'方法 = lý luận; 办法 = thực tế.',
    quiz:{question:'我们想想____吧。', options:['方法','办法'], answer:'办法', explanation:'Tình huống cụ thể → 办法.'} },

  { id:'cf_007', level:'HSK4', words:['认为','以为'],
    summary:'认为 = cho rằng (tin là đúng); 以为 = tưởng (nhưng thực tế lại khác).',
    items:[
      { word:'认为', meaning:'cho rằng', usage:'Khẳng định ý kiến.',
        example:{cn:'我认为这个办法不错。', pinyin:'Wǒ rènwéi zhège bànfǎ búcuò.', vi:'Tôi cho rằng cách này không tệ.'} },
      { word:'以为', meaning:'cứ tưởng (sai)', usage:'Trước đây nghĩ nhầm.',
        example:{cn:'我以为你不会来。', pinyin:'Wǒ yǐwéi nǐ bú huì lái.', vi:'Tôi cứ tưởng bạn sẽ không đến.'} }
    ],
    quickRule:'认为 = tin chắc; 以为 = tưởng nhầm.',
    quiz:{question:'我____他会同意，没想到他不同意。', options:['认为','以为'], answer:'以为', explanation:'Tưởng nhầm → 以为.'} },

  { id:'cf_008', level:'HSK5', words:['提高','增加'],
    summary:'提高 = nâng cao mức độ/chất lượng; 增加 = tăng số lượng/khối lượng.',
    items:[
      { word:'提高', meaning:'nâng cao', usage:'Dùng cho trình độ, mức độ, chất lượng.',
        example:{cn:'我要提高中文水平。', pinyin:'Wǒ yào tígāo Zhōngwén shuǐpíng.', vi:'Tôi muốn nâng cao trình độ tiếng Trung.'} },
      { word:'增加', meaning:'tăng thêm', usage:'Dùng cho con số, khối lượng.',
        example:{cn:'公司增加了员工的工资。', pinyin:'Gōngsī zēngjiā le yuángōng de gōngzī.', vi:'Công ty tăng lương cho nhân viên.'} }
    ],
    quickRule:'提高 = chất; 增加 = lượng.',
    quiz:{question:'我们应该____学习方法。', options:['提高','增加'], answer:'提高', explanation:'Cải thiện phương pháp = nâng cao chất → 提高.'} },

  { id:'cf_009', level:'HSK4', words:['突然','忽然'],
    summary:'突然 vừa tính từ vừa phó từ; 忽然 chỉ là phó từ, văn vẻ hơn.',
    items:[
      { word:'突然', meaning:'đột nhiên (khẩu ngữ)', usage:'Có thể là tính từ: 这件事很突然.',
        example:{cn:'他突然站了起来。', pinyin:'Tā tūrán zhàn le qǐlái.', vi:'Anh ấy đột nhiên đứng dậy.'} },
      { word:'忽然', meaning:'đột nhiên (văn vẻ)', usage:'Chỉ làm phó từ.',
        example:{cn:'我忽然想起一件事。', pinyin:'Wǒ hūrán xiǎng qǐ yí jiàn shì.', vi:'Tôi đột nhiên nhớ ra một việc.'} }
    ],
    quickRule:'突然 = phó từ + tính từ; 忽然 = chỉ phó từ.',
    quiz:{question:'这件事真____。', options:['突然','忽然'], answer:'突然', explanation:'Làm tính từ → chỉ 突然 mới được.'} },

  { id:'cf_010', level:'HSK5', words:['仍然','依然'],
    summary:'Nghĩa giống nhau (vẫn còn). 仍然 trung tính; 依然 văn vẻ, gợi cảm xúc.',
    items:[
      { word:'仍然', meaning:'vẫn còn', usage:'Trung tính, viết và nói đều dùng.',
        example:{cn:'下雨了，他仍然来了。', pinyin:'Xià yǔ le, tā réngrán lái le.', vi:'Trời mưa, anh ấy vẫn đến.'} },
      { word:'依然', meaning:'vẫn như cũ', usage:'Văn vẻ, hay đi với cảm xúc/tình cảm.',
        example:{cn:'多年后我依然记得她。', pinyin:'Duō nián hòu wǒ yīrán jìdé tā.', vi:'Nhiều năm sau tôi vẫn nhớ cô ấy.'} }
    ],
    quickRule:'仍然 = trung tính; 依然 = cảm xúc/văn vẻ.',
    quiz:{question:'多年过去了，我____爱着她。', options:['仍然','依然'], answer:'依然', explanation:'Đi với cảm xúc lâu dài → 依然 tự nhiên hơn.'} },

  { id:'cf_011', level:'HSK5', words:['保证','保护'],
    summary:'保证 = cam đoan; 保护 = giữ an toàn.',
    items:[
      { word:'保证', meaning:'cam đoan', usage:'Khẳng định chắc chắn sẽ làm/đạt.',
        example:{cn:'我保证按时完成。', pinyin:'Wǒ bǎozhèng ànshí wánchéng.', vi:'Tôi đảm bảo hoàn thành đúng giờ.'} },
      { word:'保护', meaning:'bảo vệ', usage:'Giữ cho không bị tổn hại.',
        example:{cn:'我们要保护环境。', pinyin:'Wǒmen yào bǎohù huánjìng.', vi:'Chúng ta phải bảo vệ môi trường.'} }
    ],
    quickRule:'保证 = lời hứa; 保护 = hành động giữ an toàn.',
    quiz:{question:'我____这件事不会再发生。', options:['保证','保护'], answer:'保证', explanation:'Lời hứa/cam kết → 保证.'} },

  { id:'cf_012', level:'HSK5', words:['发生','发现'],
    summary:'发生 = (sự việc) xảy ra; 发现 = (người) phát hiện ra.',
    items:[
      { word:'发生', meaning:'xảy ra', usage:'Chủ ngữ là sự việc.',
        example:{cn:'昨天发生了一件大事。', pinyin:'Zuótiān fāshēng le yí jiàn dàshì.', vi:'Hôm qua đã xảy ra một việc lớn.'} },
      { word:'发现', meaning:'phát hiện', usage:'Chủ ngữ là người.',
        example:{cn:'我发现他的中文进步了。', pinyin:'Wǒ fāxiàn tā de Zhōngwén jìnbù le.', vi:'Tôi phát hiện tiếng Trung của anh ấy tiến bộ rồi.'} }
    ],
    quickRule:'发生 = sự việc xảy ra; 发现 = người phát hiện.',
    quiz:{question:'医生____了一个新的方法。', options:['发生','发现'], answer:'发现', explanation:'Người (bác sĩ) phát hiện → 发现.'} },

  { id:'cf_013', level:'HSK5', words:['证明','说明'],
    summary:'证明 = đưa bằng chứng để khẳng định; 说明 = giải thích, diễn giải.',
    items:[
      { word:'证明', meaning:'chứng minh', usage:'Có bằng chứng xác nhận.',
        example:{cn:'事实证明他是对的。', pinyin:'Shìshí zhèngmíng tā shì duì de.', vi:'Sự thật chứng minh anh ấy đúng.'} },
      { word:'说明', meaning:'giải thích, cho thấy', usage:'Trình bày để người khác hiểu, hoặc tài liệu hướng dẫn.',
        example:{cn:'请说明一下情况。', pinyin:'Qǐng shuōmíng yíxià qíngkuàng.', vi:'Xin giải thích tình hình một chút.'} }
    ],
    quickRule:'证明 = có bằng chứng; 说明 = diễn giải.',
    quiz:{question:'你能不能____一下原因？', options:['证明','说明'], answer:'说明', explanation:'Yêu cầu giải thích → 说明.'} },

  { id:'cf_014', level:'HSK5', words:['完成','结束'],
    summary:'完成 = hoàn thành (đạt mục tiêu); 结束 = kết thúc (dừng lại).',
    items:[
      { word:'完成', meaning:'hoàn thành', usage:'Có mục tiêu/nhiệm vụ cụ thể.',
        example:{cn:'我完成了作业。', pinyin:'Wǒ wánchéng le zuòyè.', vi:'Tôi đã hoàn thành bài tập.'} },
      { word:'结束', meaning:'kết thúc', usage:'Đến lúc dừng lại, không tiếp tục.',
        example:{cn:'会议结束了。', pinyin:'Huìyì jiéshù le.', vi:'Cuộc họp kết thúc rồi.'} }
    ],
    quickRule:'完成 = đạt mục tiêu; 结束 = dừng lại.',
    quiz:{question:'电影____了，我们回家吧。', options:['完成','结束'], answer:'结束', explanation:'Phim chiếu xong (dừng) → 结束.'} },

  { id:'cf_015', level:'HSK5', words:['继续','连续'],
    summary:'继续 = tiếp tục (có thể tạm dừng); 连续 = liên tục (không gián đoạn).',
    items:[
      { word:'继续', meaning:'tiếp tục', usage:'Dừng rồi làm tiếp.',
        example:{cn:'休息一下，再继续学习。', pinyin:'Xiūxí yíxià, zài jìxù xuéxí.', vi:'Nghỉ một chút rồi học tiếp.'} },
      { word:'连续', meaning:'liên tục', usage:'Không gián đoạn, một mạch.',
        example:{cn:'他连续工作十个小时。', pinyin:'Tā liánxù gōngzuò shí gè xiǎoshí.', vi:'Anh ấy làm việc liên tục mười tiếng.'} }
    ],
    quickRule:'继续 = nối tiếp (có thể dừng); 连续 = không gián đoạn.',
    quiz:{question:'他____三天没睡觉了。', options:['继续','连续'], answer:'连续', explanation:'Không gián đoạn → 连续.'} }
];

/* ---------- TOPICS: 11 chủ đề ---------- */
/* wordIds được fill tự động bằng helper sau khi load. */

const TOPICS = [
  { id:'t_work', name:'Công việc',
    description:'Từ vựng dùng khi đi làm, phỏng vấn, viết CV, áp lực và mục tiêu nghề nghiệp.' },
  { id:'t_family', name:'Gia đình',
    description:'Cha mẹ, người thân và các tình huống trong gia đình.' },
  { id:'t_health', name:'Sức khỏe',
    description:'Cơ thể khỏe mạnh, rèn luyện, lối sống lành mạnh.' },
  { id:'t_travel', name:'Du lịch',
    description:'Đi chơi, phong cảnh, đặt vé và trải nghiệm văn hóa.' },
  { id:'t_emotion', name:'Cảm xúc',
    description:'Hỉ nộ ái ố, cảm giác hồi hộp, thoải mái, thông cảm.' },
  { id:'t_study', name:'Học tập',
    description:'Học từ, phương pháp, nâng cao trình độ.' },
  { id:'t_exam', name:'Thi cử',
    description:'Ôn luyện, vượt qua kỳ thi HSK.' },
  { id:'t_shopping', name:'Mua sắm',
    description:'Đi mua đồ, giá cả, chất lượng và dịch vụ.' },
  { id:'t_society', name:'Xã hội',
    description:'Môi trường, văn hóa, kinh tế và các vấn đề xã hội.' },
  { id:'t_tech', name:'Công nghệ',
    description:'Mạng, phần mềm, thông tin và các thiết bị hiện đại.' },
  { id:'t_daily', name:'Giao tiếp hằng ngày',
    description:'Câu nói thường gặp khi giao tiếp tự nhiên hàng ngày.' }
];

/* ============================================================
   2. STATE + STORAGE
   ============================================================ */

const DEFAULT_STATE = () => ({
  progress: {},          // wordId -> progress object
  quizStats: { totalCorrect:0, totalWrong:0, byType:{} },
  streak: { lastStudyDate:null, days:0 },
  currentFlashcardId: null,
  currentQuizIndex: 0,
  currentQuizType: 'meaning_choice',
  filters: { search:'', level:'', topic:'', status:'', wordType:'' }
});

let state = DEFAULT_STATE();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state = { ...DEFAULT_STATE(), ...parsed,
      filters: { ...DEFAULT_STATE().filters, ...(parsed.filters || {}) } };
  } catch (e) {
    console.warn('Could not load state', e);
    state = DEFAULT_STATE();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state', e);
  }
}

function defaultProgressForWord(wordId) {
  return {
    wordId,
    status: 'new',
    correctCount: 0,
    wrongCount: 0,
    listenCount: 0,
    streakCorrect: 0,
    lastReviewedAt: null,
    lastListenedAt: null,
    nextReviewAt: null,
    isFavorite: false,
    isDifficult: false
  };
}

function getWordProgress(wordId) {
  return state.progress[wordId] || defaultProgressForWord(wordId);
}

function setWordProgress(wordId, patch) {
  const current = getWordProgress(wordId);
  state.progress[wordId] = { ...current, ...patch };
  saveState();
}

/* ============================================================
   3. HELPER — DỮ LIỆU
   ============================================================ */

function getVocabularyByLevel(level) {
  if (!level) return VOCABULARY.slice();
  return VOCABULARY.filter(w => w.level === level);
}

function getVocabularyByTopic(topic) {
  if (!topic) return VOCABULARY.slice();
  return VOCABULARY.filter(w => w.topic === topic);
}

function getVocabularyByStatus(status) {
  if (!status) return VOCABULARY.slice();
  return VOCABULARY.filter(w => getWordProgress(w.id).status === status);
}

function searchVocabulary(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return VOCABULARY.slice();
  return VOCABULARY.filter(w =>
    w.hanzi.includes(q) ||
    w.pinyin.toLowerCase().includes(q) ||
    w.pinyinPlain.toLowerCase().includes(q) ||
    w.vietnamese.toLowerCase().includes(q) ||
    (w.english || '').toLowerCase().includes(q) ||
    (w.topic || '').toLowerCase().includes(q) ||
    (w.level || '').toLowerCase().includes(q)
  );
}

function getQuizzesByType(type) {
  return QUIZZES.filter(q => q.type === type);
}

function getConfusingWordsByLevel(level) {
  if (!level) return CONFUSING_WORDS.slice();
  return CONFUSING_WORDS.filter(c => c.level === level);
}

function getGrammarByLevel(level) {
  if (!level) return GRAMMAR.slice();
  return GRAMMAR.filter(g => g.level === level);
}

function getWordById(id) {
  return VOCABULARY.find(w => w.id === id);
}

function getFilteredVocabulary() {
  const f = state.filters;
  let list = searchVocabulary(f.search);
  if (f.level)    list = list.filter(w => w.level === f.level);
  if (f.topic)    list = list.filter(w => w.topic === f.topic);
  if (f.wordType) list = list.filter(w => (w.wordType || '').includes(f.wordType));
  if (f.status)   list = list.filter(w => getWordProgress(w.id).status === f.status);
  return list;
}

/* Tự động fill wordIds cho mỗi topic dựa trên topic name. */
function buildTopicIndex() {
  TOPICS.forEach(t => {
    t.wordIds = VOCABULARY.filter(w => w.topic === t.name).map(w => w.id);
  });
}

/* ============================================================
   4. HELPER — TIẾN ĐỘ HỌC (Spaced Repetition đơn giản)
   ============================================================ */

const MS_MINUTE = 60 * 1000;
const MS_HOUR   = 60 * MS_MINUTE;
const MS_DAY    = 24 * MS_HOUR;

function getLearningProgress() {
  return state.progress;
}

function saveLearningProgress(progress) {
  state.progress = progress;
  saveState();
}

function markWordRemembered(wordId) {
  const p = getWordProgress(wordId);
  const streak = (p.streakCorrect || 0) + 1;
  let status = 'remembered';
  if (streak >= 5) status = 'mastered';
  setWordProgress(wordId, {
    status,
    streakCorrect: streak,
    lastReviewedAt: Date.now(),
    nextReviewAt: Date.now() + 3 * MS_DAY
  });
}

function markWordForgotten(wordId) {
  const p = getWordProgress(wordId);
  const wrongCount = (p.wrongCount || 0) + 1;
  setWordProgress(wordId, {
    status: wrongCount >= 3 ? 'difficult' : 'learning',
    streakCorrect: 0,
    wrongCount,
    isDifficult: wrongCount >= 3,
    lastReviewedAt: Date.now(),
    nextReviewAt: Date.now() + 10 * MS_MINUTE
  });
}

function markWordForReview(wordId) {
  setWordProgress(wordId, {
    status: 'review',
    lastReviewedAt: Date.now(),
    nextReviewAt: Date.now() + 1 * MS_DAY
  });
}

function updateWordStatus(wordId, status) {
  setWordProgress(wordId, { status });
}

function getDueReviewWords() {
  const now = Date.now();
  return VOCABULARY.filter(w => {
    const p = state.progress[w.id];
    if (!p || !p.nextReviewAt) return false;
    return p.nextReviewAt <= now && p.status !== 'mastered';
  });
}

function updateQuizResult(wordId, isCorrect) {
  if (!state.quizStats) state.quizStats = { totalCorrect:0, totalWrong:0, byType:{} };
  if (isCorrect) state.quizStats.totalCorrect++;
  else state.quizStats.totalWrong++;
  if (wordId) {
    const p = getWordProgress(wordId);
    if (isCorrect) {
      const streak = (p.streakCorrect || 0) + 1;
      let status = p.status;
      if (streak >= 3) status = 'remembered';
      if (streak >= 5) status = 'mastered';
      setWordProgress(wordId, {
        correctCount: (p.correctCount || 0) + 1,
        streakCorrect: streak, status
      });
    } else {
      const wrong = (p.wrongCount || 0) + 1;
      setWordProgress(wordId, {
        wrongCount: wrong,
        streakCorrect: 0,
        status: wrong >= 3 ? 'difficult' : (p.status === 'new' ? 'learning' : p.status),
        isDifficult: wrong >= 3
      });
    }
  }
  saveState();
}

function updateListenCount(wordId) {
  const p = getWordProgress(wordId);
  setWordProgress(wordId, {
    listenCount: (p.listenCount || 0) + 1,
    lastListenedAt: Date.now()
  });
}

function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const last = state.streak.lastStudyDate;
  if (!last) {
    state.streak = { lastStudyDate: today, days: 1 };
  } else if (last === today) {
    /* same day, no change */
  } else {
    const yesterday = new Date(Date.now() - MS_DAY).toISOString().slice(0, 10);
    state.streak.days = (last === yesterday) ? (state.streak.days + 1) : 1;
    state.streak.lastStudyDate = today;
  }
  saveState();
}

/* ============================================================
   5. HELPER — PHÁT ÂM TIẾNG TRUNG
   ============================================================ */

let _chineseVoice = null;
let _currentUtterance = null;
let _lastSpoken = null; // { text, rate }
let _currentSpeakingButton = null;

function _loadChineseVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  _chineseVoice =
    voices.find(v => v.lang === 'zh-CN') ||
    voices.find(v => v.lang === 'zh-TW') ||
    voices.find(v => v.lang && v.lang.toLowerCase().startsWith('zh')) ||
    null;
  return _chineseVoice;
}

function getChineseVoice() {
  if (_chineseVoice) return _chineseVoice;
  return _loadChineseVoice();
}

function speakChinese(text, options = {}) {
  if (!text) return;
  if (!('speechSynthesis' in window)) {
    showToast('Trình duyệt chưa hỗ trợ phát âm tự động', 'warn');
    return;
  }
  try { window.speechSynthesis.cancel(); } catch (e) {}
  const u = new SpeechSynthesisUtterance(text);
  const voice = getChineseVoice();
  if (voice) { u.voice = voice; u.lang = voice.lang; }
  else { u.lang = 'zh-CN'; }
  u.rate = options.rate != null ? options.rate : 0.85;
  u.pitch = options.pitch != null ? options.pitch : 1.0;
  if (options.button) {
    _currentSpeakingButton = options.button;
    _currentSpeakingButton.classList.add('is-playing');
  }
  u.onend = u.onerror = () => {
    if (_currentSpeakingButton) {
      _currentSpeakingButton.classList.remove('is-playing');
      _currentSpeakingButton = null;
    }
    if (options.onEnd) options.onEnd();
  };
  _currentUtterance = u;
  _lastSpoken = { text, rate: u.rate };
  window.speechSynthesis.speak(u);
}

function speakWord(word, button) {
  if (typeof word === 'string') {
    speakChinese(word, { button });
    return;
  }
  // word object
  if (word.audioUrl) { playAudioUrl(word.audioUrl); return; }
  speakChinese(word.audioText || word.hanzi, { button });
  if (word.id) updateListenCount(word.id);
}

function speakExample(exampleText, button) {
  speakChinese(exampleText, { rate: 0.8, button });
}

function speakSlowly(text, button) {
  speakChinese(text, { rate: 0.55, button });
}

function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if (_currentSpeakingButton) {
    _currentSpeakingButton.classList.remove('is-playing');
    _currentSpeakingButton = null;
  }
}

function replayLast(button) {
  if (!_lastSpoken) return;
  speakChinese(_lastSpoken.text, { rate: _lastSpoken.rate, button });
}

function playAudioUrl(url) {
  try {
    const audio = new Audio(url);
    audio.play();
  } catch (e) {
    showToast('Không phát được audio', 'warn');
  }
}

/* ============================================================
   6. RENDERERS
   ============================================================ */

function el(id) { return document.getElementById(id); }

function showToast(message, type = 'info') {
  const t = el('toast');
  if (!t) return;
  t.textContent = message;
  t.className = 'toast show toast-' + type;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => { t.className = 'toast'; }, 2500);
}

/* ---------- Dashboard ---------- */

function renderDashboard() {
  const root = el('dashboard-stats');
  if (!root) return;

  const total = VOCABULARY.length;
  let learned = 0, dueReview = 0, difficult = 0;
  let learnedHsk4 = 0, learnedHsk5 = 0;
  const totalHsk4 = VOCABULARY.filter(w => w.level === 'HSK4').length;
  const totalHsk5 = VOCABULARY.filter(w => w.level === 'HSK5').length;
  const topicLearning = {};

  VOCABULARY.forEach(w => {
    const p = state.progress[w.id];
    if (p) {
      if (['learning','review','remembered','mastered','difficult'].includes(p.status)) learned++;
      if (p.status === 'difficult') difficult++;
      if (p.status === 'learning') topicLearning[w.topic] = (topicLearning[w.topic] || 0) + 1;
      if (['remembered','mastered'].includes(p.status)) {
        if (w.level === 'HSK4') learnedHsk4++;
        else if (w.level === 'HSK5') learnedHsk5++;
      }
    }
  });
  dueReview = getDueReviewWords().length;

  const qs = state.quizStats || { totalCorrect:0, totalWrong:0 };
  const totalQuiz = qs.totalCorrect + qs.totalWrong;
  const accuracy = totalQuiz ? Math.round(qs.totalCorrect / totalQuiz * 100) : 0;

  const topTopic = Object.entries(topicLearning).sort((a,b) => b[1]-a[1])[0];
  const topTopicName = topTopic ? topTopic[0] : '—';

  const cards = [
    { icon:'📚', label:'Số từ đã học', value:learned, desc:`/ ${total} từ trong kho` },
    { icon:'🔁', label:'Số từ cần ôn', value:dueReview, desc:'sắp đến hạn ôn lại' },
    { icon:'⚠️', label:'Số từ hay sai', value:difficult, desc:'cần luyện thêm' },
    { icon:'🔥', label:'Chuỗi ngày liên tục', value:state.streak.days || 0, desc:'ngày học liên tiếp' },
    { icon:'🟢', label:'Tiến độ HSK4', value:`${learnedHsk4}/${totalHsk4}`, desc:'đã nhớ chắc', progress: totalHsk4 ? (learnedHsk4/totalHsk4*100) : 0 },
    { icon:'🔵', label:'Tiến độ HSK5', value:`${learnedHsk5}/${totalHsk5}`, desc:'đã nhớ chắc', progress: totalHsk5 ? (learnedHsk5/totalHsk5*100) : 0 },
    { icon:'🎯', label:'Tỷ lệ đúng quiz', value:`${accuracy}%`, desc:`${qs.totalCorrect}/${totalQuiz} câu`, progress:accuracy },
    { icon:'🏷️', label:'Chủ đề đang học', value:topTopicName, desc:'chủ đề bạn động chạm nhiều nhất' }
  ];

  root.innerHTML = cards.map(c => `
    <article class="stat-card">
      <div class="stat-icon">${c.icon}</div>
      <div class="stat-body">
        <div class="stat-value">${c.value}</div>
        <div class="stat-label">${c.label}</div>
        <div class="stat-desc">${c.desc}</div>
        ${c.progress != null ? `<div class="bar"><div class="bar-fill" style="width:${Math.min(100,Math.max(0,c.progress))}%"></div></div>` : ''}
      </div>
    </article>
  `).join('');
}

/* ---------- Vocabulary cards ---------- */

function renderVocabularyCards() {
  const root = el('vocab-grid');
  if (!root) return;
  const list = getFilteredVocabulary();
  el('vocab-count').textContent = `${list.length} từ`;

  if (!list.length) {
    root.innerHTML = '<div class="empty-state">Không tìm thấy từ phù hợp.</div>';
    return;
  }

  root.innerHTML = list.map(w => {
    const p = getWordProgress(w.id);
    return `
      <article class="vocab-card" data-word-id="${w.id}">
        <div class="vocab-top">
          <div class="hanzi hanzi-md">${w.hanzi}</div>
          <button class="icon-btn" data-action="speak" data-word-id="${w.id}" title="Nghe phát âm">🔊</button>
        </div>
        <div class="pinyin">${w.pinyin}</div>
        <div class="vi">${w.vietnamese}</div>
        <div class="vocab-meta">
          <span class="badge badge-level-${w.level.toLowerCase()}">${w.level}</span>
          <span class="badge badge-soft">${w.topic}</span>
          <span class="badge badge-outline">${w.wordType}</span>
          <span class="badge badge-status-${p.status}">${STATUS_LABEL[p.status]}</span>
        </div>
        <div class="vocab-actions">
          <button class="btn btn-primary btn-sm" data-action="learn" data-word-id="${w.id}">Học từ này</button>
          <button class="btn btn-outline btn-sm" data-action="add-review" data-word-id="${w.id}">+ Ôn tập</button>
        </div>
      </article>
    `;
  }).join('');
}

function populateFilterDropdowns() {
  const topicSel = el('filter-topic');
  if (topicSel && topicSel.options.length <= 1) {
    TOPIC_NAMES.forEach(t => {
      const o = document.createElement('option');
      o.value = t; o.textContent = t; topicSel.appendChild(o);
    });
  }
  const statusSel = el('filter-status');
  if (statusSel && statusSel.options.length <= 1) {
    Object.entries(STATUS_LABEL).forEach(([k, v]) => {
      const o = document.createElement('option');
      o.value = k; o.textContent = v; statusSel.appendChild(o);
    });
  }
  const typeSel = el('filter-type');
  if (typeSel && typeSel.options.length <= 1) {
    const types = [...new Set(VOCABULARY.map(w => w.wordType))];
    types.forEach(t => {
      const o = document.createElement('option');
      o.value = t; o.textContent = t; typeSel.appendChild(o);
    });
  }
}

/* ---------- Flashcard ---------- */

let _flashcardFlipped = false;

function renderFlashcard(word) {
  const root = el('flashcard-area');
  if (!root) return;
  if (!word) {
    word = VOCABULARY[0];
  }
  state.currentFlashcardId = word.id;
  saveState();
  _flashcardFlipped = false;

  const p = getWordProgress(word.id);
  const ex = (word.examples && word.examples[0]) || null;

  root.innerHTML = `
    <div class="flashcard ${_flashcardFlipped ? 'is-flipped' : ''}" id="flashcard">
      <div class="flashcard-front">
        <div class="hanzi hanzi-xl">${word.hanzi}</div>
        <div class="pinyin pinyin-lg">${word.pinyin}</div>
        <div class="flashcard-meta">
          <span class="badge badge-level-${word.level.toLowerCase()}">${word.level}</span>
          <span class="badge badge-soft">${word.topic}</span>
          <span class="badge badge-outline">${word.wordType}</span>
          <span class="badge badge-status-${p.status}">${STATUS_LABEL[p.status]}</span>
        </div>
        <p class="flashcard-hint">Bấm "Lật thẻ" để xem nghĩa và ví dụ</p>
      </div>
      <div class="flashcard-back">
        <div class="vi-big">${word.vietnamese}</div>
        <div class="muted">${word.english || ''}</div>
        <p class="explain">${word.simpleExplanation || ''}</p>
        ${ex ? `
          <div class="example">
            <div class="example-cn hanzi-sm">${ex.cn}</div>
            <div class="example-pinyin">${ex.pinyin}</div>
            <div class="example-vi">${ex.vi}</div>
          </div>` : ''}
        ${word.commonPhrases && word.commonPhrases.length ? `
          <div class="chip-row"><strong>Cụm thường dùng:</strong>
            ${word.commonPhrases.map(p => `<span class="chip">${p}</span>`).join('')}
          </div>` : ''}
        ${word.confusingWords && word.confusingWords.length ? `
          <div class="chip-row"><strong>Dễ nhầm với:</strong>
            ${word.confusingWords.map(p => `<span class="chip chip-warn">${p}</span>`).join('')}
          </div>` : ''}
      </div>
    </div>
    <div class="flashcard-controls">
      <button class="btn btn-primary" data-fc-action="flip">🔄 Lật thẻ</button>
      <button class="btn btn-outline" data-fc-action="speak-word">🔊 Nghe từ</button>
      <button class="btn btn-outline" data-fc-action="speak-example" ${ex ? '' : 'disabled'}>🗣️ Nghe ví dụ</button>
      <button class="btn btn-outline" data-fc-action="speak-slow">🐢 Nghe chậm</button>
      <button class="btn btn-outline" data-fc-action="replay">🔁 Nghe lại</button>
      <button class="btn btn-outline" data-fc-action="stop">⏹️ Dừng</button>
      <button class="btn btn-success" data-fc-action="remembered">✅ Nhớ rồi</button>
      <button class="btn btn-danger" data-fc-action="forgotten">❌ Chưa nhớ</button>
      <button class="btn btn-warning" data-fc-action="review-later">⏰ Cần ôn lại</button>
      <button class="btn btn-accent" data-fc-action="next">➡️ Câu tiếp theo</button>
    </div>
  `;
}

function flipFlashcard() {
  _flashcardFlipped = !_flashcardFlipped;
  const fc = el('flashcard');
  if (fc) fc.classList.toggle('is-flipped', _flashcardFlipped);
}

function nextFlashcard() {
  const list = getFilteredVocabulary();
  if (!list.length) { renderFlashcard(VOCABULARY[0]); return; }
  const i = list.findIndex(w => w.id === state.currentFlashcardId);
  const next = list[(i + 1) % list.length] || list[0];
  renderFlashcard(next);
}

/* ---------- Topics ---------- */

function renderTopics() {
  const root = el('topics-grid');
  if (!root) return;
  root.innerHTML = TOPICS.map(t => {
    const words = VOCABULARY.filter(w => w.topic === t.name);
    const learned = words.filter(w => {
      const s = (state.progress[w.id] || {}).status;
      return ['remembered','mastered','review','learning'].includes(s);
    }).length;
    const total = words.length;
    const pct = total ? Math.round(learned/total*100) : 0;
    return `
      <article class="topic-card">
        <h3 class="topic-name">${t.name}</h3>
        <p class="topic-desc">${t.description}</p>
        <div class="topic-stats">
          <span>📚 Đã học: <strong>${learned}</strong></span>
          <span>🆕 Chưa học: <strong>${total - learned}</strong></span>
        </div>
        <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
        <div class="topic-actions">
          <button class="btn btn-primary btn-sm" data-action="study-topic" data-topic="${t.name}">Học chủ đề</button>
          <button class="btn btn-outline btn-sm" data-action="quiz-topic" data-topic="${t.name}">Quiz chủ đề</button>
        </div>
      </article>
    `;
  }).join('');
}

/* ---------- Grammar ---------- */

function renderGrammarCards() {
  const root = el('grammar-grid');
  if (!root) return;
  root.innerHTML = GRAMMAR.map(g => {
    const ex = g.examples[0];
    const p = g.practice[0];
    return `
      <article class="grammar-card" data-grammar-id="${g.id}">
        <div class="grammar-head">
          <h3 class="grammar-title">${g.title}</h3>
          <span class="badge badge-level-${g.level.toLowerCase()}">${g.level}</span>
        </div>
        <p class="grammar-meaning"><strong>Nghĩa:</strong> ${g.meaning}</p>
        <code class="grammar-structure">${g.structure}</code>
        <p class="grammar-explain">${g.simpleExplanation}</p>
        <div class="example">
          <div class="example-cn hanzi-sm">${ex.cn}</div>
          <div class="example-pinyin">${ex.pinyin}</div>
          <div class="example-vi">${ex.vi}</div>
          <button class="btn btn-outline btn-sm" data-action="speak-text" data-text="${ex.cn}">🔊 Nghe ví dụ</button>
        </div>
        <details class="grammar-mistakes">
          <summary>Lỗi sai thường gặp</summary>
          <ul>${g.commonMistakes.map(m => `<li>${m}</li>`).join('')}</ul>
        </details>
        <div class="grammar-practice" data-grammar-practice="${g.id}">
          <strong>Bài tập nhanh:</strong>
          <p class="practice-q">${p.question}</p>
          <input type="text" class="practice-input" placeholder="Điền đáp án..."/>
          <button class="btn btn-primary btn-sm" data-action="check-grammar" data-grammar-id="${g.id}">Kiểm tra</button>
          <p class="practice-feedback"></p>
        </div>
      </article>
    `;
  }).join('');
}

/* ---------- Confusing words ---------- */

function renderConfusingWords() {
  const root = el('confusing-grid');
  if (!root) return;
  root.innerHTML = CONFUSING_WORDS.map(c => `
    <article class="confusing-card" data-cf-id="${c.id}">
      <div class="confusing-head">
        <h3>${c.words.join(' / ')}</h3>
        <span class="badge badge-level-${c.level.toLowerCase()}">${c.level}</span>
      </div>
      <p class="confusing-summary">${c.summary}</p>
      <div class="confusing-grid-items">
        ${c.items.map(it => `
          <div class="confusing-item">
            <div class="hanzi hanzi-sm">${it.word}</div>
            <div class="confusing-meaning"><strong>Nghĩa:</strong> ${it.meaning}</div>
            <div class="confusing-usage"><strong>Cách dùng:</strong> ${it.usage}</div>
            <div class="example">
              <div class="example-cn">${it.example.cn}</div>
              <div class="example-pinyin">${it.example.pinyin}</div>
              <div class="example-vi">${it.example.vi}</div>
              <button class="btn btn-outline btn-sm" data-action="speak-text" data-text="${it.example.cn}">🔊 Nghe</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="quick-rule">💡 ${c.quickRule}</div>
      <div class="mini-quiz" data-mini-quiz="${c.id}">
        <strong>Mini Quiz:</strong>
        <p>${c.quiz.question}</p>
        <div class="mini-quiz-options">
          ${c.quiz.options.map(o => `<button class="btn btn-outline btn-sm mini-opt" data-cf-id="${c.id}" data-opt="${o}">${o}</button>`).join('')}
        </div>
        <p class="mini-feedback"></p>
      </div>
    </article>
  `).join('');
}

/* ---------- Quiz ---------- */

function getCurrentQuizList() {
  return getQuizzesByType(state.currentQuizType);
}

function renderQuiz() {
  const root = el('quiz-area');
  if (!root) return;
  const list = getCurrentQuizList();
  if (!list.length) { root.innerHTML = '<div class="empty-state">Chưa có quiz dạng này.</div>'; return; }
  if (state.currentQuizIndex >= list.length) state.currentQuizIndex = 0;
  const q = list[state.currentQuizIndex];

  let body = '';
  if (q.type === 'meaning_choice' || q.type === 'fill_blank' || q.type === 'confusing_choice') {
    body = `
      <p class="quiz-question">${q.question}</p>
      <div class="quiz-options">
        ${q.options.map(o => `<button class="btn btn-outline quiz-opt" data-answer="${o}">${o}</button>`).join('')}
      </div>
    `;
  } else if (q.type === 'listening_choice') {
    body = `
      <p class="quiz-question">Nghe và chọn chữ Hán đúng:</p>
      <div class="quiz-listen-controls">
        <button class="btn btn-primary" data-action="quiz-play">🔊 Phát âm</button>
        <button class="btn btn-outline" data-action="quiz-replay">🔁 Nghe lại</button>
        <button class="btn btn-outline" data-action="quiz-slow">🐢 Nghe chậm</button>
      </div>
      <div class="quiz-options quiz-options-hanzi">
        ${q.options.map(o => `<button class="btn btn-outline quiz-opt hanzi-sm" data-answer="${o}">${o}</button>`).join('')}
      </div>
    `;
  } else if (q.type === 'sentence_order') {
    const tokens = [...q.tokens].sort(() => Math.random() - 0.5);
    body = `
      <p class="quiz-question">Sắp xếp các từ thành câu hoàn chỉnh:</p>
      <div class="sentence-builder" id="sentence-builder"></div>
      <div class="sentence-tokens" id="sentence-tokens">
        ${tokens.map(t => `<button class="btn btn-outline token-btn" data-token="${t}">${t}</button>`).join('')}
      </div>
      <div class="quiz-listen-controls">
        <button class="btn btn-primary" data-action="check-order">Kiểm tra</button>
        <button class="btn btn-outline" data-action="reset-order">Làm lại</button>
      </div>
    `;
  }

  const qs = state.quizStats;
  const total = qs.totalCorrect + qs.totalWrong;
  const acc = total ? Math.round(qs.totalCorrect / total * 100) : 0;

  root.innerHTML = `
    <div class="quiz-card" data-quiz-id="${q.id}">
      <div class="quiz-head">
        <span class="badge badge-soft">${state.currentQuizIndex + 1} / ${list.length}</span>
        <span class="badge badge-level-${q.level.toLowerCase()}">${q.level}</span>
        <span class="quiz-score">Đúng: ${qs.totalCorrect} · Sai: ${qs.totalWrong} · ${acc}%</span>
      </div>
      ${body}
      <div class="quiz-feedback" id="quiz-feedback"></div>
      <div class="quiz-nav">
        <button class="btn btn-accent" data-action="next-quiz">Câu tiếp theo ➡️</button>
      </div>
    </div>
  `;
}

function checkAnswer(selected) {
  const list = getCurrentQuizList();
  const q = list[state.currentQuizIndex];
  if (!q || !q.options) return;
  const isCorrect = selected === q.answer;
  const fb = el('quiz-feedback');
  fb.className = 'quiz-feedback ' + (isCorrect ? 'is-correct' : 'is-wrong');
  fb.innerHTML = `
    <div><strong>${isCorrect ? '✅ Chính xác!' : '❌ Sai rồi'}</strong> Đáp án: <strong>${q.answer}</strong></div>
    ${q.translation ? `<div class="muted">${q.translation}</div>` : ''}
    <div>${q.explanation || ''}</div>
  `;
  document.querySelectorAll('.quiz-opt').forEach(b => {
    b.disabled = true;
    if (b.dataset.answer === q.answer) b.classList.add('opt-correct');
    if (b.dataset.answer === selected && !isCorrect) b.classList.add('opt-wrong');
  });
  updateQuizResult(q.targetWordId || null, isCorrect);
  renderDashboard();
}

function nextQuiz() {
  const list = getCurrentQuizList();
  state.currentQuizIndex = (state.currentQuizIndex + 1) % list.length;
  saveState();
  renderQuiz();
}

function resetQuiz() {
  state.currentQuizIndex = 0;
  saveState();
  renderQuiz();
}

let _sentenceBuilder = [];
function pushToken(token, btn) {
  _sentenceBuilder.push(token);
  btn.disabled = true;
  renderSentenceBuilder();
}
function renderSentenceBuilder() {
  const sb = el('sentence-builder');
  if (!sb) return;
  sb.innerHTML = _sentenceBuilder.map((t, i) =>
    `<span class="token-pill" data-idx="${i}">${t}</span>`
  ).join('');
}
function checkSentenceOrder() {
  const list = getCurrentQuizList();
  const q = list[state.currentQuizIndex];
  const fb = el('quiz-feedback');
  const built = _sentenceBuilder.join('');
  const correct = q.answer.join('');
  const isCorrect = built === correct;
  fb.className = 'quiz-feedback ' + (isCorrect ? 'is-correct' : 'is-wrong');
  fb.innerHTML = `
    <div><strong>${isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng — thử lại'}</strong></div>
    ${isCorrect ? `
      <div class="hanzi hanzi-sm">${q.finalSentence}</div>
      <div class="muted">${q.translation}</div>
      <div>${q.explanation}</div>
    ` : `<div>Đáp án đúng: <strong>${q.finalSentence}</strong></div>`}
  `;
  updateQuizResult(null, isCorrect);
  renderDashboard();
}
function resetSentenceOrder() {
  _sentenceBuilder = [];
  document.querySelectorAll('.token-btn').forEach(b => { b.disabled = false; });
  renderSentenceBuilder();
  const fb = el('quiz-feedback'); if (fb) { fb.className = 'quiz-feedback'; fb.innerHTML = ''; }
}

/* ---------- Review section ---------- */

function renderReviewSection() {
  const root = el('review-area');
  if (!root) return;
  const due = getDueReviewWords();
  const wrong = VOCABULARY.filter(w => (state.progress[w.id] || {}).wrongCount > 0);
  const remembered = VOCABULARY.filter(w => ['remembered','mastered'].includes((state.progress[w.id] || {}).status));
  const newWords = VOCABULARY.filter(w => !state.progress[w.id] || state.progress[w.id].status === 'new');
  const difficult = VOCABULARY.filter(w => (state.progress[w.id] || {}).status === 'difficult');

  const groups = [
    { icon:'🔁', name:'Từ cần ôn hôm nay', list:due },
    { icon:'⚠️', name:'Từ sai nhiều lần', list:difficult },
    { icon:'✅', name:'Từ đã nhớ', list:remembered },
    { icon:'🆕', name:'Từ mới chưa học', list:newWords },
    { icon:'😵', name:'Từ hay sai (đã từng sai)', list:wrong }
  ];

  root.innerHTML = groups.map(g => `
    <article class="review-card">
      <div class="review-head">
        <h3>${g.icon} ${g.name}</h3>
        <span class="badge badge-soft">${g.list.length}</span>
      </div>
      ${g.list.length ? `
        <details>
          <summary>Xem danh sách (${g.list.length})</summary>
          <ul class="review-list">
            ${g.list.slice(0, 30).map(w => `
              <li>
                <span class="hanzi-sm">${w.hanzi}</span>
                <span class="pinyin">${w.pinyin}</span>
                <span class="vi">${w.vietnamese}</span>
                <button class="icon-btn" data-action="speak" data-word-id="${w.id}">🔊</button>
                <button class="btn btn-outline btn-xs" data-action="learn" data-word-id="${w.id}">Học</button>
              </li>`).join('')}
          </ul>
        </details>
      ` : '<p class="muted">Chưa có từ nào.</p>'}
    </article>
  `).join('');
}

/* ============================================================
   7. EVENT HANDLERS
   ============================================================ */

function attachGlobalListeners() {
  // ---- Navigation ----
  const hamburger = el('hamburger');
  const nav = el('main-nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      hamburger.classList.toggle('is-active');
    });
  }
  document.querySelectorAll('[data-scroll-to]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.dataset.scrollTo;
      const target = el(id);
      if (target) target.scrollIntoView({ behavior:'smooth', block:'start' });
      if (nav) nav.classList.remove('is-open');
      if (hamburger) hamburger.classList.remove('is-active');
      // also handle filter shortcut, e.g. data-scroll-to=vocabulary data-filter-level=HSK4
      if (a.dataset.filterLevel) {
        state.filters.level = a.dataset.filterLevel;
        const sel = el('filter-level'); if (sel) sel.value = a.dataset.filterLevel;
        renderVocabularyCards();
      }
    });
  });

  // ---- Scrollspy ----
  if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('#main-nav a[data-scroll-to]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach(l => l.classList.toggle('is-current', l.dataset.scrollTo === id));
        }
      });
    }, { rootMargin:'-40% 0px -55% 0px' });
    sections.forEach(s => observer.observe(s));
  }

  // ---- Filter ----
  const searchInput = el('filter-search');
  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        state.filters.search = searchInput.value;
        renderVocabularyCards();
      }, 200);
    });
  }
  ['filter-level','filter-topic','filter-status','filter-type'].forEach(id => {
    const e = el(id);
    if (!e) return;
    e.addEventListener('change', () => {
      const key = id.replace('filter-','');
      const mapping = { level:'level', topic:'topic', status:'status', type:'wordType' };
      state.filters[mapping[key]] = e.value;
      saveState();
      renderVocabularyCards();
    });
  });
  const resetBtn = el('filter-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.filters = DEFAULT_STATE().filters;
      ['filter-search','filter-level','filter-topic','filter-status','filter-type'].forEach(id => {
        const e = el(id); if (e) e.value = '';
      });
      saveState();
      renderVocabularyCards();
    });
  }

  // ---- Delegated clicks on main ----
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const action = t.dataset.action;

    if (action === 'speak') {
      const wid = t.dataset.wordId;
      const w = getWordById(wid);
      if (w) speakWord(w, t);
      return;
    }
    if (action === 'speak-text') {
      speakChinese(t.dataset.text, { button: t });
      return;
    }
    if (action === 'learn') {
      const w = getWordById(t.dataset.wordId);
      if (w) {
        if (getWordProgress(w.id).status === 'new') updateWordStatus(w.id, 'learning');
        renderFlashcard(w);
        el('flashcard').scrollIntoView({ behavior:'smooth', block:'start' });
        renderDashboard();
        renderVocabularyCards();
      }
      return;
    }
    if (action === 'add-review') {
      const w = getWordById(t.dataset.wordId);
      if (w) { markWordForReview(w.id); showToast('Đã thêm vào danh sách ôn tập', 'success'); renderDashboard(); renderVocabularyCards(); renderReviewSection(); }
      return;
    }
    if (action === 'study-topic') {
      const topic = t.dataset.topic;
      state.filters = { ...DEFAULT_STATE().filters, topic };
      const sel = el('filter-topic'); if (sel) sel.value = topic;
      renderVocabularyCards();
      el('vocabulary').scrollIntoView({ behavior:'smooth' });
      return;
    }
    if (action === 'quiz-topic') {
      state.currentQuizType = 'meaning_choice';
      state.currentQuizIndex = 0;
      saveState();
      renderQuiz();
      el('quiz').scrollIntoView({ behavior:'smooth' });
      return;
    }
    if (action === 'quick-review') {
      const due = getDueReviewWords();
      if (due.length) renderFlashcard(due[0]);
      else renderFlashcard(VOCABULARY[0]);
      el('flashcard').scrollIntoView({ behavior:'smooth' });
      return;
    }
    if (action === 'check-grammar') {
      const card = t.closest('.grammar-card');
      const input = card.querySelector('.practice-input');
      const fb = card.querySelector('.practice-feedback');
      const g = GRAMMAR.find(x => x.id === t.dataset.grammarId);
      if (!g) return;
      const user = input.value.trim();
      const ok = g.practice[0].answer.split('/').map(s => s.trim()).some(a => user.includes(a)) || user === g.practice[0].answer;
      fb.textContent = ok ? '✅ Chính xác! ' + g.practice[0].explanation : `❌ Đáp án: ${g.practice[0].answer}. ${g.practice[0].explanation}`;
      fb.className = 'practice-feedback ' + (ok ? 'is-correct' : 'is-wrong');
      return;
    }
    if (action === 'check-sentence') {
      const ta = el('sentence-input');
      const target = el('sentence-target').dataset.word;
      const out = el('sentence-feedback');
      const s = ta.value.trim();
      const msgs = [];
      if (!s.includes(target)) msgs.push('Bạn chưa dùng từ ' + target + ' trong câu.');
      else msgs.push('Câu của bạn đã sử dụng đúng từ cần luyện.');
      if (s.length < 6) msgs.push('Hãy thử viết câu dài hơn một chút.');
      if (!/[。.!?！？]/.test(s)) msgs.push('Đừng quên thêm dấu câu ở cuối.');
      out.innerHTML = msgs.map(m => `<div>• ${m}</div>`).join('');
      // TODO: Tích hợp AI sửa câu tại đây
      return;
    }
    if (action === 'new-sentence-target') {
      const list = getFilteredVocabulary();
      const r = list[Math.floor(Math.random() * list.length)] || VOCABULARY[0];
      const tgt = el('sentence-target');
      tgt.dataset.word = r.hanzi;
      tgt.innerHTML = `Hãy viết một câu dùng từ <strong class="hanzi-sm">${r.hanzi}</strong> (${r.pinyin} — ${r.vietnamese})`;
      el('sentence-input').value = '';
      el('sentence-feedback').innerHTML = '';
      return;
    }
    if (action === 'quiz-play') {
      const list = getCurrentQuizList();
      const q = list[state.currentQuizIndex];
      speakChinese(q.audioText, { button: t });
      return;
    }
    if (action === 'quiz-replay') {
      const list = getCurrentQuizList();
      const q = list[state.currentQuizIndex];
      speakChinese(q.audioText, { button: t });
      return;
    }
    if (action === 'quiz-slow') {
      const list = getCurrentQuizList();
      const q = list[state.currentQuizIndex];
      speakSlowly(q.audioText, t);
      return;
    }
    if (action === 'next-quiz') { nextQuiz(); return; }
    if (action === 'reset-quiz') { resetQuiz(); return; }
    if (action === 'check-order') { checkSentenceOrder(); return; }
    if (action === 'reset-order') { resetSentenceOrder(); return; }
  });

  // ---- Click on quiz options (delegated) ----
  document.addEventListener('click', e => {
    const opt = e.target.closest('.quiz-opt');
    if (opt) { checkAnswer(opt.dataset.answer); return; }
    const tok = e.target.closest('.token-btn');
    if (tok) { pushToken(tok.dataset.token, tok); return; }
    const mini = e.target.closest('.mini-opt');
    if (mini) { handleMiniQuiz(mini); return; }
  });

  // ---- Quiz tabs ----
  document.querySelectorAll('[data-quiz-tab]').forEach(b => {
    b.addEventListener('click', () => {
      state.currentQuizType = b.dataset.quizTab;
      state.currentQuizIndex = 0;
      saveState();
      document.querySelectorAll('[data-quiz-tab]').forEach(x => x.classList.toggle('is-active', x === b));
      renderQuiz();
    });
  });

  // ---- Flashcard control buttons (delegated) ----
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-fc-action]');
    if (!t) return;
    const w = getWordById(state.currentFlashcardId) || VOCABULARY[0];
    const action = t.dataset.fcAction;
    if (action === 'flip') flipFlashcard();
    if (action === 'speak-word') { speakWord(w, t); }
    if (action === 'speak-example') { const ex = w.examples && w.examples[0]; if (ex) speakExample(ex.cn, t); }
    if (action === 'speak-slow') speakSlowly(w.hanzi, t);
    if (action === 'replay') replayLast(t);
    if (action === 'stop') stopSpeaking();
    if (action === 'remembered') { markWordRemembered(w.id); showToast('Đã đánh dấu "Nhớ rồi" — sẽ ôn lại sau 3 ngày', 'success'); renderDashboard(); renderVocabularyCards(); renderReviewSection(); nextFlashcard(); }
    if (action === 'forgotten') { markWordForgotten(w.id); showToast('Đã đánh dấu "Chưa nhớ" — sẽ ôn lại trong 10 phút', 'warn'); renderDashboard(); renderVocabularyCards(); renderReviewSection(); nextFlashcard(); }
    if (action === 'review-later') { markWordForReview(w.id); showToast('Sẽ ôn lại vào ngày mai', 'info'); renderDashboard(); renderReviewSection(); }
    if (action === 'next') nextFlashcard();
  });
}

function handleMiniQuiz(btn) {
  const cfId = btn.dataset.cfId;
  const opt = btn.dataset.opt;
  const cf = CONFUSING_WORDS.find(x => x.id === cfId);
  if (!cf) return;
  const isCorrect = opt === cf.quiz.answer;
  const card = btn.closest('.mini-quiz');
  const fb = card.querySelector('.mini-feedback');
  fb.className = 'mini-feedback ' + (isCorrect ? 'is-correct' : 'is-wrong');
  fb.textContent = (isCorrect ? '✅ Chính xác! ' : '❌ Sai rồi. Đáp án: ' + cf.quiz.answer + '. ') + cf.quiz.explanation;
  card.querySelectorAll('.mini-opt').forEach(b => { b.disabled = true; if (b.dataset.opt === cf.quiz.answer) b.classList.add('opt-correct'); });
  updateQuizResult(null, isCorrect);
  renderDashboard();
}

/* ============================================================
   8. INIT
   ============================================================ */

function init() {
  loadState();
  updateStreak();
  buildTopicIndex();

  // Populate filter dropdowns
  populateFilterDropdowns();
  // Restore filter values
  ['search','level','topic','status','wordType'].forEach(k => {
    const map = { search:'filter-search', level:'filter-level', topic:'filter-topic', status:'filter-status', wordType:'filter-type' };
    const e = el(map[k]); if (e && state.filters[k]) e.value = state.filters[k];
  });

  renderDashboard();
  renderVocabularyCards();
  const startWord = getWordById(state.currentFlashcardId) || VOCABULARY[0];
  renderFlashcard(startWord);
  renderTopics();
  renderGrammarCards();
  renderConfusingWords();
  renderReviewSection();
  renderQuiz();

  // Set up sentence target
  const sTgt = el('sentence-target');
  if (sTgt) {
    const w = VOCABULARY[0];
    sTgt.dataset.word = w.hanzi;
    sTgt.innerHTML = `Hãy viết một câu dùng từ <strong class="hanzi-sm">${w.hanzi}</strong> (${w.pinyin} — ${w.vietnamese})`;
  }

  attachGlobalListeners();

  // Speech voices may load async
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = _loadChineseVoice;
    _loadChineseVoice();
  }

  // Welcome toast
  if (state.streak.days > 1) showToast(`Chào mừng quay lại — bạn đã học ${state.streak.days} ngày liên tiếp! 🔥`, 'success');

  // Debug validation
  if (location.search.includes('debug=1')) runDebugChecks();
}

function runDebugChecks() {
  const ids = new Set();
  VOCABULARY.forEach(w => { console.assert(!ids.has(w.id), 'Dup vocab id', w.id); ids.add(w.id); });
  const qids = new Set();
  QUIZZES.forEach(q => { console.assert(!qids.has(q.id), 'Dup quiz id', q.id); qids.add(q.id); });
  QUIZZES.forEach(q => { if (q.targetWordId) console.assert(getWordById(q.targetWordId), 'Quiz target missing', q.targetWordId); });
  console.log('✅ Debug checks done. Vocab:', VOCABULARY.length, 'Quiz:', QUIZZES.length);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
