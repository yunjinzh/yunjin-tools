"""Super Minds 6: source-grounded, segmented bilingual learning course.
Authoring sources are the supplied Student's Book. Printed page = PDF page.
"""
from book_helpers import vocab, q, passage, grammar, phonics

TEACHER = '未提供第六册教师用书；依据学生用书编写'
BOOK = {
 'number': 6, 'title': 'Super Minds 6',
 'edition': 'Cambridge University Press · 所上传学生用书扫描版',
 'sourceNote': '依据所上传的 Super Minds 6 学生用书，覆盖导入单元及 9 个正式单元。故事与阅读卡为标明页码的分段教学改写，题目、例句与表达支架为新编；完整原页可对照查看。没有提供第六册教师用书或原版音频，不把听力空格推测成标准答案。旧版材料的交通统计、开放时间与预测不作今日事实使用；冒险情节是虚构故事，不是现实操作指导。',
 'bookSummary': '跟随 Alex、Phoebe 和 Patrick 穿越时空，把长故事拆成因果线索；学会解释、比较、转述和提出假设。',
 'storyGuide': '返校实验 → 海盗宝藏 → 未来交通 → 古埃及 → 奥运赛场 → 伦敦大火 → 发明实验室 → 休斯敦 → 冰雪世界 → 恐龙追逐与归来',
 'teacherAvailable': False, 'pageMin': 2, 'pageMax': 127,
 'pageBase': 'books/6/pages', 'grammarAppendix': True,
 'units': []
}

def unit(i,title,zh,start,end,icon,goal,words,g1,g2,songtitle,songpage,typ='song'):
 u=dict(id=i,title=title,zh=zh,start=start,end=end,icon=icon,goal=goal,
        teacher=TEACHER,grammarPage=118+i,vocab=vocab(words),grammar=[g1,g2],
        song=dict(title=songtitle,page=songpage,type=typ,task=[]),extra=[])
 BOOK['units'].append(u)
 return u

def G(title,rule,examples,p1,o1,a1,w1,p2,o2,a2,w2):
 return grammar(title,rule,examples,[q(p1,o1,a1,w1,'grammar'),q(p2,o2,a2,w2,'grammar')])

u=unit(0,'Back to school','重返学校',4,9,'🏫','按原因与结果复述实验事故，区分“已经”和“还没有”。',
'''basketball hoop|篮球架上的篮圈|The basketball hoop is above the net.
tennis court|网球场|We meet beside the tennis court.
net|网；球网|The ball went over the net.
football pitch|足球场|The football pitch is behind our school.
railings|栏杆|Please stay inside the railings.
running track|跑道|We walked around the running track.
bike rack|自行车停放架|My bike is in the bike rack.
litter bin|垃圾桶|Put the paper in the litter bin.
school bell|学校的铃|The school bell has already rung.''',
G('already / yet：已经与尚未','现在完成时：have / has + 过去分词。already 通常在肯定句中，yet 常放在否定句或问句末尾。','I have already packed my bag.|我已经收拾好书包了。\nShe has not finished the experiment yet.|她还没有完成实验。','I have ___ read the instructions.','already|yet|tomorrow',0,'肯定句表示“已经读过”，用 already。','Has Patrick put on his goggles ___?','already yesterday|yet|ago',1,'问“已经戴好了吗”，yet 放在疑问句末尾。'),
G('who / which / where：补充说明','who 介绍人，which 介绍物；where 介绍事情发生的地点。先找被说明的名词。','Alex is the boy who wears glasses.|Alex 是戴眼镜的男孩。\nThis is the lab where we study science.|这是我们学科学的实验室。','Phoebe is the friend ___ reads carefully.','where|which|who',2,'friend 指人，后面用 who。','This is the room ___ the accident happened.','where|who|which it',0,'这里说明事故发生的地点，用 where。'),
'The Time Travellers',6)
u['song']['task']=['翻到第 6 页，找到歌词中的地点和人物；这里只提供电脑语音，不提供原曲。','从歌词和第 7 页对话各选一个以前的冒险，说明它发生在哪里。','说两句新句子：They have already … / They have not … yet.']
u['phonics']=phonics('双元音：/aɪ/ 与 /eɪ/','对应第 6 页 Spelling patterns。比较 nice / exciting 的 /aɪ/ 与 tasty / amazing 的 /eɪ/；字母不同也可能有相同元音。下面为新编朗读词组。','nice|exciting\ntasty|amazing\ntime|gate',6,[q('哪个词与 nice 含有相同的 /aɪ/ 元音？','time|gate|net',0,'nice 与 time 含 /aɪ/；gate 是 /eɪ/，net 是 /e/。','phonics')])

u=unit(1,'The treasure','海盗的宝藏',10,21,'🏴‍☠️','讲清宝藏属于谁，并用 for / since 介绍珍爱的物品。',
'''palm tree|棕榈树|The treasure is near a palm tree.
spade|铲子|The gardener uses a spade.
hook|钩子|A coat hangs on the hook.
hammock|吊床|There is a hammock between the trees.
eye-patch|眼罩|The pirate wears an eye-patch in the picture.
treasure chest|宝箱|The treasure chest has a heavy lid.
coins|硬币|There are old coins in the box.
key|钥匙|This key opens the little chest.
hole|洞；坑|The children noticed a hole in the sand.
binoculars|双筒望远镜|We use binoculars to watch birds.''',
G('for / since：持续了多久','现在完成时中，for + 一段时间，since + 开始的时间点。for three years；since 2022。','I have had this book for two years.|这本书我已经拥有两年了。\nShe has known him since primary school.|她从小学起就认识他。','I have lived here ___ six months.','since|for|at',1,'six months 是时长，用 for。','He has liked ships ___ he was seven.','for|during|since',2,'he was seven 给出起点，用 since。'),
G('How long … ?：询问持续时间','How long have / has + 主语 + 过去分词 … ? 用 for 或 since 回答。','How long have you had your binoculars?|你有这副望远镜多久了？\nI have had them since my birthday.|从生日那天起我就有了。','___ have you known your friend? — For five years.','How long|How many|How far',0,'回答是时长，因此问 How long。','How long ___ she had this key?','have|has|is',1,'主语 she，用 has + 过去分词 had。'),
'Get on board!',12)
u['song']['task']=['在第 12 页找出海盗旅行和寻宝的词；读懂情节，不把海盗行为当作榜样。','找出一句 have + 过去分词，说明它表达的经历。','用英语说一种真正珍爱的“treasure”，可以是一张画或一本书。']
u['phonics']=phonics('-sure 与 -ture','对应第 12 页。treasure、pleasure 中常听到 /ʒə/；nature、adventure 的结尾常有 /tʃə/。听电脑语音后慢读，注意 /tʃ/ 前有短暂阻塞。','treasure|pleasure\nnature|adventure\nmeasure|picture',12,[q('哪个词的结尾和 treasure 的 -sure 更接近？','picture|nature|pleasure',2,'treasure 与 pleasure 的结尾都是 /ʒə/ 一类声音。','phonics')])

u=unit(2,'Future transport','未来交通',22,33,'🚝','分清必须做的准备与未来预测，用证据解释 Patrick 的困难。',
'''monorail|单轨列车|The monorail runs above the road.
cable car|缆车|The cable car goes up the mountain.
parachute|降落伞|The story shows a colourful parachute.
solar panel|太阳能板|There is a solar panel on the roof.
microlight|超轻型飞机|We saw a microlight in a photograph.
hang-glider|悬挂式滑翔机|The hang-glider has wide wings.
jet pack|喷气背包|The imaginary jet pack can fly.
wind turbine|风力发电机|The wind turbine turns in the wind.
surfboard|冲浪板|The blue surfboard is beside the sea.
floating skateboard|悬浮滑板|The future city has floating skateboards.''',
G('need to / do not need to','need to + 动词原形表示需要做；do not need to 表示没有必要做，不是“禁止做”。主语 he / she 用 needs / does not need。','You need to read the instructions.|你需要读说明书。\nWe do not need to hurry today.|我们今天不用着急。','You need ___ the safety instructions.','reading|to read|readed',1,'need to 后接动词原形 read。','You do not need to bring a pen. 意思是？','你不必带笔。|你绝对不能带笔。|你已经丢了笔。',0,'do not need to 表示没有必要，不等于 must not。'),
G('will / will not：预测未来','will + 动词原形；will not 可缩写为 won’t。预测是看法，不是已经证实的事实。','I think more people will use trains.|我认为会有更多人使用列车。\nPerhaps future cars will not need petrol.|也许未来汽车不需要汽油。','In my future city, buses ___ be quieter.','were|having|will',2,'在预测未来，使用 will + 动词原形。','Which sentence is a prediction?','I think travel will be easier.|I travelled yesterday.|I am on a bus now.',0,'will be 表示对未来的预测；另外两句是过去或现在。'),
'Expressing interest：表现出兴趣',24,'dialogue')
u['song']['task']=['阅读第 24 页 Mia 和 Josh 的对话，找出 Really? / Tell me more. / Wow!。','说清 Josh 为什么担心 Mia，再选一个安全的爱好做双人对话。','听对方说完，回应一句表示兴趣的话，再问一个相关问题。']
u['phonics']=phonics('对话语气：表示兴趣','这是依据第 24 页功能对话新编的发音练习，不是本单元原版 phonics 专页。把 Really? 和 Tell me more. 当作完整意群，留意语气。','Really?|Tell me more.\nI see.|That sounds interesting.\nWow!|What happened next?',24,[q('哪一句最能鼓励别人继续介绍爱好？','Tell me more.|Put it in the bin.|It is a red key.',0,'Tell me more. 表示“多告诉我一些”，用于表达兴趣。','phonics')])

u=unit(3,'Ancient Egypt','古埃及',34,45,'🔺','按顺序解释故事和形状，用被动语态说明物品怎样被制作。',
'''pyramid|金字塔；棱锥|We made a paper pyramid.
Sphinx|狮身人面像|The Sphinx appears in our history picture.
pharaoh|法老|A pharaoh was a ruler of Ancient Egypt.
chariot|古代双轮马车|The museum has a model chariot.
slaves|奴隶；被奴役的人|The text uses the word slaves for people who were not free.
rock|岩石|The model stands on a flat rock.
hieroglyphics|象形文字|The wall has pictures of hieroglyphics.
tomb|陵墓|The guide showed us a photograph of a tomb.
mummy|木乃伊|There is a mummy in the adventure story.''',
G('过去时被动语态','was / were + 过去分词，强调某物“被怎样处理”。单数用 was，复数用 were。例句练语言，不把旧教材的古代施工推测当成已证实史实。','The model was made from paper.|模型是用纸做的。\nThe pictures were painted yesterday.|这些画是昨天画的。','The paper pyramid ___ made yesterday.','were|was|has',1,'pyramid 是单数，过去时被动语态用 was made。','The stones were ___ to the museum.','take|taking|taken',2,'被动语态用过去分词，take 的过去分词是 taken。'),
G('a lot of / a few / a little','a lot of / lots of 可接可数复数或不可数名词；a few + 可数复数，a little + 不可数名词。','There are a few symbols on the wall.|墙上有几个符号。\nWe need a little water and a lot of paper.|我们需要一点水和很多纸。','We have ___ small stones.','a few|a little|much a',0,'stones 可数且为复数，表示几个用 a few。','There is ___ water in the cup.','a few|a little|many',1,'water 是不可数名词，表示一点用 a little。'),
'In old Cairo',36)
u['song']['task']=['在第 36 页标出故事发生的地点和出现的人物。','用三句英语说出“发现木乃伊 → 逃跑 → 木乃伊回到墓中”的歌曲情节。','找出过去式动词，按 /t/、/d/、/ɪd/ 分类读一读；原曲需自备音频。']
u['phonics']=phonics('-ed 的三种读法','对应第 36 页。清辅音（/t/ 除外）后常读 /t/；浊辅音（/d/ 除外）和元音后常读 /d/；/t/、/d/ 后读 /ɪd/，增加一个音节。','looked|watched\nplayed|opened\nwanted|shouted',36,[q('哪一个词的 -ed 读 /ɪd/，增加一个音节？','looked|played|wanted',2,'want 末尾是 /t/，wanted 的 -ed 读 /ɪd/。','phonics')])

u=unit(4,'Olympic sports','奥运运动',46,57,'🏅','提出并回应建议，说明已安排的计划，按线索复述赛场经历。',
'''long jump|跳远|We watched the long jump at school.
gymnastics|体操|She practises gymnastics with her coach.
rowing|赛艇运动|The rowing team trains on the lake.
archery|射箭|We saw an archery competition on TV.
high jump|跳高|The high jump starts at ten.
wrestling|摔跤|The wrestling match was exciting.
hurdles|跨栏|The runner cleared the hurdles.
weightlifting|举重|Weightlifting needs careful training.
fencing|击剑|The fencing team wears special equipment.
boxing|拳击|The poster shows a boxing match.''',
G('We could … ：提出建议','could + 动词原形，可委婉提出建议。用 Sounds good. 接受，用 I’m not too keen on that. 温和表达不太喜欢。','We could watch the rowing.|我们可以看赛艇。\nWe could go after lunch.|我们可以午饭后去。','We could ___ the high jump.','watching|watched|watch',2,'情态动词 could 后接原形 watch。','哪一句是友善地提出建议？','You always make mistakes.|We could try the art club.|I went there yesterday.',1,'We could … 是本单元建议句型。'),
G('现在进行时表示安排','be + 动词 -ing 配合 tomorrow、on Saturday 等时间词，可以表示已经安排好的将来活动。','I am meeting my coach tomorrow.|我明天要见教练。\nThey are playing a match on Saturday.|他们周六要打一场比赛。','She ___ playing tennis tomorrow.','is|are|does',0,'she 与 is 搭配，再接 playing。','“We are meeting at three tomorrow.” 表达什么？','过去的经历|已经安排的会面|永远不变的习惯',1,'tomorrow 提示将来；现在进行时这里表示已安排的活动。'),
'Saying that you are not interested：表达不感兴趣',48,'dialogue')
u['song']['task']=['在第 48 页找到 Olivia 的三个建议，并读出 Charlie 的回应。','任选两个课后活动，用 We could … 提建议，并补充真实理由。','练习不同意时保持礼貌，再共同选一个双方都愿意的活动。']
u['phonics']=phonics('按意群读：建议与回应','依据第 47–48 页对话新编。could 后紧接动词，重读活动名称；礼貌回应可以分成“先表态 / 再解释”两块。','We could watch rowing.|Sounds good to me.\nI am not too keen on that.|What about tennis?\nSorry, but I cannot swim.|We could choose another club.',48,[q('朗读 We could watch the rowing. 时，could 后应接哪个形式？','watch|watched|watching',0,'could 后跟动词原形；连贯读 could watch。','phonics')])

u=unit(5,'In London','伦敦之旅',58,69,'🌉','先讲经历再补充时间细节，辨认伦敦景点与印象派画作。',
'''chemist’s|药店|The chemist’s is next to the station.
tailor’s|裁缝店|The tailor’s makes and repairs clothes.
barber’s|理发店|He went to the barber’s for a haircut.
baker’s|面包店|We bought fresh bread at the baker’s.
grocer’s|食品杂货店|The grocer’s sells fruit and vegetables.
butcher’s|肉店|There is a butcher’s on the high street.
jeweller’s|珠宝店|The jeweller’s displays rings in the window.
carpenter’s|木匠作坊|The carpenter’s has wooden chairs.''',
G('Have you ever … ? / never','Have / Has + 主语 + ever + 过去分词，询问到现在为止有没有某经历。never 表示从未，不再加 not。','Have you ever visited a castle?|你曾参观过城堡吗？\nI have never seen a wax figure.|我从未见过蜡像。','Have you ever ___ to London?','go|been|went',1,'现在完成时用过去分词 been。','她从未去过那儿：She has ___ been there.','never|not never|no',0,'never 已含否定，不用 not never。'),
G('经历与具体过去时间','现在完成时谈经历；出现 yesterday、last week 等明确过去时间时，用一般过去时补充细节。','I have been to the museum.|我去过那家博物馆。\nI went there with my aunt last week.|我上周和阿姨去的。','Have you seen the bridge? — Yes, I ___ it yesterday.','have seen|will see|saw',2,'yesterday 指明确的过去时间，用 saw。','哪一句自然地补充过去的细节？','I visited it last Sunday.|I have visited it yesterday.|I visit it tomorrow yesterday.',0,'last Sunday 应与一般过去时 visited 搭配。'),
'Have you … ?',60)
u['song']['task']=['在第 60 页歌词中找到 London、Paris、New York。','把 Have you ever … ? 读成完整问题，再给一个真实回答。','如果回答 Yes，补充 I went … / I saw … 和一个具体时间。']
u['phonics']=phonics('/s/ 与 /z/：声音是否振动','对应第 60 页。/s/ 像轻轻的嘶声，/z/ 发音时声带振动；相同字母 s 不一定发相同的音。','city|zoo\nhissing|buzzing\nsnake|bees',60,[q('哪个词开头是 /z/？','snake|city|zoo',2,'zoo 的开头是 /z/；snake、city 的开头是 /s/。','phonics')])

u=unit(6,'Crazy inventions','奇妙发明',70,81,'🛠️','描述发明的问题，礼貌询问机器用途，并解释杠杆的三个要素。',
'''spanner|扳手|The mechanic used a spanner.
switch|开关|The switch is beside the screen.
lever|杠杆；操纵杆|A lever turns around a pivot.
button|按钮|This button starts the toy.
drill|钻；电钻|The adult put the drill away safely.
screwdriver|螺丝刀|The screwdriver is in the toolbox.
workbench|工作台|The model is on the workbench.
hammer|锤子|The carpenter keeps the hammer on a shelf.
saw|锯|The adult uses a saw in the workshop.
paintbrush|画笔；刷子|My paintbrush has blue paint on it.''',
G('too many / not enough','too many + 可数复数表示太多；not enough + 可数复数或不可数名词表示不足。判断时要联系用途。','This model has too many wheels.|这个模型的轮子太多了。\nWe have not got enough paper.|我们的纸不够。','The box is full. There are ___ books in it.','too many|not enough|a little',0,'箱子已满，结合语境表示书太多。','We need four wheels, but we have two. We have ___ wheels.','too many|not enough|too much',1,'需要四个却只有两个，说明数量不足。'),
G('Can you tell me … ?','礼貌问句中，后半句用陈述语序：what this machine is / what this lever does。不要再次把 is / does 提前。','Can you tell me what this button does?|你能告诉我这个按钮有什么作用吗？\nCan you tell me what this machine is for?|你能告诉我这台机器是做什么的吗？','Can you tell me ___?','what does this lever|what this lever does|what do this lever',1,'嵌入问句保持主语 this lever 在谓语 does 前。','选择正确的礼貌问句。','Can you tell me what is this machine?|Can you tell me what this machine is?|Can you tell me what this machine are?',1,'用 what this machine is 的陈述语序。'),
'Giving reasons：说明理由',72,'dialogue')
u['song']['task']=['读第 72 页，解释模型为什么有四片机翼、为什么没有轮子。','圈出 That’s because … / That’s why …，各造一句有因果关系的句子。','画一个纸上发明，伙伴问用途，你用礼貌问句和理由回答。']
u['phonics']=phonics('原因意群：That is because …','依据第 72 页功能对话新编。先说观察到的现象，稍停，再用 because 引出原因；不要把原因与结果颠倒。','It has no wheels.|That is because it lands on water.\nIt is mostly green.|That is why we need green paint.\nI am hungry.|Could you make a sandwich?',72,[q('“It lands on water. That is why it has no wheels.” 哪个是原因？','没有轮子|它降落在水面上|有人饿了',1,'That is why 后引出结果；前面的降落地点是原因。','phonics')])

u=unit(7,'This is Houston','这里是休斯敦',82,93,'🌙','用 -ing 讲活动，转述别人说的话，并区分科幻故事与科学说明。',
'''countdown clock|倒计时钟|The countdown clock shows ten seconds.
lunar module|登月舱|The model lunar module is small.
space capsule|太空舱|The astronaut sits in the space capsule.
spacesuit|宇航服|The spacesuit protects the astronaut.
launch pad|发射台|The rocket is on the launch pad.
crater|陨石坑；环形山|The photograph shows a crater on the moon.
control panel|控制面板|The engineer checks the control panel.
screen|屏幕|We can see the moon on the screen.
headset|耳麦|She listens through her headset.''',
G('-ing 活动作主语','动词 -ing 短语可以作主语，表示做某事这件活动。单项活动一般接 is；不能把主语只写成动词原形。','Reading about space is exciting.|阅读太空知识很令人兴奋。\nWorking together is important.|合作很重要。','___ a spacesuit takes time.','Put on|Putting on|Puts on',1,'活动短语作主语，用 Putting on。','Watching the stars ___ interesting.','is|are|do',0,'Watching the stars 整体是一项活动，接 is。'),
G('转述：said that …','本单元练习把原话改成过去时转述：I am → he / she was，I like → he / she liked；同时调整人称。','“I am tired.” She said that she was tired.|“我累了。”她说她累了。\n“I like science.” He said that he liked science.|“我喜欢科学。”他说他喜欢科学。','Zanrok said, “I am from Alpha 346.” → He said that he ___ from Alpha 346.','is yesterday|was|were',1,'按本单元的过去时转述练习，am 改 was。','“I like soup,” she said. → She said that ___ liked soup.','I|you|she',2,'转述她的话，人称 I 改成 she。'),
'Can you hear us?',84)
u['song']['task']=['在第 84 页区分宇航员与 Ground Control 的台词。','找到一个 -ing 作主语的句子，说出它在评价哪项活动。','两人轮读通讯对话；不把歌曲中的虚构通讯当作真实航天操作。']
u['phonics']=phonics('/ʌ/：mum、son 与 lunch','对应第 84 页。mum、son、honey 的拼写不同，但重读元音都有 /ʌ/。短促发音，不拖成 /ɑː/。','mum|son\nlunch|honey\nGus|plums',84,[q('哪个词和 mum 含有相同的 /ʌ/ 元音？','moon|son|screen',1,'son 中的 o 读 /ʌ/，和 mum 的元音相同。','phonics')])

u=unit(8,'A cold place','冰雪世界',94,105,'🧊','用附加问句核对信息，用 may / might 表达可能，理解救助与求助。',
'''northern lights|北极光|The picture shows the northern lights.
iceberg|冰山|Most of the iceberg is under water.
seal|海豹|The seal rests on the ice.
seal pup|小海豹|We watch the seal pup from a distance.
ice floe|浮冰|The ice floe moves on the sea.
polar bear|北极熊|The book has a photograph of a polar bear.
polar bear cub|北极熊幼崽|The polar bear cub stays near its mother.
sledge|雪橇|The sledge is beside the snowy hill.
mittens|连指手套|My mittens keep my hands warm.
igloo|冰屋|We drew an igloo in the snow scene.''',
G('附加问句：…, is it?','本单元以 be 动词练习：前肯定、后否定；前否定、后肯定。短问句的人称和 be 动词要与前面一致。','It is cold, is it not?|天气很冷，是吗？\nThey are not ready, are they?|他们还没准备好，是吗？','It is cold here, ___?','is it|isn’t it|does it',1,'前面肯定 is，后面用否定 isn’t it。','They are not penguins, ___?','are they|aren’t they|is it',0,'前面否定 are not，后面用肯定 are they。'),
G('may / might：可能','may / might + 动词原形，表示不确定的可能；否定是 may not / might not。不要把“可能”读成“必定”。','We might visit the museum tomorrow.|我们明天可能去博物馆。\nThe ice may melt in warmer weather.|天气变暖时冰可能融化。','We might ___ home early.','going|went|go',2,'might 后使用原形 go。','“It may snow.” 的意思是？','一定会下雪。|可能下雪。|已经下雪了。',1,'may 表示可能性，并不保证一定发生。'),
'Checking information：核对计划',96,'dialogue')
u['song']['task']=['阅读第 96 页对话，说出 Mia 的计划和出现的问题。','找出核对信息的句子，模仿 Can I just check something?。','用 We might … 提出一个不需要雪的替代活动。']
u['phonics']=phonics('附加问句的停顿','依据第 95–96 页对话新编。先读完整陈述，再短暂停顿读 isn’t it? / are they?。真正不确定时常用上扬语气询问。','It is cold,|isn’t it?\nThey are not ready,|are they?\nYou are coming,|aren’t you?',96,[q('They are not ready, ___? 应怎样补全并读？','are they|isn’t it|does she',0,'前面主语 they、be 动词 are 且是否定，后面用 are they。','phonics')])

u=unit(9,'The Jurassic Age','恐龙时代',106,117,'🦖','用假设句表达想象，梳理整册故事结尾，并用化石证据解释过去。',
'''sunrise|日出|We watched the sunrise from the window.
horizon|地平线|The sun appeared above the horizon.
valley|山谷|A river runs through the valley.
pond|池塘|Dragonflies fly above the pond.
grassland|草原；草地|The picture shows a wide grassland.
stream|小溪|The stream flows past the trees.
bush|灌木丛|A bird is hiding in the bush.
swamp|沼泽|The old story begins near a swamp.
log|原木；倒下的树干|The beetle is under the log.''',
G('If …, would … ：想象的情况','If + 主语 + 过去式，主句用 would / ’d + 原形。本单元表达现在或将来的假设，不等于事情真的发生过。','If I had a time machine, I would visit the past.|如果我有时光机，我会去过去。\nIf I were a scientist, I would study fossils.|如果我是科学家，我会研究化石。','If I ___ a time machine, I would visit the future.','have|had|will have',1,'第二条件句的 if 从句用过去式 had。','If I saw a dinosaur, I ___ take a photo from far away.','would|was|did',0,'假设的结果使用 would + 原形。'),
G('What would you do if … ?','提问假设：疑问词 + would + 主语 + 原形 + if + 过去式？回答可用 I would … / I would not …。','What would you do if you found a fossil?|如果你发现化石，会怎么做？\nI would ask an expert about it.|我会请教专家。','What would you ___ if you met an alien?','did|doing|do',2,'would 后用原形 do。','“I would not touch it.” 的缩写是？','I wouldn’t touch it.|I didn’t touch it.|I haven’t touch it.',0,'would not 缩写为 wouldn’t，含义保持假设。'),
'I’d like to be …',108)
u['song']['task']=['在第 108 页找到描述动物身体的词，如 horns、claws、wings。','选择一句 If I were …，只用朗读或画画表现想象，不模仿危险行为。','编一句善意的新歌词：If I were …, I would …。']
u['phonics']=phonics('/ɔː/：不同拼写的长元音','对应第 108 页，采用教材英式发音示例。or、aw 等拼写可发 /ɔː/；口形略圆，声音拉长。不同口音可能有差别。','short|claws\nhorns|roar\nmore|saw',108,[q('在教材的英式发音中，哪个词与 short 含相同的长元音 /ɔː/？','claws|cat|sit',0,'short 和 claws 的重读元音都是 /ɔː/。','phonics')])

# Stories, reading and cross-curricular passages. Each is a retelling, not a transcript.
U=BOOK['units']
u=U[0]
u['story']=passage('Back in time again',[8,9],'同一天的科学课再次出现。孩子们想阻止旧事故，却因为护目镜碰倒粉末发生了新事故，黄色光门再次打开。',
'''The children return to their science lesson with Mr Davis.|孩子们回到 Davis 老师的科学课上。|return to 表示回到；先交代人物与地点。
Phoebe notices that the date is the same as before: 11 April.|Phoebe 注意到日期和上次一样：4 月 11 日。|the same as 是“与……相同”。
Alex worries that another accident will happen.|Alex 担心又会发生事故。|worries that 后面接担心的事情。
Last time, Patrick knocked over the water and spoiled the experiment.|上次 Patrick 碰倒了水，弄坏了实验。|knocked over 是“碰倒”，不是主动倒水。
This time, Phoebe tells Patrick to sit still and touch nothing.|这次 Phoebe 让 Patrick 坐好，什么也别碰。|this time 与 last time 对照。
Alex and Phoebe read the instructions and measure the mixture carefully.|Alex 和 Phoebe 仔细读说明、量好混合物。|carefully 说明他们做事的方式。
Mr Davis asks Patrick to put his safety goggles on.|Davis 老师让 Patrick 戴好护目镜。|ask someone to do 表示让某人做某事。
Patrick's goggles fly up and hit a jar of blue powder.|Patrick 的护目镜飞起来，碰到一罐蓝色粉末。|先找主语 goggles，再找两个动作 fly、hit。
The powder falls into the mixture, and an explosion follows.|粉末掉进混合物，接着发生了爆炸。|and 连接前因与后果；这是虚构情节。
The yellow light appears, and the three friends enter it together.|黄色的光出现了，三个朋友一起走进去。|enter 就是 go into；光门引出新一册冒险。''',
[q('这次事故的直接原因是什么？','护目镜碰倒了粉末罐。|孩子们把窗户打开了。|Patrick 又碰倒了水。',0,'上次是水；这次是护目镜撞到蓝色粉末罐。注意区分两次事故。'),q('为什么看到 4 月 11 日让 Phoebe 感到奇怪？','那是新学期结束的日子。|它与第一次穿越发生的日期相同。|她忘了带生日礼物。',1,'日期重复，让孩子们担心同样的冒险会再发生。')])
u['reading']=passage('Remembering the Time Travellers',[7],'两位同学回顾第五册的冒险。读懂“地点、人物和事情”的说明，比一次记住全部故事更重要。',
'''Two friends discuss the Time Travellers' earlier adventures.|两个朋友谈论时间旅行者之前的冒险。|earlier adventures 指前面发生过的故事。
One favourite episode takes place in a rainforest.|一个受喜爱的故事发生在热带雨林。|take place 表示发生；episode 是一集或一个篇章。
The children had to jump from a waterfall in that episode.|在那一篇里，孩子们不得不从瀑布跳下。|这是对虚构故事的回顾，不是现实活动建议。
Another favourite is the episode in which they meet Elvis.|另一个受喜爱的故事是他们遇见 Elvis 的那一篇。|in which 指“在那一篇故事中”。
They also remember the mysterious ship called the Mary Celeste.|他们还记得名叫 Mary Celeste 的神秘船。|called 在这里相当于“名叫”。
The ship did not disappear, but its captain and sailors did.|消失的不是船，而是船长和水手。|did 代替前面的 disappear，避免重复。
Patrick is described as the boy who wants to do brave things.|Patrick 被描述为那个总想做勇敢事情的男孩。|who 从句告诉我们是哪个男孩。
Phoebe is the friend who often knows where they are.|Phoebe 是那个常常知道他们身在何处的朋友。|where they are 是“他们在哪里”。''',
[q('Mary Celeste 对话纠正了哪一个误解？','消失的是船上的人，不是船。|Elvis 是船长。|船停在学校操场。',0,'对话强调船没有消失，船长和水手消失了。'),q('谁常常判断出大家到了哪里？','Mr Davis|Patrick|Phoebe',2,'Phoebe 的人物特点是了解地点与背景。')])
u['world']=passage('A careful reader’s experiment',[8,9],'新编学习策略：像检查实验步骤一样读长文，先看人物地点，再找事件顺序与因果证据。',
'''Before a long story, I look at the title and the pictures.|读长故事之前，我先看标题和图片。|before 在这里引出时间；这是新编的阅读方法。
I ask who is there, where they are and what the problem is.|我问：有谁、在哪里、遇到了什么问题。|三个问题帮助建立故事框架。
I read a small part and mark one word that I need to learn.|我读一小段，标出一个需要学习的词。|a small part 提醒我们分段完成。
I use first, next and finally to connect the events.|我用 first、next、finally 把事件连起来。|这些顺序词帮助复述，而不是逐字背诵。
When something happens, I look back for its cause.|发生一件事时，我回头找它的原因。|cause 是原因；look back 指回看已读部分。
I check my answer with a sentence in the story.|我用故事中的一句话检查答案。|with 表示借助什么来核对。
If I am still confused, I read that small part again.|如果仍然不明白，我就再读那一小段。|again 是再一次，不必每次都从头开始。
Then I explain the story in my own words.|然后我用自己的话讲清故事。|in my own words 是“用自己的话”。''',
[q('回答“为什么”时，哪一步最有帮助？','只看图片颜色。|回到相关句子找原因。|跳过所有难词。',1,'原因题需要根据文本找到事件之间的联系。'),q('文中的 first、next、finally 帮助我们做什么？','描述事件顺序。|计算单词个数。|猜测所有答案。',0,'它们分别表示首先、接着、最后，帮助按顺序讲故事。')],kind='依据单元目标新编')
u['create']=dict(title='一分钟讲清实验事故',pages=[8,9],tasks=['列出“上次事故”和“这次事故”各自的原因。','用 First / Next / Finally 准备 4–6 句英文复述。','讲给家人听，请对方回答：这次是谁的什么物品碰到了什么？'],frame='First, the children …\nThey were worried because …\nThis time, Patrick’s …\nAs a result, …\nFinally, …',model='The children were back in science class. Phoebe recognised the date. Alex and Phoebe tried to avoid another accident. However, Patrick’s goggles hit a jar of powder. The powder fell into the mixture, and there was an explosion. Finally, the yellow light appeared again.',success='能说清人物、两次事故的区别、这次的原因与结果；遇到难句可以看关键词再说。',teacher='依据第 8–9 页故事新编的复述任务；无第六册教师用书核对。')

u=U[1]
u['story']=passage('The pirates’ treasure',[14,15],'朋友们找到海盗埋的金币，却发现它们属于被抢的家庭。他们归还宝藏，又遇到另一伙海盗，最后从光门逃离。',
'''From a hill, the friends watch the pirate ship sail away.|朋友们从山坡上看着海盗船驶离。|from a hill 先交代观察位置。
They also notice another ship with red sails and a black flag.|他们还注意到另一艘有红帆和黑旗的船。|another 是另一个；这是一条后面有用的线索。
The children dig up a treasure chest filled with gold coins.|孩子们挖出一个装满金币的宝箱。|filled with 是装满；dig up 表示挖出来。
Patrick thinks the treasure is theirs, but Phoebe disagrees.|Patrick 觉得宝藏归他们了，Phoebe 却不同意。|theirs 表示他们的；but 提示意见不同。
Soon, tired families arrive on a boat.|不久，一些疲惫的家庭乘船来到这里。|soon 推动时间向前。
A woman explains that pirates stole the money for their new farms.|一个女人解释说，海盗抢走了他们买新农场的钱。|the money for … 表示准备用于……的钱。
The friends return the chest and send the families towards a town.|朋友们归还宝箱，并告诉这些家庭往一个城镇走。|return 在这里是归还，不是回来。
At midnight, more pirates arrive with the first captain as their prisoner.|午夜，更多海盗押着先前的船长来了。|as their prisoner 说明船长现在的处境。
Alex sneezes, and the hidden children are discovered.|Alex 打了个喷嚏，藏着的孩子们被发现了。|are discovered 是被发现。
The pirates demand the treasure, but a yellow glow appears in the hole.|海盗索要宝藏，但坑里出现了黄色的光。|demand 比 ask 更强硬，表示强令交出。
The three friends jump into the light and escape.|三个朋友跳进光里，逃走了。|先归还宝藏，再逃离危险，复述时不要换序。''',
[q('为什么 Phoebe 认为他们不能留下金币？','金币太重。|金币属于被海盗抢劫的家庭。|宝箱没有钥匙。',1,'找到不等于拥有；后来女人的解释确认了金币的主人。'),q('哪件事让藏起来的孩子暴露了？','Alex 打喷嚏。|Patrick 敲学校的铃。|Phoebe 点亮太阳能板。',0,'午夜躲藏时 Alex 打喷嚏，引来了海盗。')])
u['reading']=passage('A Roman helmet found',[16],'一位使用金属探测器的人发现头盔碎片。专家拼合后判断其用途；读者要区分文章提供的证据和没有说的事情。',
'''The textbook article describes the discovery of an old Roman helmet.|教材文章讲述了一顶古罗马头盔的发现。|这是旧版文章的阅读改写，不含今日价格或法律建议。
A man with a metal detector found pieces of it in an English village.|一个带着金属探测器的人在英国一个村庄发现了它的碎片。|pieces of it 指头盔的碎片。
At first, he did not know what the pieces were.|起初，他不知道这些碎片是什么。|at first 和后面的发现形成对照。
He showed them to experts, who put the pieces together.|他把它们拿给专家看，专家把碎片拼在一起。|them 回指 pieces；who 指 experts。
The helmet is made of copper and includes a face mask.|头盔由铜制成，还包括一个面罩。|is made of 表示材料。
Its decoration includes a creature with parts of a lion and an eagle.|装饰中有一种兼具狮子和鹰特征的生物。|creature 是生物；这里指神话形象。
The experts in the article think it was worn in military parades.|文中的专家认为它是军队游行时佩戴的。|think 表示根据证据作出的判断。
They do not think it was an ordinary helmet for fighting.|他们认为它不是作战时用的普通头盔。|ordinary 是普通的；注意用途的对比。
The report shows how experts can help explain an unusual discovery.|这篇报道说明专家能怎样帮助解释不寻常的发现。|discovery 是发现；主题是观察和求证。''',
[q('发现者一开始知道这些碎片是什么吗？','知道，他自己制作了它。|不知道，后来请教了专家。|文章说他是一位罗马士兵。',1,'文中说他起初不知道，后来把碎片给专家看。'),q('按照文中专家的判断，这顶头盔可能用于什么？','军队游行。|学校篮球比赛。|游泳时保护头部。',0,'文章将游行时佩戴与战斗时佩戴作了区分。')])
u['world']=passage('Treasure Island and types of writing',[18,19],'认识《金银岛》的开头和第一人称叙述，再分清简介、评论与传记分别告诉读者什么。',
'''Treasure Island is an adventure story by Robert Louis Stevenson.|《金银岛》是 Robert Louis Stevenson 写的冒险故事。|by 后接作者。
The opening is told by a character who uses I and my.|开头由一个使用 I 和 my 的人物来讲述。|这叫第一人称叙述。
He remembers a strange sailor arriving at his father's inn.|他回忆一个奇怪的水手来到父亲的客栈。|inn 是提供住宿与饭食的客栈。
The sailor has a sea chest, a scar and a rough appearance.|水手带着航海箱，脸上有伤疤，外表粗犷。|这些细节帮助读者想象人物。
He asks people to call him captain and pays to stay.|他让大家称他船长，并付钱住下来。|ask people to … 表示让别人怎样做。
A blurb introduces a book and tries to make people want to read it.|内容简介介绍一本书，吸引人们去读。|blurb 通常是封面或封底的短介绍。
A review gives an opinion about what works well or less well.|评论说出哪些地方好、哪些地方不够好。|opinion 是观点，需要理由支持。
A biography tells the story of a real person's life.|传记讲述一个真实人物的一生。|biography 关注人物生平，不是小说情节。''',
[q('看到 I、my 等词，可判断这段故事采用什么叙述方式？','第一人称。|天气预报。|商品价格表。',0,'讲述者以自己的身份说 I 和 my。'),q('如果想说明自己喜欢一本书的哪些地方，应写什么？','biography|review|shopping list',1,'review 是评论，可以表达喜好与理由。')])
u['create']=dict(title='我的珍宝：Show and tell',pages=[20,21],tasks=['选一个真实或画出来的珍爱物品，说明它为什么特别。','写出你怎样得到它、拥有多久，以及一个相关回忆。','用约一分钟展示它，结尾邀请听众提问；不需要展示贵重物品。'],frame='This is my treasure.\nI got it from …\nI have had it for / since …\nIt matters to me because …\nThank you for listening. Do you have any questions?',model='This drawing is my treasure. My brother made it for me. I have had it since my last birthday. It shows our family in the garden. It is important because it reminds me of a happy day. Thank you for listening.',success='说明物品、来源、持续时间与个人意义；for / since 使用恰当，并能回答一个问题。',teacher='对应第 20 页展示活动与第 21 页个人记录；示范文字新编。')

u=U[2]
u['story']=passage('A problem for Patrick',[26,27],'Alex 和 Phoebe 先读说明再飞行；Patrick 没认真听，失去控制。朋友们告诉他如何打开故事里的应急降落伞，帮助他安全降落。',
'''Alex and Phoebe read the jet-pack instructions before they take off.|Alex 和 Phoebe 起飞前读了喷气背包说明。|before 明确动作先后；喷气背包是此处的科幻装置。
They feel nervous, but they understand how the controls work.|他们有些紧张，不过理解了控制装置的作用。|but 表示紧张不等于没有准备。
They fly towards a mountain and see a cable car below.|他们飞向一座山，看见下面有一辆缆车。|towards 表示朝着，不一定已经到达。
After exploring the area, Phoebe starts to worry about Patrick.|在附近飞行之后，Phoebe 开始担心 Patrick。|worry about 后面接担心的人或事。
He was too impatient to listen to the lesson.|他太心急，没有听完讲解。|too … to … 表示太……而不能……。
Suddenly, they see Patrick falling quickly through the sky.|突然，他们看见 Patrick 在空中快速下落。|see someone doing 强调看见正在发生的动作。
His friends realise that he cannot control his jet pack.|朋友们意识到他无法控制喷气背包。|realise 是意识到；这是问题的核心。
They fly closer and tell him to use the emergency controls.|他们飞近，告诉他使用应急控制装置。|故事中的按钮不是现实设备说明。
A parachute opens, and Patrick reaches the ground safely.|降落伞打开了，Patrick 安全落地。|safely 是安全地。
He thanks his friends, and they leave through the yellow light.|他感谢朋友，大家穿过黄光离开了。|结尾的感谢说明他意识到朋友帮助的重要。''',
[q('Patrick 为什么遇到困难？','他没有认真听使用说明。|他先读完了全部说明。|他的朋友把缆车拆了。',0,'故事直接说他太心急，没有听讲，所以不知道怎样控制背包。'),q('哪个顺序符合故事？','感谢朋友 → 失控 → 朋友靠近。|失控 → 朋友靠近帮助 → 降落伞打开。|降落伞打开 → 到学校 → 开始读说明。',1,'抓住危险、帮助与解决三个环节。')])
u['reading']=passage('Getting around Bangkok',[28],'文章比较嘟嘟车与高架列车怎样帮助人们穿行城市。学习交通方式的特点，不把旧版费用与客流描述当作今天的出行信息。',
'''The textbook compares two ways of travelling around Bangkok.|教材比较了在曼谷出行的两种方式。|compare 是比较；这里只练阅读理解。
Busy roads can make a journey through the city slow.|繁忙的道路可能让穿越城市的旅程很慢。|can 表示可能，并非每一次都如此。
A tuk-tuk is easy to recognise because it has three wheels.|嘟嘟车容易辨认，因为它有三个轮子。|because 解释容易辨认的原因。
The driver sits at the front, and passengers sit behind.|司机坐在前面，乘客坐在后面。|front 和 behind 是位置对比。
The article says a tuk-tuk ride can feel fast and exciting.|文章说，乘坐嘟嘟车可能让人觉得快而刺激。|can feel 描述体验，不是推荐冒险。
The skytrain offers a different way to cross the city.|高架列车提供另一种穿行城市的方法。|offers 是提供；different 引出对比。
Its trains run on tracks above the street traffic.|它的列车在街道交通上方的轨道行驶。|above 表示在上方。
They use electricity, but the route does not reach every possible destination.|列车用电，不过线路并不能到达每一个目的地。|but 提示一种交通方式也有局限。
A good comparison explains both useful features and limitations.|好的比较会同时说明有用的特点和局限。|both … and … 表示两方面都考虑。''',
[q('嘟嘟车在文中最容易辨认的外形特征是什么？','只有一个轮子。|有三个轮子。|有飞机机翼。',1,'文中 because 后明确说明三个轮子这一特征。'),q('高架列车怎样避开街道上的车流？','在车流上方的轨道行驶。|每位乘客背上喷气背包。|它在水下航行。',0,'above the street traffic 是理解这一优势的关键词。')])
u['world']=passage('The history of the car',[30,31],'按时间线理解车辆的发展：动力、速度、制造方式和污染问题不断变化。“未来的车”是想象，不等于已发生的历史。',
'''The textbook uses a timeline to explain changes in cars.|教材用时间线解释汽车的变化。|timeline 把历史事件按时间排列。
Early steam-powered vehicles moved slowly and had special jobs.|早期蒸汽动力车辆行驶缓慢，并有特定用途。|steam-powered 表示由蒸汽提供动力。
Cugnot's heavy cart was designed to pull military equipment.|Cugnot 的重型车被设计来拖运军事装备。|was designed to 说明设计用途。
Later, engineers developed vehicles that could carry people without horses.|后来，工程师改进了不用马就能载人的车辆。|without horses 强调与马车的差异。
As engines improved, vehicles became faster.|随着发动机改进，车辆变得更快。|as 在此表示随着。
Road safety became a problem that people had to think about.|道路安全成了人们必须考虑的问题。|that 后面说明是什么样的问题。
Factories found ways to produce cars in larger numbers.|工厂找到批量生产汽车的方法。|in larger numbers 表示更大量地。
The timeline also introduces concerns about pollution from traffic.|时间线还介绍了人们对交通污染的担忧。|concerns about 是对……的担忧。
A future invention belongs in a prediction, not among events that already happened.|未来的发明应放在预测中，而不是当作已经发生的事件。|already happened 与 future prediction 要分开。''',
[q('时间线通常怎样组织内容？','按事件发生的先后。|按词语字母顺序。|只按图片大小。',0,'timeline 的主要结构是时间先后。'),q('哪一项应标为预测而不是历史事件？','早期车辆使用蒸汽。|未来每家也许都有飞行汽车。|工厂曾改进制造方法。',1,'“未来”“也许”表示尚未发生、不能当作事实的预测。')])
u['create']=dict(title='设计一座未来交通城市',pages=[32,33],tasks=['画出 3 种交通方式，并给每种写一条用途或限制。','写 4 句预测，至少包含一句 will not。','与伙伴做城市导览对话，问一句 Do we need to … ? 并给出理由。'],frame='In my future city, people will …\nThey will not …\nTo use this transport, you need to …\nYou do not need to …\nI think this will help because …',model='In my future city, people will use quiet electric trains. The trains will run above busy roads. We will not need a car for every short journey. People will need to follow the safety rules. I think travelling will be easier, but this is only my prediction.',success='区分预测与事实；至少说出一种优势、一种限制和一项必要准备。',teacher='对应第 32 页角色对话与第 33 页未来生活问卷；转换为新编城市设计表达任务。')

u=U[3]
u['story']=passage('The mummy’s tomb',[38,39],'孩子们进入墓穴，先遇到蝎子，再因随意按按钮滑进地下。他们逃开木乃伊，在珍宝室遇到光门。',
'''The children find a doorway covered with hieroglyphics.|孩子们找到一个布满象形文字的入口。|covered with 表示被……覆盖。
They disagree about whether the signs mean welcome or keep out.|他们对符号是“欢迎”还是“禁止入内”意见不一。|whether … or … 表示究竟是……还是……。
Patrick wants to enter, although Alex thinks it may be dangerous.|Patrick 想进去，尽管 Alex 觉得可能有危险。|although 引出相反的想法。
Inside the dark passage, small creatures fall onto the children.|在黑暗的通道里，小生物掉到了孩子们身上。|passage 在这里指通道，不是文章段落。
Alex recognises them as scorpions, and the children run away.|Alex 认出那是蝎子，孩子们跑开了。|recognise … as … 是认出……是……。
At the end of a corridor, Patrick presses a button without waiting.|在走廊尽头，Patrick 没有等待就按了一个按钮。|without waiting 说明他没有先停下来判断。
The floor opens, and they slide into a room deep inside the pyramid.|地板打开了，他们滑进金字塔深处的房间。|slide 是滑行；deep inside 表示深处。
A white figure comes towards them, and they believe it is a mummy.|一个白色身影走向他们，他们认为那是木乃伊。|believe 描述人物的判断。
They run into another room and block the doorway with a rock.|他们跑进另一个房间，用岩石堵住入口。|with a rock 说明使用什么。
Gold and silver objects shine around them in the beautiful tomb.|美丽的陵墓里，金银物品在四周闪耀。|shine 是发光；tomb 是陵墓。
Phoebe wants to look longer, but the yellow gate appears and they leave.|Phoebe 还想多看一会儿，但黄色光门出现了，他们便离开了。|but 标明愿望与实际行动不同；冒险情节不可照做。''',
[q('孩子们为什么滑进金字塔深处？','Patrick 按了按钮，地板打开了。|他们坐了电梯。|Phoebe 挖了一条新路。',0,'先按按钮，再地板打开，再滑下去，这是明确的因果链。'),q('Phoebe 在最后一个房间为什么改变了心情？','她找到了学校铃。|她看见美丽的金银物品，想多停留。|她终于吃到午饭。',1,'她从害怕变成惊叹，是因为看到美丽的陵墓和珍宝。')])
u['reading']=passage('Rhodopis and the golden shoe',[41],'这是教材收录的一则古埃及背景传说。Rhodopis 受到不公平对待，一只金鞋把她与法老的故事联系起来；传说不是历史事实记录。',
'''In the legend, Rhodopis works as a servant in an old man's house.|在传说中，Rhodopis 在一位老人的家里做仆人。|in the legend 明确这是一则传说。
The other girls are unkind because she looks different from them.|其他女孩因为她看起来不同，就对她不友善。|because 说明她被不公平对待的原因。
Rhodopis feels lonely and talks to the animals near the river.|Rhodopis 感到孤单，向河边的动物说心事。|lonely 是孤单的；不是一个人的错误。
The old man sees her dancing and gives her beautiful golden shoes.|老人看到她跳舞，送给她一双漂亮的金鞋。|gives her … 表示送给她……。
When everyone is invited to the Pharaoh's party, the girls keep her working.|当大家受邀参加法老的聚会时，那些女孩却让她继续干活。|keep someone doing 是让某人一直做某事。
A hippo splashes her shoes, so she leaves them in the sun to dry.|河马溅湿了她的鞋，因此她把鞋放在太阳下晒干。|so 连接原因与结果。
A bird takes one shoe and drops it near the Pharaoh.|一只鸟叼走一只鞋，把它落在法老附近。|one shoe 是一双中的一只。
The Pharaoh searches for the person who owns the shoe.|法老寻找那只鞋的主人。|who owns the shoe 说明寻找谁。
When he reaches the house, the shoe fits Rhodopis.|当他来到那座房子时，鞋正好适合 Rhodopis。|fit 在这里表示大小合适。
He chooses Rhodopis as his queen despite the other girls' objections.|尽管其他女孩反对，他还是选择 Rhodopis 做王后。|despite 表示尽管；讨论时关注尊重差异与公平对待。''',
[q('把金鞋带到法老那里的是谁？','河马。|一只鸟。|那几个女孩。',1,'河马溅湿鞋，鸟带走鞋；两个动作的执行者不同。'),q('哪句话最符合这篇故事的价值讨论？','外表不同就应该被排斥。|仆人没有感受。|每个人都应得到尊重和公平对待。',2,'故事里的不友善行为造成伤害，不能以外表或身份判断人的价值。')])
u['world']=passage('Three-dimensional shapes',[42,43],'从平面与立体的区别入手，认识面、棱和顶点，并用纸金字塔理解展开图。',
'''A two-dimensional shape has length and width.|二维图形有长和宽。|two-dimensional 可简称 2D。
A three-dimensional shape also has height or depth.|三维形状还有高度或深度。|also 表示比前面多一个维度。
A cube has six square faces.|正方体有六个正方形面。|face 在几何中是面，不是人的脸。
An edge is where two faces meet, and a vertex is a corner.|棱是两个面相接的地方，顶点就是角点。|edge、vertex 是观察形状的关键词。
A square-based pyramid has one square base and four triangular faces.|四棱锥有一个正方形底面和四个三角形侧面。|square-based 说明底面形状。
The four triangular faces meet at one top point.|四个三角形侧面在顶部的一个点相会。|meet 表示相交、相接。
A cylinder has two circular flat faces and one curved surface.|圆柱有两个圆形平面和一个曲面。|flat 与 curved 分别是平的和弯曲的。
A paper net can be folded to make a model of a solid shape.|纸展开图可以折成立体模型。|net 在这里是展开图，与球网的意思不同。''',
[q('正方体有几个正方形面？','四个。|六个。|八个。',1,'cube 有六个面；八个是它的顶点数，别混淆。'),q('四棱锥的底面是什么形状？','正方形。|圆形。|五边形。',0,'square-based 已经说明它有一个正方形底面。')])
u['create']=dict(title='古代文明小讲解员',pages=[43,44,45],tasks=['选古埃及或另一个熟悉的古代文明，画一张图并标出 3 个英文词。','准备三条可在教材或可靠图书中找到的事实，并记录来源页码。','用约一分钟介绍地点、一个代表物及其特点；可以展示纸模型。'],frame='My topic is …\nThe people lived in …\nThey are known for …\nThis model was made from …\nIt has … faces.\nOne question I still have is …',model='My topic is Ancient Egypt. The pyramids are famous buildings. This is my paper model of a square-based pyramid. It was made from paper and tape. It has one square base and four triangular faces. I would like to learn more about the writing on ancient walls.',success='区分事实与猜想；至少用一句被动语态，一处形状词，并能指出信息来源。',teacher='对应第 43 页纸模型与第 44 页古代文明演讲；不采用旧版“所有金字塔均由奴隶建造”等简化表述。')

u=U[4]
u['story']=passage('Not the best day',[50,51],'三场比赛带来三次意外：Phoebe 被球打到，Patrick 的脚受伤，Alex 掉进水里。找准人、地点、事件就能复述。',
'''The friends take a bus to a hall near the Olympic Stadium.|朋友们乘巴士来到奥林匹克体育场附近的场馆。|near 说明位置；先交代第一站。
They sit in the front row to watch volleyball.|他们坐在前排看排球比赛。|front row 是前排。
Phoebe cheers excitedly, but a ball hits her face near the end.|Phoebe 兴奋地欢呼，但临近结束时球打到了她的脸。|near the end 说明事情发生的时间。
Her eye hurts, and the friends move on to a wrestling match.|她的眼睛受伤了，朋友们接着去看摔跤比赛。|move on to 表示转到下一项活动。
Patrick admires the shorter wrestler and expects him to win.|Patrick 欣赏个子较矮的选手，认为他会赢。|expect someone to … 表示预料某人会……。
The taller wrestler is thrown through the air and lands on Patrick's foot.|个子较高的选手被摔出去，落到了 Patrick 的脚上。|is thrown 是被动语态。
Next, they watch rowing from seats close to the water.|接着，他们坐在靠近水面的座位上看赛艇。|next 标明第三场活动。
Alex leans forward while cheering for the rowers.|Alex 一边为赛艇选手欢呼，一边向前倾。|while 表示两个动作同时发生。
Phoebe warns him, but he leans too far and falls in.|Phoebe 提醒他，可他倾得太靠前，掉进了水里。|too far 是过度，解释意外原因。
His friends help him out, and the three leave through the yellow gate.|朋友们帮助他出来，三人穿过黄色光门离开。|help him out 在这里是帮他离开水面。
One has a black eye, one has a sore foot, and one is soaking wet.|一个眼圈青了，一个脚痛，还有一个全身湿透。|平行结构帮助把三个人的经历对应起来。''',
[q('谁在看摔跤时脚受了伤？','Phoebe。|Patrick。|Alex。',1,'Phoebe 在排球场受伤；Patrick 在摔跤场伤脚；Alex 在赛艇场落水。'),q('Alex 为什么落水？','他欢呼时身体向前倾得太多。|他被排球打落水。|他主动参加了赛艇比赛。',0,'文本说明他 lean forward 太远，注意不是其他两人的事故。')])
u['reading']=passage('Reading about the X Games',[52],'用小标题快速读懂介绍性文章：是什么、有哪些项目、怎样观看。旧教材的赛事地点和项目分类不作为今日赛程信息。',
'''The article introduces a sports event called the X Games.|文章介绍名叫 X Games 的体育赛事。|introduces 是介绍；原文采用问答式小标题。
It groups its information under short questions.|它把信息放在简短的问题下面。|under 在这里指小标题之下。
The photographs show sports such as skateboarding and BMX biking.|照片展示了滑板和小轮车等运动。|such as 表示举例，不是列出全部。
Other examples include snowboarding and snowmobiling.|其他例子包括单板滑雪和雪地摩托。|include 表示包括。
The article describes separate events for summer and winter sports.|文章描述了分别面向夏季和冬季运动的赛事。|separate 表示分开的。
Competitors aim to win medals, and the audience watches their skills.|参赛者争取奖牌，观众欣赏他们的技巧。|competitors 与 audience 分别是参赛者和观众。
The text also mentions music and meeting other sports fans.|文章还提到音乐和与其他体育爱好者见面。|also 告诉我们活动不只有比赛。
A final section explains that people can watch without attending in person.|最后一部分说明，人们不亲临现场也可以观看。|in person 是亲自到场。
The headings help a reader find the answer to a specific question.|这些小标题帮助读者找到某个具体问题的答案。|specific 表示具体的；先确定问题再定位段落。''',
[q('想知道文中有哪些比赛项目，应先找哪类小标题？','What sports do they do?|When is your birthday?|Who wrote this poem?',0,'项目问题与 What sports … 对应，能快速定位信息。'),q('文章最后一部分主要解决什么问题？','如何制作奖牌。|怎样不去现场也观看比赛。|谁发明了所有运动。',1,'最后一节是 What if I can’t go?，介绍远程观看方式。')])
u['world']=passage('Muscles help us move',[54,55],'肌肉让身体运动，有些能有意识控制，有些自动工作。理解基本概念，再用一份简单活动记录练英语。',
'''Muscles help our bodies move in many different ways.|肌肉帮助身体以许多不同方式运动。|move 是移动或活动，不只指跑步。
We use muscles when we walk, smile and eat.|走路、微笑和吃东西时，我们都会用到肌肉。|when 介绍使用肌肉的场景。
Many muscles are connected to the bones of the skeleton.|许多肌肉与骨骼相连接。|skeleton 是骨骼系统。
We can choose to move voluntary muscles, such as those in our fingers.|我们能有意识地控制随意肌，例如手指运动所用的肌肉。|voluntary 在这里指可有意识控制。
Other muscles work without us deciding each movement.|另一些肌肉工作时，不需要我们决定每一个动作。|without … deciding 表示不必有意识地下达每次动作。
Our heart keeps beating while we think about other things.|当我们想着别的事情时，心脏仍然在跳动。|keeps beating 是持续跳动。
Muscles need energy, which our bodies get from food.|肌肉需要能量，而身体从食物中获得能量。|which 指代前面的 energy。
Different activities use different groups of muscles.|不同活动会使用不同的肌群。|different … different … 是这段的比较重点。''',
[q('哪一种活动是能主动决定的肌肉运动例子？','用手指写字。|要求心脏每一次跳动。|让所有肌肉永远停止。',0,'手指写字是教材用来说明随意肌的例子。'),q('文中为什么提到食物？','食物让骨头消失。|身体从食物中获取肌肉所需的能量。|只要吃东西就不需要活动。',1,'食物与能量有关；文章没有说可以因此不活动。')])
u['create']=dict(title='体育记者的小采访',pages=[56,57],tasks=['选择一个真实运动员或明确标为虚构的人物，准备 4 个采访问题。','至少问一个经历问题和一个未来安排问题。','分角色采访，再把听到的两条信息整理成短文，事实与虚构分清。'],frame='May I ask you some questions?\nWhen are you playing next?\nHave you ever … ?\nHow often do you practise?\nThank you for talking to me.',model='This is an imaginary interview. Our tennis player is playing a match on Saturday. She practises three times a week. She has played in a school final, and she felt nervous before it. She likes tennis because she can learn from each match.',success='能礼貌提问、认真听答复，并用现在进行时说明一项已安排的活动。',teacher='对应第 56 页采访角色卡；示范人物为虚构，不声称教材音频中存在该采访。')

u=U[5]
u['story']=passage('The Great Fire',[62,63],'孩子们在 1666 年伦敦大火的虚构穿越故事中帮助他人。Fisher 一家放下家具腾出位置，让更多孩子安全离开。',
'''The children meet Mr Fisher while a great fire spreads through London.|当一场大火在伦敦蔓延时，孩子们遇到 Fisher 先生。|spreads through 表示蔓延；这是历史背景中的虚构冒险。
He explains that the fire started at a baker's and grew in the strong wind.|他说火起于面包店，强风使火势扩大。|grew 在这里指火势变大。
Mr Fisher wants to take his family to the countryside in a cart.|Fisher 先生想用马车带家人到乡下。|take … to … 是把……带到……。
Beside the river, people hurry to load their belongings onto boats.|河边，人们急忙把物品装到船上。|belongings 是个人物品。
A small child falls into the water when a crowded boat rocks.|一艘拥挤的船晃动时，一个小孩掉进水里。|when 说明落水发生的情境。
In the story, Patrick brings the child back, and the mother gives him a bracelet.|故事里 Patrick 把孩子救回，母亲送给他一只手镯。|手镯是本册结尾再次出现的重要线索；现实水上救援需专业帮助。
At Mr Fisher's house, the friends help load a large chest onto the cart.|在 Fisher 先生家，朋友们帮助把一个大箱子装上马车。|load … onto … 是把……装到……上。
A woman arrives with tired children who also need to escape.|一位女人带着一些疲惫的孩子赶到，他们也需要逃离。|who 引出这些孩子的情况。
The family removes furniture to make room for more people.|这家人搬下家具，为更多的人腾出位置。|make room 表示腾位置，room 在这里不可数。
The friends give up their places and let the other children ride.|三个朋友让出自己的位置，让其他孩子乘车。|give up 在这里是让出，不是对学习失去信心。
A yellow light shines in the doorway, and the friends use their magical way out.|门口亮起黄光，朋友们用自己的魔法通道离开。|magical 明确这是虚构的逃离方式。''',
[q('Fisher 一家为什么把家具搬下车？','家具需要重新油漆。|为了给需要离开的孩子腾出地方。|他们要在街上开商店。',1,'他们把人的安全放在物品前面，腾出车上空间。'),q('Patrick 得到的哪件物品会成为后面的线索？','一只手镯。|一个足球。|一副滑雪板。',0,'小孩的母亲给了他 bracelet；末单元会再次出现。')])
u['reading']=passage('Four London sights',[64],'把四个景点与各自特点配对：伦敦塔、塔桥、伦敦眼和蜡像馆。不学习旧版票价、排队时间或开放安排。',
'''The textbook introduces four places that visitors can learn about in London.|教材介绍了四个可供了解的伦敦地点。|four places 提醒我们建四栏来整理信息。
The Tower of London has been used as both a castle and a prison.|伦敦塔曾被用作城堡和监狱。|both … and … 连接两种不同用途。
Its famous objects include the Crown Jewels.|那里著名的物品包括王室珠宝。|include 表示包括，不代表只有这一类展品。
The reading also mentions the guards and the ravens at the Tower.|文章还提到伦敦塔的守卫和渡鸦。|ravens 是鸟；注意与 Tower Bridge 分开。
Tower Bridge has sections that can be raised for passing ships.|塔桥有可以抬起、让船通过的部分。|can be raised 是能够被抬起。
The London Eye is a large wheel with glass observation capsules.|伦敦眼是带有玻璃观景舱的大型摩天轮。|observation 表示观察、观景。
From a capsule, visitors can look across the city.|游客从观景舱里可以俯瞰城市。|across the city 表示看到城市的大片区域。
Madame Tussauds displays figures of famous people made from wax.|杜莎夫人蜡像馆展示用蜡制作的名人模型。|made from wax 说明材料。
A wax figure may look real, but it is not the person standing there.|蜡像可能看起来很真，但并不是真人站在那里。|may look 与 is not 区分外观和事实。''',
[q('哪一个景点的部分结构可以抬起让船通过？','London Eye。|Tower Bridge。|Madame Tussauds。',1,'raise 与 passing ships 是塔桥的关键特点。'),q('蜡像馆里“名人”的真实身份是什么？','用蜡做的人物模型。|正在工作的真正演员。|所有人都是守卫。',0,'made from wax 明确说明是蜡像，不能把外表当作事实。')])
u['world']=passage('Impressionism: looking at light',[66,67],'比较写实画与印象派，观察光、颜色和笔触。表达自己的观察时，要说明画中看见了什么。',
'''Realistic paintings often show clear details that resemble real life.|写实绘画常呈现接近真实生活的清晰细节。|resemble 是像、与……相似。
Impressionist artists explored light, colour and the feeling of a scene.|印象派艺术家探索光线、颜色和场景带来的感受。|scene 是画面或场景。
The movement developed in France in the nineteenth century.|这一艺术运动于十九世纪在法国发展起来。|nineteenth century 是 1801–1900 年这一世纪。
Monet, Renoir, Degas and Pissarro are artists named in the textbook.|教材列出的艺术家有 Monet、Renoir、Degas 和 Pissarro。|先认识姓名，不必一次背完拼写。
Many artists painted outdoor scenes and everyday people.|许多艺术家画户外场景和普通人的生活。|everyday 作形容词，意为日常的。
They used short brush strokes to create effects of colour and light.|他们用短笔触创造色彩和光线的效果。|brush strokes 是笔触。
Close up, we may notice separate marks of paint.|近看时，我们可能注意到一块块独立的颜料痕迹。|close up 表示靠近观察。
From farther away, the marks can form a clearer whole scene.|从远些的位置看，这些笔触能形成更完整清晰的景象。|whole scene 是整体画面。''',
[q('印象派画家特别关注什么？','只画完全一样的直线。|光、色彩与场景感受。|隐藏每一笔颜料。',1,'光线、色彩和整体感受是本段的核心。'),q('为什么可以从不同距离看同一幅画？','近看笔触，远看整体画面。|距离能改变画的作者。|远看一定会听见原曲。',0,'文中最后两句比较了近处与远处的观察。')])
u['create']=dict(title='为朋友做一张城市明信片',pages=[68,69],tasks=['选一个了解的城市，整理两处景点或地点的特点。','用 Have you ever … ? 问家人，再写自己真实或明确虚构的旅行经历。','完成 5–7 句明信片，包含经历、具体过去时间和个人感受。'],frame='Hi …,\nGreetings from … !\nI have visited …\nYesterday, I …\nMy favourite place was … because …\nSee you soon!',model='Hi Sam, Greetings from my imaginary trip to London! I have seen Tower Bridge. Yesterday, I visited a museum with my family. I liked the old objects because each one had a story. I have taken some photographs too. See you soon!',success='清楚区分真实与虚构；现在完成时讲经历，一般过去时补充具体时间，并给出一个理由。',teacher='依据第 68 页城市介绍及第 69 页明信片写作新编；不虚构任何真实的个人旅行。')

u=U[6]
u['story']=passage('Professor Potts',[74,75],'教授的几台发明接连出错：上错颜色、算错题、传送出问题。Patrick 又碰了未完成的机器，黄色光门随之出现。',
'''Professor Potts proudly shows the children his inventions.|Potts 教授骄傲地向孩子们展示发明。|proudly 表示他展示时的心情。
His painting machine should paint a chair with red and yellow spots.|他的涂色机器本应给椅子涂上红黄斑点。|should 在这里表示预期效果。
Instead, it covers the cat with green and blue spots.|结果，它把猫涂上了绿色和蓝色斑点。|instead 引出与预期相反的结果。
Next, the professor introduces a machine called Homework Express.|接着，教授介绍名叫 Homework Express 的作业机器。|called 说明机器的名称。
Alex gives it a large multiplication problem, but the answer looks wrong.|Alex 给它一道大数乘法题，但答案看起来不对。|multiplication 是乘法；不要盲信机器答案。
Another invention is supposed to move objects from one place to another.|另一项发明本应把物品从一个地方传到另一个地方。|is supposed to 表示设计上应该做到。
The professor tries his bicycle, and the attempt produces black smoke and a problem.|教授拿自行车试验，结果冒出黑烟，还出了问题。|attempt 是一次尝试；观察结果是否符合目标。
Phoebe declines a turn under the hairdressing machine.|Phoebe 拒绝试用理发机器。|declines 表示礼貌拒绝。
Patrick pulls a lever on an invention that is not finished.|Patrick 拉动了一台尚未完工机器的操纵杆。|not finished 是解释风险的重要信息。
The professor cannot explain the yellow light that appears.|教授无法解释突然出现的黄光。|that appears 描述是哪道光。
The children recognise their gate, say goodbye and step through it.|孩子们认出那是光门，道别后走了进去。|recognise 表示再次认出熟悉的事物。''',
[q('涂色机器的实际结果与预期有什么不同？','它正确涂好了椅子。|它涂到了猫身上，而且颜色也错了。|它把全部作业写完了。',1,'比较 should paint 与 instead 后的内容即可发现两个错误。'),q('为什么 Phoebe 不想试理发机器？','她已看见其他机器出错，对可靠性有疑问。|她完全没看到任何发明。|她想让 Patrick 剪头发。',0,'这是依据前面接连出错作出的合理推断；不是把机器介绍当作可靠保证。')])
u['reading']=passage('Five inventions and their effects',[76],'阅读五种发明怎样改变通信、出行、娱乐与工作。重点是功能与影响，不把旧版“最伟大”排名当作客观结论。',
'''The webpage in the textbook chooses five important inventions.|教材里的网页选出了五种重要发明。|chooses 表示这是作者的选择和观点。
They are the radio, the plane, the television, the computer and the mobile phone.|它们是收音机、飞机、电视、计算机和手机。|先列出五种对象，有助于分组记忆。
Radio helps people send information across long distances.|无线电帮助人们远距离传递信息。|across long distances 是跨越很远的距离。
Planes make many long journeys much faster.|飞机让许多长途旅行更快。|make + 宾语 + 形容词，说明造成的变化。
Television brings moving pictures and sound into people's homes.|电视把动态画面与声音带进人们家中。|moving pictures 指活动影像。
Computers help people process information and complete many kinds of work.|计算机帮助人们处理信息、完成多种工作。|process 在这里是处理。
Mobile phones let people communicate away from a fixed telephone.|手机让人们不在固定电话旁也能联系。|away from 表示离开某个地点。
Each invention can solve a problem, but it can also create new difficulties.|每种发明能解决问题，也可能带来新的困难。|but 告诉我们还要考察另一面。
The best choice depends on the job that a person needs to do.|哪种最好，要看一个人需要完成什么任务。|depends on 是取决于；评价需要标准。''',
[q('文中哪一种发明主要让长途旅行更快？','飞机。|油画。|课桌。',0,'Planes 对应 long journeys，功能与对象要配对。'),q('如何更有依据地判断“哪个发明最好”？','只看名字最长的是哪个。|先说明要解决的问题，再比较作用。|所有人必须永远选同一个。',1,'价值取决于任务和需求，不能只背一个排名。')])
u['world']=passage('Levers: force, load and pivot',[78,79],'以图片中的木杆搬木头为例，认识力、重物与支点。这里只观察原理，不需要操作真实工具或重物。',
'''A lever is a simple machine that turns around a fixed point.|杠杆是绕一个固定点转动的简单机械。|simple machine 是简单机械。
The fixed point is called the pivot.|这个固定点叫支点。|is called 是被称为。
The object that we want to move is the load.|我们想移动的物体叫负载或重物。|load 在这里是被移动的对象。
A push or a pull applied to the lever is a force.|施加在杠杆上的推力或拉力是一种力。|force 是力，不是机器的名称。
In the picture, Gemma uses a pole resting on a rock.|图中 Gemma 用一根支在石头上的木杆。|resting on 说明木杆支在什么上面。
The rock is the pivot, and the heavy log is the load.|石头是支点，重木头是负载。|把术语与具体对象配对。
Pushing one end of the pole can lift the other end.|向下按木杆一端，可以抬起另一端。|one end 与 the other end 是两端对比。
The position of the pivot changes how much force is needed.|支点的位置会改变所需力的大小。|position 是位置；这也是课本观察活动的重点。''',
[q('Gemma 的例子中，哪一个是支点？','重木头。|石头。|她的帽子。',1,'木杆绕着石头支撑的位置转动，所以石头是 pivot。'),q('图中要被抬起的木头对应哪个词？','load|screen|paint',0,'load 指要移动的负载，这里就是重木头。')])
u['create']=dict(title='纸上发明发布会',pages=[77,80,81],tasks=['选一个日常小问题，画一台解决它的虚构机器；给按钮和操纵杆加标签。','写两句说明用途，再写一条还没解决的问题。','伙伴用 Can you tell me … ? 提问，你用 because 解释；只做绘画或纸模型。'],frame='My invention is called …\nIt helps people …\nThis button is for …\nIt has not got enough … yet.\nCan you tell me what … does?\nThat is because …',model='My invention is a book-finding robot. It helps me find books on a tall shelf. The blue button starts a search. The red switch stops the machine. It has not got enough space for large books yet. I need to improve the design before it can work well.',success='用途与按钮功能说清楚；能指出一条限制，正确使用一个间接问句和一个原因句。',teacher='对应第 77 页创意发明、第 80 页询问材料与工具、第 81 页生动写作；活动限定为纸上设计。')

u=U[7]
u['story']=passage('Alex, the engineer',[86,87],'虚构故事把孩子们带进登月控制室。工作人员突然睡着，Alex 帮助通讯；真相揭开后，大家向他道歉并致谢。',
'''The friends are in a space control room, where security officers suspect them.|朋友们来到太空控制室，保安怀疑他们。|suspect 表示怀疑；他们还没解释清自己的来历。
Suddenly, the engineers and guards fall asleep at their desks.|突然，工程师和保安在桌旁睡着了。|fall asleep 是开始睡着。
Phoebe notices that they had all been drinking tea.|Phoebe 注意到他们之前都喝过茶。|all 是寻找共同线索的重要词。
She thinks something in the tea caused the strange sleep.|她认为茶里的某种东西造成了异常入睡。|thinks 表示根据线索推断；此处是虚构情节。
A voice in a headset asks Houston for help.|耳麦里传来一个声音，向休斯敦请求帮助。|asks … for help 是向……求助。
Phoebe recognises the voice as Neil Armstrong's in the story.|在故事中，Phoebe 认出那是 Neil Armstrong 的声音。|历史人物被放入虚构冒险，不表示这些事件真的发生过。
Alex sits at the control panel and talks to the astronauts.|Alex 坐到控制面板前，与宇航员通话。|talks to 说明他在做什么。
His instructions help the astronauts continue their return journey.|他的指示帮助宇航员继续返回的旅程。|return journey 是返程。
When the engineers wake up, they hear that Alex has helped.|工程师醒来后，听说 Alex 提供了帮助。|when 引出场景变化。
A security officer apologises and says they have found the real spy.|一名保安道歉，说他们找到了真正的间谍。|apologises 是道歉，说明先前的怀疑有误。
Alex says a computer simulation taught him what to do, and the gate appears.|Alex 说自己从模拟游戏中学过这些操作，然后光门出现了。|这是故事设定；玩游戏不等于具备真实航天操作资格。''',
[q('Phoebe 发现了什么共同线索？','大家之前都喝过茶。|大家都戴着海盗眼罩。|大家刚从泳池出来。',0,'all been drinking tea 把工作人员睡着的现象联系起来。'),q('保安后来为什么道歉？','他忘了送生日礼物。|他先前怀疑孩子们，但真正的间谍另有其人。|他不喜欢月亮。',1,'故事结尾说已找到真正的间谍，并承认孩子们帮助了大家。')])
u['reading']=passage('Lost in space: a science-fiction story',[89],'科幻故事先写两只猴子失联，再跳到遥远未来。人物通过雕像发现两段情节的联系，并表达歉意与友好。',
'''The first part of this fictional story begins with two monkeys named Leo and Rosy.|这篇虚构故事第一部分介绍两只名叫 Leo 和 Rosy 的猴子。|fictional 明确它不是一份真实航天史记录。
Scientists send them into space and listen to sounds from the capsule.|科学家把它们送进太空，收听太空舱传来的声音。|from the capsule 指声音来自哪里。
At first, everything seems normal.|起初，一切看起来正常。|seems 表示看起来。
On the third day, the scientists lose contact with the animals.|第三天，科学家与动物失去联系。|lose contact 是失去联系。
The second part jumps forward eight hundred years.|第二部分把时间向前推进了八百年。|第一部分设在 1957 年，第二部分设在 2757 年，都是故事时间。
Commander Cormack's spacecraft lands on Pluto and meets monkey-like beings.|Cormack 指挥官的飞船降落在冥王星，遇到像猴子的生物。|冥王星属于矮行星；这里的生命情节是科幻想象。
A special microphone translates their languages so they can communicate.|一种特殊麦克风翻译双方语言，使他们能够交流。|so 表示结果：翻译让沟通成为可能。
The chief takes the visitors to a temple with a statue of two monkeys.|首领带访客来到一座有两只猴子雕像的庙。|statue 是雕像，成为连接两段故事的线索。
Cormack recognises Leo and Rosy and understands the connection.|Cormack 认出 Leo 和 Rosy，明白了两段故事的联系。|connection 是联系，不是两个毫无关联的故事。
He apologises for the past treatment of animals and hopes for friendship.|他为过去对待动物的方式道歉，并期待建立友谊。|apologises for 后接道歉的原因；主题是尊重与承担责任。''',
[q('哪件物品让 Cormack 明白了过去与未来的联系？','一只学校铃。|Leo 和 Rosy 的雕像。|一辆伦敦巴士。',1,'他认识两只猴子的形象，因此理解了两个故事部分的关联。'),q('这个文本应该怎样分类？','有真实动物居民的冥王星新闻。|可以照做的航天实验步骤。|包含时间跳跃的科幻故事。',2,'情节明确是 fiction，不能把幻想中的生活当作科学发现。')])
u['world']=passage('The changing shape of the moon',[90,91],'月亮反射阳光；我们看到的亮面随月球相对太阳与地球的位置而变化。分清“看起来的形状”和月亮本身的形状。',
'''The moon does not make its own light.|月亮本身不发光。|does not make 是关键否定。
We see it because it reflects light from the sun.|我们能看见它，是因为它反射太阳光。|reflects 表示反射。
As the moon travels around Earth, our view of its lit half changes.|月亮绕地球运动时，我们看到的受光部分会改变。|our view 强调从地球看到的样子。
A thin crescent can grow into a half moon and then a full moon.|细细的月牙看起来会逐渐变成半月，再到满月。|grow 在这里指可见亮面增大，不是月球变大。
We call the growing visible part waxing.|我们把可见亮面逐渐增大的阶段叫盈月阶段。|waxing 是逐渐变亮、变圆。
After the full moon, the visible lit part becomes smaller.|满月之后，可见的亮面开始缩小。|after 把月相按顺序连接。
This shrinking stage is called waning.|这一逐渐缩小的阶段叫亏月阶段。|waning 与 waxing 相对。
The moon itself does not turn into a thin slice; its appearance changes.|月亮本身没有变成薄片，变化的是我们看到的样子。|itself 与 appearance 区分物体和外观。''',
[q('月亮的光来自哪里？','它自己像灯泡一样发光。|太阳光的反射。|海洋中的电灯。',1,'reflects light from the sun 是文本的直接证据。'),q('月牙变成满月说明什么？','月亮本身从薄片长成圆球。|我们看到的受光部分发生变化。|月亮离开了太阳系。',1,'变化的是可见亮面的比例，月亮本身没有变形。')])
u['create']=dict(title='小调查：大家喜欢什么节目？',pages=[92,93],tasks=['设计一个节目偏好问题，选择 3–4 个选项，只统计愿意参与的家人或同学。','把真实回答计数并画简单条形图；没有调查时明确标为示例数据。','用 -ing 作主语说一种活动，再用 said that 转述一个人的观点。'],frame='My question was …\nI asked … people.\n… people chose …\nWatching … is …\nOne person said that …\nThis chart shows …',model='This is an example survey, not real data. I asked four imaginary viewers about programmes. Two chose documentaries, one chose cartoons, and one chose sports. Watching documentaries is interesting. One viewer said that she liked learning about animals.',success='数字与图一致；区分真实调查和示例；能正确使用一个 -ing 主语和一个转述句。',teacher='对应第 92 页电视调查与第 93 页表达观点；范文数据明确为虚构示例。')

u=U[8]
u['story']=passage('Rescuing the seal pups',[98,99],'朋友们想保护小海豹，却因登上浮冰而陷入危险。直升机救起他们，他们向警方提供信息；现实中保护动物应求助专业人员。',
'''The friends notice six seal pups resting on an ice floe.|朋友们注意到六只小海豹躺在浮冰上。|notice 是注意到；ice floe 是在水上漂动的冰块。
Phoebe knows about the animals from a documentary.|Phoebe 从一部纪录片中了解过这些动物。|from 表示知识来源。
She says they should not get too close because they might frighten the pups.|她说不应该靠得太近，因为可能吓到小海豹。|might 表示可能；保护动物也包括不打扰它们。
Two men arrive, and the children believe that the pups are in danger.|两个男人来了，孩子们认为小海豹面临危险。|believe 描述人物根据现场作出的判断。
The children go onto the ice to help, but the floe moves away from the land.|孩子们登上冰面想帮忙，可浮冰离岸漂走了。|but 标明好意之后出现的新问题。
Now they are stranded, and the sea is too cold to swim across.|现在他们被困住了，海水太冷，无法游回去。|stranded 是被困；这是故事对危险的描写。
Later, a helicopter crew sees them waving and rescues them.|后来，直升机人员看见他们挥手，把他们救了起来。|crew 是执行任务的工作人员。
The pilot explains that their action was dangerous and that they were lucky.|飞行员指出他们的行为很危险，他们获救很幸运。|没有把成功获救写成冒险一定有好结果。
The friends describe the two men and identify them in police photographs.|朋友们描述了那两个男人，并在警方照片中辨认他们。|identify 是辨认，提供信息是他们能做的帮助。
Finally, the yellow light returns, and the time travellers leave the icy place.|最后黄光再次出现，时间旅行者离开了冰雪之地。|先说明获救与报告，再讲魔法结尾。''',
[q('小海豹获救的意愿为什么又变成了孩子们的危险？','他们登上浮冰，冰离开岸边，自己被困。|他们在家看纪录片。|他们先向专家报告。',0,'故事显示“想帮忙”不等于行动安全，冰漂走是关键转折。'),q('回到安全地点后，孩子们怎样帮助警方？','用魔法找到了所有海豹。|描述男子并辨认照片。|自己驾驶直升机。',1,'他们提供观察到的信息，没有独立执行专业救援。')])
u['reading']=passage('Scott’s Antarctic journey',[101],'了解 Scott 探险队的目标、到达和艰难返程。以时间顺序阅读历史题材，同时认识勇气需要与准备、条件和安全判断结合。',
'''Robert Falcon Scott led an expedition towards the South Pole.|Robert Falcon Scott 带领一支探险队前往南极点。|led 是 lead 的过去式；expedition 是考察或探险队伍。
He hoped his team would be the first to reach it.|他希望自己的队伍第一个到达那里。|hoped 表示愿望，尚不等于结果。
The team travelled across ice in extremely difficult weather.|队伍在极其恶劣的天气下穿越冰原。|extremely difficult 强调环境困难。
Scott and four companions continued the final part of the journey on foot.|Scott 和四位同伴步行继续最后一段旅程。|on foot 是步行。
They reached the South Pole in January 1912.|他们于 1912 年 1 月到达南极点。|reached 后直接接地点，不加 to。
They found a Norwegian flag and learned that another team had arrived earlier.|他们发现挪威国旗，得知另一支队伍更早到了。|earlier 是更早；这里不沿用旧文不准确的“只早几天”。
The return journey was long, and the conditions became very severe.|返回路途漫长，环境变得十分严酷。|return journey 与出发时的目标不同。
Scott and his four companions died before they could return safely.|Scott 和四位同伴未能安全返回，全部遇难。|客观了解悲剧，不把牺牲生命作为孩子模仿的目标。
The diary later found with the expedition helped people understand their experience.|后来找到的探险日记帮助人们了解这段经历。|diary 是历史信息的一种来源。''',
[q('Scott 的目标是否完全实现？','是，他确认自己是第一个到达的人。|没有，他到达了南极点，但别人更早到达。|没有，他根本没有向南极出发。',1,'区分“到达南极点”与“第一个到达”这两个不同目标。'),q('哪种资料帮助后来的人了解这次经历？','一本日记。|一张未来城市广告。|一张海盗寻宝图。',0,'日记是文中提及的重要记录资料。')])
u['world']=passage('Glaciers: moving ice',[102,103],'冰川由长期积累、压实的雪形成，并会缓慢流动。用形成—移动—融化三步理解它与水的关系。',
'''A glacier is a large mass of ice that moves slowly.|冰川是会缓慢移动的大块冰体。|mass 在这里指一大片物质。
It can form where snow builds up over many years.|它能在雪多年累积的地方形成。|builds up 是逐渐堆积。
New layers press down on older snow, helping it turn into dense ice.|新雪层压在旧雪上，使它逐渐变成致密的冰。|layers 是层；dense 是紧密的。
The weight of the ice causes it to flow gradually.|冰体自身的重量使它逐渐流动。|gradually 是逐渐地，不是一下子滑走。
Valley glaciers move through mountain valleys.|山谷冰川在山谷中移动。|valley 对应本册后面的自然地形词汇。
Ice sheets cover much larger areas of land.|冰盖覆盖面积更大的陆地。|much larger 表示大得多。
When parts of a glacier reach warmer conditions, ice can melt into water.|冰川的一部分遇到更温暖的条件时，冰可能融化成水。|melt into water 是物态变化。
Pieces that break away into the sea can become icebergs.|断裂后进入海中的冰块可能形成冰山。|break away 是分离、断裂出去。
Studying glaciers helps us understand stored fresh water and environmental change.|研究冰川有助于理解淡水储存与环境变化。|不需要背旧版百分比，也能讲清基本关系。''',
[q('冰川中的冰主要怎样形成？','多年积雪逐渐压实成冰。|岩石瞬间变成水蒸气。|每一块冰都来自人工冰箱。',0,'关键词是 over many years、layers、press down。'),q('冰山可能怎样形成？','沙子被风吹到树上。|冰川的一部分断裂进入海中。|海水中的所有鱼一起冻结。',1,'break away into the sea 描述冰山形成的一种过程。')])
u['create']=dict(title='旅行计划还没定',pages=[104,105],tasks=['选一个假想的寒冷地区旅行，列出地点、同行人、交通和活动。','把尚未确定的项目用 may / might 表达，并说明一个影响因素。','与伙伴做计划核对对话，再用一句话说明现实中会向谁获取可靠帮助。'],frame='We may go to …\nWe might travel by …\nIt depends on …\nYou are going with …, aren’t you?\nWe have not decided yet.\nWe will ask … for advice.',model='We might visit a snowy town during the holidays. We may travel by train, but we have not decided yet. It depends on the weather and our family’s plans. We might visit a museum if the weather is bad. We will ask a local guide about suitable activities.',success='至少两处可能性表达；一个正确的附加问句；不把不确定计划说成已确定事实。',teacher='对应第 104 页不确定假期计划角色卡；第 105 页影视评论可作延伸任务。')

u=U[9]
u['story']=passage('The chase',[110,111],'恐龙追逐把冒险推向结尾。孩子们回到科学课，似乎不记得经历，Patrick 口袋里的手镯却留下了证据。',
'''The friends see a huge triceratops eating plants near some bushes.|朋友们看到一只巨大的三角龙在灌木附近吃植物。|triceratops 是三角龙；故事把动物安排在幻想场景中。
Alex wants to move closer because he knows it is a herbivore.|Alex 想靠近，因为他知道它是食草动物。|herbivore 是食草动物，但不表示可以安全靠近野生动物。
Phoebe warns that even a plant-eater can be frightened.|Phoebe 提醒说，食草动物也会受惊。|even 强调“即使如此也会”。
Small dinosaurs with sharp teeth come out and surround Alex.|一些有尖牙的小恐龙走出来，围住了 Alex。|surround 是包围。
A much larger Tyrannosaurus rex appears, and the smaller animals scatter.|一只大得多的霸王龙出现，小动物们四散逃开。|scatter 是向各处散开。
The friends run, but the large predator chases them.|朋友们跑起来，可大型捕食者追着他们。|predator 是捕食者；but 表示困难没有解决。
A giant pterosaur picks them up and carries them towards its nest.|一只巨大的翼龙抓起他们，带往自己的巢。|翼龙是飞行爬行动物；这段不是准确的恐龙年代分类课。
As it drops them above the nest, the yellow light appears.|当翼龙在巢上方松开他们时，黄光出现了。|as 表示两个动作同时发生。
The children land back in Mr Davis's classroom.|孩子们回到了 Davis 老师的教室。|back 与开篇的科学课形成首尾呼应。
He says they vanished for only a second or two after the explosion.|他说爆炸后他们只消失了一两秒钟。|only 强调教室时间与冒险经历的反差。
The friends seem to remember nothing, but Patrick finds an old bracelet in his pocket.|朋友们似乎什么都不记得，Patrick 却从口袋里找到一只旧手镯。|bracelet 回扣伦敦大火中获得的礼物，留下悬念。''',
[q('结尾哪件物品把故事与伦敦大火一集联系起来？','旧手镯。|学校垃圾桶。|未来列车票。',0,'手镯是获救小孩的母亲送给 Patrick 的。'),q('结尾为什么让人产生悬念？','老师说他们离开了十年。|他们似乎忘了冒险，却有手镯这样的线索。|所有人物都变成了海盗。',1,'记忆与实物证据形成反差，读者会继续思考冒险是否真的发生。')])
u['reading']=passage('Life around a pond',[112,113],'池塘周围的动物各有外形与行为特征。读描述时用“它是什么—长什么样—怎样生活”来整理信息。',
'''A pond and its edges can be home to many kinds of wildlife.|池塘及周围可以成为许多野生生物的家园。|be home to 表示是……的栖息地。
The article describes birds, mammals, insects and small fish.|文章介绍鸟类、哺乳动物、昆虫和小鱼。|先分大类，再记具体特征。
A male mallard is easy to recognise by its green head.|雄性绿头鸭的绿色头部容易辨认。|male 指雄性；并不是所有鸭子都有绿色头。
Newts are amphibians with long tails and live near water.|蝾螈是有长尾巴、在水边生活的两栖动物。|amphibians 是两栖动物这一大类。
A kingfisher may appear as a quick flash of blue before flying away.|翠鸟飞走之前，可能只让人看到一道快速的蓝色身影。|a flash of blue 是形象描写，不是闪光灯。
A heron waits patiently and uses its long beak to catch food.|苍鹭耐心等待，用长喙捕食。|patiently 是耐心地，描述行为方式。
Water voles live near the banks and eat grass and other plants.|水䶄生活在岸边，吃草和其他植物。|water vole 是水䶄，一种啮齿动物，不必误认成普通家鼠。
Dragonflies have four wings and can be seen flying above the water.|蜻蜓有四片翅膀，可以在水面上方看到它们飞行。|four wings 是用于辨认的特征。
Quiet observation helps us notice differences without disturbing the animals.|安静观察帮助我们发现差别，同时不打扰动物。|without disturbing 表示避免干扰；不需要靠近水边或捕捉动物。''',
[q('哪种动物在文中以四片翅膀为特征？','蜻蜓。|苍鹭。|水䶄。',0,'Dragonflies 对应 four wings，是直接的外形信息。'),q('哪一种整理方式最能帮助读懂这篇说明文？','只数逗号。|动物名称、外形特征、行为或食物。|把全部动物都写成鱼。',1,'文本通过特征和行为区分不同动物，分类记录最有效。')])
u['world']=passage('Fossils: evidence from the past',[114,115],'化石是古代生物遗骸或活动痕迹的保存记录。通过埋藏、保存、发现和研究，理解科学家怎样从证据认识过去。',
'''Fossils are preserved remains or traces of life from the past.|化石是过去生物遗骸或活动痕迹保存下来的记录。|remains 是遗骸，traces 包括足迹等活动痕迹。
They can include bones, shells, teeth and footprints.|它们可以包括骨骼、贝壳、牙齿和足迹。|include 表示列举，化石不只有恐龙骨头。
An animal may be buried in mud or other sediment after it dies.|动物死后，可能被泥或其他沉积物掩埋。|may 表示一种可能过程，并非每个动物都会形成化石。
Over a long time, some hard parts or their shapes can be preserved.|经过很长时间，一些坚硬部分或其形状可能保存下来。|preserved 是被保存；强调长时间与条件。
The surrounding layers can become rock.|周围的沉积层可能变成岩石。|layers 把过程与地层联系起来。
Palaeontologists study fossils to learn about ancient life.|古生物学家研究化石，以了解古代生命。|palaeontologists 可分块练读，先理解“研究古生物的人”。
They record where a fossil was found and examine it carefully.|他们记录化石的发现地点，并仔细检查。|where 引出证据的位置信息。
Some fossils are prepared for museum displays so other people can learn from them.|一些化石会被整理用于博物馆展示，让更多人学习。|displays 是展览；整理与研究需要专业人员。
A model imprint made in clay is useful for learning, but it is not an ancient fossil.|在黏土里制作的印痕模型有助于学习，但并不是真正的古代化石。|model 与 fossil 分开，避免把课堂手工当作自然证据。''',
[q('哪一项也可以成为化石记录？','古代生物留下并保存下来的足迹。|今天刚写完的购物单。|任何刚掉下来的树叶都自动是化石。',0,'化石可以是遗骸，也可以是经过保存的活动痕迹。'),q('自己做的黏土印痕与真正化石有什么关系？','它是教学模型，不是古代自然形成的化石。|它立刻有几千万年历史。|它能证明任何恐龙都生活在同一时代。',0,'模型用来帮助理解过程，不等于真实的古代证据。')])
u['create']=dict(title='我的证据海报与假设故事',pages=[116,117],tasks=['从课内已核对的内容选一只动物或一种化石，画大图并列 3 个要点。','用 I know … because … 说明一个有证据的判断；不了解的信息写“尚不确定”。','再用 If I …, I would … 创作 2 句想象，与事实部分分开展示。'],frame='My topic is …\nHere are three things I learned: …\nMy evidence comes from page …\nI am not sure about …\nIf I found …, I would …',model='My topic is fossils. Fossils can be remains or traces of ancient life. They may include shells, bones or footprints. Scientists study them carefully. I learned this from the fossil pages in my book. If I found an unusual stone, I would photograph it and ask an expert about it.',success='海报内容有来源，能分清事实、尚不确定的信息和假设；至少正确使用一个第二条件句。',teacher='对应第 116 页海报展示；第 117 页藏头诗可作为可选创作。未给出没有原音就无法核实的恐龙海报听力填空答案。')

BOOK['glossary']=[dict(word=a,zh=b) for a,b in [
 ('Alex','Alex：时间旅行者之一，戴眼镜的男孩'),('Phoebe','Phoebe：时间旅行者之一，善于观察和判断地点'),('Patrick','Patrick：时间旅行者之一，经常行动很快'),('Mr Davis','Davis 老师：孩子们的科学老师'),
 ('experiment','实验'),('powder','粉末'),('mixture','混合物'),('goggles','护目镜'),('explosion','爆炸'),('instructions','说明；指示'),('accident','事故；意外'),('already','已经'),('yet','还；已经（常见于否定或问句）'),('episode','一集；一个故事篇章'),
 ('treasure','宝藏；珍爱的东西'),('pirate','海盗'),('prisoner','被关押的人'),('sneeze','打喷嚏'),('helmet','头盔'),('copper','铜'),('parade','游行；阅兵'),('inn','客栈'),('blurb','书的简短介绍'),('review','评论'),('biography','传记'),
 ('unicycle','独轮车；第 22 页补充词'),('inline skates','直排轮滑鞋；第 22 页补充词'),('impatient','不耐烦的；心急的'),('emergency','紧急情况'),('passenger','乘客'),('destination','目的地'),('prediction','预测'),('pollution','污染'),
 ('Rhodopis','Rhodopis：传说中的女孩'),('symbol','符号'),('servant','仆人'),('scorpion','蝎子'),('corridor','走廊'),('cube','正方体'),('cylinder','圆柱'),('vertex','顶点'),('edge','棱；边缘'),('face','面；脸'),('net','网；几何图形的展开图'),
 ('cheer','欢呼'),('rower','赛艇选手'),('sore','疼痛的'),('muscle','肌肉'),('voluntary','随意的；能有意识控制的'),('involuntary','不随意的；不需要有意识决定的'),('skeleton','骨骼；骨架'),('energy','能量'),
 ('Mr Fisher','Fisher 先生：伦敦大火故事中的人物'),('bracelet','手镯'),('belongings','个人物品'),('furniture','家具'),('wax','蜡'),('raven','渡鸦'),('impressionism','印象派'),('brush stroke','笔触'),
 ('Professor Potts','Potts 教授：虚构的发明家'),('nails','钉子；第 70 页补充词'),('paint pot','颜料罐；第 70 页补充词'),('invention','发明'),('pivot','支点'),('load','负载；要移动的物体'),('force','力'),('purpose','用途；目的'),('reliable','可靠的'),
 ('Houston','休斯敦：故事中的航天控制中心所在地'),('astronaut','宇航员'),('engineer','工程师'),('simulation','模拟'),('spy','间谍'),('apologise','道歉'),('Pluto','冥王星，属于矮行星'),('reflect','反射'),('crescent','月牙；新月形'),('waxing','月亮可见亮面逐渐增大'),('waning','月亮可见亮面逐渐减小'),
 ('documentary','纪录片'),('stranded','被困住；无法离开'),('rescue','救援'),('expedition','考察；探险'),('companion','同伴'),('glacier','冰川'),('ice sheet','冰盖'),('melt','融化'),('climate','气候'),
 ('triceratops','三角龙'),('Tyrannosaurus rex','霸王龙'),('pterosaur','翼龙；飞行爬行动物'),('herbivore','食草动物'),('predator','捕食者'),('nest','巢'),('mallard','绿头鸭'),('newt','蝾螈'),('kingfisher','翠鸟'),('heron','苍鹭'),('water vole','水䶄；一种在水边生活的啮齿动物'),('dragonfly','蜻蜓'),('fossil','化石'),('palaeontologist','古生物学家'),('sediment','沉积物'),('evidence','证据'),('trace','痕迹'),('preserve','保存')
]]

# Explicit coverage notes let the common portal avoid promising untouched textbook audio.
BOOK['coverageNote']='10 个单元、80 个学习模块：课文词汇选读、双语语法、故事改写、主题阅读、发音或功能语块、跨学科理解、表达任务、综合挑战。第 2、4、6、8 单元的教材为功能对话，本站如实标注；其语音练习是教学新编。含逐页原书对照，不冒充原版录音或教师答案。'
