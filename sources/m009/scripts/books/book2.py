from book_helpers import vocab, q, passage, grammar, phonics

BOOK = dict(number=2,title='Super Minds 2',edition='Cambridge University Press · 2012',
 sourceNote='依据用户提供的 Super Minds 2 学生用书编写；页码均为书内印刷页。未提供第二册教师用书和原版音频。故事与知识短文采用有标识的教学改写；新编练习不冒充教材听力答案。',
 bookSummary='跟随 Flash、Thunder、Whisper 和 Misty，从日常作息、动物和小镇走到运动与假期；用简短句子读懂事件、提出问题并说明原因。',
 storyGuide='Super Friends 的十次小冒险：先找人物与问题，再说他们怎样帮忙，最后说结果。',
 teacherAvailable=False,pageMin=2,pageMax=128,pageBase='books/2/pages',grammarAppendix=False,units=[])
U=BOOK['units']
meta=[
('Back to school','回到学校',4,9,'🎒','用 There is / are 描述教室，并说清朋友们怎样阻止窃贼。','It’s good to see you all again',6),
('My day','我的一天',10,21,'⏰','按时间讲述一天的作息，并读懂飞行员的工作日。','It’s three o’clock in the afternoon',12),
('The zoo','动物园',22,33,'🦜','说出动物喜欢什么，并按特征给动物分类。','The zebra likes sausages',24),
('Where we live','我们居住的地方',34,45,'🏘️','描述小镇地点与方位，讲清 Flash 怎样让火车停下来。','Our town’s got a lot of great things',36),
('The market','逛市场',46,57,'🍎','礼貌提供食物、检查食材，并理解诚实与食品卫生。','Would you like some fruit?',48),
('My bedroom','我的卧室',58,69,'🛏️','描述房间与物品归属，解释整理和回收的区别。','Little Timothy McKane',60),
('People','人物与生日',70,81,'🎂','描述人物情绪，写清生日邀请，并讲述蝴蝶的一生。','Who’s that man over there?',72),
('Off we go!','出发吧',82,93,'🚌','表达旅行愿望、说出正在做的事，并学习长度测量。','It’s a big wide world out there',84),
('Sports club','运动俱乐部',94,105,'⚽','交流运动喜好，读懂调查图表，并理解包容队友。','Playing tennis is great fun',96),
('Holiday plans','假期计划',106,117,'⛺','礼貌征求许可，表达假期愿望，并认识童话角色。','It’s time for a holiday',108)]
for i,(title,zh,start,end,icon,goal,song,sp) in enumerate(meta):
 U.append(dict(id=i,title=title,zh=zh,start=start,end=end,icon=icon,goal=goal,teacher='未提供教师用书；依据学生用书编写',grammarPage=None,extra=[],song=dict(title=song,page=sp,task=['打开教材歌曲页，圈出本单元的词或句型。','选两句看懂意思后读给家长听；电脑朗读不是原版歌曲。','替换一个词，创编一句自己的歌词或句子。'])))
words=[
'''door|门|Please open the door.
bookcase|书架|There are books in the bookcase.
wall|墙|The clock is on the wall.
clock|钟|Look at the classroom clock.
window|窗户|The window is next to the door.
board|黑板；白板|There is a word on the board.
cupboard|柜子|The games are in the cupboard.
chair|椅子|Please sit on this chair.
floor|地板|My bag is on the floor.''',
'''get up|起床|I get up at seven o’clock.
get dressed|穿衣服|I get dressed after I get up.
have breakfast|吃早餐|We have breakfast in the kitchen.
brush your teeth|刷牙|Brush your teeth in the morning.
go to school|去上学|I go to school at eight o’clock.
have lunch|吃午餐|We have lunch at twelve o’clock.
play in the park|在公园玩|I play in the park after school.
have dinner|吃晚餐|My family have dinner together.
go to bed|上床睡觉|I go to bed at nine o’clock.''',
'''zebra|斑马|The zebra has black and white stripes.
monkey|猴子|The monkey is in a tree.
hippo|河马|The hippo is in the water.
parrot|鹦鹉|The parrot has colourful feathers.
snake|蛇|The snake has no legs.
bear|熊|The bear is very big.
tiger|老虎|The tiger is a wild animal.
crocodile|鳄鱼|The crocodile has a long tail.''',
'''playground|游乐场；操场|The children play in the playground.
cinema|电影院|We watch a film at the cinema.
swimming pool|游泳池|The swimming pool is next to the park.
park|公园|There are trees in the park.
hospital|医院|The hospital is behind the shop.
bus stop|公交车站|We wait at the bus stop.
shop|商店|This shop sells books.
street|街道|Our school is in this street.
café|咖啡馆；小餐馆|We have lunch in the café.
train station|火车站|The train station is near my house.''',
'''grapes|葡萄|Would you like some grapes?
beans|豆子|There are some beans on my plate.
bread|面包|We need some bread for lunch.
lemons|柠檬|These lemons are yellow.
tomatoes|番茄|There are tomatoes in the basket.
fish|鱼；鱼肉|Would you like some fish?
eggs|鸡蛋|We need two eggs for the cake.
mangos|芒果|There are three mangos in the bag.
watermelons|西瓜|These watermelons are very big.
potatoes|土豆|There are some potatoes in the kitchen.''',
'''lamp|灯|The lamp is on the table.
mirror|镜子|I can see my face in the mirror.
armchair|扶手椅|Grandpa sits in the armchair.
wardrobe|衣柜|My clothes are in the wardrobe.
sofa|沙发|The sofa is next to the window.
bed|床|My bed is blue.
table|桌子|There are two books on the table.
mat|小地毯；垫子|The cat is on the mat.''',
'''eyes|眼睛|Her eyes are brown.
hair|头发|He has got black hair.
ears|耳朵|The rabbit has long ears.
glasses|眼镜|My grandpa wears glasses.
nose|鼻子|The clown has a red nose.
cheeks|脸颊|The child has pink cheeks.
mouth|嘴巴|Open your mouth to say ah.
chin|下巴|The clown has a small chin.
face|脸|Draw a happy face.''',
'''helicopter|直升机|The helicopter is in the sky.
boat|船|We can cross the lake by boat.
lorry|卡车|The lorry carries boxes.
scooter|滑板车|My scooter is green.
bus|公共汽车|We go to school by bus.
skateboard|滑板|My skateboard is under my bed.
taxi|出租车|We take a taxi to the station.
motorbike|摩托车|The motorbike is next to the car.''',
'''badminton|羽毛球|I like playing badminton.
baseball|棒球|She plays baseball with her friends.
basketball|篮球|We play basketball after school.
football|足球|Our football team has a game today.
hockey|曲棍球|He likes playing hockey.
table tennis|乒乓球|Table tennis is fun.
tennis|网球|They play tennis in the park.
swimming|游泳|Swimming is my favourite sport.
athletics|田径运动|I like athletics and running.
volleyball|排球|We play volleyball together.''',
'''visit my cousins|看望我的表亲或堂亲|I’d like to visit my cousins.
go hiking|去徒步|We can go hiking with our family.
keep a scrapbook|做剪贴簿|I keep a scrapbook of my holiday.
help in the garden|在花园里帮忙|I help in the garden with Grandma.
build a tree house|建树屋|I’d like to build a tree house with an adult.
read a comic|看漫画|I read a comic on the sofa.
learn to swim|学游泳|I learn to swim with a teacher.
go camping|去露营|We go camping with our family.
take riding lessons|上骑马课|I’d like to take riding lessons.''']
for u,w in zip(U,words):u['vocab']=vocab(w)

def G(t,r,e,p,o,a,w,p2,o2,a2,w2):
 return grammar(t,r,e,[q(p,o,a,w,'grammar'),q(p2,o2,a2,w2,'grammar')])
U[0]['grammar']=[
 G('教室里有什么：There is / There are','一个物品用 There is / There’s；多个物品用 There are some。','There is a clock.|有一个钟。\nThere are some chairs.|有一些椅子。','一个苹果：___ an apple.','There are|There is|There am',1,'apple 是单数，要用 There is。','几本书：___ some books.','There are|There is|It is',0,'books 是复数，要用 There are。'),
 G('听清指令：做与不做','指令直接以动词开头；Don’t + 动词原形表示不要做。','Stand up.|站起来。\nDon’t open the door.|不要开门。','“不要坐下”是哪一句？','Sit down.|Don’t sit down.|Don’t stand up.',1,'Don’t sit down 是不要坐下；最后一句是不要站起来。','“打开你的书”是哪一句？','Open your book.|Close your book.|Don’t open your book.',0,'open 是打开，close 是合上。')]
U[1]['grammar']=[
 G('整点与作息时间','问现在几点用 What’s the time?；问何时做事用 When do you…?；回答时间用 at。','It’s seven o’clock.|现在七点。\nI have lunch at twelve o’clock.|我十二点吃午餐。','I have breakfast ___ seven o’clock.','in|at|on',1,'at 用于具体时刻。','“现在几点？”应该问：','Where is the clock?|What’s the time?|When is your name?',1,'What’s the time? 询问当前时间。'),
 G('他或她的一天','he、she 或一个人的名字作主语，习惯动作常在动词后加 s；go→goes，have→has。','Benny gets up at seven.|Benny 七点起床。\nShe has lunch at one.|她一点吃午餐。','Claire ___ to school at nine.','go|going|goes',2,'Claire 是一个人，第三人称单数用 goes。','He ___ breakfast at eight.','have|has|having',1,'have 的第三人称单数形式是 has。')]
U[2]['grammar']=[
 G('动物的喜好：likes / doesn’t like','一个人或动物喜欢某物用 likes；不喜欢用 doesn’t like，like 不再加 s。','The monkey likes bananas.|猴子喜欢香蕉。\nThe bear doesn’t like peas.|熊不喜欢豌豆。','The parrot ___ apples.','like|likes|liking',1,'The parrot 是单数，肯定句用 likes。','The tiger doesn’t ___ carrots.','likes|like|liking',1,'doesn’t 后接动词原形 like。'),
 G('询问喜好：Does…?','Does + he/she/单数名词 + like…?；回答 Yes,…does 或 No,…doesn’t。','Does the monkey like bananas?|这只猴子喜欢香蕉吗？\nYes, it does.|是的，它喜欢。','___ Emma like bananas?','Do|Is|Does',2,'Emma 是第三人称单数，询问喜好用 Does。','Does he like apples? 肯定回答：','Yes, he do.|Yes, he does.|Yes, he is.',1,'Does 开头的问题用 does 回答。')]
U[3]['grammar']=[
 G('小镇有什么：Has…got?','单数 town 用 Has…got…?；简短回答 Yes,it has / No,it hasn’t。','Has your town got a park?|你的小镇有公园吗？\nYes, it has.|是的，有。','___ your town got a cinema?','Have|Has|Does',1,'your town 是单数，用 Has…got。','Has your town got a pool? 否定回答：','No, it hasn’t.|No, it doesn’t.|No, it isn’t.',0,'Has…got 的简短回答沿用 has。'),
 G('说明地点：between / behind / in front of','between A and B 在 A 与 B 之间；behind 在后面；in front of 在前面；next to 在旁边。','The café is between the shop and the school.|咖啡馆在商店和学校之间。\nThe park is behind the hospital.|公园在医院后面。','在学校和商店之间：___ the school and the shop','behind|between|under',1,'between 常与 and 配对说明两者之间。','“医院在游乐场后面”是哪一句？','The hospital is behind the playground.|The hospital is in front of the playground.|The hospital is in the playground.',0,'behind 表示在后面。')]
U[4]['grammar']=[
 G('礼貌提供：Would you like…?','提供一个可数物品用 a/an；提供一些食物可用 some；接受 Yes,please，婉拒 No,thank you。','Would you like an apple?|你想要一个苹果吗？\nWould you like some bread?|你想要一些面包吗？','Would you like ___ bread?','a|an|some',2,'bread 在这里不可数，用 some bread。','礼貌婉拒应该说：','No, thank you.|Yes, please.|Here you are.',0,'No, thank you 是有礼貌地拒绝。'),
 G('检查食物：Is / Are there any…?','复数食物用 Are there any…?；不可数食物用 Is there any…?。否定句常用 not…any。','Are there any eggs?|有鸡蛋吗？\nIs there any milk?|有牛奶吗？','___ there any tomatoes?','Is|Are|Am',1,'tomatoes 是复数，所以用 Are。','___ there any bread?','Are|Do|Is',2,'bread 在这里不可数，所以用 Is。')]
U[5]['grammar']=[
 G('这、那、这些、那些','近处单数 this，远处单数 that；近处复数 these，远处复数 those。','I like this lamp.|我喜欢这盏灯。\nI like those chairs over there.|我喜欢那边的那些椅子。','近处的两本书：___ books','this|these|that',1,'两本书是复数，近处用 these。','远处的一盏灯：___ lamp over there','those|this|that',2,'一盏灯是单数，远处用 that。'),
 G('谁的物品：Whose…?','Whose 问谁的。一个物品：Whose…is this? 多个：Whose…are these? 人名后 ’s 表示所属。','Whose hat is this? It’s May’s.|这是谁的帽子？是 May 的。\nWhose socks are these? They’re Fred’s.|这些是谁的袜子？是 Fred 的。','___ cap is this?','Who|Whose|Where',1,'问物品属于谁用 Whose。','Whose socks are these? ___ Fred’s.','It’s|He’s|They’re',2,'socks 是复数，所以回答 They’re。')]
U[6]['grammar']=[
 G('说出情绪：be + 形容词','I 用 am，he/she 用 is，you/we/they 用 are；问 Are you…? 可回答 Yes,I am 或 No,I’m…。','I’m tired.|我累了。\nAre you happy? Yes, I am.|你开心吗？是的，我开心。','You ___ excited.','am|is|are',2,'you 搭配 are。','Are you angry? “不，我累了。”','No, I’m tired.|Yes, I’m angry.|No, he’s tired.',0,'回答自己时用 I；tired 是累了。'),
 G('生日月份：our / their','our 是我们的，their 是他们的；月份前用 in；多个人的生日用 birthdays。','Our birthdays are in May.|我们的生日在五月。\nTheir birthdays are in November.|他们的生日在十一月。','我们的生日：___ birthdays','Their|Our|Your',1,'our 表示我们的。','Their birthdays are ___ June.','on|at|in',2,'只说月份时用介词 in。')]
U[7]['grammar']=[
 G('旅行愿望：I’d like to…','I’d like to 后接动词原形，表达我想要做某事；乘某种交通工具常用 by。','I’d like to go to Canada by plane.|我想乘飞机去加拿大。\nI’d like to ride a bike.|我想骑自行车。','I’d like ___ a boat.','to sail|sailing|sails',0,'I’d like to 后用动词原形 sail。','乘飞机：___ plane','in|by|at',1,'表达交通方式可用 by plane。'),
 G('正在做什么：be + 动词 ing','What are you doing? 问正在做什么；回答 I’m…ing。Is/Are 开头可以询问是否正在做某事。','I’m waiting for a bus.|我正在等公交车。\nIs he playing? Yes, he is.|他正在玩吗？是的。','What are you doing? I’m ___ for a bus.','wait|waits|waiting',2,'am 后接 waiting 表示正在等。','Are you flying a plane? 肯定回答：','Yes, I am.|Yes, I do.|Yes, it is.',0,'Are you…? 回答自己用 Yes,I am。')]
U[8]['grammar']=[
 G('评价活动：动词 ing 作主语','把活动当一件事来说，动词用 ing；Playing tennis / Swimming 后接 is。','Swimming is fun.|游泳很有趣。\nPlaying tennis is difficult.|打网球很难。','___ a kite is fun.','Fly|Flying|Flies',1,'活动作句子主语时用 Flying。','Playing baseball ___ fun.','are|am|is',2,'Playing baseball 整体是一项活动，搭配 is。'),
 G('交流喜好：like doing / So do I','like 后可接 ing 表示喜欢做；同样喜欢用 So do I 或 Me too；不同意可说 I don’t。','I like swimming. So do I.|我喜欢游泳。我也喜欢。\nI like football. I don’t.|我喜欢足球。我不喜欢。','I like ___ basketball.','playing|plays|play',0,'本单元练习 like + doing，用 playing。','朋友说 I like swimming. 你也喜欢，回答：','I don’t.|So do I.|No, it isn’t.',1,'So do I 表示我也一样。')]
U[9]['grammar']=[
 G('征求许可：Can I / Can we…?','Can I…? 问我能否做；Can we…? 问我们能否做；can 后接动词原形。','Can I read a comic?|我可以看漫画吗？\nCan we visit Grandma tomorrow?|我们明天可以看望奶奶吗？','Can I ___ riding lessons?','takes|taking|take',2,'can 后接动词原形 take。','“我们可以明早去徒步吗？”','Can I go hiking tomorrow morning?|Can we go hiking tomorrow morning?|Are we hiking yesterday?',1,'我们用 we，tomorrow morning 是明天早上。'),
 G('学期复习：把问题与回答配对','Whose 问所属，When 问时间，Would you like 问是否想要，Does…like 问喜好。','Whose jumper is this? It’s Anna’s.|这是谁的毛衣？是 Anna 的。\nWhen’s her birthday? In July.|她什么时候过生日？七月。','Whose jumper is pink? 合适回答是：','In May.|Lucy’s jumper.|Yes, please.',1,'Whose 问属于谁，要回答某人的物品。','Would you like an orange? 合适回答是：','It’s on the table.|Yes, please.|In July.',1,'这里在提供食物，Yes,please 表示礼貌接受。')]
ph=[
('词首音复习：b / d / w','Starter 没有单独的 Phonics 栏；这里依据教室词汇新编词首音复习。先听词首，再读完整词。','book|board\ndoor|desk\nwall|window',4,q('哪两个词以相同的 /w/ 音开头？','wall / window|book / door|chair / clock',0,'wall 和 window 都以 /w/ 音开头。','phonics')),
('ee / ea：长音 /iː/','教材 p15 聚焦 ee / ea。cheese、teeth、eat、peas 的目标元音都是 /iː/；不要按字母名逐个读。','cheese|peas\nteeth|eat\nsee|sea',15,q('哪一组目标元音都是 /iː/？','cheese / peas|cat / dog|book / box',0,'cheese 的 ee 和 peas 的 ea 在这些词中都读 /iː/。','phonics')),
('ie / y：/aɪ/','教材 p27 聚焦 ie / y；pies、flies、sky、by 的目标音相同。y 在不同单词中可能有其他读音。','pie|sky\nflies|by\ntie|fly',27,q('sky 中 y 的读音与哪个词的元音相同？','pie|see|book',0,'sky 和 pie 都含 /aɪ/。','phonics')),
('词首组合：tr / gr / dr','教材 p39 区分 train/Troy 的 tr、great/green 的 gr、dragon 的 dr。把辅音组合连起来读。','train|tree\ngreat|green\ndragon|draw',39,q('哪一组都以 gr 开头？','train / tree|great / green|dragon / draw',1,'great、green 的开头字母组合都是 gr。','phonics')),
('w / wh：/w/','教材 p51 用 where、watermelon 练习 /w/。wh 在 where、what 中常读 /w/；并非所有 wh 单词都这样读。','where|watermelon\nwhat|water\nwhen|window',51,q('where 和 watermelon 的词首共同音是什么？','/b/|/w/|/s/',1,'这两个词开头都发 /w/。','phonics')),
('oo：看清词再听音','教材 p63 的 book、look 中 oo 读短 /ʊ/，room 中 oo 常读长 /uː/；同一拼写不一定同音。','book|look\ngood|foot\nroom|school',63,q('哪一组 oo 都读短 /ʊ/？','book / look|room / school|food / moon',0,'book、look 是短 /ʊ/；后两组通常是长 /uː/。','phonics')),
('a-e / ai / ay：/eɪ/','教材 p75 的 cake、rain、day 含相同目标音 /eɪ/，可以比较三种拼写。','cake|rain\nmake|day\nsnake|play',75,q('哪三个词的目标元音相同？','cake / rain / day|cat / rain / dog|book / day / red',0,'cake、rain、day 都含 /eɪ/。','phonics')),
('u-e / ew / ue / oe：/uː/','教材 p87 聚焦 Luke、chewing、Sue、blue、shoes 的 /uː/；new 在英式发音中常带 /j/，元音仍是 /uː/。','Luke|blue\nchew|Sue\nnew|shoes',87,q('blue 的目标元音与哪个词相同？','book|shoe|bed',1,'blue 与 shoe 都含长元音 /uː/。','phonics')),
('o / oa / o-e：/əʊ/','教材 p99 的 hippo、goat、hole、boat 含 /əʊ/；电脑若使用美式语音，可能听到 /oʊ/。','goat|boat\nhole|home\nhippo|go',99,q('哪一组包含相同的 /əʊ/ 音？','goat / boat|hot / hat|book / back',0,'goat 和 boat 的 oa 都读 /əʊ/。','phonics')),
('z / s：/z/','教材 p111 用 zoo、lizards、bananas 练习 /z/；有些 s 读 /z/，不要把所有 s 都读成 /s/。','zoo|lizards\ngives|bananas\nthese|is',111,q('哪一个单词的词首是 /z/？','snake|zoo|school',1,'zoo 的 z 发 /z/，其余两个词的词首是 /s/。','phonics'))]
for u,(t,n,ps,pn,question) in zip(U,ph):u['phonics']=phonics(t,n,ps,pn,[question])

U[0]['story']=passage('The burglars',[8,9],'学校有窃贼偷电脑，四个朋友合作阻止他们，警察随后赶到。','''The Super Friends are going home.|超级朋友们正准备回家。|先找故事开头的人物和地点。
Whisper hears about a problem at school.|Whisper 听说学校出了问题。|problem 是需要解决的问题。
Two burglars are taking the school computer.|两个窃贼正在拿走学校的电脑。|two 明确数量，taking 表示正在拿走。
The burglars think there are monsters inside.|窃贼以为里面有怪物。|这是故事里的惊吓情节，不是真有怪物。
They run to their car with the computer.|他们带着电脑跑向汽车。|with 表示带着。
Thunder lifts the car and stops them.|Thunder 抬起汽车，阻止他们逃走。|故事中的超能力情节，不能模仿。
The police arrive and thank the children.|警察赶到，感谢孩子们。|结果：电脑被保住了，窃贼被抓住。''',[
q('窃贼要拿走什么？','学校的电脑|一个足球|一只鹦鹉',0,'故事明确说 two burglars taking our computer。'),
q('哪件事使窃贼不能开车逃走？','Whisper 关上书本。|Thunder 抬起了汽车。|Flash 买了车票。',1,'结尾画面中 Thunder 抬起汽车，警方赶到。')])
U[1]['story']=passage('What a day!',[14,15],'Thunder 的力量太大，一天里接连弄坏东西；他想帮妈妈，却也需要学会小心。','''Thunder gets up at seven o’clock.|Thunder 七点起床。|钟面和动作帮助确定时间。
His strong arm breaks the lamp.|他强壮的手臂弄坏了灯。|breaks 表示弄坏。
At eight o’clock, he brushes his teeth.|八点，他刷牙。|brushes 是 brush 的第三人称形式。
Later, he bumps into the school clock.|后来，他撞到了学校的钟。|bumps into 是撞上。
Mum’s keys are under the car.|妈妈的钥匙在汽车下面。|under 说明钥匙的位置。
Thunder tries to help, but he damages the car.|Thunder 想帮忙，却弄坏了汽车。|but 表示事情出现转折。
He enjoys chicken for dinner.|晚餐时，他开心地吃鸡肉。|enjoys 表示喜欢、享受。
At bedtime, his strong body breaks the bed too.|睡觉时，他强壮的身体又弄坏了床。|too 表示也；这是幽默的结尾。''',[
q('Thunder 为什么想动汽车？','他想开车去动物园。|他想帮助妈妈拿钥匙。|他在参加赛车。',1,'妈妈说钥匙在汽车下面；Thunder 想帮她。'),
q('这个故事反复出现的情况是什么？','Thunder 力气很大，容易弄坏东西。|Thunder 一直在唱歌。|Thunder 找不到学校。',0,'灯、钟、汽车和床的画面都与他的力量有关。')])
U[2]['story']=passage('The Zoo Keeper',[26,27],'动物跑了出来，朋友们各用所长帮饲养员；Misty 最后让猴子归还钥匙。','''The children see a monkey with the zoo keeper’s keys.|孩子们看见猴子拿着饲养员的钥匙。|with 表示带着某物。
Some animals are out of their homes.|一些动物跑出了它们的住处。|out of 表示从里面出来。
Flash catches the flying parrot.|Flash 抓住飞着的鹦鹉。|catches 是抓住。
Thunder carries the heavy hippo.|Thunder 抱起沉重的河马。|他的力量是故事中的超能力。
Whisper talks to the snake and calls it back.|Whisper 和蛇说话，把它叫回来。|两件动作按顺序读。
Misty frightens the monkey, and it drops the keys.|Misty 吓到了猴子，猴子掉落了钥匙。|这里的吓唬是童话式故事情节。
The zoo keeper gets his keys back and thanks everyone.|饲养员拿回钥匙，感谢大家。|get…back 是拿回。''',[
q('是谁把蛇叫回来？','Thunder|Whisper|Flash',1,'Whisper 对蛇说 Come here,snake，蛇回应他。'),
q('饲养员最后为什么感谢孩子们？','他们帮助找回动物和钥匙。|他们买下了动物园。|他们把动物带回自己家。',0,'四个朋友一起帮他解决了动物跑出和钥匙被拿走的问题。')])
U[3]['story']=passage('The tree on the track',[38,39],'铁轨上倒着一棵树，Flash 第一次示警无效，就换一种方法让司机看懂。','''The children see a train leaving the station.|孩子们看见火车驶离车站。|leaving 表示正在离开。
There is a tree on the track.|铁轨上有一棵树。|track 在这里是铁轨。
Flash runs beside the train and shouts.|Flash 跑在火车旁边，大声呼喊。|beside 是在旁边。
The driver sees her, but he does not stop.|司机看见她，却没有停车。|第一次尝试没有成功。
Flash tries a different idea.|Flash 换了一个办法。|different 是不同的。
She makes a big STOP sign on the track.|她在铁轨上做出醒目的 STOP 标记。|STOP 的意思是停下。
The driver understands and stops before the tree.|司机明白了，在树前停下。|before 在这里表示在到达树之前。
The people thank the Super Friends.|人们感谢超级朋友们。|坚持思考，换一种办法，问题才解决。''',[
q('火车面临什么问题？','车站没有咖啡馆。|铁轨上有一棵树。|司机没有帽子。',1,'The tree on the track 是故事的危险来源。'),
q('Flash 第一次没成功后怎么做？','放弃了。|去买苹果。|换办法做出 STOP 标记。',2,'她没有放弃，而是把停止的意思清楚地展示给司机。')])
U[4]['story']=passage('Bad apples',[50,51],'朋友们发现每人拿到一个坏苹果，回市场查明摊主把好坏苹果混着卖，并当众揭穿。','''The friends have two apples each.|每个朋友有两个苹果。|each 表示每一个人。
Each child finds a bad apple.|每个孩子都发现一个坏苹果。|bad 在这里指坏掉的食物。
Whisper suggests going back to the market.|Whisper 提议回市场。|suggests 是提出建议。
The seller has one box of good apples and one of bad apples.|摊主有一箱好苹果和一箱坏苹果。|比较 good 与 bad。
The children ask for eight apples.|孩子们要买八个苹果。|four children × two apples = eight。
They show everyone the four bad apples in the bag.|他们让大家看袋里的四个坏苹果。|show 是展示。
Thunder shows the two boxes, and people see the trick.|Thunder 展示两箱苹果，大家看清了骗局。|the trick 在这里指骗人的做法。''',[
q('孩子们发现的问题是什么？','每人都有一个坏苹果。|苹果全部不见了。|他们买的是香蕉。',0,'一开始每人两个苹果，其中一个坏了。'),
q('故事想说明什么？','买苹果必须买八个。|不能靠欺骗做生意。|所有苹果都不能吃。',1,'教材本故事的价值主题是 cheating doesn’t pay：欺骗不会有好结果。')])
U[5]['story']=passage('Tidy up!',[62,63],'Flash 想快点去公园，把杂物塞进衣柜；外表整齐掩盖不了真正的问题。','''Whisper phones Flash and invites her to the park.|Whisper 打电话邀请 Flash 去公园。|invites 是邀请。
Flash must tidy her room first.|Flash 必须先整理房间。|first 提示先后顺序。
She does not like tidying up.|她不喜欢整理。|tidy up 是收拾整齐。
She quickly puts clothes, books and toys in the wardrobe.|她迅速把衣服、书和玩具塞进衣柜。|列出的三类物品帮助理解她怎么做。
The room looks tidy, but a T-shirt is still on the lamp.|房间看起来整齐了，可是灯上还有一件 T 恤。|looks tidy 不等于真正整理好。
Mum opens the wardrobe to put away the T-shirt.|妈妈打开衣柜，想放好 T 恤。|put away 是收好。
Everything falls out, and Flash cannot go to the park yet.|东西全掉了出来，Flash 暂时还不能去公园。|结尾说明把东西藏起来不是整理。''',[
q('Flash 把杂物放在哪里？','床下|衣柜里|公园里',1,'漫画显示她把衣服、学校用品和玩具都塞进衣柜。'),
q('妈妈为什么打开衣柜？','想放好灯上的 T 恤。|想找一只鹦鹉。|想修理汽车。',0,'妈妈看到 T-shirt，说要把它放进 wardrobe。')])
U[6]['story']=passage('Thunder’s birthday',[74,75],'生日比赛里朋友们一心想拿奖牌，却接连失败；游戏需要公平，也要学会接受输赢。','''Thunder wants a medal at his birthday party.|Thunder 想在自己的生日聚会上拿奖牌。|medal 是奖牌。
During tug of war, a dog distracts him.|拔河时，一只狗让他分了心。|during 表示在某活动期间。
His team does not win that game.|他的队伍没赢这场游戏。|does not win 是没有获胜。
Whisper chooses Flash for a three-legged race.|Whisper 选择和 Flash 参加两人三足。|three-legged race 是两人绑腿合作的比赛。
She runs too fast, and they do not win a medal.|她跑得太快，他们没有拿到奖牌。|too fast 表示快过头了。
Misty plays Pin the tail on the donkey without a proper blindfold.|Misty 玩贴驴尾巴时，没有好好蒙住眼睛。|blindfold 是蒙眼布。
The other children say that it is not fair.|其他孩子说这样不公平。|fair 是公平的。
The Super Friends get no medals that day.|那天超级朋友们没有拿到奖牌。|故事提醒我们公平游戏，也要接受失败。''',[
q('Whisper 和谁参加两人三足？','Misty|Flash|饲养员',1,'Whisper 说自己想与 Flash 一组。'),
q('Misty 的游戏为什么被说不公平？','她没有好好蒙住眼睛。|她邀请了朋友。|她穿着紫色衣服。',0,'漫画中的孩子指出她没有戴好 blindfold。')])
U[7]['story']=passage('The bus trip',[86,87],'朋友们想去海边，先帮司机解决羊群和轮胎问题，最后发现坐错车；司机也回报他们的帮助。','''The children take a bus for a day at the beach.|孩子们坐公交车，想去海边玩一天。|for a day 表示为了一日游。
The bus stops because there are sheep on the road.|公交车停下了，因为路上有羊。|because 后面说明原因。
Whisper asks the sheep to let the bus pass.|Whisper 请羊群让公交车通过。|let…pass 是让……通过。
Then there is a problem with a tyre.|接着，一个轮胎出了问题。|then 连接第二个困难。
Thunder lifts the bus while the driver changes the tyre.|司机换轮胎时，Thunder 抬起公交车。|这是故事超能力，不能模仿。
At the airport, the children realise they are on the wrong bus.|到了机场，孩子们发现自己坐错车了。|airport 是机场，wrong 是错误的。
The driver offers to take them to the beach.|司机提出带他们去海边。|结局中司机也帮助了他们。''',[
q('公交车第一次停下是因为什么？','路上有羊。|车站没有人。|孩子们忘了书包。',0,'最先遇到的是羊群挡路；轮胎问题发生在后面。'),
q('司机最后为什么说轮到他帮忙？','孩子们先前帮他解决了两个问题。|孩子们给他买了飞机。|他们不想去海边了。',0,'Whisper 帮羊群让路，Thunder 帮换轮胎。')])
U[8]['story']=passage('The football club',[98,99],'Flash 被原来的球队拒绝后，和 Misty 自己组队并邀请别人加入；她们用比赛证明了自己。','''Flash asks to join a football team.|Flash 请求加入一支足球队。|join 是加入。
A boy says that the team is full.|一个男孩说队伍已经满了。|这是男孩的说法。
Flash wants football, not the table tennis club.|Flash 想踢足球，不想去乒乓球俱乐部。|want 表示她自己的选择。
She and Misty start their own team and invite other children.|她和 Misty 自己组队，并邀请其他孩子加入。|own 在这里表示自己的。
The two teams play a game.|两支球队进行比赛。|a game 在这里指一场球赛。
Flash scores a goal, and Misty scores too.|Flash 进了一球，Misty 也进了一球。|scores a goal 是进球。
Their team wins two to nil.|她们的队伍以二比零获胜。|nil 在比分中表示零。
They choose to stay with their own team.|她们选择留在自己的队伍里。|结尾男孩再邀请她们时，她们礼貌地拒绝。''',[
q('Flash 和 Misty 被拒绝后做了什么？','停止踢足球。|自己组队，邀请其他孩子。|加入饲养员队伍。',1,'她们说 Let’s start a football team，并招募队员。'),
q('谁在比赛中进球？','只有 Thunder。|Flash 和 Misty。|只有司机。',1,'第6格和第7格分别显示 Flash、Misty 得分。')])
U[9]['story']=passage('Dream holidays',[110,111],'四位朋友各有假期愿望，最后大家一起参加欢乐的花园聚会。','''The Super Friends talk about their dream holidays.|超级朋友们谈论理想中的假期。|dream 在这里指梦想中的。
Thunder would like to build a tree house.|Thunder 想建一座树屋。|would like to 表示想要做。
Whisper would like to learn to swim.|Whisper 想学游泳。|learn to 是学习做某事。
Misty would like to visit her cousins.|Misty 想看望她的表亲或堂亲。|cousins 的中文关系要结合家庭情况理解。
Flash would like to help her grandma in the garden.|Flash 想在花园里帮奶奶。|help 是这个故事的重要主题。
The children follow an adult into the garden.|孩子们跟着一位大人来到花园。|follow 表示跟随。
They enjoy a party together and wish everyone a happy holiday.|他们一起享受聚会，并祝大家假期快乐。|together 表示一起。''',[
q('谁想学游泳？','Whisper|Thunder|Misty',0,'Whisper 说 I’d like to learn to swim。'),
q('Flash 的假期愿望是什么？','开公交车|帮助奶奶打理花园|参加足球比赛',1,'Flash 想 help my grandma in the garden。')])
U[0]['reading']=passage('Look around our classroom',[4,5,7],'用教材的教室词汇和句型新编一段可边指边读的短文，练习从整体到细节描述。','''This is our classroom.|这是我们的教室。|our 表示我们的。
There is a big board on the wall.|墙上有一块大黑板。|There is 后面跟一个物品。
There are some books in the bookcase.|书架里有一些书。|There are 后面跟复数。
My bag is on a chair.|我的书包在椅子上。|on 表示在上面。
Please open your book and look at the page.|请打开书，看这一页。|open 和 look 是两个指令。
Don’t put your book on the floor.|不要把书放在地上。|Don’t 表示不要。''',[
q('这段新编短文里，书在哪里？','在书架里|在汽车里|在树上',0,'There are some books in the bookcase 说明位置。'),
q('哪一条是短文里的否定指令？','打开书。|看这一页。|不要把书放在地上。',2,'Don’t put your book on the floor 是否定指令。')],kind='依据单元目标新编')
U[1]['reading']=passage('A long day for Janice',[16],'飞行员 Janice 从伦敦飞到罗马再返回，用不同时间梳理她漫长的一天。','''Janice is a pilot.|Janice 是一名飞行员。|pilot 是职业名称。
She leaves home at eleven in the morning.|她上午十一点离开家。|in the morning 明确上午。
She arrives at the airport at twelve.|她十二点到达机场。|arrives at 是到达。
Her plane leaves London at three and arrives in Rome at five.|她的飞机三点离开伦敦，五点到达罗马。|这里照课文叙述读当地钟点，不拿两地钟点直接推算飞行时长。
It leaves Rome at seven and arrives in London at ten.|飞机七点离开罗马，十点到达伦敦。|it 指前面的飞机。
Janice gets home at eleven at night.|Janice 晚上十一点回到家。|at night 与上午十一点形成对比。''',[
q('Janice 的职业是什么？','飞行员|动物饲养员|医生',0,'开头直接说明 Janice is a pilot。'),
q('这篇文章为什么说她的一天很长？','她只在机场待了一分钟。|她上午离家，晚上十一点才回家。|她一直在家睡觉。',1,'文章从上午十一点离家写到夜里十一点到家。')])
U[2]['reading']=passage('Hipsway Zoo',[28],'读动物园广告时，分别寻找动物、设施、服务与开放时间。这里是教材中的动物园信息。','''Hipsway Zoo has many different animals.|Hipsway 动物园有许多不同的动物。|这是教材广告中的动物园。
Visitors can see crocodiles and snakes there.|游客能在那里看到鳄鱼和蛇。|can see 表示可以看到。
In the big bird house, birds fly above the visitors.|大鸟舍里，鸟儿在游客头顶飞翔。|above 表示在上方。
Zoo keepers can answer questions about the animals.|饲养员可以回答关于动物的问题。|answer questions 是回答问题。
There is a café for food and drink.|那里有一家提供食物饮料的咖啡馆。|a café 表示一家，不能读成两家。
The notice says the zoo opens at ten and closes at six.|公告上写着动物园十点开门，六点关门。|这不是现实场馆的实时营业信息。''',[
q('想知道动物的知识，可以问谁？','公交司机|动物饲养员|电影院工作人员',1,'广告说 zoo keepers 可以 answer all your questions。'),
q('关于广告里的咖啡馆，哪项有依据？','有一家可用餐的咖啡馆。|咖啡馆六点开门。|明确写着有两家咖啡馆。',0,'短文说 the café，不能由此推出两家。')])
U[3]['reading']=passage('Our favourite places',[40],'Martin 喜欢电影院的儿童活动，Isabelle 喜欢和家人去咖啡馆；抓住人物、地点、时间和原因。','''Martin’s favourite place is the cinema.|Martin 最喜欢的地方是电影院。|favourite 是最喜欢的。
There is a Kids’ Club on Saturday mornings.|星期六上午有儿童俱乐部活动。|on Saturday mornings 表示每逢周六上午。
His parents take him there to watch a film.|他的父母带他去那里看电影。|him 指 Martin。
Isabelle’s favourite place is the café.|Isabelle 最喜欢的地方是咖啡馆。|换了人物，也换了地点。
She goes with her mum and brother on Wednesdays.|她星期三和妈妈、弟弟或哥哥一起去。|brother 不单独说明哥哥还是弟弟。
She has pizza and chips, then cake.|她吃比萨和薯条，之后吃蛋糕。|then 表示接着。''',[
q('Martin 什么时候去儿童俱乐部？','周六上午|周一晚上|周三下午',0,'课文说 on Saturday mornings。'),
q('两段文字共同在介绍什么？','最喜欢的地方和在那里做的事|怎样修火车|怎样给动物分类',0,'人物、地点、时间和活动是两段共有的信息。')])
U[4]['reading']=passage('A banana cake',[52],'把菜谱读成步骤：先找食材，再按先后顺序说出混合和烘烤。实际烘烤由成人负责。','''First, put a cup of milk in a bowl.|先把一杯牛奶放进碗里。|first 标出第一步。
Mix two bananas with the milk.|把两根香蕉和牛奶混合。|mix 是混合。
Add a cup of sugar and two cups of flour.|加入一杯糖和两杯面粉。|a cup 与 two cups 要看清数量。
Add four big spoons of butter and two eggs.|加入四大勺黄油和两个鸡蛋。|spoons 是勺子的复数。
Mix everything and put it in a cake tin.|把所有食材混合后放进蛋糕模具。|everything 是所有东西。
The recipe says to bake it for one hour; an adult uses the oven.|菜谱写着烤一小时；烤箱由成人操作。|前半句依据教材，后半句是本课程的活动安排。''',[
q('菜谱里需要几根香蕉？','一根|两根|四根',1,'第二步是 mix two bananas with the milk。'),
q('哪一个顺序符合菜谱？','先放进模具，再找食材。|先加入牛奶和香蕉，再加入其他食材。|先吃蛋糕，再放鸡蛋。',1,'按 first、add、mix 的步骤阅读。')])
U[5]['reading']=passage('My tidy room',[64,65],'依据教材的房间描述任务新编，练习把物品、颜色和位置连成完整的句子。','''My room has a blue bed and a small table.|我的房间有一张蓝色的床和一张小桌子。|has 表示拥有。
There is a lamp on the table.|桌上有一盏灯。|on the table 说明位置。
My books are in the bookcase.|我的书在书架里。|books 是复数，搭配 are。
These socks are mine, and those shoes are my brother’s.|这些袜子是我的，那些鞋是我兄弟的。|these 与 those 区分近处和远处。
I put my clothes in the wardrobe.|我把衣服放进衣柜。|分类收好，才是真的整理。
When I want to think, I sit quietly in my room.|当我想思考时，我安静地坐在房间里。|根据 p65 的思考空间话题新编。''',[
q('新编短文中，灯在哪里？','衣柜里|桌上|床下',1,'There is a lamp on the table 说明位置。'),
q('这段话和 Flash 故事中的做法有什么不同？','把所有东西挤进衣柜。|按用途把书和衣服放回合适位置。|不整理任何东西。',1,'书回书架、衣服回衣柜，是有分类的整理。')],kind='依据单元目标新编')
U[6]['reading']=passage('Check the birthday invitations',[76],'三张邀请函各缺一项重要信息。阅读时检查日期、时间和地点，不能靠猜补齐。','''Tim invites Ben to a party on Sunday in his garden.|Tim 邀请 Ben 星期天到他家花园参加聚会。|找日期和地点。
Tim’s invitation does not say what time it starts.|Tim 的邀请函没有说几点开始。|缺少的信息不能自己编。
Tara’s party is on Saturday at three o’clock.|Tara 的聚会在星期六三点。|日期和开始时间都有。
Her invitation does not give the place.|她的邀请函没有给出地点。|the place 指聚会地点。
Emma gives an address and a time, but no day.|Emma 写了地址和时间，却没有写哪一天。|but 引出缺少的部分。
A clear invitation needs a day, a time and a place.|清楚的邀请函需要日期、时间和地点。|最后一句归纳阅读规则。''',[
q('Tim 的邀请函缺少什么？','开始时间|星期几|聚会地点',0,'Tim 写了 Sunday 和 garden，但没写几点。'),
q('怎样判断邀请函是否清楚？','只看有没有漂亮图画。|检查日期、时间、地点。|越长就一定越清楚。',1,'教材要求写邀请时记得 day、time、where。')])
U[7]['reading']=passage('An amazing long car',[89],'教材介绍了一辆特别长的汽车；从 unusual features 找出它与普通汽车的不同。','''The car in this text is very long.|这篇文章里的汽车特别长。|只描述教材中的这辆车。
It has TVs, beds and sofas inside.|车里有电视、床和沙发。|inside 表示在里面。
There is even a swimming pool.|里面甚至还有游泳池。|even 强调让人惊讶的信息。
The car is difficult to drive on normal roads.|这辆车在普通道路上不好开。|difficult 是困难的。
The text says it needs two drivers, one at each end.|文章说它需要两个司机，两端各一个。|the text says 标明信息来自课文。
People use this special car in films and at special parties.|人们把这辆特殊的车用于电影和特别的聚会。|special 是特别的。''',[
q('哪一个设施最说明这辆车很特别？','方向盘|游泳池|车轮',1,'普通汽车也有方向盘和车轮；游泳池是特别的设施。'),
q('根据课文，车为什么需要两个司机？','它非常长，驾驶很困难。|司机不会看地图。|车里没有座位。',0,'课文先说它 difficult to drive，再说明两端各需一个司机。')])
U[8]['reading']=passage('Our favourite sports',[100],'把教材示例里的运动调查数据读成语言，再把数字与柱状图对应起来。','''There are twenty-two children in the example class.|示例班级里有二十二个孩子。|这是教材示例，不是你的班级真实数据。
Eight choose swimming as their favourite sport.|八个人最喜欢游泳。|choose 是选择。
Seven choose football.|七个人选足球。|与上一句比较数量。
Three choose athletics.|三个人选田径。|athletics 是田径运动。
Two choose table tennis, and two choose tennis.|两个人选乒乓球，两个人选网球。|两种运动人数相同。
Swimming has the most votes in this example.|这个示例里，游泳得到的票数最多。|eight 比其他各项人数多。''',[
q('示例班级中最受欢迎的运动是什么？','游泳|田径|网球',0,'游泳8人，足球7人，其他项目更少。'),
q('哪两个项目人数一样？','游泳和足球|乒乓球和网球|足球和田径',1,'乒乓球与网球都是2人。')])
U[9]['reading']=passage('My holiday plan',[106,107,112,113],'依据假期词汇、许可句型和看图说话目标新编，让孩子把零散活动连成一份能说明白的计划。','''Tomorrow morning, I’d like to visit my cousins.|明天上午，我想看望我的表亲或堂亲。|tomorrow morning 表示明天上午。
Can we read a comic together?|我们可以一起看漫画吗？|Can we 用来征求许可。
In the afternoon, we can help Grandma in the garden.|下午，我们可以在花园里帮助奶奶。|时间词让计划有顺序。
I’d like to learn to swim with a teacher too.|我也想跟老师学游泳。|too 放在句末表示也。
I can keep pictures of the holiday in a scrapbook.|我可以把假期照片收进剪贴簿。|scrapbook 保存活动的记录。
A good holiday gives us time to play and help others.|好的假期让我们有时间玩，也帮助别人。|最后一句把活动和想法联系起来。''',[
q('新编计划中，下午准备做什么？','帮奶奶打理花园|在学校上课|去医院工作',0,'In the afternoon 后面就是花园里的帮助活动。'),
q('哪一句是在征求许可？','I can keep pictures.|Can we read a comic together?|A good holiday gives us time.',1,'Can we…? 是询问我们是否可以做某事。')],kind='依据单元目标新编')

U[0]['world']=passage('Learning together',[4,7,8,9],'Starter 没有 English for school 跨学科栏；本课把教室指令与帮助他人的主题连成学习习惯任务。','''A classroom is a place to learn together.|教室是一起学习的地方。|together 是一起。
We listen when someone is speaking.|有人说话时，我们认真听。|when 表示当……的时候。
We can ask for help when a word is difficult.|遇到难词时，我们可以求助。|ask for help 是请求帮助。
We can point to a picture to show the meaning.|我们可以指着图片说明意思。|图片能帮助理解。
We take turns to read and speak.|我们轮流朗读和说话。|take turns 是轮流。
Helping a classmate helps our whole class learn.|帮助同学，也让全班更好地学习。|把故事的帮助主题用在教室里。''',[
q('遇到不认识的词时，哪种方法符合短文？','一直跳过，不求助。|指图或请求帮助。|把书藏起来。',1,'短文提出 ask for help 和 point to a picture 两个方法。'),
q('take turns 是什么意思？','轮流|一起喊叫|立刻离开',0,'轮流读、轮流说，让每个人都有练习机会。')],kind='依据单元目标新编')
U[1]['world']=passage('Time zones: read a model chart',[18,19],'世界不同地点的时间可能不同。以下数字只用于教材示意表练习，不是实时城市报时或旅行时刻表。','''Different places can have different times.|不同地方可能有不同的时间。|time zone 是时区。
We use the book’s chart for this classroom puzzle.|我们用教材的示意表做这道课堂题。|教材表是练习模型，不是实时信息。
In the chart, London shows twelve o’clock.|图表中，伦敦显示十二点。|先找作为起点的时间。
New York shows seven in the morning.|纽约显示上午七点。|按教材表中五小时的差计算。
Cairo shows two in the afternoon.|开罗显示下午两点。|按教材表中两小时的差计算。
Beijing shows seven in the evening.|北京显示晚上七点。|同一时刻，不同地点可显示不同钟点。''',[
q('按这里的教材示意表，伦敦十二点时，北京几点？','上午七点|晚上七点|中午十二点',1,'本练习明确说 Beijing shows seven in the evening。'),
q('这张示意表适合做什么？','查询所有城市今天的准确时间|确定明天航班是否准点|练习理解时区差和加减小时',2,'这是教材课堂模型；实时城市时间需要另外核对。')])
U[2]['world']=passage('Animal families',[30,31],'从毛发、羽毛、鳞片和腿的数量观察动物，理解不同动物类群的典型特征。','''Animals belong to different groups.|动物属于不同的类群。|group 是一组或一类。
Mammals have hair, and their babies drink milk.|哺乳动物有毛发，幼崽喝奶。|mammals 是哺乳动物。
Reptiles, such as lizards, have scales.|爬行动物，比如蜥蜴，有鳞片。|such as 用来举例。
Birds have feathers and lay eggs.|鸟类有羽毛，会产卵。|feathers 是羽毛。
Insects have six legs.|昆虫有六条腿。|six legs 是一个重要的分类线索。
We compare these features to sort animals.|我们比较这些特征，给动物分类。|features 是特征，不只看颜色大小。''',[
q('哪个特征最适合把甲虫归入昆虫？','有六条腿|生活在水里|身体很大',0,'教材把 six legs 列为昆虫的特征。'),
q('羽毛是哪个类群的重要特征？','爬行动物|鸟类|哺乳动物',1,'Birds have feathers。')])
U[3]['world']=passage('Towns in art',[42,43],'看城市题材的画时，可从颜色、建筑、交通与天空说出自己看到什么、为什么喜欢。','''Artists can paint towns in different ways.|艺术家可以用不同方式画城镇。|artists 是艺术家。
One picture may show water and tall buildings.|一幅画可能展现水面和高楼。|may 表示可能。
Another picture may show a train or a starry sky.|另一幅可能画火车或布满星星的天空。|another 是另一幅。
Colours can make a place look bright or quiet.|颜色能让地方显得明亮或宁静。|比较画面给你的感觉。
We can say what we see and why we like it.|我们可以说看见什么，以及为什么喜欢。|why 要接理由。
Our class can put town pictures together to make a collage.|全班可以把城镇图片组合成一幅拼贴画。|collage 是拼贴画。''',[
q('哪句话既说了看见什么，也给出喜欢的原因？','I like this picture because I like trains.|This is a picture.|Yes, it is.',0,'because I like trains 解释了喜欢的理由。'),
q('collage 的制作方式是什么？','只背一个单词|把多张图组合起来|把所有画擦掉',1,'教材项目建议把小镇图片组合成 collage。')])
U[4]['world']=passage('Bacteria and food',[54,55],'细菌很小，有些会使人不舒服。教材用食品卫生主题练习指令；本课程只观察书中图片，不安排培养霉菌。','''Bacteria are living things that are very small.|细菌是非常小的生物。|living things 是生物。
Some bacteria in food can make people ill.|食物里有些细菌会使人生病。|some 不是所有细菌。
We wash and dry our hands before cooking.|做饭前，我们洗手并擦干。|before 表示在……之前。
We keep the kitchen clean and wash fruit and vegetables.|我们保持厨房清洁，清洗水果和蔬菜。|clean 是清洁的。
Different foods need suitable places for storage.|不同食物需要放在合适的地方保存。|storage 是储存。
An adult helps with cooking and keeping food safely.|成人帮助烹调和妥善保存食物。|这句把教材卫生主题转成家庭学习活动。''',[
q('短文说所有细菌都危险吗？','是，全部危险。|没有，只说有些会使人生病。|说细菌都是动物。',1,'Some bacteria 指有些，不是所有。'),
q('哪一步应该在做饭前完成？','洗手并擦干|先把食物放到地上|把脏餐具藏起来',0,'教材明确提出 wash and dry your hands before you cook。')])
U[5]['world']=passage('Recycling',[66,67],'回收把旧材料变成新材料；先识别材料，再按所在地的分类规则投放。','''We throw away things we do not need.|我们会丢弃不再需要的东西。|throw away 是扔掉。
Some rubbish goes into big holes called landfills.|一些垃圾被送入叫作填埋场的大坑。|landfill 是填埋场。
Recycling makes old materials useful again.|回收让旧材料再次有用。|again 是再次。
Old newspapers can become new paper.|旧报纸可以变成新纸。|become 是变成。
Old glass and metal can be recycled too.|旧玻璃和金属也可以回收。|glass 与 metal 是材料名称。
We sort our rubbish and follow our local bin labels.|我们给垃圾分类，并遵循本地垃圾桶上的标识。|不同地方的分类规则可能不同。''',[
q('回收的主要意思是什么？','让旧材料再次被利用|把一切藏进衣柜|把垃圾随便扔在路上',0,'Recycling 指从废旧材料制作新的东西。'),
q('旧报纸在教材里可以变成什么？','新纸|新动物|新食物',0,'课文明确给出 old newspapers → new paper。')])
U[6]['world']=passage('The life cycle of a butterfly',[78,79],'用 first、then、finally 把卵、毛毛虫、蛹、蝴蝶四个阶段按顺序讲清楚。','''A butterfly begins life as a tiny egg on a leaf.|蝴蝶的生命从叶片上的小卵开始。|tiny 是非常小的。
A caterpillar comes out of the egg.|毛毛虫从卵里孵出来。|不是一只成虫蝴蝶直接出来。
The caterpillar eats leaves and grows.|毛毛虫吃叶子，逐渐长大。|grows 是生长。
It becomes a chrysalis.|它变成蛹。|chrysalis 是蛹。
Inside, its body changes.|里面的身体发生变化。|inside 说明外面不动，里面仍在变化。
A butterfly comes out and opens its wings.|蝴蝶从蛹里出来，展开翅膀。|wings 是翅膀。''',[
q('从卵里最先出来的是什么？','成虫蝴蝶|毛毛虫|小鸟',1,'第二步是 caterpillar comes out of the egg。'),
q('正确顺序是哪一个？','卵→毛毛虫→蛹→蝴蝶|蝴蝶→蛹→卵→毛毛虫|卵→蝴蝶→毛毛虫→蛹',0,'这四个阶段按教材图文依次排列。')])
U[7]['world']=passage('How long? How tall?',[90,91],'小物品用尺子、大物品用卷尺；学习毫米、厘米、米之间的关系，再比较猜测和实测。','''We measure length to find out how long something is.|我们测量长度，了解物品有多长。|length 是长度。
We measure height to find out how tall it is.|我们测量高度，了解物品有多高。|height 是高度。
A ruler helps us measure small things.|尺子帮助我们测量小物品。|ruler 是尺子。
Ten millimetres make one centimetre.|十毫米等于一厘米。|10 mm = 1 cm。
One hundred centimetres make one metre.|一百厘米等于一米。|100 cm = 1 m。
We can guess first, measure, and compare the results.|我们可以先猜，再测量，最后比较结果。|compare 是比较。''',[
q('一厘米等于多少毫米？','1毫米|10毫米|100毫米',1,'Ten millimetres make one centimetre。'),
q('什么顺序适合教材的测量项目？','猜一猜→测量→比较|先填假的结果→不测量|只看颜色',0,'教材表格有 Guess 与 Measurement 两栏，用来比较。')])
U[8]['world']=passage('Sport and breathing',[102,103],'呼吸时空气进出肺部；观察安静时和轻微活动后的呼吸变化，学会记录。','''When we breathe, air moves in and out of our lungs.|呼吸时，空气进出我们的肺。|lungs 是肺。
Our chest moves as we breathe.|呼吸时，胸部会起伏。|chest 是胸部。
We can notice the movement with a hand on the chest.|把手轻放胸前，可以觉察这个动作。|notice 是注意到。
After exercise, we often breathe faster.|运动后，我们通常呼吸更快。|often 表示通常，不是每次固定相同。
We can count breaths for the same amount of time.|我们可以在相同的时间长度内数呼吸次数。|比较时保持时间相同。
Then we record the numbers and compare them.|然后记录数字并进行比较。|这是观察记录，不是身体能力评分。''',[
q('呼吸时，空气进出身体的哪个部分？','肺|书包|头发',0,'air moves in and out of our lungs。'),
q('比较活动前后的呼吸次数时，应怎样做？','每次计数的时间一样长|一次数10秒，一次数10分钟|完全不用记录',0,'相同的计数时间才便于比较。')])
U[9]['world']=passage('Fairy tales',[114,115],'童话常有善恶角色和愿望冲突。用角色想做什么、谁阻拦、怎样解决三个问题读故事。','''Fairy tales are stories with imaginary events.|童话是包含想象事件的故事。|imaginary 是想象中的。
They may have kings, queens, dragons or talking animals.|里面可能有国王、王后、龙或会说话的动物。|may 表示可能，不是每篇都有。
Cinderella wants to go to a party at the palace.|灰姑娘想去王宫参加舞会。|wants to 表示角色的愿望。
The Three Billy Goats Gruff want to cross a bridge.|三只山羊想过一座桥。|cross 是穿过。
A hungry troll is under the bridge.|桥下有一个饥饿的巨怪。|这是山羊故事中的障碍。
We can name the characters, their wishes and their problems.|我们可以说出人物、愿望和困难。|用这三个线索组织复述。''',[
q('三只山羊想做什么？','过桥|驾驶飞机|开动物园',0,'教材故事配对说明它们 want to cross the bridge。'),
q('读童话时，哪组三个问题最有助于复述？','谁？想做什么？遇到什么困难？|纸多重？书多贵？桌多高？|几点下课？谁带水？天气怎样？',0,'人物、愿望、困难能帮助抓住故事的主要关系。')])
projects=[
 dict(title='我的教室小导游',pages=[4,5,7],tasks=['画出或指出教室里的三个物品，至少包含一个单数和一组复数。','用 There is / There are 读出两句，再给出一句礼貌指令。','用中文说明窃贼想做什么、朋友们怎样阻止他们。'],frame='This is our classroom.\nThere is a ...\nThere are some ...\nPlease ...\nDon’t ...',model='This is our classroom. There is a clock on the wall. There are some books in the bookcase. Please open your book. Don’t put it on the floor.',success='能说清两个物品及位置；单复数选择有依据；能用中文说明故事的起因、行动、结果。',teacher='依据学生用书 p4–7 的教室描述和指令任务新编；不是教师用书答案。'),
 dict(title='一天的时间海报',pages=[20,21],tasks=['把纸分成 morning、afternoon、evening 三栏，填至少四项自己的真实作息。','写出每项活动的整点时间，用 I…at…读出。','把其中两项改成介绍朋友的句子，检查 gets / goes / has。'],frame='In the morning, I ... at ... o’clock.\nIn the afternoon, I ...\nIn the evening, I ...\nMy friend ... at ... o’clock.',model='I get up at seven o’clock. I have lunch at twelve o’clock. I play in the park at four o’clock. My friend goes to bed at nine o’clock.',success='至少四项活动有时间且先后合理；能把一项作息改为 he/she 或人名作主语。',teacher='依据学生用书 p21 作息海报；模型时间为新编示例，不是孩子必须采用的作息。'),
 dict(title='小小动物讲解员',pages=[30,31,33],tasks=['选教材里的一种动物，准备外形、食物、能力三条有依据的信息。','两人分演游客和讲解员，练习 Does it…? 或 What does it eat?。','说明它属于哪个动物类群，并指出一个分类特征。'],frame='This is a ...\nIt has got ...\nIt eats ...\nIt can ...\nIt is a ... because ...',model='This is a hippo. It comes from Africa. It lives in rivers. It eats grass. It is a mammal. Its babies drink milk.',success='能介绍至少三点；能问答一次；分类时用特征说明理由，不只猜名称。',teacher='依据学生用书 p33 河马资料卡与动物园角色扮演，结合 p30–31 类群知识。'),
 dict(title='设计我的小镇地图',pages=[35,37,43],tasks=['画一个含五处地点的小镇，给每处写英文名称。','用 between、behind、next to 中的至少两个词说明地点。','请家人问 Has your town got…?，你根据自己的地图作答。'],frame='My town has got a ...\nThe ... is between the ... and the ...\nThe ... is behind the ...\nMy favourite place is ... because ...',model='My town has got a park and a cinema. The café is between the school and the shop. The park is behind the school. My favourite place is the park because I can play there.',success='地图与句子一致；between 后有两个参照物；能给出喜欢某个地点的原因。',teacher='依据学生用书 p35 想象小镇、p37 地图说明与 p43 城镇拼贴活动整合。'),
 dict(title='水果沙拉采购小剧场',pages=[47,49,52,56],tasks=['画一碗自己的水果沙拉，写明包含三种水果、不含一种水果。','扮演采购员与家人，用 Are there any…? 检查需要的食材。','用 Would you like…? 提供沙拉，对方用 Yes,please 或 No,thank you 回答。'],frame='There are some ... in my fruit salad.\nThere aren’t any ...\nAre there any ...?\nWould you like some ...?',model='There are some grapes and mangos in my fruit salad. There are some apples too. There aren’t any lemons. Would you like some fruit salad? Yes, please.',success='食材描述与图相符；区分 some/any；完成一次礼貌提供和回应。',teacher='依据学生用书 p52 自编食物对话与 p56 水果沙拉描写；实际切洗由成人协助。'),
 dict(title='我的房间整理图',pages=[59,61,64,67],tasks=['画整理前后的小房间，把书、衣服、玩具分别放到合适位置。','用 this/that/these/those 各试说一句；说话时指向对应物品。','家人问 Whose…?，回答物品归属，再挑一个可回收材料说明分类。'],frame='I like this ...\nThese ... are ...\nWhose ... is this? It’s ...’s.\nMy ... are in/on ...',model='I like this blue lamp. These books are in the bookcase. Whose hat is this? It’s Dad’s. My clothes are in the wardrobe. Now my room is tidy.',success='能够区分近远、单复数；至少两类物品有合理位置；说清收好和藏乱物的区别。',teacher='依据学生用书 p59、p61、p64 的家具与归属表达，结合 p67 回收分类；整理图为新编任务。'),
 dict(title='一封清楚的生日邀请',pages=[76,80,81],tasks=['给一个朋友写邀请，必须包含星期或日期、开始时间和地点。','加一种食物、一项游戏，以及一句礼貌邀请。','请家人只看邀请就回答何时何地；再用中文说说公平游戏的一条规则。'],frame='Dear ...,\nPlease come to my birthday party.\nIt is on ... at ...\nThe party is at ...\nWe can eat ... and play ...\nSee you there!',model='Dear Amy, please come to my birthday party. It is on Saturday at three o’clock. The party is at my house. We can eat cake and play games. See you there!',success='日期、时间、地点齐全；受邀人无需猜；能说明公平比输赢更值得遵守。',teacher='依据学生用书 p76 邀请函检查与写作，结合 p81 生日聚会对话；模型为新编。'),
 dict(title='我的旅行交通工具',pages=[83,85,89,91],tasks=['设计一辆旅行车或一艘船，画出里面的三样设施。','写出想去哪儿、乘什么去；用一句现在进行时说明图中某人在做什么。','用尺子量画中一个部分，注明 cm；比较猜测长度与实测长度。'],frame='This is my ...\nIt has got ...\nI’d like to go to ... by ...\nThe driver is ...\nThe picture is ... cm long.',model='This is my bus. It has got a bed and two sofas. I’d like to go to the beach by bus. The driver is waiting. My picture is fifteen centimetres long.',success='愿望句用 would like to；进行时用 be+ing；测量标清单位；示例数字不能代替实际测量。',teacher='依据学生用书 p89 自创交通工具与 p91 测量项目整合；模型长度为示例。'),
 dict(title='班级运动小调查',pages=[100,104,105],tasks=['采访至少四人：What sport do you like doing?，每人只记录一个最喜欢的运动。','把人数画成简单柱状图，检查总人数与受访人数相同。','用两句介绍结果，再写一句邀请别人参与的友好话语。'],frame='I like ...\nIn our survey, ... people like ...\n... is the favourite sport.\nCome and play with us!',model='I like playing football. In our survey, three people like swimming and two people like tennis. Swimming is the favourite sport. Come and play with us!',success='图表人数与真实记录一致；like 后用 ing；能主动邀请别人一起参加。',teacher='依据学生用书 p100 调查柱状图与 p105 运动海报；模型数据仅示范表达，不能当作实际调查结果。'),
 dict(title='我的假期愿望卡',pages=[106,107,110,111,115],tasks=['选三项假期活动，写清其中一项准备什么时候做。','用 Can I…? 或 Can we…? 向家人征求许可，并记录回答。','加入一件帮助他人的事；最后选择一篇童话，用人物、愿望、困难三个词口头介绍。'],frame='I’d like to ...\nCan I/we ... tomorrow morning?\nI can help ...\nMy favourite fairy tale is ...\nThe character wants to ...',model='I’d like to visit my cousins. Can we go hiking tomorrow morning? I can help Grandma in the garden. My favourite fairy tale is Cinderella. She wants to go to a party.',success='三项活动说得清；征求许可的句子完整；有帮助他人的计划；童话复述至少包含人物和愿望。',teacher='依据学生用书 p106–107 假期活动、p110–111 愿望故事与 p115 童话角色任务整合。')]
for u,p in zip(U,projects):u['create']=p
BOOK['glossary']=[dict(word=w,zh=z) for w,z in [
('burglars','窃贼（复数）'),('monster','怪物'),('keys','钥匙（复数）'),('careful','小心的'),('pilot','飞行员'),('airport','机场'),('arrive','到达'),('leave','离开'),('zoo keeper','动物园饲养员'),('feathers','羽毛'),('scales','鳞片'),('mammals','哺乳动物'),('reptiles','爬行动物'),('insects','昆虫'),('track','铁轨；轨道'),('between','在两者之间'),('behind','在后面'),('in front of','在前面'),('collage','拼贴画'),('bowl','碗'),('flour','面粉'),('butter','黄油'),('bacteria','细菌'),('tidy up','整理；收拾'),('rubbish','垃圾'),('recycle','回收利用'),('landfill','垃圾填埋场'),('medal','奖牌'),('fair','公平的'),('blindfold','蒙眼布'),('invitation','邀请函'),('caterpillar','毛毛虫'),('chrysalis','蛹'),('butterfly','蝴蝶'),('tyre','轮胎'),('driver','司机'),('measure','测量'),('length','长度'),('height','高度'),('centimetre','厘米'),('millimetre','毫米'),('metre','米'),('goal','进球；球门；目标'),('team','队伍'),('breathe','呼吸'),('lungs','肺'),('chest','胸部'),('trophy','奖杯'),('fairy tale','童话'),('character','故事人物；角色'),('palace','宫殿'),('troll','童话中的巨怪'),('wish','愿望')]]
