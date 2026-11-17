"""Super Minds 1: source-checked, beginning-reader learning cards.

Source mapping: SB printed page p = PDF page p-1 (1-based).
Teacher references are printed T-pages, not PDF indices.
All teaching examples/questions are newly written; story retellings retain the
events of the supplied Student's Book, checked against the Teacher's Book.
"""
from book_helpers import vocab, q, passage, grammar, phonics


def G(title, rule, examples, questions):
    for item in questions:
        item['kind'] = 'grammar'
    return grammar(title, rule, examples, questions)


def PH(title, note, pairs, page, question):
    question['kind'] = 'phonics'
    return phonics(title, note, pairs, page, [question])


def C(title, pages, tasks, frame, model, success, teacher):
    return dict(title=title, pages=pages, tasks=tasks, frame=frame, model=model,
                success=success, teacher=teacher)


def U(i, title, zh, start, end, icon, goal, song_title, song_page):
    return dict(id=i, title=title, zh=zh, start=start, end=end, icon=icon,
                goal=goal, grammarPage=None, teacher=f"教师用书 T{start}–T{end}",
                song=dict(title=song_title, page=song_page, task=[
                    '打开原页，圈出已经认识的词。',
                    '先按意思读一句，再用拍手打节奏。',
                    '用本单元词语替换一句，读给家人听；原版歌曲需配套音频。']))


UNITS = []

u = U(0, 'Friends', '认识超级朋友', 4, 9, '👋',
      '介绍姓名和年龄，认读 1–10、颜色与字母，说明四位朋友的不同本领。',
      'A, B, C, D, E, F, G', 6)
u['vocab'] = vocab('''
one|一|I have one book.
two|二|I have two pens.
three|三|I have three bags.
four|四|I have four toys.
five|五|I have five pencils.
six|六|I am six.
seven|七|I am seven.
eight|八|I am eight.
nine|九|I have nine balls.
ten|十|I have ten cars.
''')
u['grammar'] = [
    G('What’s your name?', '问名字用 What’s your name?；回答用 I’m + 名字。I’m 是 I am 的缩写。',
      "What's your name?|你叫什么名字？\nI'm Lily.|我叫莉莉。", [
          q('别人问 What’s your name?，哪句回答的是名字？', "I'm Lily.|I'm seven.|It's red.", 0, 'Lily 是姓名；seven 是年龄，red 是颜色。'),
          q('你想知道新朋友叫什么，选哪句？', "How old are you?|What's your name?|Look at me!", 1, 'What’s your name? 用来询问姓名。')]),
    G('How old are you?', '问年龄用 How old are you?；回答用 I’m + 数字。年龄不是姓名。',
      "How old are you?|你几岁？\nI'm eight.|我八岁。", [
          q('How old are you? — I’m eight. 这里 eight 表示什么？', '名字|颜色|年龄', 2, 'How old 问年龄，所以 eight 表示八岁。'),
          q('想表达“我六岁”，哪句合适？', "I'm six.|I'm blue.|I'm Flash.", 0, 'six 是六；blue 是蓝色；Flash 是名字。')])]
u['phonics'] = PH('字母名称：A–Z', '本课先认字母名称，不把字母名称当作单词里的发音。读 A–Z 时指着原页；大小写是一对。',
                   'A|a\nM|m\nZ|z', 6,
                   q('英语字母表的最后一个字母是？', 'A|M|Z', 2, '字母表从 A 开始，到 Z 结束。'))
u['story'] = passage('Meet the Super Friends', [8, 9],
    '四位朋友展示不同本领。Whisper 能和动物说话，问出小猫叫 Tabby、四岁；别人直接问，小猫只会喵喵叫。每个人都有自己的长处。', '''
Thunder is strong.|Thunder 力气很大。|strong：强壮的；图中他举起桌子。
Flash can run fast.|Flash 跑得很快。|fast：快地。
Misty can disappear.|Misty 能隐身。|disappear：消失；这是故事中的超能力。
Whisper can speak to animals.|Whisper 能和动物说话。|speak to：与……说话。
The cat is Tabby.|这只猫叫 Tabby。|Tabby 是小猫的名字。
Tabby is four.|Tabby 四岁。|four 在这里回答年龄。
''', [q('谁能和 Tabby 交谈？', 'Thunder|Whisper|Flash', 1, '第四句写 Whisper can speak to animals。'),
      q('这段故事最主要介绍了什么？', '四位朋友的不同本领|四种学校用品|四个比赛奖杯', 0, '四位朋友依次展示自己的特别本领。')])
u['reading'] = passage('My name, my age, my colours', [4, 5, 7],
    '用一张自我介绍卡练习姓名、年龄和六种颜色。下面的 Lily 是新编示例人物。', '''
Hello! I am Lily.|你好！我叫莉莉。|Hello：你好；打招呼可以先说它。
I am seven.|我七岁。|I am 可以缩写成 I’m。
My hat is yellow.|我的帽子是黄色的。|yellow：黄色。
My bag is red and blue.|我的书包是红蓝两色的。|and：和；red 红色，blue 蓝色。
My pens are green, orange and purple.|我的笔有绿色、橙色和紫色。|green 绿色；orange 橙色；purple 紫色。
''', [q('Lily 几岁？', 'Six.|Seven.|Eight.', 1, '第二句 I am seven 说明她七岁。'),
      q('Lily 的帽子是什么颜色？', 'Purple.|Green.|Yellow.', 2, '第三句 My hat is yellow。')], kind='依据单元目标新编')
u['world'] = passage('A friendly hello', [4, 8, 9],
    '把故事里“交朋友”的主题变成小对话：先问候，再交换姓名与年龄，给对方说话的机会。这是入门单元延伸活动。', '''
I say hello.|我说你好。|hello 是友好的开场。
I say my name.|我说出自己的名字。|my name：我的名字。
I ask your name.|我问你的名字。|your name：你的名字。
I listen to you.|我听你说。|listen：听；轮到对方时认真听。
We can be friends.|我们可以成为朋友。|friends：朋友。
''', [q('说完自己的名字之后，哪种做法能让双方交流？', '一直只说自己的事|问对方名字并听回答|拿走对方的帽子', 1, '第三、四句告诉我们问对方名字并认真听。'),
      q('这段话的主题是？', '交朋友|数玩具|画房子', 0, '从 hello、name、listen 到 friends，讲的是怎样友好地认识别人。')], kind='依据单元目标新编')
u['create'] = C('我的朋友通行证', [4, 5, 7, 9],
    ['画自己的头像，写姓名和年龄。', '给帽子涂色，用英语说出一种颜色。', '与家人轮流问姓名和年龄，再说一句朋友的本领。'],
    "Hello! I'm ____.\nI'm ____.\nMy hat is ____.\nMy friend is ____.\n____ can ____.",
    "Hello! I'm Lily. I'm seven. My hat is yellow. Whisper can speak to animals.",
    '能分别回答姓名、年龄；能认出一个颜色词；能用中文说清四位朋友各有本领。',
    '依据学生用书 4–9 页及教师用书 T4、T5、T7–T9 的问答与角色表演活动改编；通行证与示例为新编。')
UNITS.append(u)

u = U(1, 'At school', '学校里的小帮手', 10, 21, '🎒',
      '认读学习用品，礼貌发出课堂指令，讲清 Flash 遇到的麻烦和朋友的帮助。',
      'What’s this?', 12)
u['vocab'] = vocab('''
pen|钢笔；笔|This is my pen.
rubber|橡皮|My rubber is blue.
pencil|铅笔|Pass me a pencil, please.
book|书|Open your book, please.
notebook|笔记本|My notebook is green.
bag|书包；包|My bag is red.
desk|书桌|The book is on my desk.
ruler|尺子|This is a long ruler.
pencil case|铅笔盒|My pencil case is yellow.
''')
u['grammar'] = [
    G('认物与确认：What’s this? / Is it ...?', '不知道是什么，问 What’s this?；猜测时问 Is it a ...?，用 Yes, it is. 或 No, it isn’t. 回答。',
      "What's this? It's a ruler.|这是什么？这是一把尺子。\nIs it a pen? No, it isn't.|它是笔吗？不，不是。", [
          q('物品是一支铅笔。What’s this? 应怎样回答？', "It's a pencil.|It's a desk.|It's a bag.", 0, 'pencil 才是“铅笔”。'),
          q('物品是书。别人问 Is it a pen?，应选哪句？', 'Yes, it is.|No, it isn’t.|I’m seven.', 1, '书不是笔，用 No, it isn’t. 否定这个猜测。')]),
    G('有礼貌的指令', 'Open / Close / Pass me 后接物品；please 让请求更有礼貌。指令不需要先说 you。',
      'Open your book, please.|请打开你的书。\nPass me a ruler, please.|请递给我一把尺子。', [
          q('想请别人把尺子递给你，应说？', 'Close your ruler, please.|Pass me a ruler, please.|Open your ruler, please.', 1, 'Pass me ... 表示“把……递给我”。'),
          q('Close your book, please. 要做什么？', '打开书|拿出笔|合上书', 2, 'close 是合上；open 才是打开。')])]
u['phonics'] = PH('短元音 a /æ/', 'bag、cat、hat 中 a 发短元音 /æ/；嘴张开，声音短。这里练词中的声音，不读字母名称 A。',
                   'cat|hat\nbag|black\nfat|rat', 15,
                   q('哪组词里的 a 都与 bag 中的 a 同音？', 'cat / hat|name / cake|blue / green', 0, 'cat、hat 和 bag 都含短元音 /æ/。'))
u['story'] = passage('Watch out, Flash!', [14, 15],
    'Flash 跑得太急，撞到搬水果的人并道歉。她拿到笔记本后又落了东西，朋友们把学习用品还给她，最后她发现连书包也忘了。', '''
Flash runs very fast.|Flash 跑得很快。|run：跑；very fast：非常快。
She bumps into a man.|她撞到了一位男子。|bumps into：撞到；看原页掉落的水果。
She says sorry.|她说对不起。|sorry：对不起。
Her mum gives her a notebook.|妈妈把笔记本给她。|gives her：给她。
Her friends give her school things.|朋友们把学习用品给她。|school things：学习用品。
Oh no! Her bag is missing.|哎呀！她的书包没拿。|最后发现 My bag!；先停下来检查物品。
''', [q('Flash 撞到人后做了什么？', '把书藏起来|道歉|参加比赛', 1, '第三句说 She says sorry。'),
      q('朋友们怎样帮助 Flash？', '把学习用品给她|把书包涂红|教她游泳', 0, '第五句和原页第 6 格都说明朋友把文具还给她。')])
u['reading'] = passage('My school bag', [17],
    '以课本“写一写自己的书包”为目标，新编一段五句小介绍。先找颜色，再找里面的物品。', '''
This is my school bag.|这是我的书包。|This is ...：这是……。
It is green and blue.|它是绿蓝两色的。|It 指上句的书包。
I have a book and a notebook.|我有一本书和一本笔记本。|book 和 notebook 不是同一个词。
My pencil is in my pencil case.|我的铅笔在铅笔盒里。|in：在……里面。
My bag is ready for school.|我的书包准备好了，可以上学了。|ready：准备好的。
''', [q('铅笔放在哪里？', 'In the pencil case.|Under the desk.|On the ruler.', 0, '第四句给出位置：in my pencil case。'),
      q('怎样用一句话介绍书包颜色？', 'It is a pen.|It is green and blue.|I am seven.', 1, '第二句用 It is + 颜色介绍书包。')], kind='依据单元目标新编')
u['world'] = passage('Mix the colours', [18, 19],
    '美术页把红、黄、蓝作为颜料混色的三原色。混出橙、紫、绿，加白色让颜色变浅。这里讨论的是课本的颜料混色活动。', '''
Red, yellow and blue are primary colours.|红、黄、蓝是本课颜料混色的三原色。|primary colours：三原色；限定为本课颜料活动。
Red and yellow make orange.|红色和黄色混合得到橙色。|mix：混合；make：变成。
Red and blue make purple.|红色和蓝色混合得到紫色。|purple：紫色。
Blue and yellow make green.|蓝色和黄色混合得到绿色。|green：绿色。
White makes a colour lighter.|白色让一种颜色变浅。|lighter：更浅；与加深颜色相反。
''', [q('课本颜料活动中，蓝色与黄色混合得到什么？', 'Orange.|Green.|Purple.', 1, '第四句：Blue and yellow make green。'),
      q('怎样让颜料颜色变浅？', 'Add white.|Add a book.|Close the bag.', 0, '最后一句说明加入白色会让颜色变浅。')])
u['create'] = C('书包整理员与颜色画家', [17, 19, 21],
    ['画一个书包，标出三种学习用品。', '用 What’s this? / Is it ...? 与家人玩三次猜物。', '画三组混色箭头，说明一种新颜色怎样得到。'],
    "This is my bag.\nIt is ____ and ____.\nI've got a ____ and a ____.\n____ and ____ make ____.",
    'This is my bag. It is green and blue. I have a book and a pencil. Blue and yellow make green.',
    '能认出并读出三种文具，礼貌请求递物，说明一次正确的颜料混色。',
    '依据学生用书 17、19、21 页及教师用书 T17–T21 的描述、混色与海报任务改编；短文和问答为新编。')
UNITS.append(u)

u = U(2, 'Let’s play!', '玩具与公平比赛', 22, 33, '🪁',
      '介绍别人的姓名、年龄和最爱玩具，描述大小新旧，按顺序讲完卡丁车比赛。',
      'Hey, Emma! What’s your favourite toy?', 24)
u['vocab'] = vocab('''
kite|风筝|My kite is yellow.
doll|玩偶|This doll is small.
monster|怪兽玩具|This is a green monster.
plane|飞机玩具|My plane is new.
computer game|电脑游戏|This is my favourite computer game.
train|火车玩具|The train is long.
car|小汽车|My car is red.
ball|球|I have a small ball.
bike|自行车|My bike is blue.
go-kart|卡丁车|Misty has an old go-kart.
''')
u['grammar'] = [
    G('介绍他或她', 'his 表示“他的”，her 表示“她的”；问年龄用 How old is he/she?；问最爱用 What’s his/her favourite toy?',
      "What's her name? Her name's Mia.|她叫什么名字？她叫米娅。\nHow old is he? He's seven.|他几岁？他七岁。\nHis favourite toy is his ball.|他最爱的玩具是他的球。", [
          q('介绍女孩 Mia：“____ name is Mia.” 应填？', 'His|Her|He', 1, '女孩“她的名字”用 Her name。'),
          q('His favourite toy is his train. 他最爱的玩具是？', 'A doll.|A ball.|A train.', 2, 'favourite toy 后说明是 train，火车玩具。')]),
    G('形容玩具：a / an + 形容词 + 名词', '先说大小、新旧或颜色，再说物品；an 放在元音发音开头的词前，如 an old ...，不是只看后面的名词。',
      "It's a new kite.|它是一只新风筝。\nIt's an old go-kart.|它是一辆旧卡丁车。\nIt's a big green monster.|它是一个绿色的大怪兽玩具。", [
          q('表达“一辆旧卡丁车”，哪句正确？', 'an old go-kart|a old go-kart|an new go-kart', 0, 'old 以元音发音开头，所以前面用 an。'),
          q('A short red train 是哪一种玩具？', '长的蓝色火车|短的红色火车|小的绿色飞机', 1, 'short=短，red=红色，train=火车。')])]
u['phonics'] = PH('短元音 e /e/', 'pen、red、ten 中 e 是短元音。先听词，再找共同声音；它与 cat 的 /æ/ 不同。',
                   'pen|ten\nred|bed\nBen|Ken', 27,
                   q('哪一个词与 pen 中的 e 发音相同？', 'cat|kite|ten', 2, 'pen 和 ten 都有短元音 /e/。'))
u['story'] = passage('The go-kart race', [26, 27],
    'Ben 嘲笑 Misty 的旧车，还在比赛中把她撞出赛道。Thunder 帮助她，Misty 最后获胜。这个故事提醒我们公平比赛。', '''
Ben and Misty are in a race.|Ben 和 Misty 参加比赛。|race：比赛。
Misty has an old go-kart.|Misty 有一辆旧卡丁车。|old：旧的；Ben 嘲笑它。
Ben pushes her go-kart off the track.|Ben 把她的卡丁车撞出赛道。|off the track：离开赛道；这是不公平的做法。
Thunder helps Misty.|Thunder 帮助 Misty。|helps：帮助。
Misty wins the race.|Misty 赢得比赛。|wins：赢；原页她举起奖杯。
Fair play is important.|公平比赛很重要。|fair play：公平竞赛；不能为了赢而作弊。
''', [q('是谁帮助 Misty 回到比赛中？', 'Ben.|Thunder.|The cat.', 1, '第四句：Thunder helps Misty。'),
      q('Ben 的哪种做法不公平？', '给朋友加油|说谢谢|把对手撞出赛道', 2, '第三句的行为干扰了对手，是故事所反对的作弊。')])
u['reading'] = passage('My favourite toy', [28, 29],
    '依据玩具描述与“最爱的东西”写作任务新编。读出物品、颜色和大小，最后说明为什么喜欢。', '''
My favourite toy is a train.|我最爱的玩具是一列火车。|favourite：最喜欢的。
It is a long blue train.|它是一列长长的蓝色火车。|long：长的。
It is not new.|它不是新的。|not：不；先别把旧玩具排除在外。
I play with my brother.|我和哥哥一起玩。|with：和……一起。
We like this train.|我们喜欢这列火车。|We：我们；一起玩让玩具有意义。
''', [q('这列火车是什么样的？', 'Long and blue.|Short and red.|New and green.', 0, '第二句给出 long blue；第三句说它不是新的。'),
      q('短文里是谁一起玩？', '我和老师|我和哥哥|我和 Ben', 1, '第四句 I play with my brother。')], kind='依据单元目标新编')
u['world'] = passage('A tangram puzzle', [30, 31],
    '七巧板来自中国，由不同形状的拼片组成。观察三角形、正方形和平行四边形，转动拼片做新图案。', '''
A tangram is an old Chinese toy.|七巧板是一种古老的中国玩具。|Chinese：中国的。
It has seven pieces.|它有七块拼片。|pieces：一块块拼片。
There are triangles, a square and a parallelogram.|里面有三角形、一个正方形和一个平行四边形。|triangle / square / parallelogram：三种形状。
There is no circle.|里面没有圆形拼片。|circle：圆形。
Turn the pieces to make a picture.|转动拼片，拼出一个图案。|turn：转动；可参考原页剪贴模板。
''', [q('七巧板有多少块拼片？', 'Six.|Seven.|Ten.', 1, '第二句写 seven pieces。'),
      q('哪种形状不是七巧板的拼片？', 'A triangle.|A square.|A circle.', 2, '第四句说没有 circle；三角形和正方形都有。')])
u['create'] = C('给玩具办一张介绍卡', [29, 31, 32],
    ['画最喜欢的玩具，标出颜色、大小或新旧。', '用三句英语介绍玩具，并回答一次 favourite 问题。', '用七巧板模板或纸片拼一个图案，说出一种形状。'],
    "My favourite toy is a ____.\nIt is ____ and ____.\nI play with ____.\nThis shape is a ____.",
    'My favourite toy is a train. It is long and blue. It is old. I play with my brother. This shape is a triangle.',
    '能描述真实玩具而非只背名称；能辨认一种形状；能用中文解释比赛为什么要公平。',
    '依据学生用书 29–32 页及教师用书 T26–T32；故事价值与获胜者已与 T26 核对，玩具介绍为新编。')
UNITS.append(u)

u = U(3, 'Pet show', '宠物展览会', 34, 45, '🕷️',
      '说出动物与位置，表达喜欢或不喜欢，理解蜘蛛故事的变化以及动物怎样隐藏。',
      'Look at the spiders', 36)
u['vocab'] = vocab('''
elephant|大象|The elephant is big.
rat|老鼠|The rat is under the table.
lizard|蜥蜴|The lizard is green.
frog|青蛙|The frog is in the box.
spider|蜘蛛|The spider is on the desk.
duck|鸭子|I like ducks.
dog|狗|The dog is small.
cat|猫|My cat is black.
''')
u['grammar'] = [
    G('in / on / under：找位置', 'in 是在里面，on 是在上面，under 是在下面；先找动物，再找它相对物品的位置。',
      'The frog is in the box.|青蛙在盒子里。\nThe cat is on the desk.|猫在书桌上。\nThe rat is under the chair.|老鼠在椅子下。', [
          q('The spider is under the table. 蜘蛛在哪里？', '桌子上|桌子里|桌子下', 2, 'under 表示在……下面。'),
          q('青蛙在盒子里面，应填 The frog is ____ the box.', 'on|in|under', 1, '盒子里面用 in。')]),
    G('I like / I don’t like', '说一般喜好时，动物常用复数：I like cats.；不喜欢加 don’t。',
      "I like dogs.|我喜欢狗。\nI don't like rats.|我不喜欢老鼠。", [
          q('I don’t like spiders. 是什么意思？', '我喜欢蜘蛛|我不喜欢蜘蛛|蜘蛛在桌下', 1, 'don’t like 表示不喜欢。'),
          q('想表达“我喜欢鸭子”，选哪句？', 'I like ducks.|I don’t like ducks.|I am a duck.', 0, 'I like ... 表示我喜欢……；ducks 用复数说这类动物。')])]
u['phonics'] = PH('短元音 i /ɪ/', 'Tim、big、six 里的 i 发短而轻的 /ɪ/。spider 虽然也写 i，读音不同，不凭字母外形猜声音。',
                   'big|pig\nsit|six\nTim|Kim', 39,
                   q('哪一个词里的 i 与 big 中的 i 不同音？', 'sit|six|spider', 2, 'big、sit、six 都是短元音 /ɪ/；spider 中是 /aɪ/。'))
u['story'] = passage('The spider', [38, 39],
    '朋友们起初怕蜘蛛。Whisper 让他们慢慢观察，他们发现蜘蛛会织网，很聪明；可一下子看到树上许多蜘蛛，又吓了一跳。', '''
Whisper likes the spider.|Whisper 喜欢这只蜘蛛。|likes：喜欢。
His friends are afraid.|他的朋友们害怕。|afraid：害怕的。
They watch the spider under the table.|他们观察桌子下面的蜘蛛。|watch：看、观察；under：在下面。
The spider makes a web.|蜘蛛织出一张网。|web：蜘蛛网。
The friends think it is clever.|朋友们觉得它很聪明。|clever：聪明的。
Then they see many spiders and feel afraid again.|后来他们看到许多蜘蛛，又害怕了。|again：又；故事没有说他们从此再也不怕了。
''', [q('朋友们为什么觉得蜘蛛聪明？', '它会开车|它织出一张网|它有一顶帽子', 1, '第四、五句表明他们看到蜘蛛织网后赞叹。'),
      q('结尾发生了什么？', '大家又被许多蜘蛛吓到|蜘蛛变成小猫|大家赢了比赛', 0, '第六句说明结尾出现许多蜘蛛，朋友们又害怕了。')])
u['reading'] = passage('The pet show winners', [40],
    '依据宠物展听力活动的信息改写：第一名是 Lucy，第二名 Donald，第三名 Sally。先看名字，再配对动物与名次。', '''
Welcome to the pet show.|欢迎来到宠物展。|pet show：宠物展览会。
Lucy is a lizard.|Lucy 是一只蜥蜴。|Lucy 是名字，lizard 是动物类别。
Lucy is number one.|Lucy 是第一名。|number one：一号、第一名；此处表示名次。
Donald the dog is number two.|小狗 Donald 是第二名。|number two：第二名。
Sally the spider is number three.|蜘蛛 Sally 是第三名。|number three：第三名。
''', [q('谁是第一名？', 'Donald the dog.|Sally the spider.|Lucy the lizard.', 2, '第三句写 Lucy is number one。'),
      q('Sally 是哪一种动物？', 'A spider.|A duck.|A cat.', 0, '最后一句 Sally the spider 表明 Sally 是蜘蛛。')])
u['world'] = passage('Hide with colours', [42, 43],
    '动物的颜色与周围环境接近时，不容易被发现。这叫保护色或伪装。观察草、水和叶子怎样帮助动物隐藏。', '''
Some animals are hard to see.|有些动物很难被看见。|hard to see：难以看见。
A green crocodile hides in green water.|绿色鳄鱼藏在绿色的水中。|hide：隐藏；相近颜色让它不显眼。
A brown frog hides on a brown leaf.|棕色青蛙藏在棕色叶子上。|leaf：叶子。
A tiger can hide in tall grass.|老虎能藏在高高的草丛中。|tall grass：高草丛。
Their colours help them hide.|它们的颜色帮助它们隐藏。|them 指这些动物；这是 camouflage 的作用。
''', [q('棕色青蛙在什么背景上较不显眼？', '白纸上|棕色叶子上|蓝色书包上', 1, '第三句里青蛙和叶子颜色相近。'),
      q('这段话主要解释什么？', '宠物比赛名次|怎样数蜘蛛|动物怎样借颜色隐藏', 2, '每个例子都把动物颜色与环境联系起来。')])
u['create'] = C('隐藏动物观察图', [40, 43, 44],
    ['画一只动物和环境，让它的颜色与背景接近。', '用 in、on 或 under 说出动物位置。', '说出一种喜欢的动物，再向家人解释为什么难找到隐藏动物。'],
    "I like ____.\nThe ____ is ____.\nIt is in / on / under the ____.\nThe colours are the same.",
    'I like frogs. The frog is brown. It is on a brown leaf. The colours help it hide.',
    '动物与位置能对应；能区分 like / don’t like；能用中文说清“颜色接近，所以难找”。观察真实动物时不模仿故事触摸蜘蛛。',
    '依据学生用书 40、42–44 页与教师用书 T38–T44；宠物名次取自 T40 配套听力文字，网页采用电脑语音读改写文本。')
UNITS.append(u)

u = U(4, 'Lunchtime', '午餐时间', 46, 57, '🍕',
      '介绍自己的食物，询问有没有某种食材，读懂购物数量，讲清等待轮到自己的道理。',
      'Tommy’s in the kitchen', 48)
u['vocab'] = vocab('''
banana|香蕉|I have a banana.
cake|蛋糕|The cake is small.
cheese sandwich|奶酪三明治|I have a cheese sandwich.
apple|苹果|My apple is red.
pizza|比萨饼|I like pizza.
sausage|香肠|I have one sausage.
chicken|鸡肉|We have chicken for lunch.
steak|牛排|I have a steak.
peas|豌豆|I like peas.
carrots|胡萝卜|We have three carrots.
''')
u['grammar'] = [
    G('I’ve got / I haven’t got', 'I’ve got 表示“我有”；I haven’t got 表示“我没有”。a/an 后面接一个可数物品。',
      "I've got a banana.|我有一根香蕉。\nI haven't got an apple.|我没有苹果。", [
          q('I haven’t got an apple. 表示？', '我没有苹果|我有苹果|我喜欢苹果', 0, 'haven’t got 是否定，说明没有。'),
          q('哪句表达“我有一根香蕉”？', "I haven't got a banana.|I've got a banana.|I've got a carrot.", 1, 'I’ve got 表示有；banana 是香蕉。')]),
    G('Have we got any ...?', '一起准备午餐时可问 Have we got any ...?；有就答 Yes, we have.，没有就答 No, we haven’t.。',
      'Have we got any cheese? Yes, we have.|我们有奶酪吗？有。\nHave we got any peas? No, we haven’t.|我们有豌豆吗？没有。', [
          q('篮子里有豌豆。Have we got any peas? 应答？', 'No, we haven’t.|I’m six.|Yes, we have.', 2, '有豌豆，回答 Yes, we have。'),
          q('想问“我们有奶酪吗？”，选哪句？', 'Have we got any cheese?|How old is the cheese?|What’s your cheese?', 0, 'Have we got any ...? 用来问有没有某种食材。')])]
u['phonics'] = PH('短元音 o /ɒ/', '按本教材的英式读音，hot、dog、shop 的 o 是短元音 /ɒ/。设备语音口音可能不同，先听完整词。',
                   'hot|dog\nbox|doll\nshop|stop', 51,
                   q('按本课英式读音，哪组词有相同的短 o 音？', 'hot / dog|cake / peas|blue / green', 0, 'hot 与 dog 都含本课短元音 /ɒ/。'))
u['story'] = passage('The pizza', [50, 51],
    'Misty 想吃比萨，隐身插到队伍前面，却发现比萨还没准备好，只拿到香肠和豌豆。认真排队的朋友们后来等到了新出炉的比萨。', '''
The friends wait for lunch.|朋友们排队等午餐。|wait：等待。
Misty wants pizza.|Misty 想吃比萨。|wants：想要。
She goes to the front of the queue.|她跑到队伍前面插队。|queue：队伍；front：前面。
There is no pizza for her yet.|这时还没有比萨给她。|yet：还；此时比萨没有准备好。
She gets sausages and peas.|她拿到香肠和豌豆。|gets：得到。
Her friends wait and get hot pizza.|朋友们等了一会儿，拿到热比萨。|故事提醒我们等待轮到自己。
''', [q('Misty 最后吃到的主食物是什么？', 'Pizza and cake.|Sausages and peas.|Apples and cheese.', 1, '第五句说明她拿到香肠和豌豆；有比萨的是朋友们。'),
      q('为什么说这个故事与“排队”有关？', 'Misty 插队，朋友们等待轮到自己|大家在比赛跑步|比萨是玩具', 0, '第三句的插队与最后一句的等待形成对照。')])
u['reading'] = passage('My shopping basket', [52, 53],
    '依据数字 11–20 和购物篮活动新编。先圈数字，再找食物，不能只认出食物就猜数量。', '''
This is my shopping basket.|这是我的购物篮。|basket：篮子。
I have twelve apples.|我有十二个苹果。|twelve：12。
I have fifteen carrots.|我有十五根胡萝卜。|fifteen：15；注意与 five 区分。
I have eleven bananas.|我有十一根香蕉。|eleven：11。
I have no cakes.|我没有蛋糕。|no：没有；数量并不是零食偏好的评价。
''', [q('篮子里有多少根胡萝卜？', 'Eleven.|Twelve.|Fifteen.', 2, '第三句是 fifteen carrots，即 15 根胡萝卜。'),
      q('哪一种食物不在这个篮子里？', 'Cakes.|Apples.|Bananas.', 0, '最后一句 I have no cakes。')], kind='依据单元目标新编')
u['world'] = passage('Where does our food grow?', [54, 55],
    '科学页让孩子把水果和蔬菜与生长位置连线：树上、植株上或地下。用 food、plant、tree、ground 帮助分类。', '''
Fruit and vegetables are foods from plants.|水果和蔬菜是来自植物的食物。|plants：植物。
Pears grow on trees.|梨长在树上。|grow：生长；tree：树。
Coconuts grow on trees too.|椰子也长在树上。|too：也。
Onions grow in the ground.|洋葱长在地下。|ground：地面、土壤；这里说可食用的地下部分。
Green beans grow on plants above the ground.|四季豆长在地面上的植株上。|above：在……上方；不是在地下。
''', [q('哪一种食物的可食用部分长在地下？', 'Pears.|Onions.|Coconuts.', 1, '第四句指出 onions grow in the ground。'),
      q('梨和椰子的相同点是？', '都长在树上|都是书包里的玩具|都长在地下', 0, '第二、三句都用 on trees。')])
u['create'] = C('我的午餐与购物单', [52, 53, 55, 56],
    ['画午餐盒，用 I’ve got 写出三种食物。', '列一张购物单，读出一个 11–20 的数量。', '挑两种蔬果，说它们长在树上、植株上还是地下。'],
    "I've got ____ for lunch.\nI haven't got ____.\nShopping list: ____ apples.\n____ grow on / in ____.",
    'I have a cheese sandwich and an apple. I haven’t got a banana. My shopping list has twelve apples. Pears grow on trees.',
    '能分清有与没有，正确读一个两位数；食物与生长位置能配对；能说清故事里谁在等待。',
    '依据学生用书 50–56 页与教师用书 T50–T56；购物单和午餐介绍为新编示例，不是原图答案。')
UNITS.append(u)

u = U(5, 'Free time', '一周的快乐时光', 58, 69, '📅',
      '按星期说活动，询问周末安排，读出一周计划，讲清朋友怎样寻求帮助。',
      'It’s a busy, busy week', 60)
u['vocab'] = vocab('''
Monday|星期一|I read on Mondays.
Tuesday|星期二|I ride my bike on Tuesdays.
Wednesday|星期三|I play on Wednesdays.
Thursday|星期四|I draw on Thursdays.
Friday|星期五|I sing on Fridays.
Saturday|星期六|I play football on Saturdays.
Sunday|星期日|I play with friends on Sundays.
''')
u['grammar'] = [
    G('on + 星期：说固定安排', '说每逢星期几常用 on Mondays 等复数形式。I 后面直接接活动动词。星期首字母大写。',
      'I play football on Mondays.|我每逢周一踢足球。\nI go swimming on Fridays.|我每逢周五游泳。', [
          q('想说“我每逢周二骑车”，选哪句？', 'I ride my bike on Tuesdays.|I ride my bike in Tuesdays.|I ride my bike at Tuesdays.', 0, '星期前用 on；Tuesdays 表示每逢周二。'),
          q('I go swimming on Fridays. 什么时间游泳？', 'Mondays.|Fridays.|Sundays.', 1, '句末 on Fridays 说明周五。')]),
    G('Do you ... at the weekend?', '问日常习惯用 Do you + 活动?；回答 Yes, I do. 或 No, I don’t.。at the weekend 是在周末。',
      "Do you play football at the weekend? Yes, I do.|你周末踢足球吗？是的。\nDo you watch TV at the weekend? No, I don't.|你周末看电视吗？不。", [
          q('你周末确实骑车。Do you ride your bike at the weekend? 应怎样答？', 'No, I don’t.|I’m a bike.|Yes, I do.', 2, '确实有这个习惯，用 Yes, I do。'),
          q('Do you watch TV? 询问的是？', '你看电视吗|你几岁|电视在哪里', 0, 'Do you + 动词问是否做这件事。')])]
u['phonics'] = PH('短元音 u /ʌ/', 'fun、Mum、duck 中 u 发短元音 /ʌ/。不要把它读成长长的字母名 U。',
                   'fun|sun\nMum|mud\nduck|jump', 63,
                   q('哪一个词与 fun 中的 u 发音相同？', 'blue|sun|name', 1, 'fun 和 sun 都含短元音 /ʌ/。'))
u['story'] = passage('We’re lost!', [62, 63],
    '朋友们在树林里找不到湖。Whisper 向兔子问路，兔子带路；大家用胡萝卜道谢时，兔子撞了头，结尾幽默地说它自己也迷路了。重点是需要时主动求助。', '''
The friends are lost in the woods.|朋友们在树林里迷路了。|lost：迷路的；woods：树林。
They want to find the lake.|他们想找到湖。|find：找到；lake：湖。
Whisper asks a rabbit for help.|Whisper 向兔子求助。|ask for help：寻求帮助。
The rabbit shows them the way.|兔子给他们带路。|the way：路。
They give the rabbit a carrot.|他们给兔子一根胡萝卜。|give：给；用它表示感谢。
The rabbit bumps its head and is lost too.|兔子撞了头，也迷糊得说自己迷路了。|too：也；这是漫画的幽默结尾。
''', [q('谁给朋友们带路？', 'A rabbit.|A cat.|A spider.', 0, '第三、四句说明是 rabbit，兔子。'),
      q('Whisper 解决最初问题的方法是？', '藏起地图|向兔子求助|抢一辆卡丁车', 1, '第三句 asks a rabbit for help，遇到困难可以求助。')])
u['reading'] = passage('My perfect week', [65],
    '课本小诗按星期介绍理想的一周：陪朋友、骑车、电脑游戏、玩具、游泳以及周末休息。按顺序读，不用一下子背整首。', '''
On Mondays, I play with friends.|周一，我和朋友玩。|Mondays：每逢周一。
On Tuesdays, I ride my bike.|周二，我骑自行车。|ride my bike：骑我的自行车。
On Wednesdays, I play computer games.|周三，我玩电脑游戏。|computer games：电脑游戏。
On Thursdays, I play with toys.|周四，我玩玩具。|with toys：和玩具一起玩。
On Fridays, I go swimming.|周五，我去游泳。|go swimming：去游泳。
At the weekend, I watch TV and sleep.|周末，我看电视和睡觉。|这是诗中人物的理想计划，不是要求照搬的作息表。
''', [q('诗中人物周三做什么？', 'Goes swimming.|Rides a bike.|Plays computer games.', 2, '第三句对应 Wednesdays：play computer games。'),
      q('哪一句介绍周末？', 'I watch TV and sleep.|I go swimming on Fridays.|I ride my bike on Tuesdays.', 0, '最后一句把 Saturday、Sunday 合称 the weekend。')])
u['world'] = passage('A balanced week', [66, 67],
    '课本让孩子想一想怎样获得快乐、活动身体和学习新事物，再用调查了解大家的一周。下面是依据这些目标新编的短文。', '''
I play with friends for fun.|我和朋友玩，获得快乐。|for fun：为了开心。
I do sport to keep fit.|我运动，活动身体。|do sport：运动；keep fit：保持健康。
I read to learn new things.|我阅读，学习新事物。|learn：学习。
I ask my friends about their week.|我询问朋友们一周做什么。|ask ... about：询问……的情况。
We put the answers on a chart.|我们把答案画在图表上。|chart：图表；长短不同的条形可表示人数。
''', [q('哪种活动在短文中帮助学习新事物？', 'Reading.|Hiding a ruler.|Closing a bag.', 0, '第三句 I read to learn new things。'),
      q('调查后为什么画图表？', '让答案消失|把大家的答案整理出来|替朋友决定一切', 1, '最后一句说明图表用来展示答案。')], kind='依据单元目标新编')
u['create'] = C('我的一周小诗', [65, 67, 69],
    ['写三个不同星期及对应活动，至少包含一个与朋友一起做的活动。', '问家人一个 Do you ... at the weekend? 问题，记录答案。', '按星期顺序朗读自己的计划，用中文说明快乐、活动和学习如何安排。'],
    "On Mondays, I ____.\nOn Wednesdays, I ____.\nOn Fridays, I ____.\nAt the weekend, I ____.",
    'On Mondays, I play with friends. On Wednesdays, I read. On Fridays, I go swimming. At the weekend, I ride my bike.',
    '星期与活动对应，能读出三句计划并真实回答周末问题；能说明迷路故事中的求助过程。',
    '依据学生用书 65–69 页及教师用书 T62–T69 的诗歌、调查、海报活动改编；示例计划由本课程新编。')
UNITS.append(u)

u = U(6, 'The old house', '老房子里的发现', 70, 81, '🏠',
      '介绍房间和物品数量，用 there is / are 提问，读懂动物与栖息地的关系。',
      'In my little house', 72)
u['vocab'] = vocab('''
bathroom|浴室|There is a bath in the bathroom.
bedroom|卧室|My bed is in my bedroom.
living room|客厅|We sit in the living room.
hall|门厅|My bag is in the hall.
dining room|餐厅|We eat in the dining room.
kitchen|厨房|The food is in the kitchen.
stairs|楼梯|These are the stairs.
cellar|地窖；地下室|The cellar is under the house.
''')
u['grammar'] = [
    G('There’s / There are：有一个或多个', '说某处有一个，用 There is / There’s；有多个，用 There are。注意后面的名词数量。',
      "There's a cat in the kitchen.|厨房里有一只猫。\nThere are four frogs in the bedroom.|卧室里有四只青蛙。", [
          q('“卧室里有三只猫”应填 ____ three cats in the bedroom.', 'There is|There are|I am', 1, 'three cats 是复数，用 There are。'),
          q('哪句与 There’s a rat. 数量相符？', 'One rat.|Four rats.|Ten rats.', 0, 'a rat 表示一只老鼠。')]),
    G('Is there / Are there / How many?', '一个物品用 Is there a ...?；多个用 Are there any ...?；问具体数量用 How many ... are there?',
      'Is there a garden? Yes, there is.|有花园吗？有。\nAre there any rats? No, there aren’t.|有老鼠吗？没有。\nHow many cats are there? There are two.|有几只猫？两只。', [
          q('想问有几只猫，应选？', 'How old are you?|Is it a cat?|How many cats are there?', 2, 'How many 问数量，cats 要用复数。'),
          q('屋里没有老鼠。Are there any rats? 怎样答？', 'No, there aren’t.|Yes, there is.|There are seven.', 0, '否定复数提问 Are there ...?，用 No, there aren’t。')])]
u['phonics'] = PH('辅音 h /h/', 'hat、house、help 开头的 h 发 /h/，轻轻呼气。练习整词，不在前面额外加“呵”的元音。',
                   'hat|hall\nhouse|help\nhot|happy', 75,
                   q('哪一个词开头不是 /h/？', 'hat|help|shoe', 2, 'shoe 以 /ʃ/ 开头；hat 和 help 以 /h/ 开头。'))
u['story'] = passage('At the house', [74, 75],
    '朋友们来到老房子外，有人害怕进去。Misty 先隐身去查看，发现猫、蜘蛛和老鼠；她回来让大家放心，隐身出现却又把朋友吓了一跳。', '''
The friends see an old house.|朋友们看见一座老房子。|old house：老房子。
Misty goes in first.|Misty 先进去。|first：首先。
She goes down to the cellar.|她走下楼梯去地下室。|goes down：往下走。
She sees a cat, spiders and rats.|她看见一只猫、蜘蛛和老鼠。|按原页先后观察到三种动物。
She tells her friends they can come in.|她告诉朋友们可以进来。|tells：告诉；原文表达 There’s no problem。
Her friends see her appear and get a fright.|朋友们看见她突然出现，吓了一跳。|appear：出现；这是超能力漫画情节。
''', [q('谁先进入老房子？', 'Misty.|Flash.|The rabbit.', 0, '第二句：Misty goes in first。'),
      q('Misty 在里面看到了哪一组动物？', 'Dogs, ducks and elephants.|A cat, spiders and rats.|Fish, whales and sharks.', 1, '第四句明确列出猫、蜘蛛和老鼠。')])
u['reading'] = passage('My home', [77],
    '依据课本住宅描述示例改写：一座有三间卧室和多种公共房间的家，没有地窖。用有与没有组织信息。', '''
I live in a nice house.|我住在一座漂亮的房子里。|live in：住在。
There are three bedrooms.|有三间卧室。|bedrooms 用复数，因为是三间。
There is a kitchen and a dining room.|有一间厨房和一间餐厅。|kitchen 做饭；dining room 吃饭。
There is a living room and a hall.|有一间客厅和一个门厅。|辨别不同房间名称。
There is no cellar.|没有地下室。|no cellar：没有地下室。
I like my house.|我喜欢我的房子。|用一句感受收尾。
''', [q('这座房子里有几间卧室？', 'Two.|Three.|Four.', 1, '第二句写 three bedrooms。'),
      q('这座房子没有什么？', 'A kitchen.|A living room.|A cellar.', 2, '第五句 There is no cellar。')])
u['world'] = passage('Animal homes', [78, 79],
    '地理页认识海洋、极地、沙漠、山地和丛林等栖息地，把动物与适合它们生活的地方配对。', '''
A habitat is an animal's home in nature.|栖息地是动物在自然界生活的地方。|habitat：栖息地。
A shark lives in the ocean.|鲨鱼生活在海洋里。|ocean：海洋。
A camel can live in the desert.|骆驼能在沙漠生活。|desert：沙漠。
A polar bear lives in the Arctic.|北极熊生活在北极地区。|原页归为 polar region；进一步区分它不在南极。
A tiger can live in the jungle.|老虎可以在丛林生活。|jungle：丛林；这里是教材配对示例，不表示唯一栖息地。
Different animals have different habitats.|不同动物有不同的栖息地。|different：不同的。
''', [q('哪种动物与 ocean 配对？', 'A camel.|A shark.|A tiger.', 1, '第二句说明鲨鱼生活在海洋里。'),
      q('这里的 habitat 指什么？', '动物自然生活的环境|动物比赛的奖杯|儿童的铅笔盒', 0, '第一句给出定义：自然界中动物生活的地方。')])
u['create'] = C('介绍我的家与动物之家', [77, 79, 80],
    ['画真实或想象的房子，标出三种房间。', '写一句 There’s 和一句 There are，并核对数量。', '选一种动物画出它的栖息地，用一句英语配对说明。'],
    "This is my house.\nThere's a ____.\nThere are ____ bedrooms.\nA ____ lives in the ____.",
    'This is my house. There’s a kitchen. There are two bedrooms. A shark lives in the ocean.',
    '能正确使用单数和复数，回答一个 How many 问题，说明一种动物和栖息地的关系。漫画里的旧屋探险只用于理解故事。',
    '依据学生用书 77–80 页及教师用书 T74–T80 的住宅描述、栖息地项目与想象活动改编；作品范例为新编。')
UNITS.append(u)

u = U(7, 'Get dressed', '穿衣服与说对不起', 82, 93, '🧢',
      '区分 this / these，描述正在穿的衣服，读懂帽子误会和衣料来源。',
      'I’m a cool, cool cat', 84)
u['vocab'] = vocab('''
jeans|牛仔裤|My jeans are blue.
sweater|毛衣|This sweater is warm.
jacket|夹克|I am wearing a green jacket.
skirt|裙子|Her skirt is red.
shorts|短裤|These shorts are yellow.
cap|鸭舌帽|My cap is on the chair.
shoes|鞋子|My shoes are black.
socks|袜子|These socks are blue.
T-shirt|T恤衫|I like this T-shirt.
trousers|长裤|He is wearing black trousers.
''')
u['grammar'] = [
    G('this / these：这一件和这些', '单数用 this，复数用 these。shoes、socks、trousers 等词按复数搭配：these shoes。',
      'Do you like this T-shirt?|你喜欢这件 T 恤吗？\nDo you like these shoes? Yes, I do.|你喜欢这些鞋子吗？是的。', [
          q('____ shoes：鞋子用哪一个？', 'this|these|is', 1, 'shoes 是复数，搭配 these。'),
          q('想问“你喜欢这件毛衣吗？”，选哪句？', 'Do you like these sweater?|Do you like this sweaters?|Do you like this sweater?', 2, 'sweater 是一件毛衣，搭配 this。')]),
    G('is wearing：现在穿着什么', 'He / She is wearing + 衣服表示现在穿着；提问把 is 放在前面，Is he/she wearing ...?',
      'She is wearing a red sweater.|她穿着一件红毛衣。\nIs he wearing a blue cap? Yes, he is.|他戴着蓝帽子吗？是的。', [
          q('She is wearing a red skirt. 她穿着什么？', 'A red skirt.|A blue jacket.|Red shoes.', 0, 'wearing 后的 a red skirt 是红裙子。'),
          q('男孩戴着蓝帽子。Is he wearing a blue cap? 应答？', 'No, he isn’t.|Yes, he is.|Yes, she is.', 1, '描述的是男孩 he，而且确实戴着蓝帽子，回答 Yes, he is。')])]
u['phonics'] = PH('辅音连缀 sp / st', 'spider 的开头连读 /sp/，stop 的开头连读 /st/；两个辅音之间不要加一个元音。',
                   'spider|speak\nstop|stairs\nsteak|star', 87,
                   q('哪一个词与 spider 一样以 sp 开头？', 'stop|stairs|speak', 2, 'spider 和 speak 以 /sp/ 开头，另外两个以 /st/ 开头。'))
u['story'] = passage('The cap', [86, 87],
    'Whisper 找不到帽子，误以为 Gary 戴着自己的。他让鸟拿走 Gary 的帽子，回家才发现自己的帽子在椅子下面，于是归还并道歉。', '''
Whisper cannot find his cap.|Whisper 找不到自己的帽子。|cannot find：找不到。
Gary is wearing the same kind of cap.|Gary 戴着一顶同样款式的帽子。|same：相同；相像不代表就是自己的。
Whisper thinks it is his cap.|Whisper 认为那是自己的帽子。|thinks：认为；这里是误会。
A bird takes Gary's cap for him.|一只鸟帮他拿走了 Gary 的帽子。|for him：替他；这是故事中的错误做法。
Whisper finds his own cap under a chair at home.|Whisper 在家里椅子下面找到自己的帽子。|own：自己的；under：在……下面。
He gives Gary's cap back and says sorry.|他把 Gary 的帽子还回去，并说对不起。|gives ... back：归还。
''', [q('Whisper 自己的帽子最后在哪里找到？', '在学校的树上|在家里椅子下面|在湖里', 1, '第五句说明在家里 under a chair。'),
      q('Whisper 为什么向 Gary 道歉？', '他误拿了 Gary 的帽子|他送了一本书|他不会骑车', 0, '他以为相同款式的帽子是自己的，最后发现自己错了。')])
u['reading'] = passage('Who is Tom?', [89],
    '依据原页 Tom 的人物描述改写。先认出颜色与衣物，再把人物和正在进行的活动配对。', '''
This is Tom.|这是 Tom。|人物名字先帮助确定主角。
He is wearing a blue helmet.|他戴着蓝色头盔。|helmet：头盔。
His jacket is green.|他的夹克是绿色的。|his：他的。
He is wearing black trousers and red shoes.|他穿黑色长裤和红色鞋子。|trousers、shoes 用复数形式。
He is riding a bike.|他正在骑自行车。|is riding：正在骑。
''', [q('Tom 戴着什么？', 'A red cap.|A green hat.|A blue helmet.', 2, '第二句说明 blue helmet，蓝色头盔。'),
      q('Tom 正在做什么？', 'Riding a bike.|Eating a cake.|Playing tennis.', 0, '最后一句是 He is riding a bike。')])
u['world'] = passage('What are clothes made from?', [90, 91],
    '课本介绍棉、皮革、羊毛的来源及特点：棉来自植物，皮革例子来自牛，羊毛来自羊。', '''
Cotton comes from plants.|棉来自植物。|cotton：棉。
Some T-shirts are made from cotton.|有些 T 恤是棉制的。|some：有些；不是所有 T 恤都用同一种材料。
The leather in this lesson comes from cows.|本课介绍的皮革来自牛。|leather：皮革；限定为教材里的来源例子。
Wool comes from sheep.|羊毛来自羊。|wool：羊毛；sheep：羊。
Woollen clothes can keep us warm.|羊毛衣物可以保暖。|warm：暖和的。
Leather is strong, and cotton is cool.|皮革结实，棉穿起来凉爽。|strong / cool 是课本材料特点词。
''', [q('哪一种材料来自羊？', 'Cotton.|Wool.|Leather.', 1, '第四句：Wool comes from sheep。'),
      q('本课用哪个词描述皮革？', 'Strong.|Lost.|Purple.', 0, '最后一句说 Leather is strong。')])
u['create'] = C('服装小侦探', [89, 91, 93],
    ['画一个人物，标出三件衣物和颜色。', '写两句 He/She is wearing，再让家人猜人物。', '查看一件衣物标签或课本例图，说出一种材料及其来源。'],
    "This is ____.\nHe / She is wearing ____.\nDo you like this / these ____?\n____ comes from ____.",
    'This is Tom. He is wearing a green jacket and black trousers. His shoes are red. Wool comes from sheep.',
    '衣物、颜色与人物一致，this / these 使用正确；能说明误会应先核实，做错后归还并道歉。',
    '依据学生用书 86–93 页与教师用书 T86–T93；Tom 的服装与动作按 89 页核对，创作任务为新编。')
UNITS.append(u)

u = U(8, 'The robot', '机器人与合作', 94, 105, '🤖',
      '认读身体部位，描述能做与不能做的动作，讲清机器人问题怎样由团队解决。',
      'Can you guess who we are?', 96)
u['vocab'] = vocab('''
head|头|The robot has a head.
arm|手臂|This is the robot's arm.
fingers|手指|I can move my fingers.
hand|手|This is my left hand.
knee|膝盖|Touch your knee.
leg|腿|The robot has two legs.
toes|脚趾|I can touch my toes.
foot|脚|This is my foot.
''')
u['grammar'] = [
    G('can / can’t：能做与不能做', 'can 后接动作原形；否定用 can’t。I / He / She 后都用 can，不加 s。',
      "I can stand on one leg.|我能单脚站立。\nShe can't swim.|她不会游泳。\nHe can dance.|他会跳舞。", [
          q('She can’t swim. 说明什么？', '她会游泳|她不会游泳|她正在游泳', 1, 'can’t 是否定，表示不能或不会。'),
          q('表达“他会跳舞”，哪句正确？', 'He can dances.|He cans dance.|He can dance.', 2, 'can 后的动作要用原形 dance，不加 s。')]),
    G('Can you ...?：询问本领', 'Can you + 动作? 问本领；回答 Yes, I can. 或 No, I can’t.。可以诚实说还不会。',
      'Can you ride a bike? Yes, I can.|你会骑车吗？会。\nCan you play the piano? No, I can’t.|你会弹钢琴吗？不会。', [
          q('你会游泳。Can you swim? 应答？', 'Yes, I can.|No, I can’t.|Yes, I do.', 0, '问句用 can，肯定回答也用 can。'),
          q('想问朋友会不会骑马，选哪句？', 'Where is the horse?|Can you ride a horse?|How old is the horse?', 1, 'Can you ride a horse? 询问骑马的能力。')])]
u['phonics'] = PH('硬辅音 g /ɡ/', '本课练 give、green 开头和 bag、leg 结尾的 /ɡ/。g 的位置会变，但这些词中的声音相同。',
                   'give|green\nbag|leg\ndog|frog', 99,
                   q('哪一个词以本课的 /ɡ/ 音结尾？', 'go|cat|bag', 2, 'bag 最后一个音是 /ɡ/；go 的 /ɡ/ 在开头。'))
u['story'] = passage('The problem', [98, 99],
    '朋友们一起组装机器人，Flash 帮忙找电池。机器人说话倒过来，Misty 发现头装反了，把头转正，机器人就能正常说话。', '''
The friends build a robot together.|朋友们一起组装机器人。|together：一起。
They put on its arms, legs and head.|他们装上它的手臂、腿和头。|put on：装上；按身体部位认识零件。
Flash brings the batteries.|Flash 带来电池。|batteries：电池。
The robot says words backwards.|机器人把词倒着说。|backwards：倒着；原页 Nac I sey 是 Yes I can 的倒序。
Misty turns its head the right way.|Misty 把它的头转到正确方向。|the right way：正确方向。
Now the robot can speak clearly.|现在机器人可以清楚地说话了。|每个人都帮忙，体现 teamwork，团队合作。
''', [q('Misty 怎样解决机器人的说话问题？', '给机器人换鞋|把机器人的头转正|让机器人跳进湖里', 1, '第五句明确说明 turns its head the right way。'),
      q('谁带来了电池？', 'Flash.|Gary.|The rabbit.', 0, '第三句：Flash brings the batteries。')])
u['reading'] = passage('Funny animals', [101],
    '课本创造了 Octo、Klump、Dook 和 Zak 等想象动物。这里选 Octo 与 Zak，读身体数量，再看本领；它们不是现实动物分类。', '''
An Octo has one head.|Octo 有一个头。|Octo 是课本的想象动物名。
It has two legs and eight arms.|它有两条腿和八只手臂。|legs 和 arms 不要混淆。
It can dance.|它会跳舞。|can：会。
A Zak has one head and eight legs.|Zak 有一个头和八条腿。|Zak 也是想象动物名。
It has four wings.|它有四只翅膀。|wings：翅膀。
It can fly, but it cannot jump.|它会飞，但是不会跳。|but：但是；cannot 与 can’t 意思相同。
''', [q('Octo 有多少只手臂？', 'Two.|Four.|Eight.', 2, '第二句说明 eight arms，八只手臂。'),
      q('Zak 会做什么、不会做什么？', '会飞，不会跳|会跳，不会飞|会游泳，不会跳舞', 0, '最后一句 can fly, but cannot jump。')])
u['world'] = passage('Our skeleton', [102, 103],
    '科学页把动物与骨架配对，并介绍身体里的骨骼。骨架由骨头构成，帮助身体支撑和活动。', '''
We have a skeleton inside our body.|我们的身体里有骨架。|skeleton：骨架。
A skeleton has many bones.|骨架有许多骨头。|bones：骨头。
Bones are strong.|骨头很坚固。|strong：结实的。
Our skeleton helps us stand and move.|骨架帮助我们站立和活动。|helps：帮助；站立和运动还需要肌肉等一起工作。
Some animals have skeletons too.|有些动物也有骨架。|some：有些；不要把所有动物都说成同一种骨架。
''', [q('骨架由什么构成？', 'Books.|Bones.|Batteries.', 1, '第二句：A skeleton has many bones。'),
      q('短文说骨架能帮助我们做什么？', 'Stand and move.|Read minds.|Change colours.', 0, '第四句说明帮助站立和活动。')])
u['create'] = C('设计我的机器人宠物', [101, 103, 104, 105],
    ['画一个想象机器人宠物，标出三种身体部位及数量。', '写出它能做和不能做的各一件事。', '用四句英语介绍它，再用中文说出故事里各人怎样合作。'],
    "My robot is a ____.\nIt has ____ heads and ____ legs.\nIt can ____.\nIt can't ____.",
    'My robot is a cat. It has one head and four legs. It can dance. It can’t fly.',
    '身体数量和画图一致，can 与 can’t 意思清楚；能讲出机器人问题、Misty 的办法和结果。',
    '依据学生用书 101–105 页及教师用书 T98–T105；故事中头部装反的原因已与 T98–T99 核对，机器人作品为新编。')
UNITS.append(u)

u = U(9, 'At the beach', '海边假日', 106, 117, '🏖️',
      '提出活动建议，询问物品位置，读懂旅行和天气信息，讲出一起到山顶的故事。',
      'Let’s go to the beach', 108)
u['vocab'] = vocab('''
catch a fish|钓鱼；捕到一条鱼|I can catch a fish.
paint a picture|画一幅画|Let's paint a picture.
eat ice cream|吃冰淇淋|I like to eat ice cream.
take a photo|拍照|Let's take a photo.
listen to music|听音乐|I listen to music on Sundays.
look for shells|找贝壳|Let's look for shells.
read a book|读书|I can read a book here.
make a sandcastle|堆沙堡|Let's make a sandcastle.
''')
u['grammar'] = [
    G('Let’s ...：一起做点什么', 'Let’s 后接动作原形，向大家提建议。可以答 Good idea.，也可以礼貌说 Sorry, I don’t want to.。',
      "Let's take a photo. Good idea.|我们拍张照片吧。好主意。\nLet's look for shells. Sorry, I don't want to.|我们找贝壳吧。抱歉，我不想。", [
          q('邀请家人一起画画，哪句正确？', 'Let’s paint a picture.|Let’s paints a picture.|Let’s painting a picture.', 0, 'Let’s 后面用动作原形 paint。'),
          q('如果你不想参加某个活动，哪句是礼貌回应？', 'Give me your bag!|Sorry, I don’t want to.|I’m a picture.', 1, '可以表达不同意愿，用 Sorry, I don’t want to 礼貌回应。')]),
    G('Where’s / Where are：找物品', '问一个物品用 Where’s ...? 回答 It’s ...；问多个用 Where are ...? 回答 They’re ...。',
      "Where's the book? It's in the bag.|书在哪里？在包里。\nWhere are the shells? They're on the sand.|贝壳在哪里？在沙滩上。", [
          q('Where are the books? 应选择哪一种回答开头？', 'It’s|I’m|They’re', 2, 'books 是复数，回答用 They’re。'),
          q('Where’s the ball? It’s under the chair. 球在哪？', '椅子下|椅子上|书包里', 0, 'under the chair 表示在椅子下面。')])]
u['phonics'] = PH('ee / ea：长元音 /iː/', 'see、teeth 的 ee 与 sea、beach 的 ea 在本课都读 /iː/。这里只归纳这些例词，不表示所有 ea 都这样发音。',
                   'see|sea\nteeth|beach\ngreen|clean', 111,
                   q('哪一个词与 see 中的长 /iː/ 不同音？', 'beach|pet|cheese', 1, 'pet 的 e 是短元音 /e/；see、beach、cheese 有长 /iː/。'))
u['story'] = passage('The top of the hill', [110, 111],
    'Flash 跑得快，想比谁先到山顶，却被大石头挡住。Thunder 用力举起石头帮大家通过。Flash 最后选择和朋友们一起走，大家同时到达。', '''
Flash wants to race up the hill.|Flash 想比赛跑上山。|race：比赛；hill：小山。
She runs ahead of her friends.|她跑到朋友们前面。|ahead of：在……前面。
A big rock is in the way.|一块大石头挡住路。|in the way：挡路。
Thunder lifts the rock.|Thunder 举起石头。|lifts：举起。
Flash chooses to walk with her friends.|Flash 选择和朋友们一起走。|chooses：选择。
They reach the top together.|他们一起到达山顶。|together：一起；结尾没有一个人抢第一。
''', [q('怎样解决石头挡路的问题？', 'Flash 把石头变成帽子|Thunder 举起石头|兔子吃掉石头', 1, '第四句：Thunder lifts the rock。'),
      q('谁先独自到达山顶？', 'Flash.|Thunder.|没有，他们一起到达。', 2, '最后一句和教师书 T110 都说明他们同时到达。')])
u['reading'] = passage('Three holiday places', [112],
    '课本旅行短文介绍澳大利亚、加拿大和英国的景物与活动。读的时候把地点、景物和动作连起来。', '''
In Australia, you can visit beautiful beaches.|在澳大利亚，你可以去美丽的海滩。|Australia：澳大利亚；beaches：海滩。
You can see kangaroos and koalas there.|在那里可以看袋鼠和考拉。|there 指澳大利亚。
In Canada, you can see lakes and big forests.|在加拿大，可以看湖泊和大片森林。|Canada：加拿大；forests：森林。
You can take photos of high mountains.|你可以拍高山的照片。|take photos：拍照。
In England, you can see Tower Bridge.|在英格兰，可以看塔桥。|England 是英国的一部分；Tower Bridge：塔桥。
In Scotland, you can listen to bagpipes.|在苏格兰，可以听风笛。|Scotland 也是英国的一部分；bagpipes：风笛。
''', [q('哪一个地方的介绍提到 kangaroos 和 koalas？', 'Australia.|Canada.|Scotland.', 0, '前两句介绍澳大利亚和这两种动物。'),
      q('在 Scotland 的介绍中，可以做什么？', 'See koalas.|Listen to bagpipes.|Visit Tower Bridge.', 1, '最后一句明确写 listen to bagpipes。')])
u['world'] = passage('Read a weather map', [114, 115],
    '课本天气地图展示某一天的例子：墨西哥晴热、苏格兰寒冷下雪、日本下雨、意大利多云。这是图中的情境，不表示这些地方全年都这样。', '''
This map shows the weather in the lesson.|这张地图展示课本情境里的天气。|weather：天气；不是实时天气预报。
It is hot and sunny in Mexico.|图上墨西哥天气晴热。|hot：热；sunny：晴朗。
It is cold and snowing in Scotland.|图上苏格兰寒冷，正在下雪。|cold：冷；snowing：正在下雪。
It is raining in Japan.|图上日本正在下雨。|raining：正在下雨。
It is cloudy in Italy.|图上意大利多云。|cloudy：多云。
Weather can change from day to day.|天气每天可能变化。|不要把地图示例当成某国永远的天气。
''', [q('课本这张地图上，哪里正在下雨？', 'Mexico.|Japan.|Italy.', 1, '第四句：It is raining in Japan。'),
      q('能不能据此说“苏格兰每天都下雪”？', '能，因为一个例子代表每一天|能，因为所有地方都一样|不能，这是图中某次天气的例子', 2, '开头和结尾说明只是课本天气情境，天气会变化。')])
u['create'] = C('寄出一张假日明信片', [112, 114, 115],
    ['选择真实或想象的目的地，画出一种景物。', '写一句当天的天气和一个 Let’s 活动建议。', '用中文讲清上山故事的困难、帮助和共同到达的结果。'],
    "Dear ____,\nI am in ____.\nIt is ____ today.\nLet's ____.\nFrom ____.",
    'Dear Mia, I am at the beach. It is sunny today. Let’s make a sandcastle and take a photo. From Lily.',
    '明信片有地点、当天的天气与活动建议；能分清物品单复数问法；复述中包含帮助与一起到达。',
    '依据学生用书 110–115 页及教师用书 T110–T115 的旅行写作、天气日记目标改编；明信片示例为新编。')
UNITS.append(u)


BOOK = dict(
    number=1, title='Super Minds 1', edition='Cambridge University Press · 所附学生用书与教师用书版本',
    sourceNote='按所附学生用书 4–117 页的入门单元和九个单元编排，118–128 页节日与剪贴附件可在原页区查看。故事情节、语法和自然拼读目标已与教师用书相应 T 页核对。双语短句、解释、题目与创作支架用于教学；“依据单元目标新编”内容不是课本原文。',
    bookSummary='从打招呼、颜色和数字起步，认识教室、玩具、动物、食物、一周活动、房间、衣物、身体和海边假日；每次读短句，再用中文讲明白。',
    storyGuide='和 Thunder、Flash、Misty、Whisper 一起学习：力气、速度、隐身、与动物交谈，各有本领。每个故事先找人物和问题，再说办法与结果。',
    teacherAvailable=True, pageMin=2, pageMax=128, pageBase='books/1/pages', grammarAppendix=False,
    glossary=[dict(word=a, zh=b) for a, b in [
        ('hello','你好'),('name','名字'),('age','年龄'),('yellow','黄色'),('red','红色'),
        ('orange','橙色'),('purple','紫色'),('green','绿色'),('blue','蓝色'),('friend','朋友'),
        ('strong','强壮的'),('fast','快地'),('disappear','消失；隐身'),('animal','动物'),
        ('favourite','最喜欢的'),('old','旧的；年老的'),('new','新的'),('long','长的'),
        ('short','短的'),('big','大的'),('small','小的'),('beautiful','美丽的'),('ugly','丑的'),
        ('in','在……里面'),('on','在……上面'),('under','在……下面'),('triangle','三角形'),
        ('square','正方形'),('circle','圆形'),('parallelogram','平行四边形'),
        ('eleven','十一'),('twelve','十二'),('thirteen','十三'),('fourteen','十四'),
        ('fifteen','十五'),('sixteen','十六'),('seventeen','十七'),('eighteen','十八'),
        ('nineteen','十九'),('twenty','二十'),('weekend','周末'),('lake','湖'),('lost','迷路的'),
        ('habitat','栖息地'),('ocean','海洋'),('desert','沙漠'),('jungle','丛林'),
        ('cotton','棉'),('wool','羊毛'),('leather','皮革'),('skeleton','骨架'),('bone','骨头'),
        ('sunny','晴朗的'),('cloudy','多云的'),('hot','热的'),('cold','冷的'),('rain','雨；下雨'),
        ('snow','雪；下雪'),('together','一起'),('fair','公平的'),('sorry','对不起')]],
    units=UNITS
)
