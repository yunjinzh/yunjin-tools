"""Super Minds 3: independently authored bilingual learning scaffold, grounded in the uploaded 2012 Student's Book."""
from book_helpers import vocab, q, passage as P, grammar as G, phonics as F

BOOK = dict(number=3, title='Super Minds 3', edition='Cambridge University Press · 2012', teacherAvailable=False,
 sourceNote='依据所提供的 Super Minds 3 Student’s Book（2012）编写。页码为书内印刷页；短文为教学改写或明确标注的新编练习，不代替全书原文。未提供第三册教师用书及原配音频。',
 bookSummary='跟 Ben、Lucy 和 Buster 寻找七个字母：从学校、野餐和城镇，到海底、洞穴与世界建筑，读懂故事、比较信息，并用过去时和将来计划讲述自己的经历。',
 storyGuide='古书里的密码带出七个字母 I、F、R、S、E、N、D。Horax 和 Zelda 一路争夺古书；最后，真正打开宝藏的是 FRIENDS（朋友）。',
 pageMin=2, pageMax=127, pageBase='books/3/pages', grammarAppendix=True, units=[])

def U(i,title,zh,icon,goal,words,gram,ph,song):
 start=4 if i==0 else 10+12*(i-1)
 u=dict(id=i,title=title,zh=zh,icon=icon,goal=goal,start=start,end=9 if i==0 else start+11,
 teacher='未提供教师用书；依据学生用书编写',grammarPage=118+i,vocab=vocab(words),grammar=gram,phonics=ph,
 song=dict(title=song,page=start+2,task=['打开原书歌谣页，圈出本单元已经会读的词。','用页面的电脑语音练读短句；原版歌曲需另备配套音频。','选一个句型换成自己的信息，说给家人听。']))
 BOOK['units'].append(u);return u

def C(title,pages,tasks,frame,model,success):
 return dict(title=title,pages=pages,tasks=tasks,frame=frame,model=model,success=success,teacher='依据所列学生用书活动设计的家庭练习；示范与评价标准为新编，非教师用书标准答案。')

u=U(0,'Meet The Explorers','认识探险家','🧭','认识 Ben、Lucy 和 Buster；说出自己的本领，并讲清古书怎样失而复得。', '''
upstairs|在楼上|The bedroom is upstairs.
downstairs|在楼下|The kitchen is downstairs.
cellar|地窖|The old box is in the cellar.
twenty-one|二十一|My card has twenty-one stars.
fifty|五十|I can count to fifty.
one hundred|一百|There are one hundred pages.
uncle|叔叔；舅舅等|My uncle has a blue bike.
cousin|堂兄弟姐妹；表兄弟姐妹|My cousin likes puzzles.
''',[
G('good at + 动词 -ing','be good at 表示擅长；at 后接名词或动词 -ing，否定把 not 放在 be 后。','I am good at riding bikes.|我擅长骑自行车。\nShe is not good at singing.|她不擅长唱歌。',[q('I am good at ___ puzzles.','do|doing|does',1,'at 后的动作要用 -ing：doing。','grammar'),q('哪句表示“他不擅长游泳”？','He is good at swimming.|He not good at swim.|He is not good at swimming.',2,'is not 表示否定；at 后用 swimming。','grammar')]),
G('用 ’s 表示所属关系','人名后加 ’s，可以表示“某人的”。先找人物，再看后面的亲属或物品。','Ben is Penny’s brother.|Ben 是 Penny 的哥哥／弟弟。\nLucy’s book is old.|Lucy 的书很旧。',[q('Penny is Ben’s sister. 谁是谁的姐姐／妹妹？','Penny 是 Ben 的姐姐／妹妹。|Ben 是 Penny 的姐姐／妹妹。|Penny 是 Ben 的妈妈。',0,'Ben’s 修饰 sister，意思是“Ben 的姐妹”。','grammar'),q('“Lucy 的狗”应写作：','Lucy dog|Lucys dog|Lucy’s dog',2,'单个人名的所属关系可用名字 + ’s。','grammar')])],
F('短元音：听清中间的音','把短音读清，不在单词末尾额外加一个汉语“呃”。以下练习词依据第 9 页短元音目标新编。','cat|cap\npet|pen\ncup|sun',9,[q('pet 和哪一个词中间的元音相同？','pit|pen|pot',1,'pet 和 pen 的中间都是 /e/。','phonics')]),'The Explorers')
u['story']=P('The old book · 古书失而复得',[8,9],'两位朋友找到藏着宝藏秘密的古书，却被 Horax 和 Zelda 抢走。Buster 帮他们脱困，三位伙伴合作取回古书。','''
Ben and Lucy find a secret door in the castle.|Ben 和 Lucy 在城堡里发现一扇暗门。|secret door：暗门；先交代地点和发现。
Behind the door, they find an old book.|在门后，他们找到一本古书。|behind：在……后面。
Horax and Zelda want the book and its treasure.|Horax 和 Zelda 想要这本书以及它指向的宝藏。|want 后面接想得到的东西。
They take the book and tie the children up.|他们抢走书，并把孩子们绑起来。|tie ... up：把……绑住。
Buster helps Ben and Lucy get free.|Buster 帮助 Ben 和 Lucy 脱身。|get free：获得自由、脱困。
Lucy makes a plan to get the book back.|Lucy 想出一个取回古书的计划。|get ... back：取回……。
Buster stops the two thieves while the children escape with the book.|Buster 拦住两个坏人，孩子们带着书逃走。|while 连接同时发生的两件事。
The friends succeed by helping each other.|朋友们互相帮助，取得了成功。|用一句话说明故事的道理。
''',[q('故事的主要问题是什么？','古书没有任何字。|Horax 和 Zelda 抢走了古书。|Buster 不愿意出门。',1,'两人先发现古书，随后古书被抢，故事围绕取回它展开。'),q('Buster 起了什么作用？','帮助孩子们脱困并取回古书。|把古书卖掉。|替坏人看守孩子们。',0,'Buster 是帮助伙伴的关键角色，不是坏人的帮手。')])
u['reading']=P('Three friends, one adventure · 三位伙伴',[4,5,6,7],'认识人物、任务和本领。把“谁—做什么—为什么”连起来，就能讲明故事的开头。','''
Ben and Lucy are two explorers.|Ben 和 Lucy 是两位探险家。|explorers：探险家。
Their dog is called Buster.|他们的狗叫 Buster。|is called：名叫。
They find lost treasure and give it to museums.|他们寻找遗失的宝藏，并把它交给博物馆。|give ... to ...：把……给……。
Today they are looking for an old book in a castle.|今天，他们在一座城堡里寻找古书。|are looking for：正在寻找。
The book has a secret about some treasure.|这本书藏着有关宝藏的秘密。|解释为什么找书。
Lucy is good at doing puzzles and reading clues.|Lucy 擅长解谜和读线索。|clue：线索。
Ben is good at riding bikes and swimming.|Ben 擅长骑自行车和游泳。|两个 -ing 动作并列。
Different skills help the friends work together.|不同的本领帮助朋友们合作。|这是对人物分工的概括。
''',[q('他们找到宝藏后通常会怎么做？','藏在自己的卧室。|交给博物馆。|扔回海里。',1,'开头明确说他们把宝藏交给 museums。'),q('他们为什么寻找古书？','因为书里有关于宝藏的秘密。|因为他们要买新书包。|因为这本书能教做饭。',0,'寻找古书是为了得到宝藏线索。')])
u['world']=P('My explorer notebook · 我的线索本',[4,5,7],'本篇依据入门单元新编：用线索本练习区分人物、地点、本领和所属关系。','''
I make an explorer notebook.|我做一本探险笔记。|新编学习情境。
On the first page, I write the names of the team.|第一页，我写下小队成员的名字。|names：姓名。
On the next page, I draw a castle.|下一页，我画一座城堡。|next：下一个。
I put the cellar below the other rooms.|我把地窖画在其他房间下面。|below：在下方。
I write, “I am good at drawing maps.”|我写道：“我擅长画地图。”|good at + drawing。
My cousin is good at reading clues.|我的表亲擅长读线索。|介绍另一位成员的本领。
This is my cousin’s pencil, and that is my notebook.|这是我表亲的铅笔，那是我的笔记本。|’s 表示所属。
Our different skills can help the whole team.|我们不同的本领可以帮助整个小队。|whole team：整个团队。
''',[q('笔记中的地窖画在哪里？','其他房间上面。|其他房间下面。|城堡外的天空中。',1,'below the other rooms 表示其他房间下方。'),q('这段新编短文强调哪种做法？','只记录自己擅长的事，忽略伙伴。|不记录任何线索。|把每个人的不同本领用在合作中。',2,'最后一句指出不同技能可以帮助整个小队。')],kind='依据单元目标新编')
u['create']=C('画一张探险家名片',[5,7,8,9],['画出自己和一位伙伴，并各写一项本领。','用 good at 说一句肯定句、一句否定句。','按“找到书—书被抢—合作取回”口头复述。'],'My name is ...\nI am good at ...\nI am not good at ...\nMy friend is good at ...\nFirst ... Then ... Finally ...','Ben and Lucy find an old book. Horax and Zelda take it. Buster helps the children get free. The friends work together and get the book back.','能说清主要人物、遇到的问题和解决办法；本领句使用 at + -ing。')

u=U(1,'Our school','我们的学校','🏫','聊喜欢的学科和必须遵守的规则；理解 Johnny 的想象力怎样成为优势。','''
English|英语|We read a story in English.
Geography|地理|I like learning about places in Geography.
Music|音乐|We sing in Music.
I.T.|信息技术|I use a computer in I.T.
History|历史|History tells us about the past.
Maths|数学|I solve a number puzzle in Maths.
Science|科学|We learn about plants in Science.
Art|美术|I draw a dragon in Art.
P.E.|体育|We play basketball in P.E.
''',[
G('like / love / don’t like + -ing','说喜欢做什么时，在 like 或 love 后使用动词 -ing。he/she 的否定用 doesn’t like。','I like listening to stories.|我喜欢听故事。\nHe doesn’t like singing.|他不喜欢唱歌。',[q('Lucy loves ___ about animals.','learn|learning|learns',1,'love 后表示动作使用 learning。','grammar'),q('He ___ like doing Maths puzzles.','don’t|isn’t|doesn’t',2,'he 是第三人称单数，否定用 doesn’t like。','grammar')]),
G('have to / has to：必须做','have to 后接动词原形；he/she 用 has to。用它说明规则和必须完成的事。','We have to listen carefully.|我们必须认真听。\nShe has to arrive before nine.|她必须九点前到达。',[q('She ___ wear school uniform.','have to|has to|has',1,'she 后使用 has to + wear。','grammar'),q('We have to ___ a book every week.','reading|reads|read',2,'to 后面接动词原形 read。','grammar')])],F('字母名称也有发音规律','第 15 页练习字母名。B、C、D、E 等字母名含长音 /iː/；A、J、K 的字母名含 /eɪ/。','B|E\nC|D\nJ|K',15,[q('哪个字母的名称和 J 一样含 /eɪ/？','K|I|O',0,'J /dʒeɪ/ 和 K /keɪ/ 都有 /eɪ/。','phonics')]),'Let me tell you a secret')
u['story']=P('Getting help · 破解密码',[14,15],'Ben 和 Lucy 请 Mr Williams 帮忙读密码，但没有把书留给他。后来他们自己找到解码线索，坏人决定继续跟踪。','''
The old book is written in code.|古书是用密码写成的。|in code：用密码。
Ben and Lucy ask Mr Williams for help.|Ben 和 Lucy 向 Mr Williams 求助。|ask ... for help：向……求助。
He says the puzzle is difficult and asks to keep the book.|他说谜题很难，提出把书留下。|keep：保留。
The children do not want to give him the book.|孩子们不想把书交给他。|do not want to：不想……。
Later, someone tries to take their book in the dark.|后来，有人趁黑想抢他们的书。|in the dark：在黑暗中。
The children escape and look for a way to read the code.|孩子们脱身，寻找读懂密码的方法。|a way to：做……的方法。
They discover the key to the code in the book.|他们在书里发现了解码的关键。|key 在这里不是开门钥匙，而是解码关键。
Horax cannot read the code, so he plans to follow them.|Horax 读不懂密码，于是计划跟踪他们。|so 表示结果。
''',[q('为什么孩子们一开始需要帮助？','书写得太小，完全看不见。|书里的内容是密码。|书被水泡没了。',1,'问题是读不懂 code，而不是看不清字。'),q('结尾发生了什么变化？','孩子们发现解码方法，Horax 决定跟踪他们。|Mr Williams 当场给了完整答案。|孩子们放弃了古书。',0,'他们自己发现解码关键；Horax 仍不懂密码。')])
u['reading']=P('Johnny’s story · 爱做梦的 Johnny',[16,17],'Johnny 在课上常常走神，回答问题闹了笑话。但写作比赛给了他发挥想象力的机会，他终于获得认可。','''
Johnny often dreams during lessons at Oak Tree School.|Johnny 在 Oak Tree School 上课时常常做白日梦。|during lessons：上课期间。
In Geography, he imagines flying on a dragon over the Great Wall.|地理课上，他想象骑龙飞过长城。|imagines：想象。
In Maths, he works on a puzzle in his head.|数学课上，他在脑子里解一道谜题。|in his head：在脑中。
His answers do not match the teacher’s questions.|他的回答和老师的问题对不上。|match：与……相符。
The other children laugh, but Miss Burton is not amused.|其他孩子笑起来，Miss Burton 却没有笑。|对比孩子与老师的反应。
Later, the class enters a story-writing competition.|后来，全班参加写故事比赛。|competition：比赛。
Johnny brings his dragons, butterflies and music into one wonderful story.|Johnny 把龙、蝴蝶和音乐编进一个精彩的故事。|bring ... into：把……融入。
His story wins first prize, and everyone celebrates his imagination.|他的故事得了一等奖，大家为他的想象力喝彩。|first prize：一等奖。
''',[q('Johnny 的特长最后在哪件事上发挥出来？','写一个富有想象力的故事。|背出全部课堂答案。|修理学校的电视。',0,'他将想象编进故事，赢得写作比赛。'),q('故事提醒我们怎样看待同学？','回答错一次就没有任何能力。|只要走神，就一定能得奖。|每个人可能有不同的优势，也要学会在合适的任务中运用。',2,'故事肯定不同思考方式；并不是鼓励忽略所有课堂任务。')])
u['world']=P('Musical instrument families · 乐器家族',[18,19],'按发声和演奏方式认识吹奏、弦乐与打击乐器；用米粒瓶子做沙锤，感受节奏。','''
Musical instruments belong to different families.|乐器分属不同的家族。|belong to：属于。
We blow into wind instruments to make a sound.|我们向吹奏乐器吹气，让它发声。|blow：吹。
A flute and a recorder are wind instruments.|长笛和竖笛是吹奏乐器。|两种乐器名称。
Violins and guitars have strings.|小提琴和吉他有弦。|strings：琴弦。
A piano also has strings, but they are hidden inside.|钢琴也有弦，但弦藏在内部。|also：也；原书在此按弦乐特征介绍钢琴。
Percussion instruments help us play a rhythm.|打击乐器帮助我们演奏节奏。|rhythm：节奏。
We can put rice in closed plastic bottles to make maracas.|我们可以把米放进盖好的塑料瓶，做成沙锤。|maracas：沙锤；瓶盖由成人协助拧紧。
Shaking the bottles makes a sound that can follow the music.|摇动瓶子发出的声音可以跟着音乐打节拍。|shaking：摇动。
''',[q('哪件乐器需要吹气演奏？','吉他。|长笛。|鼓。',1,'flute 是 wind instrument。'),q('米粒沙锤最适合用来做什么？','量水温。|阅读地图。|为音乐打节拍。',2,'沙锤发出节奏性的声音，是打击乐器。')])
u['create']=C('我的学科与班级规则',[20,21],['采访两位家人喜欢的学科，记录不同答案。','写两条 have to 规则，并说明规则的用途。','用三句话讲 Johnny 从被笑到获奖的变化。'],'My favourite subject is ...\nI like ...\nIn our class, we have to ...\nJohnny dreams about ...\nHis story ...','Johnny dreams during lessons. His answers do not match the questions. In a writing competition, he uses his imagination and wins first prize.','能介绍一项爱好、一条规则；能解释 Johnny 获奖的原因，不只重复“他赢了”。')

u=U(2,'The picnic','一起去野餐','🧺','询问有什么食物、提出建议；说明 Buster 获救的经过，并认识食物链。','''
rolls|小圆面包|There are two rolls in my bag.
lemonade|柠檬饮料|Would you like some lemonade?
cheese|奶酪|There is some cheese in the sandwich.
apple juice|苹果汁|I have some apple juice.
water|水|Is there any water in the bottle?
soup|汤|The vegetable soup is warm.
vegetables|蔬菜|We need some vegetables for dinner.
salad|沙拉|How about some salad?
''',[
G('some / any：有没有一些','肯定句常用 some；一般疑问句和否定句常用 any。不可数名词用 Is there；复数名词用 Are there。','There is some cheese.|有一些奶酪。\nAre there any tomatoes?|有番茄吗？',[q('Is there ___ water in the bottle?','many|a|any',2,'询问是否有水，用 any；water 在这里不可数。','grammar'),q('___ there any rolls?','Are|Is|Am',0,'rolls 是复数，因此用 Are there。','grammar')]),
G('提出建议：Shall we ...? / How about ...?','Shall we 后接动词原形；How about 后可接食物等名词。','Shall we make some soup?|我们做些汤好吗？\nHow about some tea?|来点茶怎么样？',[q('Shall we ___ some soup?','making|make|makes',1,'Shall we 后面接 make 原形。','grammar'),q('哪句是在建议喝点果汁？','How about some juice?|Is this juice empty?|There isn’t any juice.',0,'How about ...? 用于提出建议。','grammar')])],F('短 /ɪ/ 和双元音 /aɪ/','比较 it 和 ice：/ɪ/ 短而集中；/aɪ/ 从一个元音滑向另一个。第 27 页用 iguana、ice cream 等练习。','sit|site\nbit|bite\nfin|fine',27,[q('哪一个词含 /aɪ/，和 eye 的元音相同？','sit|fish|ice',2,'ice 的开头读 /aɪ/；sit、fish 的元音是短 /ɪ/。','phonics')]),'A picnic')
u['story']=P('The golden apple · 金苹果',[26,27],'故事中 Buster 被蛇咬伤，孩子们按老人的指引寻找金苹果。Horax 抢先去摘，却帮孩子们拿到了苹果，他们还找到了第一个字母 I。','''
A snake bites Buster, and he becomes very ill.|一条蛇咬了 Buster，他病得很重。|这是虚构冒险故事，不是动物急救方法。
Ben and Lucy take him to the village for help.|Ben 和 Lucy 带他去村里求助。|for help：为了寻求帮助。
An old man tells them about a golden apple above a waterfall.|一位老人告诉他们，瀑布上方有一个金苹果。|above：在上方。
In the story, Buster needs to eat that special apple.|在故事里，Buster 需要吃那个特殊的苹果。|明确这是故事里的魔法设定。
Horax and Zelda try to reach the apple first.|Horax 和 Zelda 想抢先拿到苹果。|first：首先。
Horax loses the apple, and Ben gets it.|Horax 没有拿住苹果，Ben 得到了它。|转折使问题得到解决。
The friends help Buster and discover the letter I by the pool.|朋友们帮助 Buster，并在水潭边发现字母 I。|letter I：字母 I，不是单词 I 的句意。
They write the first letter in their book and continue their adventure.|他们把第一个字母记在书里，继续冒险。|continue：继续。
''',[q('孩子们去找金苹果的直接原因是什么？','要卖苹果换钱。|故事中的 Buster 需要它才能好起来。|要完成美术作业。',1,'老人告诉他们，这个故事中的特殊苹果能帮助 Buster。'),q('本次找到的第一个字母是什么？','I。|F。|R。',0,'结尾 Lucy 说找到的是 I，并把它记在书里。')])
u['reading']=P('Breakfast in four homes · 四个家庭的早餐',[29],'教材用四个孩子的家庭早餐展示饮食差异。说的是这些家庭的习惯，不代表一个国家里每个人都这样吃。','''
Four children describe breakfast in their homes.|四个孩子介绍自己家里的早餐。|describe：描述。
Ana in Brazil has bread, cheese, cake and fruit.|巴西的 Ana 吃面包、奶酪、蛋糕和水果。|介绍的是 Ana 的家庭。
She likes mango and watermelon.|她喜欢芒果和西瓜。|mango：芒果。
Amy describes a special cooked breakfast with foods such as eggs and toast.|Amy 介绍一顿特别的熟食早餐，包括鸡蛋和吐司等。|such as：例如；不把“特别的一餐”误说成每天都吃。
Rodolfo in northern Mexico has sausage and scrambled eggs with tortillas.|墨西哥北部的 Rodolfo 吃香肠炒蛋配薄饼。|scrambled eggs：炒蛋；tortillas：墨西哥薄饼。
Mustafa’s family in Turkey puts bread, cheese, eggs and other foods on the table.|土耳其 Mustafa 家的桌上有面包、奶酪、鸡蛋等食物。|other foods：其他食物。
His family drinks black tea with breakfast.|他家早餐喝红茶。|black tea 在这里指红茶。
Different families enjoy different breakfasts.|不同家庭喜欢不同的早餐。|避免把个人例子当作所有人的固定习惯。
''',[q('谁介绍了香肠炒蛋配薄饼？','Ana。|Mustafa。|Rodolfo。',2,'Rodolfo 的早餐是 sausage with scrambled eggs，配 tortillas。'),q('读这些介绍时，哪种理解最合适？','这是四个家庭的例子。|同一国家所有人都吃完全相同的早餐。|四个孩子都不吃鸡蛋。',0,'人物介绍的是各自家中的食物，不能概括为全国每个人。')])
u['world']=P('Food chains and habitats · 食物链与栖息地',[30,31],'认识“谁吃什么”和栖息地。用草—兔子—狐狸这条简单食物链说清能量的传递。','''
We get energy from the food we eat.|我们从吃的食物中获得能量。|energy：能量。
Animals need food for energy too.|动物也需要食物提供能量。|too：也。
A food chain shows how living things get food.|食物链展示生物怎样获得食物。|food chain：食物链。
In this example, grass uses sunlight to grow.|在这个例子里，草利用阳光生长。|in this example：限定为本课的简单例子。
A rabbit eats the grass, and a fox eats the rabbit.|兔子吃草，狐狸吃兔子。|用两个 eats 连起关系。
A habitat is the place where an animal lives.|栖息地就是动物生活的地方。|where 引出“生活的地方”。
A rainforest and a pond are different habitats.|雨林和池塘是不同的栖息地。|pond：池塘。
Plants and animals in a habitat are connected through food.|同一栖息地里的植物和动物通过食物联系起来。|connected：相互联系。
''',[q('在草—兔子—狐狸这个例子中，谁吃草？','狐狸。|兔子。|太阳。',1,'兔子从草获得食物，狐狸吃兔子。'),q('habitat 的意思是什么？','动物生活的地方。|餐厅的菜单。|某种专用餐具。',0,'栖息地指动物居住和生存的环境。')])
u['create']=C('野餐点餐与食物链卡片',[31,32,33],['从本单元选择三种野餐食物，问两句 Is/Are there any ...?。','用 Shall we 或 How about 提出一个建议。','画草、兔子、狐狸，按顺序说明谁吃什么。'],'Is there any ...?\nAre there any ...?\nShall we ...?\nThe rabbit eats ...\nThe fox eats ...','Shall we have a picnic? There are some rolls, but there isn’t any juice. How about some water? A rabbit eats grass, and a fox eats the rabbit.','能区分单数／不可数与复数问法；能讲清食物链的两条进食关系。')

u=U(3,'Daily tasks','每天的小任务','🧹','会说整点、半点和刻钟；说明日常习惯，并从机器人故事理解认真学习与负责。','''
tidy up|收拾整齐|I tidy up my room on Saturday.
do the shopping|购物|We do the shopping after lunch.
take the dog for a walk|遛狗|I take the dog for a walk with Dad.
wash up|洗碗|We wash up after dinner.
sweep|扫地|I sweep the kitchen floor.
cook|做饭|My father likes to cook.
dry the dishes|擦干碗碟|I dry the dishes carefully.
feed the dog|喂狗|We feed the dog every morning.
''',[
G('half past / quarter past / quarter to','half past 是过了半小时，quarter past 是过了一刻钟，quarter to 是差一刻钟到下一个钟点。','It is half past six.|现在六点半。\nIt is quarter to seven.|现在六点四十五分。',[q('quarter past five 是几点？','五点十五分。|五点四十五分。|四点四十五分。',0,'past 表示过了；quarter 是十五分钟。','grammar'),q('6:45 可以说：','half past six|quarter past six|quarter to seven',2,'再过十五分钟到七点，因此是 quarter to seven。','grammar')]),
G('always / usually / sometimes / never','这些词说明动作多常发生：总是、通常、有时、从不。这里放在主要动作前。','I always brush my teeth before bed.|睡前我总是刷牙。\nShe sometimes washes up.|她有时洗碗。',[q('“我从不在上学前玩电脑游戏”应选：','I always play computer games before school.|I never play computer games before school.|I usually play computer games before school.',1,'never 表示从不。','grammar'),q('哪句顺序正确？','He sometimes cooks dinner.|He cooks sometimes dinner.|He sometimes dinner cooks.',0,'本句频率副词 sometimes 放在主要动词 cooks 前。','grammar')])],F('/v/ 和 /f/：一个有振动，一个没有','轻咬下唇吹气读 /f/；同样口形加声带振动读 /v/。第 39 页以 van、fans 等练习。','van|fan\nvery|fairy\nleave|leaf',39,[q('哪一个词以 /v/ 开头？','fan|fish|van',2,'van 的开头有声带振动，读 /v/。','phonics')]),'What a busy day')
u['story']=P('Tidying up · 帮忙才找到线索',[38,39],'坏人为找字母把村里弄乱。Ben 和 Lucy 根据“帮助别人”的提示收拾现场，发现第二个字母 F。','''
The next clue says there is a letter in the village.|下一条线索说，村里藏着一个字母。|clue：线索。
Ben is tired and wants to look for it in the morning.|Ben 累了，想等早晨再找。|in the morning：早晨。
Horax and Zelda listen and decide to search after dark.|Horax 和 Zelda 偷听后，决定天黑再找。|after dark：天黑以后。
Their search leaves a terrible mess.|他们搜寻后留下了一片狼藉。|mess：杂乱。
The next morning, Ben and Lucy remember the clue about helping hands.|第二天早晨，Ben 和 Lucy 想起有关“伸出援手”的线索。|helping hands 在这里指帮助别人。
They tidy up the village and move the heavy things.|他们帮村里收拾，把沉重的东西搬好。|heavy：沉重的。
While Lucy clears the rubbish, she finds something important.|Lucy 清理垃圾时，发现了重要的东西。|rubbish：垃圾。
It is F, the second letter in their puzzle.|那是谜题中的第二个字母 F。|first 是第一；second 是第二。
''',[q('为什么村里变得很乱？','Ben 和 Lucy 举办了比赛。|Horax 和 Zelda 搜找字母时弄乱了现场。|村里正在下雪。',1,'故事把混乱与坏人夜里找线索联系起来。'),q('哪种行动帮助他们找到 F？','帮助清理村庄。|整天坐着等。|把书扔掉。',0,'他们理解 helping hands，收拾时找到字母。')])
u['reading']=P('Arnold and the robot · 没听懂就操作',[40,41],'Arnold 想让机器人代劳，却不会让它停下。科学家回来才控制住机器人。Arnold 决定以后认真听讲。','''
William builds robots that help with housework.|William 制造能帮助做家务的机器人。|housework：家务。
His helper Arnold has to keep the laboratory tidy.|助手 Arnold 必须保持实验室整洁。|laboratory：实验室。
Arnold does not listen when William teaches him about the robots.|William 教他机器人知识时，Arnold 没有认真听。|为后面的麻烦埋下原因。
One day, Arnold orders a robot to wash the floor.|一天，Arnold 命令机器人洗地板。|orders ... to：命令……做……。
The robot keeps filling a bucket and pouring water onto the floor.|机器人不断装满水桶，把水倒在地板上。|keeps ... -ing：不断做……。
Arnold presses another button, but the robot works even faster.|Arnold 按另一个按钮，机器人反而动作更快。|even faster：更快了。
William returns and stops the robot, but Arnold must clean up the water.|William 回来关停机器人，但 Arnold 必须清理积水。|but 连接意外与责任。
Arnold decides to listen carefully next time.|Arnold 决定下次认真听讲。|listen carefully：仔细听。
''',[q('Arnold 为什么不能及时解决问题？','他以前没认真学习机器人的操作。|机器人没有任何按钮。|William 不会制造机器人。',0,'开头说明 Arnold 从不认真听，因此不了解机器人。'),q('按下第二个按钮后，机器人怎样了？','立刻消失。|开始唱歌。|倒水更快了。',2,'故事说机器人 works really fast，水越来越多。')])
u['world']=P('Saving water · 让每滴水有用',[42,43],'可用的水需要珍惜。用日常习惯练习频率副词，并区分真正用水与浪费水。','''
People, animals and plants need water.|人、动物和植物都需要水。|need：需要。
Not all water is clean enough to drink.|并不是所有水都干净到可以饮用。|not all：并非所有。
Some places do not get much rain.|有些地方降雨不多。|rain 在这里作名词。
Wasting water means using it when we do not need to.|浪费水，就是在不需要的时候仍然用水。|means：意思是。
We can turn off the tap while we brush our teeth.|刷牙时，我们可以关掉水龙头。|turn off：关闭。
A bucket can use less water than a running hose when we wash a bike.|洗自行车时，用水桶可以比一直放水的水管更节约。|less ... than：比……更少。
A dripping tap can waste water a little at a time.|滴水的龙头会一点一点地浪费水。|a little at a time：每次一点点。
We can notice our habits and choose one way to save water today.|我们可以观察自己的习惯，今天就选择一个节水办法。|把知识转成一个具体行动。
''',[q('哪种情况属于浪费水？','喝自己需要的水。|不用水时仍让龙头开着。|关好水龙头。',1,'定义是：在不需要时仍使用水。'),q('文章建议关注什么？','自己的用水习惯。|只有海洋里的鱼。|一天有多少节课。',0,'观察生活习惯能帮助找到节水行动。')])
u['create']=C('我的任务时钟',[44,45],['画三个钟面，分别表示整点、半点和刻钟。','在每个钟面旁写一项任务及一个频率词。','用“没听懂—错误操作—承担清理责任”复述 Arnold 的故事。'],'At ... I ...\nI always ...\nI sometimes ...\nI never ...\nArnold did not ... so ...','I usually do my homework at quarter past five. I sometimes wash up after dinner. Arnold does not understand the robot. It pours too much water, and he has to clean the laboratory.','能说清一个 quarter past 和一个 quarter to；能用故事证据解释 Arnold 的问题。')

u=U(4,'Around town','城镇探路','🗺️','用位置词与目的句指路；理解 Lucy 为什么换一个观察位置，并会辨认四个基本方向。','''
bank|银行|The bank is opposite the park.
tower|塔|The old tower is very high.
library|图书馆|I am going to the library to get a book.
market square|集市广场|There are fruit stalls in the market square.
supermarket|超市|We buy vegetables at the supermarket.
bus station|公交车站|The bus station is near the library.
sports centre|体育中心|I play basketball at the sports centre.
map|地图|This map helps us find the tower.
''',[
G('opposite / near / above / below','opposite 在对面；near 在附近；above 在上方；below 在下方。先找参照物再判断位置。','The bank is opposite the school.|银行在学校对面。\nThe clock is above the door.|钟在门的上方。',[q('The lamp is above the table. 哪个在上面？','桌子。|灯。|没有说明。',1,'above 前面的 lamp 位于 table 上方。','grammar'),q('学校在公园对面：The school is ___ the park.','opposite|above|below',0,'opposite 描述相对的两边。','grammar')]),
G('去哪里，为了做什么','be going to + 地点说明去向；后面再用 to + 动词原形说明目的。','I am going to the shop to buy bread.|我去商店买面包。\nShe is going to the library to read.|她去图书馆读书。',[q('I am going to the sports centre ___ basketball.','playing|to play|plays',1,'to play 表示去体育中心的目的。','grammar'),q('“I am going to the library to get a book.” 中的目的是什么？','去借／拿一本书。|体育中心。|图书馆很高。',0,'to get a book 回答“为了做什么”。','grammar')])],F('/r/ 与长 /ɑː/','本单元比较 rock 的 /r/ 和 star 中的长元音。英式录音中 car 的词尾 r 常不单独发音；电脑语音口音可能不同。','red|rock\ncar|star\npark|far',51,[q('哪个单词以 /r/ 开头？','car|star|rock',2,'rock 的开头是辅音 /r/；car、star 不以它开头。','phonics')]),'Lost in town')
u['story']=P('Up high · 换个位置看',[50,51],'线索要求从高处向下看。Lucy 发现游乐场的海盗船比塔更高，换一个观察位置后找到字母 R。','''
The clue tells Ben and Lucy to look down from a high place.|线索让 Ben 和 Lucy 从高处往下看。|look down：向下看。
They first head for a tower near the market square.|他们最初朝集市广场附近的塔走去。|head for：朝……去。
Ben notices a funfair and wants to play.|Ben 看见游乐场，想去玩。|funfair：游乐场、游乐集市。
At first, Lucy says there is no time for games.|起初，Lucy 说没时间玩游戏。|at first：起初。
Then she realises that the Pirate Ship goes higher than the tower.|后来她意识到海盗船能升得比塔更高。|higher than：比……更高。
They ride the Pirate Ship and look down at the town.|他们坐上海盗船，向下看城镇。|ride：乘坐游乐设施。
From above, they can see the letter R.|从高处，他们看到了字母 R。|from above：从上方。
Horax and Zelda have gone to the wrong place.|Horax 和 Zelda 却去了错误的地方。|解决问题有时需要改变观察角度。
''',[q('Lucy 为什么改变主意去游乐场？','海盗船提供了更高的观察位置。|她忘了要找字母。|塔已经被拆掉了。',0,'她注意到海盗船更高，可以帮助完成线索任务。'),q('这个故事最能说明哪种思考办法？','遇到问题立刻放弃。|一直照原计划做，不看新信息。|根据新信息换一个解决方法。',2,'Lucy 结合游乐设施的高度重新选择观察点。')])
u['reading']=P('A useful town map · 地图上的目的地',[52,53],'依据教材的城镇地点谜语和目的句新编一段可朗读导览；不代替第 53 页听力答案。','''
A town map helps a new visitor find useful places.|城镇地图帮助新来的游客找到有用的地点。|依据技能页目标新编。
People go to a bank to get money.|人们去银行取钱。|to get money：表示目的。
They go to a library to find books.|他们去图书馆找书。|find books：找书。
A market square is a place to buy fruit and vegetables.|集市广场是买水果和蔬菜的地方。|a place to：可以……的地方。
At a sports centre, people can play games or go swimming.|在体育中心，人们可以做运动或者游泳。|or：或者。
A visitor can ask, “Where is the library, please?”|游客可以问：“请问图书馆在哪里？”|please 让问路更礼貌。
A clear answer gives a place and a useful position word.|清楚的回答会说出地点和有用的位置词。|position word：位置词。
For example, “It is opposite the bank.”|例如：“它在银行对面。”|这是新编示范位置，并非教材地图答案。
''',[q('如果想找书，文中建议去哪里？','银行。|图书馆。|公交总站。',1,'library 是找书的地方。'),q('哪句回答能帮助游客找到位置？','It is opposite the bank.|I like soup.|It was a sunny day.',0,'opposite the bank 提供了参照物和方位关系。')],kind='依据单元目标新编')
u['world']=P('Directions · 东南西北',[54,55],'把地图方向和寻找路线联系起来。先读方向标记，才能可靠地判断地图上的东西南北。','''
North, south, east and west are four directions.|北、南、东、西是四个方向。|direction：方向。
On the map in this lesson, north is at the top.|在本课的地图上，北在上方。|先看具体地图，不能假设所有地图都一样。
South is opposite north.|南与北相对。|opposite：相对。
East is on the right of this map, and west is on the left.|这张地图的东在右边，西在左边。|right / left：右／左。
A compass helps explorers find directions.|指南针帮助探险家辨别方向。|compass：指南针。
The marked end of its needle points towards north.|针上标示北的一端指向北方。|needle：指针。
NE means north-east, between north and east.|NE 表示东北，位于北与东之间。|between：在两者之间。
A GPS uses signals from satellites to help people find their position.|GPS 使用卫星信号帮助人们确定位置。|satellite：卫星；position：位置。
''',[q('在本课北向上的地图上，西在哪边？','右边。|下边。|左边。',2,'当北向上时，东在右，西在左。'),q('NE 指哪两个方向之间？','北和东。|南和东。|北和西。',0,'NE 是 north-east 的缩写。')])
u['create']=C('为小镇设计一条路线',[56,57],['画银行、图书馆、体育中心和广场，标出北。','让家人问路，用两个位置词回答。','写两句“去哪里，为了做什么”，再讲 Lucy 的观察办法。'],'Excuse me. Where is the ...?\nIt is ... the ...\nI am going to the ... to ...\nLucy chooses ... because ...','The library is opposite the bank. I am going to the library to get a book. Lucy chooses the Pirate Ship because it goes higher than the tower.','地图与句子一致；能用 to + 动词说明目的，并解释 Lucy 的选择。')

u=U(5,'Under the sea','海底世界','🐙','用 was/were 讲过去的位置与状态；复述海底脱困和救助海鹦的故事，发现自然中的图案。','''
dolphin|海豚|A dolphin swims near the boat.
turtle|海龟；龟|The turtle has a hard shell.
anchor|锚|The ship has a heavy anchor.
octopus|章鱼|The octopus has eight arms.
seahorse|海马|I can see a small seahorse.
seal|海豹|A seal is resting on the rock.
starfish|海星|The starfish is on the sea floor.
shell|贝壳|There is a shell on the beach.
''',[
G('was / were：过去的状态','was 和 were 是 be 的过去式。I/he/she/it 用 was；you/we/they 用 were。否定用 wasn’t / weren’t。','The beach was quiet yesterday.|昨天海滩很安静。\nThe children were happy.|孩子们当时很高兴。',[q('The dolphins ___ in the sea yesterday.','was|were|is',1,'dolphins 是复数，过去状态用 were。','grammar'),q('I ___ at school yesterday. I was at home.','wasn’t|weren’t|isn’t',0,'I 的过去否定形式是 wasn’t。','grammar')]),
G('Was / Were ...?：询问过去','把 was/were 放在主语前提问；短答保留对应的 was/were，不用 did。','Were you on the beach?|你当时在海滩上吗？\nYes, I was.|是的，我在。',[q('___ Tim in the sea yesterday?','Were|Did|Was',2,'Tim 是一个人，用 Was Tim ...?。','grammar'),q('Were they at the park? 肯定短答是：','Yes, they was.|Yes, they were.|Yes, they did.',1,'问句用 were，回答也用 were。','grammar')])],F('/s/ 与 /ʃ/：s 和 sh','/s/ 像细细的气流，/ʃ/ 像让人安静时的“嘘”。比较 sea/she 和 sip/ship。','sea|she\nsip|ship\nsock|shock',63,[q('哪个词开头是 /ʃ/？','sea|sock|shell',2,'shell 的 sh 读 /ʃ/。','phonics')]),'Fish, fish everywhere')
u['story']=P('The trap · 海底陷阱',[62,63],'Ben 的胳膊被大贝壳夹住，坏人又放出鲨鱼。章鱼帮助 Ben 脱困，鱼群组成第四个字母 S。','''
Ben and Lucy search under the sea for another letter.|Ben 和 Lucy 到海底寻找另一个字母。|under the sea：在海底。
Ben looks inside a giant shell.|Ben 查看一个巨大的贝壳里面。|giant：巨大的。
His arm gets stuck, and Lucy cannot open the shell.|他的胳膊被卡住，Lucy 打不开贝壳。|gets stuck：被卡住。
Horax and Zelda arrive with a shark in a cage.|Horax 和 Zelda 带着笼子里的鲨鱼出现。|cage：笼子。
They release it, but the angry shark turns towards them.|他们放出鲨鱼，愤怒的鲨鱼却转向他们。|but 引出意外转折。
A helpful octopus opens the shell and frees Ben.|一只热心的章鱼打开贝壳，让 Ben 脱困。|这是故事中的拟人化情节。
The children then notice a group of fish forming a letter.|接着，孩子们注意到一群鱼组成了一个字母。|forming：形成、组成。
The fish make an S, their fourth letter.|鱼群组成 S，这是他们的第四个字母。|fourth：第四。
''',[q('谁帮助 Ben 从贝壳里脱困？','鲨鱼。|章鱼。|Horax。',1,'章鱼帮助打开贝壳，Ben 才能把胳膊抽出。'),q('字母 S 是怎样出现的？','刻在一棵树上。|写在医院的门上。|由鱼群组成。',2,'结尾 Lucy 让 Ben 看鱼群，它们形成了 S。')])
u['reading']=P('What Christine found · 被发现的小海鹦',[64,65],'风暴过后，Christine 和 Ryan 发现被网困住的小海鹦，照顾它长大。次年再见到海鹦，她相信其中一只是自己帮助过的那只。','''
After a storm, Christine and Ryan go to the beach to look for treasures.|风暴过后，Christine 和 Ryan 去海滩寻宝。|treasures 在这里是贝壳等有趣的发现。
They find a small black-and-white bird caught in a net.|他们发现一只被网困住的黑白色小鸟。|caught in a net：被网困住。
Christine’s father tells them it is a young puffin.|Christine 的爸爸告诉他们，那是一只小海鹦。|puffin：海鹦。
He explains that puffins hunt for fish and are good at swimming.|他解释说，海鹦捕食鱼，擅长游泳。|hunt for：捕猎、寻找食物。
The children make a box with grass and feed the bird fish.|孩子们在盒子里铺草，给小鸟喂鱼。|这里在复述书中人物的行动。
The puffin grows, and one day it leaves.|小海鹦长大了，有一天离开了。|grows：长大。
A year later, the children see three puffins on a cliff.|一年后，孩子们在悬崖上看到三只海鹦。|a year later：一年之后。
Christine feels sure that one is their old friend, although the story does not prove it.|Christine 相信其中一只是老朋友，不过故事没有证实。|区分人物的确信与已证实的事实。
''',[q('他们最初在哪里发现小海鹦？','一张网里。|学校的课桌上。|市场的笼子里。',0,'小鸟被困在海滩的一张网中。'),q('故事结尾，哪种说法最准确？','他们给海鹦戴了标签，证实它回来了。|Christine 相信一只海鹦是老朋友。|小海鹦亲口告诉了他们名字。',1,'原文写她很确信，并没有提供身份确认的证据。')])
u['world']=P('Patterns and symmetry · 图案与对称',[66,67],'观察动物身上的点和条纹，再用折纸判断两边是否能对应重合，认识对称。','''
Animals can have spots, stripes and other patterns.|动物身上可能有斑点、条纹和其他图案。|pattern：图案。
Spots are small marks that look like dots.|斑点是像小圆点的标记。|spots：斑点。
Horizontal stripes go across from side to side.|水平条纹从一侧横向延伸到另一侧。|horizontal：水平的。
Vertical stripes go up and down.|垂直条纹上下延伸。|vertical：垂直的。
A symmetrical shape has two matching sides across a line.|对称图形在一条线两边有相互对应的部分。|symmetrical：对称的。
That line is called a line of symmetry.|那条线叫作对称轴。|line of symmetry：对称轴。
We can fold a paper shape along the line to check the two sides.|我们可以沿着这条线折叠纸形，检查两边。|fold：折叠。
A paper fish is symmetrical when its two halves match.|当一条纸鱼的两半能对应重合时，它就是对称的。|halves：一半的复数形式。
''',[q('horizontal stripes 指什么？','横向条纹。|小圆斑点。|竖向条纹。',0,'horizontal 表示水平、横向。'),q('怎样检查画出的纸鱼是否沿中线对称？','只看它是什么颜色。|沿中线折叠，看两半是否重合。|数纸上写了几个字母。',1,'对应部分沿对称轴折叠后应能重合。')])
u['create']=C('海洋发现小报告',[67,68,69],['画一种海洋动物，标出两处身体特征或图案。','问家人 Were you ... yesterday?，记录一句过去的位置。','用“发现—照顾—离开—再次见到”讲海鹦故事。'],'My sea animal is ...\nIt has ...\nWere you ... yesterday?\nThe children found ...\nA year later ...','Christine and Ryan find a young puffin in a net. They feed it and it grows. It leaves at the end of summer. A year later, Christine sees puffins and thinks her friend has returned.','能用 was/were 说过去状态；能把人物的猜想说成“她认为”，而不是已证实的事实。')

u=U(6,'Gadgets','实用小装置','🔦','比较物品、在预算内购物；理解洞穴中的合作解围，并读懂简单数列。','''
lift|电梯|We take the lift to the third floor.
walkie-talkie|对讲机|The explorers use a walkie-talkie.
torch|手电筒|The torch helps me see in the dark.
CD player|CD 播放机|This CD player is small.
mp3 player|MP3 播放器|My mp3 player has many songs.
mobile phone|手机|I use a mobile phone to call Mum.
electric fan|电风扇|The electric fan is beside the window.
laptop|笔记本电脑|This laptop is lighter than that one.
electric toothbrush|电动牙刷|My electric toothbrush is blue.
games console|游戏机|The games console is expensive.
''',[
G('比较级：两样东西作比较','短形容词常加 -er；big 变 bigger。较长形容词常用 more + 形容词；后接 than。','This torch is cheaper than that one.|这支手电筒比那支便宜。\nThe blue phone is more expensive.|蓝色手机更贵。',[q('This bag is ___ than my old bag.','bigger|biggest|big',0,'有 than，比较两样物品，用 bigger。','grammar'),q('expensive 的比较级是什么？','expensiver|most expensive|more expensive',2,'较长形容词 expensive 用 more expensive。','grammar')]),
G('最高级：在一组中最……','比较一组事物时，常用 the + -est 或 the most + 形容词，并说明比较范围。','This is the smallest torch in the shop.|这是商店里最小的手电筒。\nIt is the most useful thing in my bag.|它是我包里最有用的东西。',[q('这三支手电筒中最便宜的：the ___ torch of the three','cheaper|cheapest|cheap',1,'在三个中选最便宜，用最高级 cheapest。','grammar'),q('“书包里最有用的物品”是：','the more useful thing in the bag|most useful than the bag|the most useful thing in the bag',2,'最高级 the most useful，并说明范围 in the bag。','grammar')])],F('长元音与字母组合','第 75 页练习长元音。这里用 cake、bike、nose 对比短元音；注意有些词尾 e 不发音，却影响前面的元音。','cap|cape\nkit|kite\nnot|note',75,[q('哪一个词的元音和 bike 相同？','big|kite|sit',1,'bike 和 kite 的元音都读 /aɪ/。','phonics')]),'My bike is bigger')
u['story']=P('The cave · 洞穴里的好主意',[74,75],'Ben 带手电和对讲机下洞找字母。被坏人追进洞后，他靠 Lucy 与 Buster 的机智配合安全离开。','''
The next clue sends the friends to some caves.|下一条线索把朋友们引向洞穴。|cave：洞穴。
Ben goes inside with a torch and a walkie-talkie.|Ben 带着手电筒和对讲机走进去。|with：带着。
Lucy stays outside to watch for Horax and Zelda.|Lucy 留在外面，留意 Horax 和 Zelda。|watch for：注意、提防。
Deep in the dark cave, Ben finds beautiful paintings and the letter E.|在黑暗的洞穴深处，Ben 发现漂亮的壁画和字母 E。|paintings：画；E 是第五个字母。
Then the two thieves come into the cave, and Ben hides behind a rock.|随后两个坏人走进洞里，Ben 藏到岩石后面。|behind：在后面。
He tells Lucy about the problem on his walkie-talkie.|他通过对讲机告诉 Lucy 遇到的麻烦。|on his walkie-talkie：通过对讲机。
Lucy uses Buster’s growling sound to frighten the thieves.|Lucy 利用 Buster 的低吼声吓唬坏人。|growling：低吼。
They run away, and Ben gets out safely.|坏人逃跑了，Ben 平安脱身。|safely：安全地。
''',[q('哪些物品帮助 Ben 在洞里看清并联系 Lucy？','电风扇和牙刷。|手电筒和对讲机。|CD 播放机和足球。',1,'手电用于照明，对讲机用于保持联系。'),q('坏人为什么逃跑？','他们被 Buster 的吼声吓到了。|他们已经得到所有宝藏。|Ben 告诉他们午餐时间到了。',0,'Lucy 让 Buster 的声音吓住他们，帮助 Ben 脱困。')])
u['reading']=P('Choosing a torch · 按预算选手电',[71,76,77],'依据教材比较价格、购物问答的目标新编；价格是本练习设置，不是原书听力答案。','''
Mia wants a torch for a camping trip.|Mia 想为露营买一支手电筒。|新编购物情境。
She has twenty pounds to spend.|她有二十英镑预算。|to spend：可以花费的。
The first torch costs twenty-five pounds.|第一支手电筒要二十五英镑。|costs：价格是。
It is too expensive for her budget.|它超出了她的预算。|budget：预算。
She asks, “Have you got a cheaper one?”|她问：“有便宜一点的吗？”|cheaper：更便宜的。
The assistant shows her a smaller torch for twelve pounds.|店员给她看一支十二英镑的较小手电。|assistant：店员。
Mia checks that it works and chooses the cheaper torch.|Mia 检查它能用，然后选了较便宜的那支。|选择依据不只看外观。
She has eight pounds left after paying.|付款后，她还剩八英镑。|twenty minus twelve is eight。
''',[q('Mia 为什么不选第一支？','它超出二十英镑预算。|它是商店最小的。|她不需要手电。',0,'第一支二十五英镑，比她的预算多五英镑。'),q('买十二英镑的手电后还剩多少钱？','十二英镑。|五英镑。|八英镑。',2,'20 − 12 = 8。')],kind='依据单元目标新编')
u['world']=P('Numbers and sequences · 数字与数列',[78,79],'用罗马数字读数，用相邻两数之和寻找数列规则。聚焦教材中的数学活动，不把历史简述当成完整数学史。','''
We use numbers to count, measure and buy things.|我们用数字计数、测量和购物。|measure：测量。
The symbols 0 to 9 are part of the Hindu-Arabic number system.|0 到 9 这些符号属于印度—阿拉伯数字系统。|number system：记数系统。
Roman numerals use letters such as I, V and X.|罗马数字使用 I、V、X 这样的字母。|Roman numerals：罗马数字。
I means one, V means five, and X means ten.|I 表示一，V 表示五，X 表示十。|记住三个基础符号。
VI is six, but IV is four.|VI 是六，但 IV 是四。|符号的位置会改变运算关系。
A number sequence follows a rule.|数列按照某种规律排列。|sequence：数列。
In the sequence 1, 1, 2, 3, 5, each new number is the sum of the two before it.|数列 1、1、2、3、5 中，每个新数都是前两数之和。|sum：和。
The next two numbers in this sequence are eight and thirteen.|这个数列接下来的两个数是八和十三。|3 + 5 = 8，5 + 8 = 13。
''',[q('罗马数字 IV 表示几？','六。|四。|九。',1,'小的 I 在 V 前，表示 5 − 1。'),q('1, 1, 2, 3, 5, 8 后面是哪一个数？','9。|11。|13。',2,'这个数列把前两数相加，5 + 8 = 13。')])
u['create']=C('预算内购物挑战',[80,81],['给三件物品编出价格，总预算为 £30。','写一个比较级和一个最高级，说明选择。','两人扮演顾客与店员，询价、选择并计算余额。'],'Have you got a ...?\nHow much is it?\nThis ... is cheaper than ...\nIt is the ... in the shop.\nI have ... pounds left.','I have thirty pounds. This torch is twelve pounds, and that one is twenty-five pounds. This one is cheaper. I buy it and have eighteen pounds left.','对话包含询价与选择理由；比较级使用 than；余额计算正确。')

u=U(7,'In the hospital','医院里的故事','🏥','说出不舒服的部位，用规则与不规则过去式讲事件；理解 Sophia 怎样发现问题并求助。','''
earache|耳朵痛|I have an earache.
headache|头痛|He has a headache today.
cold|感冒|I have a cold and feel tired.
doctor|医生|The doctor asks what happened.
toothache|牙痛|She has a toothache.
nurse|护士|The nurse helps the patient.
stomach-ache|肚子痛|Ben has a stomach-ache.
cough|咳嗽|I have a cough.
''',[
G('规则动词过去式：常加 -ed','讲已经发生的动作，许多动词加 -ed；如 play → played、jump → jumped。','Harry jumped and landed on the floor.|Harry 跳起来，落到地上。\nThe doctor looked at his arm.|医生检查了他的胳膊。',[q('Yesterday, we ___ basketball.','play|playing|played',2,'yesterday 表示过去，play 的过去式是 played。','grammar'),q('look 的过去式是：','looked|look|looking',0,'规则变化在 look 后加 -ed。','grammar')]),
G('不规则过去式：单独记忆','一些动词不加 -ed：go → went，feel → felt，have → had，give → gave，say → said，wake up → woke up。','She felt tired and went home.|她觉得累，就回家了。\nHe gave me a book.|他给了我一本书。',[q('go 的过去式是：','goed|went|going',1,'go 是不规则动词，过去式是 went。','grammar'),q('Yesterday she ___ a stomach-ache.','have|has|had',2,'have 的过去式是 had。','grammar')])],F('-ed 的读法：不是都多一个音节','liked /t/ 不增加音节；played /d/ 也不增加音节；wanted /ɪd/ 增加音节。第 87 页练读 hiked、liked、skated、hated。','liked|hiked\nplayed|stayed\nwanted|hated',87,[q('哪一个词的 -ed 单独增加一个音节？','liked|played|wanted',2,'wanted 的 -ed 读 /ɪd/，而 liked /t/、played /d/ 不多一个音节。','phonics')]),'What a week')
u['story']=P('At the hospital · 假装生病的坏人',[86,87],'一条假短信把 Ben 和 Lucy 引到医院。病床上其实是 Horax，他索要古书。医生进门给“病人”检查，让孩子们有机会离开。','''
Ben receives a message saying his grandfather is in hospital.|Ben 收到短信，说他的爷爷在医院。|receives：收到；message：消息。
He and Lucy go to Room 209.|他和 Lucy 赶到 209 号病房。|room number：房间号。
They enter quietly because they think Grandpa is asleep.|他们以为爷爷睡着了，于是轻轻走进去。|because 说明原因。
But the person in the bed is Horax, not Grandpa.|可是床上的人是 Horax，并不是爷爷。|辨认真正的人物身份。
The message was a trick to bring the children there.|原来短信是把孩子们骗来的计谋。|trick：骗局。
Horax demands the book and the letters.|Horax 索要古书和字母。|demands：强要。
A doctor comes in and asks the children to step outside.|医生进来，让孩子们先出去。|step outside：到外面去。
Ben and Lucy use the chance to leave safely with their information.|Ben 和 Lucy 抓住机会，带着线索安全离开。|chance：机会。
''',[q('为什么 Ben 来到医院？','他收到爷爷生病的短信。|他想买一张地图。|他受邀参加歌唱比赛。',0,'短信称 Grandpa 在 209 号病房。'),q('谁实际上在病床上？','Ben 的爷爷。|Horax。|Buster。',1,'故事的转折是病床上的“爷爷”其实是 Horax。')])
u['reading']=P('Sophia saves the day · 窗口里的发现',[88,89],'Sophia 踢球伤了膝盖，住院时用望远镜观察窗外。她发现学校附近起火并及时求助，帮助大家避免危险。','''
Sophia scores a goal, but she hurts her leg.|Sophia 踢进一球，却伤了腿。|scores a goal：进球。
The next morning, a doctor checks her knee and arranges an X-ray.|第二天早晨，医生检查她的膝盖并安排拍 X 光片。|knee：膝盖；X-ray：X 光检查。
Sophia has to stay in hospital for two weeks.|Sophia 必须住院两周。|has to：不得不。
She feels bored until the doctor gives her binoculars.|她觉得无聊，直到医生给她一副望远镜。|binoculars：双筒望远镜。
Through them, she can watch the streets and her friends near the school.|通过望远镜，她能观察街道和学校附近的朋友。|through：通过。
One day, she spots a fire in the wood behind the school.|一天，她发现学校后面树林里着火了。|spots：发现、看见。
She uses her phone to call the fire brigade.|她用电话向消防队求助。|fire brigade：消防队。
The news celebrates the girl whose quick call helps save the school.|新闻表扬了这个及时求助、帮助保护学校的女孩。|用动作与结果解释标题。
''',[q('Sophia 为什么要住院？','她的膝盖受伤，需要治疗。|她想观察轮船。|她要在医院参加比赛。',0,'医生在检查与 X 光检查后发现膝盖问题。'),q('真正帮助保护学校的行动是什么？','只在窗口观看。|发现火情后及时打电话求助。|自己离开医院去扑火。',1,'她看见火情并联系消防队；故事没有让她自行灭火。')])
u['world']=P('Fever words · 读懂身体与体温的词',[90,91],'依据本单元科学页练习 fever、temperature、thermometer 等词。这里只学表达与阅读，不把教材简化文字当诊断或用药办法。','''
When we feel ill, we may feel hotter than usual.|生病时，我们有时会觉得比平常热。|may 表示可能，并非每次都一样。
The word fever describes an unusually high body temperature.|fever 描述体温异常升高的情况。|fever：发热。
Temperature tells us how hot or cold something is.|temperature 表示某物有多热或多冷。|temperature：温度。
A thermometer is an instrument for measuring temperature.|thermometer 是测量温度的工具。|thermometer：温度计。
The book also uses the words rest, water and germs.|书中还用了 rest、water 和 germs 这些词。|rest：休息；germs：病菌的日常统称。
A patient can tell an adult, “I feel ill and very hot.”|身体不舒服的人可以告诉大人：“我不舒服，而且很热。”|把感受表达出来。
A doctor asks questions to understand what is happening.|医生通过提问来了解情况。|understand：了解。
This reading practises health vocabulary, not decisions about medicine.|这篇阅读练习健康词汇，不指导用药决定。|理解教材的学习范围。
''',[q('哪一个词表示测量温度的工具？','thermometer。|binoculars。|walkie-talkie。',0,'thermometer 是温度计；另外两个分别是望远镜和对讲机。'),q('I feel ill and very hot. 表达的是什么？','购物预算。|身体感受。|天气预报的准确温度。',1,'句子说“我不舒服，而且感觉很热”，是在描述自己的状态。')],kind='依据单元目标新编')
u['create']=C('一次求助的清楚表达',[92,93],['用 I have ... 或 I feel ... 描述一种虚构的身体感受。','用两个过去式说明“发生了什么”，练习向成人清楚求助。','按“受伤—观察—发现—求助”的顺序讲 Sophia 的故事。'],'I have ...\nI feel ...\nYesterday I ...\nFirst, Sophia ...\nThen she ...\nFinally ...','Sophia hurt her leg and went to hospital. The doctor gave her binoculars. She saw a fire near the school and called the fire brigade. Her quick action helped protect the school.','能区分现在感受与过去事件；复述包含发现危险后求助，不编造治疗或药量。')

u=U(8,'Around the world','环游世界','🌍','用过去时说明做过和没做过的事；在模型公园找齐字母，并用折纸了解另一种艺术。','''
Egypt|埃及|We read about pyramids in Egypt.
Chile|智利|Chile is in South America.
Mexico|墨西哥|My friend visited Mexico.
China|中国|The Great Wall is in China.
Spain|西班牙|We saw a map of Spain.
Argentina|阿根廷|Argentina is in South America.
India|印度|We found India on the map.
Australia|澳大利亚|The Sydney Opera House is in Australia.
Turkey|土耳其|This flag is the flag of Turkey.
Brazil|巴西|Rio de Janeiro is in Brazil.
''',[
G('过去时否定：didn’t + 动词原形','didn’t 已经表示过去，后面的动作回到原形：didn’t go，不能说 didn’t went。','We went to the beach, but we didn’t swim.|我们去了海滩，但没有游泳。\nShe didn’t buy a postcard.|她没有买明信片。',[q('Yesterday I didn’t ___ to the park.','went|go|going',1,'didn’t 后接动词原形 go。','grammar'),q('哪句正确表达“她去了伦敦，但没去动物园”？','She went to London, but she didn’t go to the zoo.|She went to London, but she didn’t went to the zoo.|She go to London, but she doesn’t went to the zoo.',0,'肯定句使用 went；否定句用 didn’t go。','grammar')]),
G('Did ...? 询问过去的经历','Did + 主语 + 动词原形？短答 Yes, ... did. / No, ... didn’t.。特殊疑问词可放在 Did 前。','Did you visit the museum?|你参观博物馆了吗？\nWhere did you stay?|你住在哪里？',[q('Did she ___ any photos?','took|takes|take',2,'did 后面的动词用原形 take。','grammar'),q('Did they go by train? 否定短答是：','No, they weren’t.|No, they didn’t.|No, they don’t.',1,'Did 开头的过去时问句用 didn’t 作否定短答。','grammar')])],F('/iː/ 和 /ɪ/：长短要分清','第 99 页比较长 /iː/ 与短 /ɪ/。这里用 sheep/ship 等新编词对练习，不依赖字母是否相同。','sheep|ship\nfeel|fill\nseat|sit',99,[q('哪一个词的元音与 sheep 相同？','ship|sit|seat',2,'sheep 和 seat 的元音都是长 /iː/。','phonics')]),'All my friends are far away')
u['story']=P('The final letters · 模型公园里的字母',[98,99],'孩子们在同一座模型公园看世界建筑。古书不见了，但他们从 INDIA 标牌上发现最后两个字母 N 和 D。','''
Ben and Lucy visit a park with models from around the world.|Ben 和 Lucy 参观一座展示世界模型的公园。|他们没有在一天内飞遍这些国家。
They see a football stadium from Brazil and the Great Wall of China.|他们看到巴西足球场和中国长城的模型。|models：模型。
They also visit the Sydney Opera House and the Egyptian pyramids.|他们还看了悉尼歌剧院和埃及金字塔的模型。|also：也。
Mr Williams appears in the park and greets them.|Mr Williams 在公园出现，向他们打招呼。|appears：出现。
The children stop to eat their sandwiches.|孩子们停下来吃三明治。|stop to eat：停下手头的事去吃东西。
Then Lucy discovers that their book is missing.|接着，Lucy 发现古书不见了。|missing：不见了。
Near the Indian model, she notices letters missing from the INDIA sign.|在印度模型附近，她注意到 INDIA 标牌上缺了字母。|把建筑标牌与寻字母任务联系起来。
The missing N and D are the last two letters they need.|缺少的 N 和 D 正是他们需要的最后两个字母。|之前已有 I、F、R、S、E。
''',[q('他们怎样在一天内看到许多国家的建筑？','乘宇宙飞船环游地球。|参观同一座公园里的建筑模型。|真的从巴西游泳到中国。',1,'第 94 页引入的是模型村／公园，后续建筑都在这里。'),q('他们找到的最后两个字母是什么？','N 和 D。|A 和 I。|B 和 C。',0,'INDIA 标牌缺少 N、D；剩余可见 I、I、A。')])
u['reading']=P('Molly’s London visit · 一封旅行邮件',[95],'Molly 写给 Dana 的邮件按地点、动物和食物介绍旅行。注意“去了哪里”和“没有做什么”的对照。','''
Molly writes an email to Dana about London.|Molly 写邮件给 Dana，介绍伦敦之行。|email：电子邮件。
Yesterday, she went to the zoo with her dad.|昨天，她和爸爸去了动物园。|went 是 go 的过去式。
Her mum did not go with them; she went shopping.|妈妈没有一起去，而是去购物了。|did not go：没有去。
They saw elephants, hippos and zebras.|他们看到了大象、河马和斑马。|saw 是 see 的过去式。
They did not see the lion because it stayed inside its cave.|他们没看到狮子，因为它待在洞里。|because 说明原因。
After the zoo, they went to a pizza restaurant.|离开动物园后，他们去了披萨店。|after：在……之后。
Molly did not eat pizza; she chose spaghetti instead.|Molly 没有吃披萨，而是吃了意大利面。|instead：代替、转而。
She enjoyed the food and wanted to share the visit with her friend.|她觉得食物好吃，想把这次旅行分享给朋友。|概括邮件的沟通目的。
''',[q('谁和 Molly 一起去了动物园？','她的妈妈。|她的爸爸。|Dana。',1,'邮件开头写 Dad and I went to the zoo。'),q('哪一项与邮件相符？','Molly 吃了披萨并看到了狮子。|Molly 没去动物园。|Molly 吃了意大利面，没有看到狮子。',2,'两个否定信息分别是没看到 lion、没吃 pizza。')])
u['world']=P('Origami · 把纸折成作品',[102,103],'认识 origami 的意思，并按照图示折出模型。把艺术说明读成清楚的动作步骤。','''
Origami is the art of folding paper into models.|Origami 是把纸折成模型的艺术。|folding：折叠。
The word comes from Japanese.|这个词来自日语。|comes from：来自。
Ori means fold, and kami means paper.|ori 表示折叠，kami 表示纸。|帮助记忆单词来源。
People can make birds, animals, masks and many other shapes.|人们可以折出鸟、动物、面具等许多形状。|shapes：形状。
For a simple butterfly, the book starts with a square piece of paper.|做简单蝴蝶时，书中先准备一张正方形纸。|square：正方形。
Folding along a diagonal makes a triangle.|沿对角线折，就得到三角形。|diagonal：对角线。
Further folds make the body and wings.|接着继续折，形成身体和翅膀。|wings：翅膀。
We can follow pictures carefully and explain each step to a partner.|我们可以仔细看图，并向伙伴解释每个步骤。|follow：按照；step：步骤。
''',[q('Origami 是哪种艺术？','折纸。|画油画。|雕刻石头。',0,'关键意思是 folding paper。'),q('把正方形沿一条对角线对折，会得到什么基本形状？','圆形。|三角形。|五角星。',1,'正方形沿对角线折成三角形。')])
u['create']=C('旅行采访与明信片',[104,105],['采访一位家人曾去过的地方，也可以明确设定一次虚构旅行。','问一个 Did ...? 问题，记录做过和没做过的事。','写四句明信片，包含地点、同行者、活动与感受。'],'Where did you go?\nWho did you go with?\nDid you ...?\nI went to ...\nI ... but I didn’t ...\nIt was ...','I went to London with my dad. We visited the zoo, but we didn’t see the lion. After that, we went to a restaurant. I ate spaghetti and had a great day.','问句与否定句在 did/didn’t 后用原形；能说清人物、地点和至少一个对照事实。')

u=U(9,'Holiday plans','假期计划与宝藏','🌦️','用 going to 讨论计划；讲清 FRIENDS 与 FINDERS 的区别，理解 Sean 怎样改变对假期的看法。','''
thunderstorm|雷暴；雷雨|There is a thunderstorm outside.
lightning|闪电|We can see lightning through the window.
cloudy|多云的|It is cloudy this morning.
rainy|下雨的|It is going to be rainy tomorrow.
windy|有风的|It is windy near the sea.
umbrella|雨伞|I take my umbrella on rainy days.
raincoat|雨衣|My raincoat keeps me dry.
foggy|有雾的|It is foggy in the morning.
boots|靴子|I wear boots when it rains.
''',[
G('be going to：未来计划或预测','am/is/are going to 后接动词原形。说天气时常用 It is going to be + 形容词。否定在 be 后加 not。','I am going to read a book.|我打算读一本书。\nIt is going to be rainy.|将会下雨。',[q('She is going to ___ her grandma.','visits|visited|visit',2,'going to 后接动词原形 visit。','grammar'),q('It is going to ___ windy tomorrow.','be|is|are',0,'说未来的天气，going to 后用 be 原形。','grammar')]),
G('Are you going to ...? 讨论计划','把 am/is/are 放到主语前提问。短答沿用 be：Yes, I am. / No, she isn’t.。','Are you going to swim?|你打算游泳吗？\nWhat are they going to do?|他们打算做什么？',[q('___ he going to play tennis?','Are|Is|Do',1,'he 搭配 is，疑问句把 Is 放在开头。','grammar'),q('Are you going to read tonight? 肯定短答是：','Yes, I do.|Yes, I did.|Yes, I am.',2,'问句以 Are you 开头，回答用 I am。','grammar')])],F('/ɜː/：bird、purple 中的音','第 111 页集中练习 /ɜː/。英式 bird、girl、turn 共享这个长元音；部分美式语音会带 r 音色。','bird|third\ngirl|shirt\nturn|purple',111,[q('哪个词的主要元音与 bird 相同？','girl|bed|bad',0,'bird 和 girl 在本课英式发音中都有 /ɜː/。','phonics')]),'A super holiday')
u['story']=P('The treasure · 朋友才是钥匙',[110,111],'同样七个字母可以组成 FINDERS，也可以组成 FRIENDS。Horax 只想占有宝藏，Lucy 却读懂了真正的答案：朋友。','''
Ben and Lucy find Horax and Zelda with the stolen book.|Ben 和 Lucy 发现 Horax 和 Zelda 拿着被偷的古书。|stolen：被偷走的。
The thieves still need the seven letters to finish a message.|坏人还需要七个字母来补完整条信息。|finish：完成。
The children are discovered, and Ben gives the letters in a mixed order.|孩子们被发现了，Ben 说出打乱顺序的字母。|mixed order：打乱的顺序。
They also learn that Mr Williams was Horax in disguise.|他们还发现，Mr Williams 原来是 Horax 假扮的。|in disguise：乔装打扮。
Horax arranges the letters to spell FINDERS, but the entrance does not open for him.|Horax 把字母拼成 FINDERS，但入口没有为他打开。|finders：发现者；与 friends 用同一组字母。
Lucy rearranges them to spell FRIENDS.|Lucy 重新排列字母，拼出 FRIENDS。|friends：朋友。
True friends can enter, and Ben and Lucy reach the beautiful treasure.|真正的朋友可以进入，Ben 和 Lucy 找到了美丽的宝藏。|说明正确答案与人物关系。
They decide to take it to a museum, where it belongs.|他们决定把宝藏交给博物馆，让它去该去的地方。|与本册开头的探险家使命呼应。
''',[q('真正让孩子们进入的单词是什么？','FINDERS。|FRIENDS。|FINGERS。',1,'Lucy 说正确词是 friends，不是 finders。'),q('他们决定怎样处理宝藏？','交给博物馆。|藏到 Horax 家。|自己偷偷卖掉。',0,'结尾 Lucy 提议把宝藏送到 museum。')])
u['reading']=P('Holidays with Grandma · 改变想法的假期',[112,113],'Sean 起初觉得农场没有电视、没有伙伴，很无聊。奶奶教他骑马，他逐渐热爱照顾动物，最后不舍得离开。','''
Sean is unhappy about spending his holiday on Grandma’s farm.|Sean 不愿意去奶奶的农场度假。|unhappy：不高兴的。
His parents have work in Africa and cannot take him with them.|父母要去非洲工作，不能带他同行。|cannot take him：不能带上他。
At first, he complains that there is no television and no other children.|起初，他抱怨那里没有电视，也没有其他孩子。|at first：最初。
One day, Grandma invites him to meet her horse and pony.|一天，奶奶带他去看马和小马。|pony：小型马。
She teaches him to ride, starting slowly.|奶奶从慢慢骑开始，教他骑马。|teaches him to：教他做……。
Sean soon loves riding and helps feed and brush the animals.|Sean 很快喜欢上骑马，还帮忙喂马、刷毛。|feed / brush：喂食／刷毛。
When his parents return a month later, he no longer feels bored.|一个月后父母回来时，他已经不再觉得无聊。|no longer：不再。
He asks to stay with Grandma until school starts.|他请求留在奶奶家，直到开学。|until：直到。
''',[q('Sean 的看法为什么改变了？','农场忽然装了很多电视。|他发现自己喜欢骑马和照顾动物。|父母每天都带他去非洲。',1,'他从接触马、学习骑马到主动照顾动物，找到了乐趣。'),q('开头与结尾最大的变化是什么？','他开始不想去，最后不想离开。|他开始喜欢学校，最后讨厌学校。|他一直觉得农场完全一样无聊。',0,'对比两处请求，就能看出态度改变。')])
u['world']=P('Seasons and hemispheres · 两个半球的季节',[114,115],'从赤道和地轴倾斜理解：南北半球季节不同，热带许多地区更常区分雨季与旱季。','''
The Equator divides the Earth into the Northern and Southern hemispheres.|赤道把地球分为北半球和南半球。|hemisphere：半球。
Many places have spring, summer, autumn and winter.|许多地方有春、夏、秋、冬。|many places 不等于所有地方。
The two hemispheres have their seasons at different times.|两个半球在不同时间迎来相应季节。|at different times：在不同时间。
December is in winter in Japan, but in summer in New Zealand.|十二月在日本是冬季，在新西兰却是夏季。|用 but 对比两个半球。
The Earth travels around the sun, and its axis is tilted.|地球围绕太阳运行，地轴是倾斜的。|axis：地轴；tilted：倾斜的。
This changes how much sunlight each hemisphere gets during the year.|这会改变一年中各半球获得的日照情况。|连接原因与季节变化。
Many places near the Equator have wet and dry seasons.|赤道附近的许多地方有雨季和旱季。|wet / dry：湿润的／干燥的。
When we plan a holiday, we need to think about the place and the season.|计划假期时，我们需要考虑目的地和季节。|把地理知识用在计划中。
''',[q('日本十二月是冬季，新西兰的十二月是什么季节？','冬季。|春季。|夏季。',2,'两国位于不同半球，教材以此比较相反季节。'),q('哪项有助于解释季节变化？','地轴倾斜，加上地球绕太阳运行。|地球每年换一个形状。|所有地方同一天得到完全相同的日照。',0,'地轴倾斜使公转中不同半球的日照情况发生变化。')])
u['create']=C('我的假期计划与全册复述',[116,117],['选一个地方，写两项 going to 计划和一种可能的天气。','请家人问 Are you going to ...?，用肯定和否定各回答一次。','把 I、F、R、S、E、N、D 写在纸片上，拼成 FRIENDS，再讲故事结局。'],'I am going to ...\nIt is going to be ...\nAre you going to ...?\nYes, I am. / No, I’m not.\nThe letters make ...\nThe friends ...','I am going to visit my grandma. We are going to feed the horses. In the adventure, Lucy makes the word FRIENDS. Ben and Lucy find the treasure and take it to a museum.','计划句中 be 与主语一致；能解释为什么 FRIENDS 比 FINDERS 更符合故事主题，并说清宝藏去向。')

BOOK['glossary'] = vocab('''
explorer|探险家|The explorer follows a clue.
treasure|宝藏|The treasure belongs in a museum.
clue|线索|This clue helps us solve the puzzle.
code|密码|The book is written in code.
museum|博物馆|We visit a museum.
waterfall|瀑布|The waterfall is high.
laboratory|实验室|The scientist works in a laboratory.
rubbish|垃圾|We put the rubbish in the bin.
compass|指南针|A compass helps us find north.
puffin|海鹦|The puffin catches fish.
symmetry|对称|This shape has symmetry.
budget|预算|My budget is twenty pounds.
binoculars|双筒望远镜|She looks through binoculars.
pyramid|金字塔|There is a pyramid model in the park.
hemisphere|半球|Japan is in the Northern hemisphere.
''')
