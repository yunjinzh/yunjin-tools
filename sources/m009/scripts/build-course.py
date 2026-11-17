from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
def lines(s): return [x.strip().split('|') for x in s.strip().splitlines() if x.strip()]
def question(prompt,options,answer,why,kind='meaning'):
    return dict(prompt=prompt,options=options.split('|'),answer=answer,why=why,kind=kind)
def passage(title,pages,kind,summary,text,qs):
    return dict(title=title,pages=pages,kind=kind,summary=summary,sentences=[dict(en=a,zh=b,note=c if len(row)>2 else '') for row in lines(text) for a,b,*rest in [row] for c in [rest[0] if rest else '']],questions=qs)
U=[]
meta=[
 ('Well done, Ben and Lucy!','出发吧，小探险家',4,9,'🎡','给小探险家做一次采访','The Explorers',6),
 ('In the museum','博物馆的秘密',10,21,'🏛️','说清楚金猫为什么消失又回来','It’s midnight',12),
 ('The world around us','身边的大世界',22,33,'🌿','描述最喜欢的地方，讲清一次出游','Walking with Mum',24),
 ('Danger!','紧急时刻',34,45,'🚒','用过去进行时讲清当时发生的事','Yesterday at half past nine',36),
 ('Two return tickets','坐上故事列车',46,57,'🚆','买一张车票，讲清旅途中的插曲','Mr Knocks',48),
 ('Police!','小侦探出动',58,69,'🔎','描述人物外貌，找到故事的关键证据','Who are you?',60),
 ('Mythical beasts','神奇动物研究所',70,81,'🐉','比较动物，讲一个有起因和结果的故事','The most beautiful dinosaur',72),
 ('Orchestra practice','森林里的音乐会',82,93,'🎻','说清物品属于谁，表达自己的梦想','Chaos in the classroom',84),
 ('In the planetarium','星空探险计划',94,105,'🪐','描述未来，写一张来自月球的明信片','One day I’ll be an astronaut',96),
 ('At the campsite','营地寻宝终点站',106,117,'⛺','准备野餐，复述完整的寻宝结局','We’re going on a picnic',108)]
for i,(title,zh,start,end,icon,goal,song,sp) in enumerate(meta):
 U.append(dict(id=i,title=title,zh=zh,start=start,end=end,icon=icon,goal=goal,song=dict(title=song,page=sp),grammarPage=118+i,teacher=f'T{start}–T{end}',grammar=[],extra=[]))
vocab=[
'''big wheel|摩天轮|We can see the town from the big wheel.
rollercoaster|过山车|The rollercoaster is very fast.
roundabout|旋转木马；游乐场转盘|The children are on the roundabout.
mayor|市长|The mayor says, “Well done!”
dodgem cars|碰碰车|I like driving the dodgem cars.
microphone|麦克风|The journalist has a microphone.
band|乐队|The band is playing music.
photographer|摄影师|The photographer is taking a photo.
journalist|记者|The journalist asks Ben a question.''',
'''queen|女王；王后|The queen is wearing a crown.
knight|骑士|The knight has a shield.
crown|王冠|Look at the gold crown.
helmet|头盔|The knight is wearing a helmet.
necklace|项链|This necklace is very old.
bracelet|手镯；手链|Give her the bracelet, please.
belt|腰带|The knight has a brown belt.
shield|盾牌|There is a symbol on the shield.
bow and arrow|弓箭|You mustn't touch the bow and arrow.
sword|剑|The knight is holding a sword.''',
'''mountain|山|We walked to the top of the mountain.
forest|森林|There are many trees in the forest.
village|村庄|The village is near the lake.
lake|湖|The lake is quiet and beautiful.
island|岛|There is a small island in the lake.
field|田野；田地|The horses are in the field.
river|河流|The river runs through the village.
path|小路|Follow the path to the forest.''',
'''fire|火；火灾|The firefighters put out the fire.
flood|洪水|The flood covered the road.
emergency services|应急救援部门|Lucy called the emergency services.
police car|警车|A police car stopped near the house.
police officer|警察|The police officer helped us.
fire engine|消防车|A fire engine arrived.
firefighter|消防员|The firefighter was carrying a hose.
ambulance|救护车|The ambulance took the man to hospital.
paramedic|急救人员|The paramedic helped the man.''',
'''station|车站|We arrived at the station at nine.
platform|站台|Our train is at platform two.
escalator|自动扶梯|The escalator is moving slowly.
ticket office|售票处|Let's go to the ticket office.
train driver|火车司机|The train driver is in the front of the train.
stairs|楼梯|We walked up the stairs.
rucksack|双肩背包|The map is in my rucksack.
suitcase|手提箱；行李箱|This suitcase is heavy.
a cup of coffee|一杯咖啡|Dad would like a cup of coffee.
a cup of tea|一杯茶|Mum would like a cup of tea.''',
'''dark|深色的|He has got dark hair.
blonde|金色头发的|She has got blonde hair.
fair|浅色头发的|The boy has got fair hair.
moustache|唇上的胡子|The man has got a moustache.
curly|卷曲的|Her hair is curly.
beard|下巴和脸颊上的胡须|My grandpa has got a beard.
scar|伤疤|He has got a scar on his cheek.
straight|直的|She has got long straight hair.''',
'''tail|尾巴|The dragon has got a long tail.
horn|角|The beast has got two horns.
back|背部|There are scales on its back.
scales|鳞片|Fish have got scales.
wing|翅膀|This bird has got a broken wing.
neck|脖子|The giraffe has got a long neck.
feathers|羽毛|The bird has got blue feathers.
tongue|舌头|The beast has got a long tongue.''',
'''tambourine|铃鼓|I can play the tambourine.
triangle|三角铁|Listen to the triangle.
trumpet|小号|The map is in the trumpet.
trombone|长号|Ben plays the trombone.
drums|鼓|Lucy plays the drums.
harp|竖琴|The harp makes a beautiful sound.
saxophone|萨克斯管|Can you play the saxophone?
keyboard|电子键盘乐器|This keyboard is mine.
violin|小提琴|The bear loves playing the violin.''',
'''planet|行星|Earth is a planet.
rocket|火箭|The rocket will fly into space.
UFO|不明飞行物|They saw a UFO in the story.
star|恒星；星星|The sun is a star.
comet|彗星|The comet moves around the sun.
telescope|望远镜|We can look at the moon through a telescope.
astronaut|宇航员|One day I will be an astronaut.
moon|月亮；卫星|The moon goes around Earth.
space station|空间站|The astronauts live on a space station.''',
'''sail a boat|驾驶帆船|We could sail a boat.
swing on a rope|抓着绳子荡|They swing on a rope in the picture.
dive into the water|潜入水中|He can dive into the water.
row a boat|划船|Ben and Lucy row a boat.
dry your clothes|晾干你的衣服|You need to dry your clothes.
make a raft|制作木筏|Tom wants to make a raft.
put up a tent|搭帐篷|We can put up a tent together.
make a fire|生火|The adults make a fire at the campsite.
collect wood|收集木柴|They collect wood for the fire.''']
for u,v in zip(U,vocab): u['vocab']=[dict(word=a,zh=b,example=c) for a,b,c in lines(v)]

def gram(u,title,rule,examples,questions):
 U[u]['grammar'].append(dict(title=title,rule=rule,examples=[dict(en=a,zh=b) for a,b in lines(examples)],questions=questions))
Q=question
gram(0,'现在的习惯：do / does','问习惯用 Do / Does + 人 + 动词原形？he / she / it 用 does。问身份或状态则用 am / is / are。',
'''Do you like adventures?|你喜欢冒险吗？
Does Lucy like Buster?|Lucy 喜欢 Buster 吗？
Is Ben your friend?|Ben 是你的朋友吗？''',[
 Q('___ Lucy like adventures?','Do|Does|Is',1,'Lucy 是第三人称单数；like 是实义动词，所以用 Does。','grammar'),Q('Does he ___ football?','plays|playing|play',2,'does 已承担第三人称变化，后面用动词原形 play。','grammar')])
gram(0,'过去发生了什么：did / was / were','问过去的动作，用 Did + 人 + 动词原形？问过去的状态，用 was / were；I / he / she / it 用 was，you / we / they 用 were。',
'''Did you find the statue?|你找到雕像了吗？
Where were you yesterday?|你昨天在哪里？
Was it exciting?|那很刺激吗？''',[
 Q('Did you ___ the map?','found|find|finding',1,'Did 后用原形 find，不用 found。','grammar'),Q('Where ___ you yesterday?','was|did|were',2,'这里问过去在哪里，you 搭配 were。','grammar')])
gram(1,'博物馆规则：must / mustn’t','must 表示必须；mustn’t 表示禁止。后面都接动词原形。mustn’t 不是“不必”。',
'''You must be quiet.|你必须保持安静。
You mustn't touch the sword.|你不能触摸这把剑。''',[
 Q('展品不能碰：You ___ touch the exhibits.','must|mustn’t|are',1,'禁止做某事用 mustn’t。','grammar'),Q('We must ___ quiet.','are|being|be',2,'情态动词 must 后用原形 be。','grammar')])
gram(1,'把东西给谁：宾语代词','give / show / tell 后可以先说接收者，再说物品。I→me，he→him，she→her，we→us，they→them；you 和 it 不变。',
'''Give me the book, please.|请把书给我。
He showed them the statue.|他把雕像展示给他们看。''',[
 Q('Lucy needs the map. Give ___ the map.','she|her|hers',1,'动词后的 Lucy 用宾格 her。','grammar'),Q('The children want a story. Tell ___ a story.','them|they|their',0,'tell 后用宾格 them。','grammar')])
gram(2,'把意思连接起来：and / but / because / so','and 添加；but 转折；because 引出原因；so 引出结果。先分清两半句的关系，再选连接词。',
'''I was hungry, but there was no food.|我饿了，但是没有食物。
We went home because it was late.|我们回家了，因为时间晚了。
It was raining, so we stayed inside.|下雨了，所以我们待在室内。''',[
 Q('I stayed home ___ I was ill.','because|but|so',0,'生病是待在家的原因，所以用 because。','grammar'),Q('It was raining, ___ we took an umbrella.','because|so|but',1,'带伞是下雨带来的结果，用 so。','grammar')])
gram(2,'过去的能力：could / couldn’t','could 表示过去能做，couldn’t 表示过去不能做。后面用动词原形；问句把 Could 放前面。',
'''I could swim when I was six.|我六岁时会游泳。
Could you ride a bike when you were five?|你五岁时会骑自行车吗？''',[
 Q('When I was two, I ___ ride a bike. 我那时不会。','could|couldn’t|can',1,'过去不会，用 couldn’t。','grammar'),Q('Could she ___ when she was five?','swam|swimming|swim',2,'could 后用原形 swim。','grammar')])
gram(3,'过去某一刻正在做：was / were + ing','过去进行时把镜头停在过去某一刻。I / he / she / it + was；you / we / they + were；后面加动词 ing。',
'''Tilly was playing with a ball.|Tilly 当时正在玩球。
They were swimming.|他们当时正在游泳。''',[
 Q('At eight, Tilly ___ playing with a ball.','is|was|were',1,'过去时间，Tilly 是单数，用 was。','grammar'),Q('The children were ___ a sandcastle.','built|build|building',2,'过去进行时为 were + building。','grammar')])
gram(3,'问当时在做什么','一般问句把 Was / Were 放到主语前；回答用 Yes, … was/were 或 No, … wasn’t/weren’t。特殊问句可用 What were … doing?。',
'''Were they reading? Yes, they were.|他们当时在阅读吗？是的。
What was she doing?|她当时在做什么？''',[
 Q('___ you sleeping at nine?','Was|Did|Were',2,'you 搭配 were。','grammar'),Q('Was he running? No, he ___.','wasn’t|weren’t|didn’t',0,'用问句中的 was 回答，否定是 wasn’t。','grammar')])
gram(4,'时间小标签：at / in / on','at 接钟点；in 接月份、年份、季节和 morning / afternoon / evening；on 接星期、日期、具体某天的早午晚。',
'''The train leaves at nine o'clock.|火车九点出发。
We travel in July.|我们七月旅行。
We went on Saturday morning.|我们周六早上去的。''',[
 Q('The train leaves ___ 8:30.','on|in|at',2,'具体钟点用 at。','grammar'),Q('We arrived ___ Monday morning.','on|at|in',0,'具体某天的早上用 on。','grammar')])
gram(4,'长动作遇上短动作：when','was/were + ing 描述当时正在进行的动作；when 引出发生的另一个动作，常用一般过去时。',
'''I was reading when the train stopped.|火车停下来时，我正在阅读。
When she arrived, we were waiting.|她到达时，我们正在等候。''',[
 Q('I was sleeping when the phone ___.','rings|rang|ringing',1,'背景动作用 was sleeping，发生的动作用过去式 rang。','grammar'),Q('When I arrived, they ___ football.','were playing|play|plays',0,'到达那一刻正在踢球，选 were playing。','grammar')])
gram(5,'以前常常：used to','used to + 动词原形，表示过去的习惯或状态，通常暗示现在不同。不要把 used to 后的动词再变成过去式。',
'''He used to steal jewellery.|他过去常偷珠宝。
I used to have short hair.|我以前留短发。''',[
 Q('I used to ___ short hair.','had|having|have',2,'used to 后接原形 have。','grammar'),Q('He used to live in London. 说的是：','过去的情况|明天的计划|正在发生的事',0,'used to 描述过去的习惯或状态。','grammar')])
gram(5,'过去不得不：had to','had to + 动词原形，表示过去必须做或不得不做。它讲的是当时的必要性。',
'''The detective had to find him.|侦探当时必须找到他。
We had to wait for the train.|我们当时不得不等火车。''',[
 Q('Yesterday I ___ finish my homework.','have|had to|has',1,'yesterday 是过去；必须做用 had to。','grammar'),Q('They had to ___ early.','leave|left|leaving',0,'had to 后用动词原形 leave。','grammar')])
gram(6,'比较与“最”：comparatives / superlatives','两者比较常用 -er + than 或 more + 长形容词；在一组中最……用 the -est 或 the most。good→better→best；bad→worse→worst。',
'''This dragon is bigger than that one.|这条龙比那条大。
It is the most beautiful beast.|它是最漂亮的神兽。
This is the best story.|这是最好的故事。''',[
 Q('This beast is ___ than that one.','bigger|biggest|the big',0,'than 提示两者比较，用 bigger。','grammar'),Q('This is the ___ picture of all.','better|good|best',2,'of all 表示范围内“最”，good 的最高级是 best。','grammar')])
gram(6,'它长什么样：look like','What does it look like? 问外貌。用 It has got… / It looks like… 回答；不是问它喜欢什么。',
'''What does it look like?|它长什么样？
It looks like a dragon.|它看起来像一条龙。
It has got wings and a long tail.|它有翅膀和长尾巴。''',[
 Q('What does it look like? 应回答：','It likes fish.|It has got two horns.|It can run.',1,'look like 问外貌特征，two horns 是两个角。','grammar'),Q('It looks ___ a dragon.','as|at|like',2,'looks like 表示“看起来像”。','grammar')])
gram(7,'这是谁的：mine / yours / his / hers / ours / theirs','这些名词性物主代词能独立代替“某人的东西”，后面不再加名词。my violin = mine；her drum = hers。',
'''This violin is mine.|这把小提琴是我的。
Those drums are hers.|那些鼓是她的。
Is this yours?|这是你的吗？''',[
 Q('This is my violin. It is ___.','my|mine|me',1,'独立代替 my violin 用 mine。','grammar'),Q('Those are her drums. They are ___.','hers|her|she',0,'独立代替 her drums 用 hers。','grammar')])
gram(7,'补充说明：who / which / where','who 介绍人；which 介绍物或动物；where 介绍地点。找到前面要说明的名词，就更容易选择。',
'''A musician is a person who plays music.|音乐家是演奏音乐的人。
This is the cup which has the line on it.|这是写着那句诗的杯子。
This is the hall where we play.|这是我们演奏的大厅。''',[
 Q('A drummer is a person ___ plays drums.','where|which|who',2,'person 是人，用 who。','grammar'),Q('This is the place ___ we practise.','where|who|which',0,'这里说明练习的地点，用 where。','grammar')])
gram(8,'谈未来：will / won’t','will + 动词原形描述未来；will not = won’t。提问把 Will 放在主语前。I will = I’ll。',
'''I will visit the moon.|我将去月球。
I won't forget you.|我不会忘记你。
Will you be an astronaut?|你会成为宇航员吗？''',[
 Q('One day I will ___ an astronaut.','am|be|being',1,'will 后用原形 be。','grammar'),Q('will not 可以缩写为：','wasn’t|wouldn’t|won’t',2,'will not = won’t。','grammar')])
gram(8,'怎样做：副词','副词描述动作怎样发生；很多形容词加 -ly：slow→slowly，careful→carefully。happy→happily；good 的副词是 well。',
'''Read the message carefully.|仔细读这条信息。
She smiled happily.|她开心地笑了。
He plays well.|他演奏得好。''',[
 Q('Please speak ___. 请轻声说。','quiet|quietly|quieter',1,'修饰 speak 这个动作用副词 quietly。','grammar'),Q('She smiled ___.','happy|happily|happiness',1,'修饰 smiled 用 happily。','grammar')])
gram(9,'数一数，装一装','可数名词可以直接数 apples；不可数名词如 bread / milk，可用容器或份量数：a loaf of bread，two bottles of milk。复数变化在容器词上。',
'''We need some bread and some apples.|我们需要一些面包和苹果。
There are two loaves of bread.|有两条面包。
We need a packet of crisps.|我们需要一包薯片。''',[
 Q('两瓶牛奶：two ___ of milk','bottle|bottles|milks',1,'数量 two 让容器 bottle 变成 bottles；milk 不加 s。','grammar'),Q('两条面包：two ___ of bread','loaf|loafs|loaves',2,'loaf 的复数是 loaves。','grammar')])
gram(9,'问数量：How much / How many','How many + 可数名词复数；How much + 不可数名词。先看问的是 apples 还是 milk。',
'''How many apples do we need?|我们需要多少个苹果？
How much milk have we got?|我们有多少牛奶？''',[
 Q('How ___ apples do we need?','much|many|any',1,'apples 是可数名词复数，用 many。','grammar'),Q('How ___ bread have we got?','many|much|some',1,'bread 在这里不可数，用 much。','grammar')])

phonics=[
 ('押韵小搭档','结尾的声音相同就可能押韵，拼写可以不同。先听声音，再看字母。','train|plane\nboys|noise\nSue|too','train 和哪个词押韵？','plane|tree|cat',0,9),
 ('ow 有两种声音','crown 的 ow 读 /aʊ/，像 now；arrow 的 ow 读 /əʊ/，像 show。','crown|clown\nshow|window\ncrowd|now','哪个词与 crown 的 ow 发音相同？','window|clown|show',1,15),
 ('有些字母不发音','先听整个词：write 的 w、rhino 的 h、sign 的 g、island 的 s 不发音。不要把每个字母都硬读出来。','write|right\nknow|no\nsign|island','write 中不发音的字母是？','w|r|t',0,27),
 ('/aɪ/ 的不同拼法','bike 的 i_e 和 light 的 igh 都可表示 /aɪ/。knight 的 k 不发音。','bike|light\nnight|knight\nbright|write','与 light 韵母相同的是？','feet|night|late',1,39),
 ('/eə/，找同一个声音','英式发音中，bear、chair、stairs、pear 都有 /eə/；不同口音的 r 音可能不同。','bear|pear\nchair|hair\nstairs|wear','哪个词与 bear 押韵？','bee|bird|pear',2,51),
 ('/ɑː/ 和 /ɔː/','英式示范中，car、farm 是 /ɑː/；horse、four 是 /ɔː/。先分成两组再跟读。','car|farm\nhorse|four\nscar|dark','哪个与 car 属于同一组？','farm|horse|four',0,63),
 ('ea 不总读一样','beast、beans 的 ea 是 /iː/；feather、head 的 ea 是 /e/。看到相同字母也要留意词的发音。','beast|beans\nfeather|head\nbread|weather','哪个词的 ea 与 beast 相同？','bread|beans|head',1,75),
 ('/ɜː/ 和 /ɔː/','英式示范中，bird、word 是 /ɜː/；short、tall 是 /ɔː/。字母不同也可能同音。','bird|word\nshort|tall\nfirst|purple','哪个词与 bird 的元音相同？','word|short|tall',0,87),
 ('轻重拍与 /ə/','surfer、dancer、farmer 的最后一个音节读得轻，英式发音常为 /ə/。不要把每个音节都读得一样重。','surfer|dancer\nfarmer|teacher\nrocket|planet','farmer 通常重读哪个音节？','第一个|第二个|两个都一样重',0,99),
 ('句子里的轻音词','先把名词和主要动词读清楚；a、the、to、of 等小词在自然句子里常读轻。放慢速度仍要连成意思组。','a cup of tea|a bottle of milk\nput up a tent|row a boat\ncollect wood|make a raft','“a cup of tea”中通常最承载信息的词是？','a 和 of|cup 和 tea|只有 of',1,111)]
for u,x in zip(U,phonics):
 title,note,pairs,q,opts,a,p=x
 u['phonics']=dict(title=title,note=note,pairs=[dict(a=a,b=b) for a,b in lines(pairs)],page=p,questions=[Q(q,opts,a,note,'phonics')])

if __name__=='__main__':
 # Content is kept in a second authoring file to make source review manageable.
 exec((ROOT/'scripts/course-readings.py').read_text())
 for u in U:
  for area in ['story','reading','world']:
   for i,s in enumerate(u[area]['sentences']):s['id']=f"u{u['id']}-{area}-s{i}"
   for i,q in enumerate(u[area]['questions']):q['id']=f"u{u['id']}-{area}-q{i}"
  for gi,g in enumerate(u['grammar']):
   for qi,q in enumerate(g['questions']):q['id']=f"u{u['id']}-g{gi}-q{qi}"
  for i,q in enumerate(u['phonics']['questions']):q['id']=f"u{u['id']}-ph-q{i}"
  u['questions']=[q for g in u['grammar'] for q in g['questions']]+u['story']['questions']+u['reading']['questions']+u['world']['questions']+u['phonics']['questions']
 data=dict(version=2,title='Super Minds 4',edition='Cambridge University Press · 2012',units=U,
  glossary=[dict(word=a,zh=b) for a,b in lines('''explorer|探险者
explorers|探险者们
adventure|冒险
adventures|冒险经历
treasure|宝藏
symbol|符号；标记
diamond|钻石；菱形
rhyme|押韵的诗；这里指寻宝诗谜
clue|线索
clues|线索（复数）
line|一行；这里常指诗句
lines|诗句；行（复数）
map|地图
statue|雕像
statues|雕像（复数）
found|找到（find 的过去式）
brought|带来（bring 的过去式）
gave|给了（give 的过去式）
took|拿；带（take 的过去式）
saw|看见（see 的过去式）
went|去（go 的过去式）
thought|想；认为（think 的过去式）
knew|知道（know 的过去式）
hid|藏（hide 的过去式）
hide|躲藏；藏起
thief|贼
stole|偷（steal 的过去式）
steal|偷走物品
rob|抢劫某人或某处
jewellery|珠宝
jewellers|珠宝商；这里指珠宝店
escape|逃脱
escaped|逃脱了
trap|圈套
trick|计谋；欺骗
pocket|口袋
menu|菜单
waiter|服务员
restaurant|餐厅
conductor|列车员；乐队指挥（按语境）
tunnel|隧道
ticket|票
tickets|票（复数）
lead|牵引绳；也可表示带领
noise|声响
scared|害怕的
strange|奇怪的
happened|发生了
accident|事故
operator|接线员；操作员
tsunami|海啸
geography|地理
warned|提醒；警告
safe|安全的
dangerous|危险的
suddenly|突然
rushed|迅速移动
snorkelling|浮潜
sandcastle|沙堡
remembered|记起了
lesson|课；教训（按语境）
cap|鸭舌帽；有帽檐的帽子
opposite|在……对面
thirsty|口渴的
hungry|饿的
journey|旅途
sandwich|三明治
sandwiches|三明治（复数）
grandson|孙子；外孙
farmer|农夫
juicy|多汁的
shoulder|肩膀
seeds|种子
seed|种子
wrong|错误的；不对的
honest|诚实的
frightening|令人害怕的
learnt|学到（learn 的过去式）
dragon|龙
beast|神兽；兽
ladder|梯子
pool|水池
jacket|夹克
chest|箱子；胸部（按语境）
oar|船桨
lighthouse|灯塔
west|西方
north|北方
south|南方
east|东方
hired|租用了
fitted|合适；匹配
hatched|孵化了
egg|蛋
cracked|裂开了
orchestra|管弦乐队
concert|音乐会
dream|梦想；梦
friendly|友善的
silent|沉默的
wolf|狼
practising|练习着（英式拼写）
poem|诗
note|便条；笔记
postcard|明信片
orbit|绕……运行
solar|太阳的
diameter|直径
natural|自然的；天然的
snare|捕兽套
snares|捕兽套（复数）
mushrooms|蘑菇
rabbit|兔子
hurt|受伤；伤害
sticks|棍子
ghosts|幽灵
shone|照射（shine 的过去式）
protect|保护
predator|捕食者
prey|猎物
poison|毒素
poisonous|有毒的
porcupine|豪猪
quills|豪猪的刺
pattern|花纹；图案
survive|生存
exhibit|展品
exhibits|展品（复数）
ancient|古代的
culture|文化
capsule|胶囊；小容器
collage|拼贴画
foreground|前景
background|背景
landscape|风景
force|力
forces|力（复数）
gravity|重力
friction|摩擦
surface|表面
rough|粗糙的
smooth|光滑的
detective|侦探
mystery|谜团
fictional|虚构的
author|作者
vibration|振动
vibrations|振动（复数）
loud|响亮的
quiet|安静的；轻声的
scale|比例尺；鳞片（按语境）
grid|网格
reference|参照；坐标标记
directions|方向
centimetres|厘米
kilometres|千米''')],
  sourceNote='依据用户提供的 2012 年版 Student’s Book 与 Teacher’s Book 制作。中文讲解、例句、测验和学习路线由本页面编写；阅读卡标明原文选读或教学改写。完整课文以原页为准。',
  audioNote='电脑语音合成，不是教材 CD 原声；录音回听与朗读打卡不提供自动发音评分。')
 (ROOT/'dist/course-data.js').write_text('window.COURSE = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
 print('Built',len(U),'units;',sum(len(u['vocab']) for u in U),'core words;',sum(len(u[a]['sentences']) for u in U for a in ['story','reading','world']),'reading cards;',sum(len(u['questions']) for u in U),'authored questions')
