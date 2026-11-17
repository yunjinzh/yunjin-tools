"""Super Minds 5 course: source-grounded bilingual teaching retellings.
Source: uploaded Student's Book; printed pages equal PDF page numbers.
"""
from book_helpers import vocab, q, passage, grammar, phonics

BOOK = dict(number=5,title='Super Minds 5',edition='Cambridge University Press · 用户提供的学生用书',teacherAvailable=False,pageMin=2,pageMax=127,pageBase='books/5/pages',grammarAppendix=True,
 sourceNote='依据本次上传的 Super Minds 5 学生用书编写。书面页码与 PDF 页码一致。故事与阅读均为标明来源的教学改写；新增练习不是原书听力答案。未提供第五册教师用书。',
 bookSummary='和 Alex、Phoebe、Patrick 穿越时空，从庞贝、雨林和摇滚舞台走到未来与神秘海上。读懂事件的原因和结果，再用连词讲清完整故事。',
 storyGuide='The Time Travellers：一次科学课事故打开黄色时空之门。每次冒险都寻找下一道门；结尾回到学校，却留下时间上的疑问。历史人物与地点被放进虚构故事，不能把情节当作历史事实。',units=[])

def add(i,title,zh,start,end,icon,goal,words,g1,g2,songtitle,songpage,songtasks,ph):
 u=dict(id=i,title=title,zh=zh,start=start,end=end,icon=icon,goal=goal,teacher='未提供教师用书；依据学生用书编写',grammarPage=118+i,
 vocab=vocab(words),grammar=[g1,g2],song=dict(title=songtitle,page=songpage,task=songtasks),phonics=ph)
 BOOK['units'].append(u)
 return u

def G(title,rule,examples,a,b):return grammar(title,rule,examples,[q(*a,kind='grammar'),q(*b,kind='grammar')])
def PH(title,note,pairs,page,prompt,opts,ans,why):return phonics(title,note,pairs,page,[q(prompt,opts,ans,why,'phonics')])
def P(title,pages,summary,text,a,b,kind='依据课文的教学改写'):return passage(title,pages,summary,text,[q(*a),q(*b)],kind)
def C(u,title,pages,tasks,frame,model,success,teacher):
 u['create']=dict(title=title,pages=pages,tasks=tasks,frame=frame,model=model,success=success,teacher=teacher)

u=add(0,'The Science lesson','科学课上的时空之门',4,9,'🧪','读懂实验事故的经过；用过去时讲昨天发生的事。', '''
shelf|架子|The books are on the shelf.
goggles|护目镜|The pupils wear goggles in the lab.
instructions|说明；指令|Read the instructions before you start.
apron|围裙|The teacher is wearing an apron.
explosion|爆炸|There is an explosion in the story.
bubbles|气泡|We can see bubbles in the water.
test tube|试管|The test tube is on the table.
liquid|液体|Water is a liquid.
gloves|手套|The scientist puts on her gloves.
powder|粉末|The powder in the picture is blue.
''',G('一般过去时：肯定与否定','过去发生的动作使用过去式；否定用 did not / didn’t + 动词原形。','I watched a film yesterday.|昨天我看了一部电影。\nShe didn’t sing a song.|她没有唱歌。',('Yesterday, Alex ___ a film.','watch|watched|watching',1,'Yesterday 表示过去，watch 的过去式是 watched。'),('Phoebe didn’t ___ Music yesterday.','have|had|having',0,'didn’t 后面接动词原形 have。')),G('过去时提问','询问过去发生的事用 What did + 主语 + 动词原形；Did 引导的问题可用 Yes/No 回答。','What did you do at school?|你在学校做了什么？\nDid you have a good day?|你这一天过得好吗？',('___ did you do yesterday?','Who|What|Where',1,'这里询问做了什么事情，用 What。'),('Did you ___ a good day?','had|having|have',2,'Did 已表示过去，后面的 have 用原形。')),'歌曲：The Time Travellers',6,['看 p6，找出三个主角的名字。','用电脑语音读本课故事句；歌曲旋律需另配原书音频。','说一说：过去和未来用英语怎么说？'],PH('押韵：听词尾','对应 p6 Rhyming words；以下词对为新编辨音，不是原书音轨。','day|say\nlight|night\nfriend|end',6,'哪个词和 light 押韵？','late|night|little',1,'light /laɪt/ 与 night /naɪt/ 的结尾声音相同。'))

u=add(1,'Disaster!','灾难来临',10,21,'🌋','识别过去进行时；说清庞贝故事中的危险、提醒与逃离。','''
smoke|烟|Dark smoke rises into the sky.
volcano|火山|The volcano is far from the town.
temple|神庙|There is an old temple in the city.
columns|柱子|The building has tall columns.
fountain|喷泉|Water falls into the fountain.
theatre|剧院|The theatre is next to the square.
horse and cart|马车|A horse and cart moves down the road.
servant|仆人|A servant carries food in the story.
statue|雕像|We saw a stone statue.
''',G('过去进行时与 when','was/were + 动词-ing 表示过去某时正在做；when 可引出突然发生的事情。','I was reading when the phone rang.|电话响时我正在读书。\nThey were playing when it started to rain.|开始下雨时他们正在玩。',('When the ground shook, I ___ a book.','was reading|readed|am reading',0,'过去某时正在读书，用 was reading。'),('The boys ___ football when it happened.','was playing|were playing|plays',1,'复数主语 boys 配 were playing。')),G('while：两个同时进行的动作','while 引导过去正在发生的背景动作；两个动作都在进行时可各用过去进行时。','While Mum was reading, I was drawing.|妈妈在读书时，我在画画。\nThe dog was sleeping while we were talking.|我们在说话时狗在睡觉。',('While Dad was cooking, we ___ the table.','are setting|were setting|sets',1,'两个动作发生在过去并且同时进行，用 were setting。'),('Which word means “当……的时候” here?','because|tomorrow|while',2,'while 可连接同时发生的动作。')),'歌曲：Danger!',12,['在 p12 找出表示危险的词。','用 was/were + -ing 说一个故事背景。','读懂意思后再配合原书音频唱；电脑语音只负责读句子。'],PH('词尾不发音的 e','对应 p12 final e。以下是同规律的新编词对，比较加 e 前后元音。','cap|cape\ncut|cute\nhop|hope',12,'哪个词通常有不发音的词尾 e，并把 a 读成长音？','cap|cat|cape',2,'cape 中结尾 e 不单独发音，a 读 /eɪ/。'))

u=add(2,'In the rainforest','走进雨林',22,33,'🌿','理解 have to 的规则；沿时间线复述雨林冒险，并解释为什么要保护雨林。','''
creeper|攀缘植物；藤蔓|The creeper grows up a tree.
beak|鸟喙|The bird has a long beak.
toucan|巨嘴鸟|A toucan sits on the branch.
sloth|树懒|The sloth moves slowly.
branch|树枝|The branch is high above us.
anaconda|水蚺|The anaconda is a large snake.
pool|水潭|There is a small pool by the trees.
jaguar|美洲豹|A jaguar has a spotted coat.
anteater|食蚁兽|The anteater has a long nose.
''',G('较大的数字','hundred 是百，thousand 是千，million 是百万；具体数字后 hundred/thousand/million 不加 s。','Two hundred birds live here.|这里生活着两百只鸟。\nThe number is one million.|这个数字是一百万。',('200,000 读作什么？','two hundred|two thousand|two hundred thousand',2,'200,000 是二十万，即 two hundred thousand。'),('5,000,000 读作什么？','five million|five millions|five thousand',0,'具体数字后用单数 million。')),G('have to / don’t have to','have to 表示必须；don’t have to 表示不必，不是禁止。过去必须做可用 had to。','You have to follow the guide.|你必须跟着向导。\nYou don’t have to bring food.|你不必带食物。',('You don’t have to bring food. 这句话是什么意思？','禁止带食物。|不必带食物。|必须带食物。',1,'don’t have to 表示没有这个必要。'),('___ I have to wear boots?','Am|Did|Do',2,'询问现在是否有义务，用 Do I have to ...?')),'功能对话：Asking for instructions',24,['扮演游戏玩家，问 What do you have to do?','为一个纸上寻宝游戏说两条规则。','追问 Is there anything else?，让搭档补充一条。'],PH('读清数字词尾','本单元 p24 是功能对话，没有独立歌曲拼读栏。这里结合 p23 数字，提供新编口语辨音。','fourteen|forty\nsixteen|sixty\nnineteen|ninety',23,'sixteen 表示哪个数字？','60|6|16',2,'sixteen 是 16；sixty 是 60，读音和词尾都不同。'))

u=add(3,"The rock 'n' roll show",'摇滚演出',34,45,'🎸','用 going to 讲计划，读懂钟点；理解坚持练习的故事。','''
spotlight|聚光灯|The spotlight shines on the singer.
bodyguards|保镖|The bodyguards stand by the door.
fans|歌迷；爱好者|The fans clap after the song.
electric guitar|电吉他|She plays an electric guitar.
bass guitar|低音吉他；贝斯|The bass guitar has a deep sound.
backing singers|伴唱歌手|The backing singers stand behind the star.
dancer|舞者|The dancer moves to the music.
drum kit|架子鼓|The drummer sits at the drum kit.
stage|舞台|The band walks onto the stage.
''',G('be going to：计划','am/is/are going to + 动词原形表示已经打算做的事；提问把 be 放在主语前。','I’m going to practise tonight.|今晚我打算练习。\nAre you going to sing?|你打算唱歌吗？',('She ___ going to play the guitar.','am|is|are',1,'She 配 is。'),('Are you going to ___ a new song?','write|wrote|writing',0,'going to 后面接动词原形 write。')),G('读钟点：past 与 to','past 表示几点过几分；to 表示离下一个整点还差几分。quarter 是一刻钟，half 是半小时。','It’s twenty past five.|现在是五点二十分。\nIt’s a quarter to six.|现在是差一刻六点，也就是五点四十五分。',('twenty to six 是几点？','6:20|5:20|5:40',2,'距六点还差二十分钟，所以是 5:40。'),('5:15 应该怎么说？','a quarter past five|a quarter to five|half past five',0,'过五点十五分钟，用 a quarter past five。')),'歌曲：Come rock with me',36,['找出歌词里的 going to。','用两句英语介绍自己的练习计划。','跟读新编例句；唱歌请配原书音频。'],PH('rock 与 roll 的元音','对应 p36 rock or roll，比较英式常见读音 /ɒ/ 与 /əʊ/。电脑语音口音可能不同。','rock|roll\nTom|home\nsock|go',36,'哪个词和 roll 的元音相同？','sock|home|rock',1,'roll 与 home 通常都有 /əʊ/（美式常为 /oʊ/）。'))

u=add(4,'Space restaurant','太空餐厅',46,57,'🍽️','读日期、解释 if 规律；按上菜顺序复述生日餐。','''
waiter|服务员|The waiter brings the menu.
biscuits|饼干|There are two biscuits on the plate.
salt|盐|The salt is next to the pepper.
pepper|胡椒|Please pass the pepper.
napkin|餐巾|My napkin is on my knees.
chopsticks|筷子|I can use chopsticks.
fork|餐叉|There is a fork beside my plate.
spoon|勺子|I eat soup with a spoon.
knife|餐刀|The knife is next to the fork.
''',G('序数词与日期','日期用序数词，如 first、second、third、twenty-first。可以读 the third of April。','My birthday is on the third of April.|我的生日是四月三日。\nThe party is on the twenty-first of May.|聚会在五月二十一日。',('2nd 应该读作什么？','two|twice|second',2,'2nd 是序数词 second，表示第二。'),('the eighth of April 是哪一天？','4月8日|8月4日|4月18日',0,'月份 April 是四月，eighth 是第八。')),G('if：说明一般规律','if 从句和主句都可用一般现在时，表示通常成立的条件与结果；故事里的食物药丸是想象设定。','If you add honey, the drink becomes sweet.|如果加入蜂蜜，饮料就变甜。\nIf ice gets warm enough, it melts.|冰足够暖时会融化。',('If you add honey, the tea ___ sweet.','become|becomes|becoming',1,'tea 为单数/不可数，谓语用 becomes。'),('哪一句是在说一般规律？','If water freezes, it turns into ice.|I ate soup yesterday.|Are you going to sing?',0,'if + 一般现在时说明通常的条件和结果。')),'功能对话：Birthday plans',48,['用正确日期询问搭档的生日。','说出一个庆祝计划和一种礼物。','交换角色，再追问邀请几位朋友。'],PH('日期中的 th','本单元功能对话没有独立歌曲拼读栏；以下依据 p47–48 日期目标新编。部分序数词 th 的声音是 /θ/。','four|fourth\nsix|sixth\nten|tenth',47,'哪个词是 ten 的序数词？','tenth|thirty|third',0,'ten 的序数词是 tenth，结尾有 th。'))

u=add(5,'The Wild West','西部历险',58,69,'🤠','说清材料和用途；区分一个人与多个人的所有格。','''
jail|监狱|The jail is in the old town.
sheriff|警长|The sheriff wears a badge.
robber|劫匪|The robber appears in the story.
wagon|四轮运货马车|The wagon carries boxes.
handcuffs|手铐|The sheriff has a pair of handcuffs.
barrel|桶|There is a wooden barrel outside.
pistol|手枪|The pistol is a dangerous weapon in the story.
saddle|马鞍|The saddle is on the horse.
rope|绳子|The rope is made of strong fibres.
''',G('材料与用途','be made of + 材料；be used for + 名词或动词-ing。注意 of 与 for。','The saddle is made of leather.|马鞍是皮革做的。\nA cup is used for drinking.|杯子用来喝东西。',('The barrel is made ___ wood.','for|of|to',1,'材料用 made of。'),('This bag is used for ___ books.','carry|carried|carrying',2,'介词 for 后跟动词-ing：carrying。')),G('名词所有格','一个人通常加 ’s；以 s 结尾的规则复数只加 ’；children 等不规则复数加 ’s。','The sheriff’s badge is silver.|这位警长的徽章是银色的。\nThe children’s hats are brown.|孩子们的帽子是棕色的。',('表示“两个婴儿的帽子”应选哪一个？',"the baby’s hats|the babies’ hats|the baby hats’s",1,'babies 已是以 s 结尾的复数，在末尾加撇号。'),('表示“孩子们的书”应选哪一个？',"the childrens’ books|the children books’|the children’s books",2,'children 是不以 s 结尾的复数，要加 ’s。')),'歌曲：The meanest robber in town',60,['区分故事人物 sheriff 和 robber。','找出歌曲中的过去式；不猜缺失的原版音轨答案。','用 made of 描述一个安全的日常物品。'],PH('双写辅音：拼写与发音','对应 p60 double consonants；双写字母通常不需要把声音读两遍，比较词形。','run|running\nrob|robber\nbig|bigger',60,'run 加 -ing 的正确拼写是？','runing|running|runeing',1,'run 加 -ing 时双写 n：running。'))

u=add(6,'In Istanbul','伊斯坦布尔之旅',70,81,'🕌','用 should 提建议，用 Could I 礼貌请求；讲清走散与重聚。','''
flag|旗帜|The flag flies above the building.
sunglasses|太阳镜|Her sunglasses are in the bag.
earrings|耳环|The earrings are in a small box.
carpet|地毯|The carpet has a colourful pattern.
basket|篮子|We put the gifts in a basket.
rings|戒指|The rings are on display.
cup and saucer|杯子和茶碟|This cup and saucer are blue.
cushion|靠垫|The cushion is soft.
plate|盘子|The plate is made of clay.
comb|梳子|I keep a comb in my bag.
''',G('should / shouldn’t：建议','should + 动词原形表示应该；shouldn’t 表示不应该。它比 must 更侧重建议。','You should take a map.|你应该带地图。\nYou shouldn’t take photos without asking.|没有先询问，不应该拍照。',('You ___ ask before taking a photograph of someone.','should|shouldn’t|did',0,'尊重别人，拍照前应先问许可。'),('After should, which form is correct?','takes|taking|take',2,'情态动词 should 后用动词原形。')),G('礼貌请求与询问许可','Could I ...? 询问我能否做；Could you ...? 请别人做；Do you mind if ...? 的 Not at all 表示不介意。','Could I see that cup, please?|我可以看看那个杯子吗？\nDo you mind if I sit here? — Not at all.|你介意我坐这里吗？——不介意。',('想请店员展示一顶帽子，应说：','Could you show me that hat, please?|You hat me show.|I showed a hat yesterday.',0,'Could you + 动词原形是礼貌请求。'),('“Do you mind if I open the book?” 回答 “Not at all.” 意思是？','绝对不能打开。|不介意，可以打开。|书已经丢了。',1,'Not at all 在这里表示一点也不介意。')),'功能对话：Disagreeing politely',72,['两人分别推荐一种给老师的礼物。','用 I’m not so sure 或 I don’t agree 礼貌表达不同意见。','读出价格后，商量共同选择。'],PH('礼貌提问中的重读','本单元 p72 是功能对话；这里依据 p73 新编朗读训练，把请求的关键动作读清。','Could I see it?|Could I try it on?\nCould you help me?|Could you show me?\nNot at all.|Of course.',73,'想询问是否可以试穿，应把哪个短语读清？','try it on|turn it off|eat it up',0,'try it on 表示试穿，是这个请求的关键动作。'))

u=add(7,'The story teller','故事讲述者',82,93,'🎭','用 will 主动帮忙，用 just 说明刚发生的事；读懂线索并创作小诗。','''
audience|观众|The audience claps at the end.
candles|蜡烛|The candles are on the stage in the picture.
mask|面具|The actor is wearing a mask.
lute|鲁特琴|The musician plays a lute.
actor|演员|The actor learns his lines.
wig|假发|The wig has long black hair.
costume|戏服|Her costume is green.
lights|灯光|The lights shine on the stage.
''',G('will：主动帮忙与承诺','I’ll = I will，可用于当场决定提供帮助或作出承诺；后接动词原形。','I’ll carry your bag.|我来帮你拿包。\nI’ll bring the costumes tomorrow.|明天我会带戏服来。',('“你渴了？我去拿水。”应说：','I’ll get some water.|I was get water.|I’ll getting water.',0,'I’ll + 动词原形 get，表示现在作出的帮助决定。'),('I’ll is short for ___.','I had|I will|I am',1,'I’ll 是 I will 的缩写。')),G('现在完成时 + just','have/has + just + 过去分词，表示刚刚发生、与现在有关的事。he/she 配 has。','She has just opened the door.|她刚刚打开门。\nThey have just finished the play.|他们刚刚演完戏。',('He ___ just read the news.','have|is|has',2,'He 配 has；read 在这里是过去分词。'),('“他们刚刚到达。”应说：','They have just arrived.|They just arriving.|They has just arrive.',0,'They 配 have，arrive 的过去分词是 arrived。')),'歌曲：You’ll never buy me rings',84,['找出表达承诺的 I’ll。','用自己的话说一件能做到的小承诺。','用语音读新编句子，再配原书音频唱。'],PH('silent e：词尾字母 e','对应 p84 silent e。不是所有词尾 e 都改变前面的元音，下面比较常见规律。','hop|hope\nkit|kite\ncut|cute',84,'哪一个词的词尾 e 通常不单独发音？','kite|kit|kid',0,'kite 的 e 是不发音的词尾 e，i 读 /aɪ/。'))

u=add(8,'Museum of the future','未来博物馆',94,105,'🤖','用 if ... will ... 描述未来结果；把担心变成解决问题的讨论。','''
businessman|男商人|The businessman talks to his team.
cleaner|清洁工|The cleaner keeps the museum tidy.
engineer|工程师|The engineer designs a bridge.
dentist|牙医|The dentist checks our teeth.
businesswoman|女商人|The businesswoman runs a shop.
artist|艺术家|The artist paints a picture.
farmer|农民|The farmer grows vegetables.
mechanic|机械修理工|The mechanic repairs the car.
computer programmer|计算机程序员|The computer programmer writes code.
''',G('if + 一般现在时，will + 原形','谈将来可能发生的条件和结果：if 从句用一般现在时，结果句用 will，不在 if 从句里随意加 will。','If it rains, we’ll stay inside.|如果下雨，我们就待在室内。\nIf you press this button, the robot will stop.|如果你按这个按钮，机器人就会停下。',('If it ___, we will take an umbrella.','will rain|raining|rains',2,'if 条件从句用一般现在时 rains。'),('If I finish early, I ___ you.','will help|helped|helping',0,'未来结果用 will + 动词原形 help。')),G('What if ...?：提出可能的问题','What if + 一般现在时可询问“如果……怎么办？”；回答可以用 we can / we’ll 提出备选计划。','What if the museum is closed?|如果博物馆关门了怎么办？\nThen we can visit the park.|那么我们可以去公园。',('“如果公交车晚点怎么办？”应说：','What bus late if?|What if the bus is late?|What if is late the bus?',1,'What if 后面的从句保持陈述语序。'),('What if it rains? 哪个回答提出了备选计划？','It rained yesterday.|Blue is my favourite colour.|We can visit the indoor gallery.',2,'室内展厅是下雨时可采取的替代方案。')),'功能对话：Why do we learn Maths?',96,['分别扮演想看电视和想复习的同学。','说一种工作会怎样用到数学。','把 What if ...? 加入你们的学习计划对话。'],PH('条件句中的停顿','本单元是功能对话，没有独立歌曲拼读栏；这里结合 p95、97 新编分意群朗读。','If it rains,|we will stay inside.\nIf you are tired,|we can rest.\nWhat if it closes?|We can come tomorrow.',97,'读“If it rains, we will stay inside.” 时，最自然的分组是哪一个？','If it / rains we will / stay inside.|If it rains / we will stay inside.|If / it rains we / will stay inside.',1,'先读完整条件 If it rains，再读结果，更容易听懂。'))

u=add(9,'Mystery at sea','海上之谜',106,117,'⛵','用 already/yet 汇报进度；分清故事中的想象、观察与未解问题。','''
sail|船帆|The wind fills the sail.
mast|桅杆|The sail is fixed to the mast.
captain|船长|The captain checks the map.
lifeboat|救生艇|There is a lifeboat on the ship.
porthole|舷窗|We can see the sea through the porthole.
cabin|船舱|The captain is in his cabin.
barometer|气压计|The barometer measures air pressure.
rat|老鼠|A rat runs across the floor.
sailor|水手|The sailor works on the ship.
''',G('现在完成时：already / yet','already 表示已经，常放 have/has 与过去分词之间；not ... yet 表示还没有，yet 常在句尾。','I have already packed my bag.|我已经装好包了。\nHe hasn’t cleaned the cabin yet.|他还没有打扫船舱。',('I have ___ finished my homework.','yet|already|tomorrow',1,'肯定句“已经完成”用 already。'),('She hasn’t eaten lunch ___.','already|just|yet',2,'否定句末尾的 yet 表示还没有。')),G('Have you ... yet?','询问是否已经做完：Have/Has + 主语 + 过去分词 + yet? 回答用 Yes, ... have/has 或 No, ... haven’t/hasn’t。','Have you washed the dishes yet?|你已经洗好盘子了吗？\nNo, I haven’t. I’ve already made the soup.|还没有。我已经做好汤了。',('___ he finished the job yet?','Has|Have|Did',0,'主语 he 用 Has。'),('Have you fed the cat yet? 简短否定回答应为：','No, I didn’t.|No, I haven’t.|No, I am not.',1,'现在完成时问句用 haven’t 回答。')),'歌曲：Drop the anchor',108,['读标题，找出与船有关的词。','区分歌词里的误会与最后发生的事。','用 already 和 yet 说两件今天做过或未做的事。'],PH('look、put 与 /ʊ/','对应 p108 look and put。比较 /ʊ/ 和其他元音；注意 oo 不总是同一种读音。','look|book\nput|foot\nwood|good',108,'哪个词与 look 有相同的元音 /ʊ/？','moon|food|book',2,'look 和 book 通常读 /ʊ/；moon、food 通常读 /uː/。'))

u=BOOK['units'][0]
u['story']=P('The explosion',[8,9],'三个孩子轮流做实验。Patrick 无法读清说明，却继续操作；事故后出现了黄色时空门。这是虚构情节，重点是理解原因并遵守说明。','''
Alex, Phoebe and Patrick were in their Science lesson.|Alex、Phoebe 和 Patrick 正在上科学课。|先交代人物和地点。
Alex read the instructions, and Phoebe followed them.|Alex 读说明，Phoebe 按说明操作。|follow instructions：遵守说明。
Their first experiment changed the colour of a brick.|他们的第一个实验改变了一块砖的颜色。|first 说明事件顺序。
In the next experiment, Alex made the brick bigger.|在下一个实验中，Alex 让砖变大了。|made ... bigger：使……更大。
Mr Davis reminded them to read the instructions carefully.|Davis 老师提醒他们仔细阅读说明。|reminded：提醒。
Then Patrick knocked water over the instructions.|接着 Patrick 打翻了水，水洒在说明上。|knocked ... over：碰翻。
The words became impossible to read.|字变得看不清了。|说明为什么接下来应该停下来求助。
Alex wanted to ask the teacher, but Patrick continued without clear instructions.|Alex 想问老师，但 Patrick 在没有清楚说明的情况下继续操作。|but 表示两人的做法不同。
An explosion happened, and a strange yellow gate appeared.|一场爆炸发生了，一道奇怪的黄色门出现了。|故事把事故与时空之门连接起来；这不是实际实验步骤。
The children stepped into the light and disappeared.|孩子们走进光里，消失了。|故事的悬念：他们去了哪里？
''',('为什么后来无法读清说明？','说明被水弄湿了。|老师把说明带走了。|说明用另一种语言写成。',0,'Patrick 打翻了水，水洒在说明上。'),('这段故事中，哪一步让风险变大？','仔细阅读说明。|看不清说明仍继续实验。|向老师求助。',1,'Patrick 没有按 Alex 的建议求助，而是继续。'))
u['reading']=P('Three different school days',[7],'同样是回答“今天学校怎么样”，三个孩子的感受不同：Alex 普普通通，Patrick 失望，Phoebe 兴奋。','''
At home, the children talked about their day at school.|回家后，孩子们谈起了学校的一天。|talked about：谈论。
Alex said that his day was just OK.|Alex 说他这一天还可以。|just OK：只是还行。
There was nothing special about his day.|他没有遇到什么特别的事。|nothing special：没什么特别的。
Patrick thought it was the worst day ever.|Patrick 认为那是最糟糕的一天。|worst 是 bad 的最高级。
His football team lost six to nil.|他的足球队以零比六输了。|six to nil：六比零；这里对方得六分。
He was the goalkeeper, so he felt disappointed.|他是守门员，所以很失望。|so 连接原因和感受；感受是依据语境的解释。
Phoebe was excited about a Geography project.|Phoebe 对一个地理项目很兴奋。|excited about：对……兴奋。
She was going to do her project on Mexico.|她要做关于墨西哥的项目。|on 在这里是“关于”。
''',('谁因为足球比赛而不开心？','Alex|Phoebe|Patrick',2,'Patrick 的球队输了，他是守门员。'),('Phoebe 为什么兴奋？','她要做关于墨西哥的地理项目。|她赢了足球赛。|她不用上学了。',0,'她谈到了 Geography project on Mexico。'))
u['world']=P('Read, check, then act',[4,8,9],'从科学课故事练习“先读、核对、不会就问”的学习流程。以下为依据单元目标新编，不提供真实化学实验配方。','''
Instructions tell us what to do and in what order.|说明告诉我们做什么，以及按什么顺序做。|order：顺序。
In the story, the children need clear instructions.|故事里，孩子们需要清楚的说明。|clear：清楚的。
If the words are wet or unclear, they should stop.|如果文字湿了或不清楚，他们就应该停下来。|unclear：不清楚的。
A teacher can explain the next step.|老师可以解释下一步。|explain：解释。
Goggles and gloves are useful, but they do not replace instructions.|护目镜和手套有用，但不能代替说明。|replace：代替。
Careful questions are part of good learning.|认真提问是良好学习的一部分。|part of：……的一部分。
''',('读不清下一步时，文中建议做什么？','随意猜一猜。|停下来问老师。|加快速度。',1,'第四句说老师可以解释下一步。'),('哪句话最符合这段短文？','认真提问能帮助学习。|穿了手套就不用看说明。|不清楚也应该继续。',0,'最后一句点明：提问是良好学习的一部分。'),'依据单元目标新编')
C(u,'用四步讲清科学课事故',[7,8,9],['按“人物—正常操作—出错原因—结果”写四条笔记。','用过去时写 5–7 句；至少包含一个 but 或 so。','口头讲给家长听，再用中文解释 Patrick 应在哪里停下来。'],'The children were in ...\nFirst, ...\nThen, ...\nPatrick ... but ...\nAn explosion ...\nFinally, ...','The children were in the Science lab. At first, they followed the instructions. Then water fell onto the instructions. Alex wanted to ask the teacher, but Patrick continued. An explosion happened and a yellow gate appeared. The children walked into the light.','能说清说明被弄湿这一原因、继续操作与事故的关系，并按顺序讲述。','依据 p7 过去经历问答和 p8–9 故事新编复述任务；不是实验活动。')

u=BOOK['units'][1]
u['story']=P('A narrow escape',[14,15],'Phoebe 认出庞贝和火山危险，想提醒城里的人。爆发时，三个孩子发现黄色门并逃离。重点是原因、行动和结果。','''
Phoebe ran out of the city, and the boys followed her up a hill.|Phoebe 跑出城，两个男孩跟着她跑上小山。|followed：跟随。
She recognised Pompeii from her History lessons.|她从历史课所学认出了庞贝。|recognised：认出。
She was afraid that the volcano was going to erupt.|她担心火山将要喷发。|was going to：当时预计将要。
A loud noise came from the volcano, and dark smoke rose into the sky.|火山发出巨响，黑烟升上天空。|故事用声音和画面表现危险。
Phoebe wanted to warn the people in the city.|Phoebe 想提醒城里的人。|warn：警告、提醒危险。
The children returned, but the people did not understand their words.|孩子们返回城里，但人们不理解他们的话。|but 引出沟通困难。
Then the volcano erupted, and everyone became frightened.|随后火山喷发了，大家都害怕起来。|then 推动事件发展。
Through the smoke, Alex saw a yellow light.|透过烟雾，Alex 看见一道黄色的光。|through：穿过。
Phoebe recognised the gate from the Science lab.|Phoebe 认出了科学实验室里出现过的那道门。|前后两章的联系。
The three friends ran to the gate and disappeared through it.|三个朋友跑向门，从门里消失了。|narrow escape：险些出事但逃脱。
''',('Phoebe 为什么认出这个城市很危险？','她以前在这座城市住过。|历史课帮助她认出了庞贝和火山。|当地居民刚向她解释过火山历史。',1,'文中提到 she recognised Pompeii from her History lessons。'),('故事结尾，孩子们如何离开？','乘马车回学校。|躲进神庙睡觉。|穿过黄色时空门。',2,'Alex 发现黄色光，孩子们跑向门并消失。'))
u['reading']=P('Understanding natural disasters',[16],'本页介绍不同自然灾害及其影响。改写保留分类、观察和了解风险的核心，不把旧教材中的年度统计当作现在的排名。','''
Natural disasters can happen in different parts of the world.|自然灾害可能发生在世界不同地方。|different parts：不同地区。
Some disasters are connected with the weather.|有些灾害与天气有关。|connected with：与……有关。
Storms, floods and hurricanes are examples.|暴风雨、洪水和飓风就是例子。|examples：例子。
Scientists use equipment to study earthquakes and volcanoes.|科学家利用设备研究地震和火山。|equipment 是不可数名词。
It can be difficult to know exactly when a disaster will happen.|准确知道灾害何时发生可能很困难。|exactly：准确地。
Floods can damage homes, roads and fields.|洪水会损坏住宅、道路和农田。|damage：损害。
Forest fires may begin after lightning or because people are careless.|森林火灾可能由闪电或人们的疏忽引起。|because 表示原因。
Learning about local risks helps people prepare and listen to warnings.|了解当地风险有助于人们做准备并留意预警。|local：当地的；warnings：预警。
''',('哪项属于文中与天气有关的灾害？','洪水。|地震。|火山喷发。',0,'第三句把 floods 列为例子。'),('文章对“准确知道灾害何时发生”怎么说？','总能精确预测时间。|可能很困难。|只观察一次就能确定时间。',1,'第五句说 It can be difficult to know exactly when。'))
u['world']=P('Inside a volcano',[18,19],'用七句认识 magma、lava、crater、ash。教材的模型活动可在原书查看；这里用画图代替实际操作。','''
Deep inside Earth, some rock is so hot that it is melted.|地球深处有些岩石非常热，处于熔融状态。|melted rock：熔融岩石。
Melted rock below the surface is called magma.|地表下面的熔融岩石叫 magma（岩浆）。|below the surface：在地表下面。
Magma can collect in a chamber underground.|岩浆可以聚集在地下的岩浆房中。|chamber：腔室；这里指岩浆房。
Pressure can help push magma upwards.|压力能促使岩浆向上移动。|upwards：向上。
A crater is an opening at the top of a volcano.|crater 是火山顶部的一个开口。|用图像把单词和位置联系起来。
When magma reaches the surface, we call it lava.|岩浆到达地表后，我们称它为 lava（熔岩）。|区分 magma 和 lava 所在的位置。
An eruption can send ash and gases into the air.|一次喷发可能把火山灰和气体送进空中。|ash：火山灰；eruption：喷发。
''',('地表下面的熔融岩石叫作什么？','lava|magma|ash',1,'第二句直接给出了 magma 的定义。'),('岩浆到达地表后通常称为什么？','lava|crater|magma',0,'第六句区分了地下的 magma 和地表的 lava。'))
C(u,'小小灾害解说员',[17,18,20],['画一座火山并标出 magma、crater、lava。','用 5–7 句解释一种灾害；至少一句包含 was/were + -ing。','先看关键词讲 45 秒，再回答“发生了什么？人们当时在做什么？”'],'This talk is about ...\nIt can ...\nIn my imaginary report, people were ... when ...\nThe important words are ...\nWe can learn ...','This talk is about volcanoes. Magma is melted rock below the ground. When it reaches the surface, we call it lava. In my imaginary report, people were walking when they saw smoke. They listened to the adults and the official warnings. Learning the words helps us understand the report.','能区分词语、交代过去背景和发生的事；想象报道要明确说 imaginary，不编造真实灾害数字。','依据 p17 灾害短文写作、p18 火山知识与 p20 展示目标新编。')

u=BOOK['units'][2]
u['story']=P('The present',[26,27],'饥饿的孩子们在雨林中寻找帮助。他们误把吼猴的声音当成美洲豹，随后遇见村民、分享食物，再找到时空门。','''
The children walked through the rainforest, looking for a way out.|孩子们穿过雨林，寻找出路。|looking for：寻找。
They followed a river because they hoped to find a village.|他们沿着河走，希望找到村庄。|because 解释选择路线的原因。
A loud animal noise frightened them.|一阵很大的动物叫声吓到了他们。|frightened：使害怕。
Patrick thought it was a jaguar, but it was a howler monkey.|Patrick 以为那是美洲豹，但其实是一只吼猴。|thought 与 was 对比“猜想”和“事实”。
Later, they met a man who led them to a village.|后来，他们遇到一个人，他带他们来到村庄。|led 是 lead 的过去式。
Alex gave his penknife to an older man as a present.|Alex 把自己的小折刀作为礼物送给一位老人。|这是原故事情节，不是让孩子携带刀具的任务。
The villagers shared food with the three hungry visitors.|村民和三个饥饿的来客分享了食物。|shared：分享。
After dinner, a man showed them a waterfall and a yellow glow.|饭后，一个人带他们看瀑布和那里的黄色光芒。|after dinner：晚饭后。
In the adventure, Patrick swung through the gate on a creeper.|在这个冒险故事中，Patrick 抓住藤蔓荡过了时空门。|故事中的危险动作，不要模仿。
Alex was afraid, so Phoebe went with him through the light.|Alex 害怕，所以 Phoebe 陪他一起穿过光。|so 连接害怕与同伴支持。
''',('最初让孩子们害怕的声音其实来自谁？','美洲豹。|吼猴。|巨嘴鸟。',1,'他们后来发现树上的动物是 howler monkey。'),('Alex 害怕时，Phoebe 做了什么？','陪他一起穿过门。|让他独自留在瀑布边。|和他一起返回村庄。',0,'最后一句交代同伴的支持。'))
u['reading']=P('A meeting from the air',[29],'教材用 2008 年亚马孙上空的一次观察，引出保护森林和尊重不同生活方式。注意：这是对书中报道的改写，不是对当地社群现状的更新。','''
The article describes a flight over the Amazon rainforest in May 2008.|文章描述了 2008 年五月一次飞越亚马孙雨林的经历。|把时间说清楚，避免当成今日新闻。
The pilot saw huts below the small plane.|飞行员看见小飞机下面有一些小屋。|below：在……下面。
People on the ground pointed bows and arrows towards the plane.|地面上的人把弓箭指向飞机。|towards：朝向。
The people in the plane took photographs and flew away.|飞机上的人拍了照片后飞走了。|按时间顺序读动作。
The article suggests that the people on the ground felt frightened.|文章认为地面上的人感到了害怕。|suggests：提出一种解释，而不是读心。
It explains that cutting down forests threatens people's homes.|文章解释说，砍伐森林威胁着人们的家园。|threatens：威胁。
It also describes risks when people with little outside contact meet outsiders.|它也描述了很少与外界接触的人群遇到外来者时的风险。|不把一种生活方式当成所有群体的共同情况。
The main message is to protect their land and respect their choices.|主要意思是保护他们的土地，并尊重他们的选择。|respect：尊重。
''',('这篇教材报道描述的飞行发生在什么时候？','2008 年八月。|2008 年五月。|2018 年五月。',1,'第一句明确标出报道的时间。'),('哪一项最接近文章的核心意思？','每个地方的人生活都完全相同。|为了拍照应该闯入别人家园。|保护土地，尊重不同社群的生活。',2,'结尾总结了保护与尊重的主题。'))
u['world']=P('Why rainforests matter',[30,31],'雨林给许多生物和人提供家园，也参与水循环。砍伐与清地会破坏这些家园。','''
Rainforests are places where a great deal of rain falls.|雨林是降雨很多的地方。|a great deal of：大量的。
Many kinds of plants and animals live there.|许多种类的植物和动物生活在那里。|many kinds of：许多种类的。
Rainforest plants take in water from the ground.|雨林植物从地面吸收水分。|take in：吸收。
They release water vapour into the air as part of the water cycle.|它们把水蒸气释放到空气中，参与水循环。|water vapour：水蒸气。
Forests are also homes for people with their own languages and traditions.|森林也是有各自语言和传统的人们的家园。|traditions：传统。
Logging removes trees, and land may also be cleared for farms.|伐木会移走树木，土地也可能被清理出来建设农场。|logging：伐木；cleared：清理。
Protecting a forest means protecting many connected living things.|保护森林，就是保护许多彼此联系的生命。|connected：相互联系的。
''',('植物释放到空气中的水是什么形式？','冰块。|液体水滴。|水蒸气。',2,'第四句说明 water vapour。'),('为什么砍伐森林不只影响树木？','森林也是动物和人们的家园。|所有雨林动物都能马上搬到城市。|没有树木就会有更多同样的栖息地。',0,'第二、第五句说明多种动物、植物和人住在森林。'))
C(u,'设计一张雨林说明卡',[28,30,31,33],['从本课选一种动物，写出外形、栖息地和一个教材中可核对的特点。','写两句 have to / don’t have to 的纸上探险游戏规则。','用 5–7 句介绍雨林为什么重要，并说明你的动物卡信息来自哪一页。'],'My animal is ...\nIt has ...\nIt lives ...\nIn our paper game, you have to ...\nYou don’t have to ...\nRainforests are important because ...','My animal is a toucan. It has a large beak. It lives in the rainforest. In our paper game, you have to find the bird card. You don’t have to climb a real tree. Rainforests are important because many living things depend on them.','能说清一个动物特点、两条游戏规则和保护雨林的一条原因；不猜测原书听力空缺数字。','依据 p28 动物卡、p30–31 雨林主题和 p33 描写目标新编；提供的规则仅用于纸上游戏。')

u=BOOK['units'][3]
u['story']=P('Elvis',[38,39],'孩子们遇见 Elvis，了解到明星也需要安静。他们用换装计划帮他离开人群，随后接受款待，再次踏进时空门。与历史人物见面的情节是虚构的。','''
After the show, Patrick spoke to Elvis Presley.|演出后，Patrick 和 Elvis Presley 说话。|after the show：演出之后。
Patrick said that his grandmother loved Elvis and owned his CDs.|Patrick 说奶奶喜欢 Elvis，还拥有他的 CD。|owned：拥有。
Elvis was confused because CDs were unfamiliar to him in that time.|Elvis 很困惑，因为在那个年代，CD 对他很陌生。|时间旅行造成了有趣的误会。
In his dressing room, Elvis explained that many fans were waiting outside.|在化妆间里，Elvis 解释说外面有许多歌迷等候。|dressing room：化妆间。
He wanted some peace and quiet, and Alex thought of a plan.|他想得到一点安静，Alex 想出了一个计划。|peace and quiet：宁静。
Alex used a wig, glasses and a long coat to look like Elvis.|Alex 用假发、眼镜和长外套装扮成 Elvis。|look like：看起来像。
In the story, Alex sat on Patrick's shoulders and attracted the fans at the back door.|故事中，Alex 坐在 Patrick 肩上，在后门吸引歌迷注意。|只复述虚构情节，不模仿危险或欺骗行为。
Meanwhile, the real Elvis left by the front door with Phoebe.|与此同时，真正的 Elvis 和 Phoebe 从前门离开。|meanwhile：与此同时。
Elvis thanked the children with a meal at his hotel.|Elvis 在酒店用一顿饭感谢孩子们。|thank ... with：用……表示感谢。
They enjoyed his company, but the yellow gate appeared and they had to leave.|他们和他相处很开心，但黄色门出现了，他们必须离开。|but 表示“想留”和“必须走”的对比。
''',('Elvis 为什么不理解 Patrick 提到的 CD？','在这个故事所处的年代，CD 对他很陌生。|他以为 Patrick 在谈自己的新演出。|他正在向 Patrick 解释如何播放 CD。',0,'时间旅行让 Patrick 用了 Elvis 所处年代不熟悉的词。'),('真正的 Elvis 从哪里离开剧院？','后门，独自一人。|前门，和 Phoebe 一起。|后门，和 Alex 一起。',1,'第八句明确说明 front door with Phoebe。'))
u['reading']=P('Misha keeps playing',[41],'Misha 两次被乐队拒绝，但她继续享受演奏。制作人听到她的音乐后，看到了她的能力。故事强调坚持，而不是只看外形或音量。','''
Misha wanted to join a band and play her guitar.|Misha 想加入乐队并弹吉他。|wanted to：想要。
She felt nervous when she met Mike and his band.|遇到 Mike 和他的乐队时，她很紧张。|nervous：紧张的。
Mike said she played well but was not loud enough.|Mike 说她弹得不错，但声音不够大。|not ... enough：不够……。
Later, another band rejected her because they did not think she looked right.|后来，另一个乐队拒绝她，因为他们认为她的样子不合适。|rejected：拒绝接受。
Misha was sad, but she kept playing music.|Misha 很难过，但仍然继续演奏。|kept playing：继续演奏。
Two weeks later, she played for shoppers in the town centre.|两周后，她在市中心为购物的人演奏。|two weeks later：两周以后。
A record producer called Don Parsons stopped and listened.|一位名叫 Don Parsons 的唱片制作人停下来听。|record producer：唱片制作人。
He valued her singing and playing and offered to help her.|他欣赏她的歌唱和演奏能力，并提出帮助她。|valued：重视、欣赏。
''',('被拒绝后，Misha 怎么做？','放弃演奏并卖掉吉他。|继续演奏音乐。|马上加入了拒绝她的两个乐队。',1,'第五、六句说明她仍然演奏。'),('故事更支持哪种看法？','会制造很大声音就一定有音乐能力。|外表是唯一重要的事情。|坚持练习与真实的能力值得重视。',2,'制作人看重她的歌唱和演奏，而不是前面乐队设定的外表与音量条件。'))
u['world']=P('Making a rhythm',[42,43],'节奏由声音与停顿的组合产生。通过拍手、说词和音符长短，把节奏看成可重复的模式。','''
We can hear rhythms in many everyday sounds.|我们能在许多日常声音中听到节奏。|everyday：日常的。
A bouncing ball or falling rain can make a pattern of sounds.|弹跳的球或落下的雨能形成声音模式。|pattern：模式。
Music uses sounds and silences to create rhythm.|音乐利用声音和停顿创造节奏。|silences 在这里表示无声的间隔。
Some sounds are long, and others are short.|有些声音长，有些声音短。|others：其他一些。
A repeating pattern helps us hear the rhythm.|重复的模式有助于我们听出节奏。|repeating：反复的。
In this exercise, a crotchet lasts one beat and a quaver lasts half a beat.|在这个练习里，四分音符是一拍，八分音符是半拍。|教材以四分音符为一拍来练习。
Two quavers therefore last as long as one crotchet.|因此，两个八分音符与一个四分音符一样长。|therefore：因此。
''',('音乐节奏只由声音构成吗？','不是，还包括停顿。|是，停顿完全没有作用。|只需要声音足够大就能产生节奏。',0,'第三句说 sounds and silences。'),('在本练习中，两个 quavers 一共多长？','半拍。|两拍。|一拍。',2,'一个 quaver 是半拍，两个加起来是一拍。'))
C(u,'我的一分钟音乐介绍',[43,44,45],['选择一位熟悉的音乐人或一段喜欢的音乐，只用自己能核对的信息。','写出喜欢的两个原因和两个 going to 练习计划。','加一句具体钟点，练习 45–60 秒介绍，并拍出一小段节奏。'],'I like ...\nI enjoy it because ...\nAt ... I’m going to ...\nNext week I’m going to ...\nThe rhythm sounds ...','I like guitar music because it can be gentle or lively. I enjoy listening to clear rhythms. At half past five, I’m going to practise a short tune. Next week, I’m going to play it for my family. I can clap the rhythm before I play.','能说出喜欢的原因、两项计划和一个准确钟点；音乐介绍不能只背名词清单。','依据 p43 节奏练习、p44 展示和 p45 有顺序地写作目标新编；不编造歌手最新资料。')

u=BOOK['units'][4]
u['story']=P('The birthday meal',[50,51],'Phoebe 在未来餐厅过生日。汤、主菜、甜点都很奇特；孩子们吃饱后才发现没有这种世界的钱，最后在厨房门边遇见时空门。','''
The children sat down for a birthday meal in a strange restaurant.|孩子们坐下来，在一家奇怪的餐厅吃生日餐。|birthday meal：生日餐。
The waiter brought orange soup, but it was hard instead of liquid.|服务员端来橙色的汤，但它是硬的，不是液体。|instead of：而不是。
In this imaginary restaurant, the soup broke into little balls.|在这家想象中的餐厅里，汤碎成了小球。|imaginary 提醒读者这是虚构食物。
The children used chopsticks to pick up the balls.|孩子们用筷子夹起这些小球。|pick up：夹起、拿起。
For the next course, the waiter brought coloured steam in pots.|下一道菜，服务员端来了装在锅里的彩色蒸汽。|course：一道菜。
The friends tried to eat the steam, but they were still hungry.|朋友们试着吃蒸汽，但仍然很饿。|but 表示愿望没有实现。
Then a chocolate spaceship arrived with many birthday candles.|接着，一艘插着许多生日蜡烛的巧克力飞船来了。|spaceship：宇宙飞船。
There was ice cream inside, and the children finally ate enough.|里面有冰激凌，孩子们终于吃饱了。|finally：终于。
The bill was 60,000 goldstars, but they had none of that money.|账单是六万 goldstars，但他们没有这种钱。|goldstars 是故事中的货币。
As they went towards the kitchen to work, the yellow gate appeared by the door.|他们朝厨房走去准备干活时，门边出现了黄色时空门。|交代离开餐厅的转折。
''',('这顿饭的正确顺序是什么？','飞船甜点—蒸汽—汤。|蒸汽—汤—飞船甜点。|汤—蒸汽—飞船甜点。',2,'第三道菜是带冰激凌的巧克力飞船甜点。'),('为什么服务员要孩子们去厨房工作？','他们没有 goldstars 支付账单。|他们主动报名学习做生日蛋糕。|他们已经答应在餐厅工作一周再吃饭。',0,'第九句说明无法支付，随后他们被安排去厨房。'))
u['reading']=P('Willy Wonka’s imagined inventions',[52],'教材博客介绍 Willy Wonka 故事世界里的奇妙糖果。分清“作者想象的发明”和现实食物，再用 if 描述自己设计的虚构发明。','''
The blog describes sweets from Willy Wonka's imaginary world.|博客介绍了 Willy Wonka 想象世界里的糖果。|不是现实商品说明。
One piece of chewing gum can become a whole three-course meal.|一块口香糖可以变成一整套三道菜。|whole：完整的。
The meal begins with soup and ends with a dessert.|这顿饭从汤开始，以甜点结束。|begins with / ends with：以……开始/结束。
Another invention is ice cream that does not melt.|另一项发明是不会融化的冰激凌。|does not melt：不融化。
The writer also describes wallpaper that tastes like fruit.|作者还描写了有水果味的墙纸。|wallpaper：墙纸。
There are lollipops with lights, like tiny lamps.|还有带灯的棒棒糖，像小小的灯一样。|like 表示比较。
A kind of sugar grass grows near a chocolate river in the story.|故事里，一种糖做的草长在巧克力河附近。|in the story 限定虚构世界。
The blogger invites readers to imagine flavours and choose a favourite invention.|博主邀请读者想象味道，并选择喜欢的发明。|flavours：味道。
''',('这里的不会融化的冰激凌属于什么？','经过本文验证的现实发明。|故事中的想象发明。|实际制作冰激凌的操作步骤。',1,'开头说明是 imaginary world。'),('three-course meal 最接近什么意思？','三道菜的一顿饭。|三个人合吃的一道菜。|三天吃完的一顿饭。',0,'课文举出开头的汤和结尾的甜点，course 在这里是菜的道数。'))
u['world']=P('Different foods, different jobs',[54,55],'学习食物分类和身体需要食物的原因。这里是语言与科学概念练习，不给孩子规定个人饮食份量。','''
Our bodies need food for energy and growth.|身体需要食物来获取能量并生长。|energy：能量；growth：生长。
Different foods provide different nutrients.|不同食物提供不同营养成分。|nutrients：营养成分。
The book groups foods into fruit and vegetables, grains, dairy products, proteins and sugars.|教材把食物分成果蔬、谷物、乳制品、蛋白质类和糖类。|这是本页采用的分类标签。
Grains include foods such as bread and rice.|谷物类包括面包和米饭等食物。|such as：例如。
Milk and cheese are examples of dairy products.|牛奶和奶酪是乳制品的例子。|dairy products：乳制品。
Protein helps the body grow and repair itself.|蛋白质帮助身体生长和修复。|repair：修复。
A food diary helps us notice the variety of foods we eat.|食物日记帮助我们注意自己吃的食物是否多样。|variety：多样性；不需要评判体形。
''',('按文中分类，牛奶属于哪一类？','谷物。|乳制品。|水果。',1,'第五句给出 milk and cheese 是 dairy products。'),('food diary 可以帮助我们观察什么？','食物的多样性。|未来一周食物的准确价格。|每家餐厅的完整菜单。',0,'最后一句写出食物日记的用途。'))
C(u,'我的未来餐厅菜单',[48,49,53,56,57],['画一份虚构菜单，列出前菜、主菜和甜点并给出价格。','用日期邀请朋友，再用两句 if 描述食物的想象规则。','扮演服务员和顾客，问菜单、点餐、核对总价。'],'The meal is on the ... of ...\nFor starters, I’d like ...\nIf you ..., it ...\nThe main course is ...\nCould I have the bill, please?\nThe total is ...','My imaginary restaurant opens on the third of May. For starters, I’d like moon soup. If you tap the bowl in my story, the soup turns blue. The main course is star rice, and dessert is cloud ice cream. Could I have the bill, please? The total is twenty stars.','能读准日期、按三道菜顺序介绍、用 if 表达规则，并核对虚构价格。','依据 p48 生日对话、p49 if 规则、p53 食物发明及 p56–57 点餐写作目标新编；菜单无需制作成真实食品。')

u=BOOK['units'][5]
u['story']=P('The bank robbery',[62,63],'孩子们看到银行抢劫，先找警长。故事里他们用冒险办法拖住劫匪，警长最终逮捕了他们。下面只理解虚构情节；遇到现实危险应远离并求助。','''
The children saw men with covered faces enter the bank.|孩子们看见几个遮着脸的男人走进银行。|covered faces：遮住的脸。
A woman ran out and shouted that the bank was being robbed.|一位女士跑出来，喊着银行正在遭抢劫。|ran out：跑出来。
Phoebe said it was too dangerous to go inside, so they went to the sheriff.|Phoebe 说进去太危险，因此他们去找警长。|too dangerous：太危险。
The sheriff was afraid because the men were the Dalton brothers.|警长很害怕，因为那些人是 Dalton 兄弟。|because 解释警长为什么不愿行动。
In the story, Patrick used a rope to delay the robbers' escape.|故事中，Patrick 用绳子试图拖延劫匪逃跑。|概括情节，不把危险行动做成操作任务。
Alex secretly damaged the straps on their saddles.|Alex 悄悄弄坏了他们马鞍上的带子。|secretly：悄悄地；只复述虚构故事。
The robbers freed their horses and rode away.|劫匪解开了马匹的束缚，骑马离开。|freed：释放、解开束缚。
When the horses jumped a fence, the robbers fell to the ground.|当马跳过篱笆时，劫匪摔到了地上。|when 连接同时发生的转折。
The sheriff arrested them and gave the children badges.|警长逮捕了他们，并给孩子们徽章。|arrested：逮捕。
Then the yellow gate appeared, and the Time Travellers left the town.|随后黄色门出现，时间旅行者们离开了小镇。|故事离开这一站。
''',('警长起初为什么没有采取行动？','他认为银行没有发生任何事情。|他已在另一条街抓住了劫匪。|他害怕 Dalton 兄弟。',2,'第四句说 sheriff was afraid。'),('故事中，最后是谁逮捕劫匪？','警长。|Patrick。|Alex。',0,'第九句明确写出 The sheriff arrested them。'))
u['reading']=P('Different peoples, different traditions',[64,65],'原页标题使用 American Indians。这里采用“北美原住民”说明不同社群有不同语言、家园和传统，不把所有人描绘成同一种生活方式。','''
The text introduces some Indigenous peoples of North America.|文章介绍了北美的一些原住民社群。|Indigenous peoples：原住民各族群。
It uses the older term American Indians in its title.|标题使用了较旧的称呼 American Indians。|读原页时认识这个词，同时理解称呼的语境。
There were many different communities, with different languages.|那里有许多不同社群，使用不同的语言。|communities：社群。
Their homes and ways of life were not all the same.|他们的家园与生活方式并不都一样。|not all the same：并非完全相同。
Some communities used tall tents called teepees.|有些社群使用叫 teepees 的高帐篷。|some 表示部分，不能改成 all。
Bison were important to some Plains peoples for food and materials.|对一些大平原族群而言，野牛是重要的食物和材料来源。|不把这一特点套用到所有北美原住民。
The reading describes conflict when newcomers wanted their land.|阅读描述了外来者想占用他们土地时发生的冲突。|conflict：冲突。
It reminds us that history, languages and traditions deserve respect.|文章提醒我们，历史、语言和传统都值得尊重。|deserve respect：值得尊重。
''',('哪一句准确保留了文章中“多样性”的意思？','所有社群使用同一种语言。|所有人都住相同的帐篷。|不同社群有不同语言与生活方式。',2,'第三、第四句明确强调差异。'),('some communities 应该理解为？','一些社群。|每一个社群。|没有任何社群。',0,'some 是一部分，不等于 all。'))
u['world']=P('Gold: material and uses',[66,67],'用材料、开采难度和用途理解黄金。本节保留稳定概念，不提供价格、投资建议或旧教材中的产量排名。','''
Gold is a precious metal.|黄金是一种贵金属。|precious：珍贵的。
Small pieces may be found in streams, but much gold is underground.|小块黄金可能在溪流里发现，但很多黄金在地下。|underground：在地下。
Mines and machines are used to bring it to the surface.|矿井和机器被用来把它带到地表。|are used to：被用于。
Finding and extracting gold can be difficult.|寻找和提取黄金可能很困难。|extracting：提取。
Gold is rare, which helps explain why people value it.|黄金较稀有，这有助于解释人们为何珍视它。|rare：稀有的；不表示价格永远上涨。
It can be shaped into jewellery such as rings.|它可以制成戒指等珠宝。|such as：例如。
Gold also conducts electricity, so it is used in some electronic parts.|黄金也能导电，因此用在某些电子部件中。|conducts electricity：导电。
''',('文章提到黄金被珍视的一个原因是什么？','开采它总是很容易。|它较稀有。|它比普通石头更常见。',1,'第五句把 rare 和 value 联系起来。'),('黄金为什么能用于某些电子部件？','因为它能阻断所有电流。|因为它具有与塑料相同的绝缘作用。|因为它能导电。',2,'最后一句说明 conducts electricity。'))
C(u,'安全的西部故事展板',[59,61,68,69],['画一个完全虚构的小镇人物，不使用现实同学的通缉照片。','用 made of、used for 描述两个日常物品，再写一组单数与复数所有格。','写 6–8 句有开头、问题、求助和结尾的小故事，加入一句人物对话。'],'My character is ...\nThe ... is made of ...\nIt is used for ...\nOne day, ...\n“...,” ... said.\nThey asked ... for help.\nIn the end, ...','My character is a helpful sheriff. Her hat is made of cotton. Her notebook is used for writing clues. One day, a visitor lost a bag. “Can you help me?” he asked. The sheriff asked the shopkeepers. In the end, they found the visitor’s bag beside the wagon.','材料与用途表达正确；能用所有格说明“谁的”；故事以观察与求助解决问题。','依据 p68 人物海报和 p69 故事写作改编为安全的失物故事；不要求儿童表演攻击、追捕或武器操作。')

u=BOOK['units'][6]
u['story']=P('Lost in the city',[74,75],'三个孩子规划参观伊斯坦布尔，却在拥挤的地铁站走散。Ali 提醒男孩们回到最后见到 Phoebe 的地方，他们才终于重聚。','''
Phoebe bought a guidebook and showed the boys the sights of Istanbul.|Phoebe 买了一本旅行指南，向男孩们展示伊斯坦布尔的景点。|guidebook：旅行指南。
They made a list of places to visit and decided to take the underground.|他们列好想去的地点，决定乘地铁。|decided to：决定。
At busy Taksim station, Alex and Patrick got onto a train.|在繁忙的 Taksim 站，Alex 和 Patrick 上了一列地铁。|got onto：登上。
The doors closed before Phoebe could join them.|Phoebe 还没来得及跟上，门就关了。|before 交代走散的先后关系。
The boys hoped to find her at the sights on their list.|男孩们希望在清单上的景点找到她。|hoped to：希望。
They visited several places, but they did not find her.|他们去了好几个地方，却没有找到她。|but 说明计划没有成功。
A friendly boy called Ali listened to their problem.|一个叫 Ali 的友好男孩听他们讲了遇到的问题。|listened to：认真听。
He suggested returning to the station where they had last seen Phoebe.|他建议回到他们最后看见 Phoebe 的那个车站。|suggested：建议。
Phoebe was still waiting there, and the friends were happy to be together again.|Phoebe 仍在那里等候，朋友们重聚后很开心。|still：仍然。
Before Ali could show them more sights, the yellow gate appeared near the escalator.|Ali 还没来得及带他们看更多景点，黄色门就在扶梯附近出现了。|故事中时间门打断了新的计划。
''',('孩子们在哪里走散？','蓝色清真寺。|Taksim 地铁站。|香料市场。',1,'第三、第四句交代地铁车门关闭造成走散。'),('Ali 的哪条建议帮助他们找到 Phoebe？','再去全部景点一次。|换一本更大的指南。|回到最后见到她的车站。',2,'第八句是关键转折。'))
u['reading']=P('The world in a room',[76,77],'教材用一个示例房间说明日常用品可能来自不同国家。例子属于书中的情境，不能当成今天每个品牌或每件商品的固定产地。','''
The reading asks us to look around an example bedroom.|阅读请我们环顾一个示例卧室。|an example 表明这是一个情境，不代表每个人的房间。
The trainers, clothes, phone and computer come from different countries in the text.|在文中，运动鞋、衣服、手机和电脑来自不同国家。|come from：来自。
The example trainers are made in Indonesia.|示例中的运动鞋产自印度尼西亚。|in the example；不是所有运动鞋都产于此。
The text mentions a computer from China and a car from Germany.|文中提到来自中国的电脑和来自德国的汽车。|mentions：提到。
Even the television programmes connect the room with other places.|甚至电视节目也让这个房间与其他地方发生联系。|connect ... with：把……与……联系起来。
We can check labels instead of guessing where an object was made.|我们可以查看标签，而不是猜物品在哪里制造。|labels：标签；依据阅读目标补充的方法。
The next page asks where our food comes from and how far it travels.|下一页询问食物来自哪里，以及运输了多远。|how far：多远。
Together, the pages show how everyday life is connected with the wider world.|这两页共同说明日常生活如何与更广阔的世界相联系。|wider world：更广阔的世界。
''',('如何确认自己一件物品的产地更可靠？','直接查看物品标签。|把书中电脑的产地套到所有物品。|只凭颜色猜。',0,'第六句建议 check labels instead of guessing。'),('这篇阅读的中心意思是什么？','每个人房间里的东西完全一样。|日常用品把我们与世界各地联系起来。|只有旅行才能接触别的地方。',1,'最后一句总结了 connected with the wider world。'))
u['world']=P('Planning a town',[78,79],'一个适合生活的小镇需要住宅、工作、交通和公共服务。规划时，要考虑不同人的需要，而不只是把建筑塞进地图。','''
Town planners think about how a town can be a good place to live.|城镇规划者思考怎样让一个城镇适合生活。|town planners：城镇规划者。
They need space for homes and places where people work.|他们需要为住宅和工作地点安排空间。|space：空间。
They consider how people will travel by foot, bus, train or car.|他们考虑人们如何步行或乘公交、火车和汽车出行。|consider：考虑。
Schools, libraries and hospitals provide important services.|学校、图书馆和医院提供重要服务。|services：服务。
Parks and playgrounds give people places to relax and play.|公园和游乐场提供休息、玩耍的场所。|relax：放松。
Different people may need different places near their homes.|不同的人可能需要不同的设施靠近住宅。|different needs：不同需要。
A useful plan explains both where a place is and why it belongs there.|有用的规划既说明地点在哪里，也说明为什么这样安排。|both ... and ...：既……又……。
''',('哪一组设施在文中用于公共服务？','私人住宅、车库、家庭花园。|学校、图书馆、医院。|货物仓库、工厂、私人办公室。',1,'第四句列出了这些服务设施。'),('好的规划除了画地点，还需要解释什么？','为什么把它安排在那里。|是否能只考虑汽车的需要。|是否让所有建筑使用同一张设计图。',0,'最后一句强调 why it belongs there。'))
C(u,'给小镇游客的一份指南',[73,79,80,81],['画一张有四处地点的小镇地图，用英语标注。','写两条 should 和一条 shouldn’t 的建议，并解释原因。','扮演游客与店员，用 Could I / Could you 完成一段购物问答。'],'Welcome to ...\nYou should ... because ...\nYou shouldn’t ...\nThe ... is next to ...\nCould I ... , please?\nCould you ... ?','Welcome to Green Town. You should visit the library because it has a room for children. You should bring comfortable shoes for the park. You shouldn’t leave litter. The gift shop is next to the library. Could I see that blue cup, please? Could you tell me the price?','地图位置说得清楚；建议后有原因；至少完成一问一答的礼貌请求。','依据 p79 规划项目、p80 购物角色扮演和 p81 游客建议写作新编；地图和店铺均为虚构。')

u=BOOK['units'][7]
u['story']=P('Helping Shakespeare',[86,87],'孩子们在虚构冒险中遇见 Shakespeare，帮助他处理不满意的观众，并讨论戏剧结尾。注意：这不是 Shakespeare 创作历史的记录。','''
In this fictional adventure, the children met Shakespeare at his theatre.|在这个虚构冒险中，孩子们在剧院遇见了 Shakespeare。|先区分小说情节与真实历史。
He was unhappy because the audience did not like his play.|他很难过，因为观众不喜欢他的戏。|because 解释感受。
Some angry men came to ask for their money back.|几个生气的人来要求退钱。|ask for：要求得到。
The children helped him escape a dangerous confrontation.|孩子们帮助他摆脱了一次危险冲突。|用概括理解情节，不模仿其中危险的舞台动作。
Shakespeare invited the children to have dinner at his house.|Shakespeare 邀请孩子们到家里吃饭。|invited：邀请。
They discussed the ending of Romeo and Juliet.|他们讨论了《罗密欧与朱丽叶》的结尾。|discussed：讨论。
In the story, Phoebe suggested a tragic ending instead of a happy one.|故事中，Phoebe 建议把快乐结尾改为悲剧结尾。|tragic：悲剧的；这是书中的穿越设定。
The angry men returned, but Shakespeare offered them free tickets to the new version.|那些生气的人又来了，但 Shakespeare 邀请他们免费观看新版。|version：版本。
This time the audience enjoyed the play and clapped at the end.|这一次观众喜欢这出戏，结束时鼓起掌来。|this time 对比上一次演出。
As the children went towards the stage, they saw the yellow gate and stepped through it.|孩子们走向舞台时，看见了黄色门，便穿门而过。|再次进入下一次冒险。
''',('Shakespeare 起初为什么难过？','因为观众不喜欢他的戏。|因为所有演员都拒绝上台。|因为他忘记了自己写的台词。',0,'第二句说明 audience had disliked his play。'),('以下哪种阅读方式正确？','把孩子们修改结尾当成真实历史。|知道这是让历史人物进入时空冒险的虚构故事。|认为每次真实演出都会出现时空门。',1,'开头和第七句均明确限定为 fictional adventure。'))
u['reading']=P('A clever woman',[89],'一头牛失踪了。聪明的女主人没有真的靠狗“识别小偷”，而是利用小偷的害怕，观察谁没有摸狗。重点是用证据解释推理。','''
Three travellers asked Marlowe for a place to sleep.|三位旅人请求 Marlowe 提供过夜的地方。|asked ... for：向……请求。
He let them stay in the stable and gave them soup.|他让他们住在马厩里，还给他们汤。|stable：马厩。
During the night, one man took a cow into the forest and tied it to a tree.|夜里，一个人把一头牛牵进森林，拴在树上。|during the night：夜间。
When the cow was missing, all three men denied taking it.|牛不见后，三个人都否认拿走了牛。|denied：否认。
Marlowe's wife said that their dog Barney would bark when the thief stroked him.|Marlowe 的妻子说，小偷摸狗 Barney 时，狗会叫。|这是她设下的测试，并非证实狗有魔法。
Each man went into the room, but Barney stayed quiet.|每个人都进了房间，但 Barney 一直安静。|stayed quiet：保持安静。
The woman then smelled their hands because Barney had a strong smell.|随后她闻了他们的手，因为 Barney 身上有很重的气味。|because 解释这个检查的依据。
The thief's hand did not smell of the dog: he was too afraid to touch it.|小偷的手没有狗的气味：他太害怕了，没有摸狗。|证据是手上的气味，而不是狗叫。
''',('女主人最后用什么证据判断谁没有摸狗？','谁的衣服上有泥土。|谁的手没有狗的气味。|谁的手里拿着绳子。',1,'第七、八句说明通过闻手来判断。'),('小偷为什么不摸 Barney？','他害怕狗会叫并揭穿自己。|他知道牛已经回来。|他根本没有进入房间。',0,'他相信女主人的话，所以害怕触摸狗。'))
u['world']=P('Poems can take many shapes',[90,91],'诗可以写人、动物、东西和感受；可以押韵，也可以不押韵。练习三种形式：故事诗、颜色诗、藏头诗。','''
A poem can be about a person, an object, an animal or a feeling.|诗可以写一个人、一件物品、一种动物或一种感受。|feeling：感受。
Some poems rhyme, but rhyme is not a rule for every poem.|有些诗押韵，但并不是每首诗都必须押韵。|not ... every：不是每一个都……。
Words can create pictures in the reader's mind.|词语可以在读者脑海中形成画面。|mind：头脑、心里。
A story poem can introduce characters and a place.|故事诗可以介绍人物和地点。|characters：人物。
A colour poem gathers interesting things of the same colour.|颜色诗可以把同一种颜色的有趣事物放在一起。|gathers：聚集。
In an acrostic, the first letters of the lines spell a chosen word.|在藏头诗里，每一行的首字母拼出选定的词。|acrostic：藏头诗。
Reading poems aloud helps us notice their sound and rhythm.|大声朗读诗有助于发现它们的声音与节奏。|aloud：出声地。
''',('诗一定要押韵吗？','必须，否则就不是诗。|不一定。|只有颜色诗才可以不押韵。',1,'第二句说明 rhyme is not a rule for every poem。'),('acrostic 的特点是什么？','每行最后一个词都必须相同。|每行必须有相同的词数。|各行首字母能拼出一个词。',2,'第六句给出藏头诗的定义。'))
C(u,'诗歌小舞台',[83,85,91,92,93],['选 story poem、colour poem 或 acrostic 写 4–6 行原创小诗。','用 I’ll 说自己为朗诵准备什么，用 have/has just 汇报一项已完成的准备。','朗读自己的诗，再用中文解释最喜欢的一行；也可简单统计家人喜欢哪一首。'],'I’ll ...\nI have just ...\nMy poem is about ...\n[Write four to six lines here.]\nMy favourite line is ... because ...','I’ll read my colour poem. I have just written four lines. Blue is the sea in my picture. Blue is the cup on my desk. Blue is a bird in my dream. Blue is the sky after rain. My favourite line is about the bird because it is something I imagined.','能说出承诺与刚完成的动作；诗有清楚主题；能解释诗句而不只是念出来。','依据 p91 诗歌创作和 p92 阅读调查目标新编；英文范例为原创，不转载原书署名诗作。')

u=BOOK['units'][8]
u['story']=P('The trouble with Orangehead XR-97',[98,99],'孩子们在未来博物馆发现危险机器人。救出程序员 Don 后，他们听从专业帮助，在机器人暂停充电时阻止了它。故事也提醒读者不要忽略禁入标志。','''
The children explored a museum where old cars and motorbikes were exhibits.|孩子们参观一座把旧汽车和摩托车作为展品的博物馆。|exhibits：展品；背景是未来。
Patrick ignored a Do not enter sign and opened a door.|Patrick 无视“请勿进入”标志，打开一扇门。|ignored：忽略；这是引出危险的行为。
Inside, they heard a robot with an orange head planning to take over the world.|在里面，他们听见一个橙色脑袋的机器人计划统治世界。|take over：控制、接管。
The frightened children left and heard someone calling for help.|受惊的孩子们离开后，听见有人呼救。|calling for help：呼救。
A man was trapped inside a submarine, and they helped him get out.|一个人被困在潜水艇里，他们帮助他脱困。|trapped：被困。
His name was Don, and he was the robots’ programmer.|他叫 Don，负责给机器人编程。|programmer：程序员。
He explained that Orangehead XR-97 was now dangerous.|他解释说 Orangehead XR-97 已变得危险。|由了解机器人的人解释问题。
Don knew the robots stopped for five minutes each morning to charge their batteries.|Don 知道机器人每天早晨会停下五分钟给电池充电。|charge their batteries：给电池充电；仅指故事设定。
The children hid among the exhibits while they waited.|孩子们等待时藏在展品中。|while 连接同时进行的背景动作。
At 6.55, Don worked quickly at the computer while the robots were stopped.|六点五十五分，机器人暂停时，Don 在电脑前迅速工作。|不要把剧情当成现实机器的操作说明。
His plan stopped Orangehead XR-97, and the yellow gate appeared.|他的计划阻止了 Orangehead XR-97，黄色门出现了。|stopped：使停止、阻止。
The children waved goodbye to Don and left through the light.|孩子们向 Don 挥手告别，从光里离开。|按问题—求助—解决—离开的顺序复述。
''',('Don 为什么选择早晨 6:55 行动？','那时机器人暂停五分钟充电。|那时孩子们能买到博物馆门票。|那时机器人会离开博物馆一整天。',0,'第八、十句说明充电暂停提供了机会。'),('谁最了解机器人并在电脑前解决问题？','Alex。|程序员 Don。|Patrick。',1,'Don 是机器人的程序员，最后由他执行计划。'))
u['reading']=P('A firefighter’s story',[101],'采访中的女性消防员曾从事其他工作。一次带学生参观消防站让她重新追求小时候的理想；她最重视的是帮助别人、挽救生命。','''
The interview is with a woman who works as a firefighter.|这篇采访的对象是一位女性消防员。|interview：采访。
Her grandfather and uncle were firefighters, so she knew about the job when she was young.|她的祖父和叔叔都是消防员，所以她小时候就了解这份工作。|so 说明原因与结果。
She first worked in a circus and later became a sports teacher.|她先在马戏团工作，后来成为体育老师。|first / later：先后顺序。
One day, she took schoolchildren to visit a fire station.|一天，她带学生参观消防站。|fire station：消防站。
The visit reminded her how much she wanted to become a firefighter.|这次参观让她重新想起自己多么想成为消防员。|reminded her：提醒她、使她想起。
A year later, she was doing that job herself.|一年后，她自己也做起了这份工作。|a year later：一年后。
She enjoys the variety of working times and the friendships at the station.|她喜欢工作时间的变化，也喜欢消防站里的伙伴情谊。|variety：变化、多样性。
For her, the best part is doing important work and saving lives.|对她而言，最棒的是做有意义的工作并挽救生命。|the best part：最好的部分。
''',('什么经历让她重新想成为消防员？','开始在马戏团工作。|观看一场电视采访。|带学生参观消防站。',2,'第五句说明这次参观重新点燃了她的职业兴趣。'),('她认为工作最棒的部分是什么？','每天都在完全相同的时段工作。|做重要的工作并挽救生命。|可以经常和丈夫在同一个消防站值班。',1,'最后一句给出了她最重视的价值。'))
u['world']=P('Fractions in a museum',[102,103],'把一个整体等分，得到分数。用门票和零花钱练习 half、third、quarter；先确认每份一样大。','''
A fraction describes part of a whole.|分数表示一个整体的一部分。|fraction：分数；whole：整体。
If we divide a whole into two equal parts, each part is one half.|如果把整体分成相等的两份，每份是二分之一。|equal 是关键：每份大小相同。
Three equal parts make thirds, and four equal parts make quarters.|等分成三份得到三分之一份，等分成四份得到四分之一份。|thirds、quarters 是复数形式。
Two quarters are the same amount as one half.|两个四分之一与一个二分之一一样多。|the same amount：同样多。
In the textbook ticket example, adults pay twelve pounds and children pay half price.|教材的门票例子中，成人付十二英镑，儿童付半价。|这是题目中的示例票价，不是现实博物馆价格。
Half of twelve pounds is six pounds.|十二英镑的一半是六英镑。|用除以二核对。
If Sara has eight pounds and spends a half and a quarter of it, she has two pounds left.|Sara 有八英镑，花掉一半和四分之一后，还剩两英镑。|8−4−2=2；left：剩下的。
''',('two quarters 等于多少？','one half|one third|three quarters',0,'两个四分之一是 2/4，等于 1/2。'),('Sara 有 £8，花掉一半和四分之一，还剩多少？','£6|£4|£2',2,'一半是 £4，四分之一是 £2，8−4−2=2。'))
C(u,'设计一位未来小帮手',[95,97,103,104,105],['画一个虚构机器人，写出它能帮忙的三件事。','用两句 if ... will ... 解释功能，再用 What if ...? 提出一个问题和备用方案。','给它一天安排 4 个相等的时间格，用 quarter 或 half 解释安排。'],'My imaginary robot is called ...\nIf ..., it will ...\nIf ..., it will ...\nWhat if ...? Then ...\nIt spends one quarter of its time ...','My imaginary robot is called Book Buddy. If I cannot find a story, it will help me search the shelf. If a book is out of place, it will show me the right shelf. What if its battery is low? Then it will stop and ask for help. It spends one quarter of its time charging.','能说清两个条件与结果、一个备选计划，并用分数说明等分的时间；明确机器人是自己的想象设计。','依据 p95、97 条件句，p103 分数项目和 p105 机器人广告新编。')

u=BOOK['units'][9]
u['story']=P('The Mary Celeste',[110,111],'孩子们在船上被发现并关进船舱。绿色门带走了水手，黄色门把孩子们送回学校；可同学说科学课还没开始，留下一个时间谜题。时空门解释属于小说。','''
The children hid in a lifeboat and watched the sailors.|孩子们躲在救生艇里观察水手。|hid 是 hide 的过去式。
Patrick sneezed, so two sailors discovered them.|Patrick 打了个喷嚏，因此两位水手发现了他们。|sneezed：打喷嚏；so 表示结果。
The worried captain ordered the children to be locked in his cabin.|忧心忡忡的船长命人把孩子们关进他的船舱。|ordered：命令。
Phoebe found the captain's diary and read about his feeling that something was wrong.|Phoebe 找到船长的日记，读到他觉得事情不对劲。|diary：日记；不是客观证明发生了什么。
Through the porthole, the children saw strange green lights.|透过舷窗，孩子们看见奇怪的绿光。|porthole：舷窗。
Their own gate was yellow, so these green gates surprised them.|他们自己的门是黄色的，所以这些绿色门让他们惊讶。|颜色差异是关键线索。
They got out of the cabin and saw a sailor disappear into a green gate.|他们离开船舱，看见一个水手消失在绿色门里。|这是小说中的超自然情节。
Soon the ship was silent, and no sailors were left.|很快，船安静下来，水手都不见了。|were left：剩下来。
Alex remembered the mystery of a ship called the Mary Celeste.|Alex 想起了一艘叫 Mary Celeste 的船的谜团。|书中把真实船名与虚构时间门联系起来。
Then their yellow gate appeared and took them back to the school playground.|随后，他们的黄色门出现，把他们送回学校操场。|back to：回到。
They told their friends about the Science lesson and the amazing journey.|他们告诉朋友们科学课和奇妙旅程的事。|journey：旅程。
But their friends said Science was still to come that afternoon, leaving a new puzzle.|但朋友们说科学课要到当天下午才上，于是又出现了一个谜题。|结尾没有完全解决“是否回到正确时间”的问题。
''',('水手为什么发现了躲藏的孩子们？','因为 Patrick 打了喷嚏。|因为 Phoebe 向水手大声求助。|因为 Alex 从救生艇里主动走出来。',0,'第二句给出声音与被发现的因果关系。'),('回到学校后，哪句话留下时间上的谜题？','朋友们正在操场玩。|同学说科学课还没有上。|孩子们想讲自己的旅程。',1,'孩子们已经历科学课事故，同学却说科学课在下午才开始。'))
u['reading']=P('Reading a sea mystery carefully',[112],'教材把百慕大三角的报道和不同解释放在一起。练习区分地点、报道中的事件和未经证实的猜想，不把神秘解释直接当成事实。','''
The article discusses the Bermuda Triangle in the Atlantic Ocean.|文章讨论大西洋中的百慕大三角。|Atlantic Ocean：大西洋。
It describes an area between Florida, Bermuda and Puerto Rico.|它描述佛罗里达、百慕大和波多黎各之间的一片区域。|between：在……之间。
The text refers to reports of missing ships and planes.|文章提到了船只和飞机失踪的报道。|reports：报道；阅读时要关心证据。
It gives examples from 1918 and 1945.|它列出了来自 1918 年和 1945 年的例子。|这是文中选取的历史例子。
It also explains that the area has much sea traffic and can have bad weather.|文章也解释说该区域海上交通繁忙，可能遇到恶劣天气。|traffic：交通；weather：天气。
Some people in the text offer mysterious explanations, such as aliens.|文中有些人提出外星人等神秘解释。|some people say 不等于已经证明。
A suggestion is not the same as evidence that it happened.|一种猜想不等于证明事情发生过的证据。|evidence：证据。
A careful reader asks what is known, what is reported and what is only a guess.|仔细的读者会问：哪些已知，哪些来自报道，哪些只是猜想？|阅读目标是区分信息的可靠程度。
''',('文中把百慕大三角放在哪个大洋？','太平洋。|印度洋。|大西洋。',2,'第一句明确写出 Atlantic Ocean。'),('读到“有些人认为是外星人”时，应该怎样理解？','这是文中提到的一种猜想，并非已被证明。|这已经证明外星人带走了船。|这说明每位水手都见过外星人。',0,'第六、七句区分 suggestion 与 evidence。'))
u['world']=P('Oceans, rivers and salt',[114,115],'认识五大洋，并理解海水为什么比河水咸。只保留基本水循环概念，不沿用旧版对海域连接关系和极值测量的有误或过时描述。','''
Oceans are very large areas of salt water.|海洋是面积非常大的咸水区域。|salt water：咸水。
The five oceans are the Pacific, Atlantic, Indian, Arctic and Southern Oceans.|五大洋是太平洋、大西洋、印度洋、北冰洋和南冰洋。|把英文名称与地图相连。
The Pacific is the largest ocean, and the Arctic is the smallest.|太平洋是最大的海洋，北冰洋是最小的。|largest / smallest：最大/最小。
Rivers carry tiny amounts of dissolved salts from rocks and soil towards the sea.|河流把来自岩石和土壤的微量溶解盐分带向海洋。|dissolved：溶解的。
When seawater evaporates, the water leaves but most of the salt stays behind.|海水蒸发时，水离开，而大部分盐留了下来。|evaporates：蒸发。
Water returns as rain and continues moving through the water cycle.|水以雨的形式返回，并在水循环中继续移动。|water cycle：水循环。
Over long periods, these processes help make seawater salty.|长期以来，这些过程促成了海水的咸味。|processes：过程；这是简化的概念模型。
''',('海水蒸发时，盐通常怎样？','全部随水一起蒸发。|大部分留在海水中。|全部被带回河流中。',1,'第五句说明 most of the salt stays behind。'),('哪个大洋最大？','Arctic Ocean|Indian Ocean|Pacific Ocean',2,'第三句明确写出 Pacific is the largest。'))
C(u,'给时空旅程写结尾报告',[109,115,116,117],['选择三站冒险，每站写“地点—问题—办法—结果”四个关键词。','用 and、but、because、so 写 6–9 句连贯总结，并说明结尾还留下什么问题。','加两句 already/yet 汇报自己的学习进度；口述时区分故事想象与真实地理知识。'],'The Time Travellers visited ...\nThey had a problem because ...\nThey ... , so ...\nAt the end, ... but ...\nI have already ...\nI haven’t ... yet.','The Time Travellers visited a rainforest, a future museum and a ship. In the rainforest, they were hungry, so they looked for help. In the museum, Don helped them stop a dangerous robot. On the ship, green gates appeared, but their own gate was yellow. At the end, they returned to school, but their friends said Science was still to come. I have already read the ending. I haven’t solved the time puzzle yet.','能按顺序讲述至少三站，使用因果与转折连词，说明开放式结尾，并正确使用 already/yet。','依据 p109 进度问答、p116 小组展示和 p117 全故事总结新编；不要求为未解结尾编造唯一标准答案。')

BOOK['glossary']=[
 dict(word='gate',zh='门；故事中的时空门'),dict(word='past',zh='过去'),dict(word='future',zh='未来'),
 dict(word='disappear',zh='消失'),dict(word='disappeared',zh='消失了'),dict(word='warn',zh='提醒危险；警告'),
 dict(word='erupt',zh='喷发'),dict(word='eruption',zh='喷发'),dict(word='magma',zh='地表下的岩浆'),dict(word='lava',zh='流到地表的熔岩'),
 dict(word='crater',zh='火山口'),dict(word='ash',zh='灰；火山灰'),dict(word='rainforest',zh='雨林'),dict(word='protect',zh='保护'),
 dict(word='respect',zh='尊重'),dict(word='tribe',zh='部落；族群'),dict(word='howler monkey',zh='吼猴'),dict(word='present',zh='礼物；现在的'),
 dict(word='dressing room',zh='化妆间'),dict(word='rhythm',zh='节奏'),dict(word='crotchet',zh='四分音符'),dict(word='quaver',zh='八分音符'),
 dict(word='course',zh='一道菜；课程'),dict(word='starter',zh='前菜'),dict(word='dessert',zh='甜点'),dict(word='bill',zh='账单'),
 dict(word='steam',zh='蒸汽'),dict(word='ingredients',zh='食材；原料'),dict(word='recipe',zh='食谱'),dict(word='gold',zh='黄金'),
 dict(word='leather',zh='皮革'),dict(word='wood',zh='木头'),dict(word='metal',zh='金属'),dict(word='cotton',zh='棉'),
 dict(word='guidebook',zh='旅行指南'),dict(word='underground',zh='地铁；地下的'),dict(word='escalator',zh='自动扶梯'),
 dict(word='souvenir',zh='纪念品'),dict(word='tradition',zh='传统'),dict(word='poem',zh='诗'),dict(word='poetry',zh='诗歌'),
 dict(word='acrostic',zh='藏头诗'),dict(word='rhyme',zh='押韵'),dict(word='evidence',zh='证据'),dict(word='thief',zh='小偷'),
 dict(word='stable',zh='马厩'),dict(word='submarine',zh='潜水艇'),dict(word='battery',zh='电池'),dict(word='exhibit',zh='展品'),
 dict(word='fraction',zh='分数'),dict(word='half',zh='一半'),dict(word='quarter',zh='四分之一；一刻钟'),dict(word='equal',zh='相等的'),
 dict(word='already',zh='已经'),dict(word='yet',zh='还；已经（用于否定或疑问）'),dict(word='just',zh='刚刚；恰好'),
 dict(word='Atlantic',zh='大西洋的；大西洋'),dict(word='Pacific',zh='太平洋的；太平洋'),dict(word='Arctic',zh='北极的；北冰洋'),
 dict(word='evaporation',zh='蒸发'),dict(word='journey',zh='旅程'),dict(word='mystery',zh='谜团'),dict(word='imaginary',zh='想象中的'),
 dict(word='fictional',zh='虚构的'),dict(word='because',zh='因为'),dict(word='while',zh='当……的时候'),dict(word='meanwhile',zh='与此同时')]
