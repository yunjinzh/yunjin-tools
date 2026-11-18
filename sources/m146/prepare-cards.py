import json, pathlib, concurrent.futures
from PIL import Image
root=pathlib.Path(__file__).resolve().parent
src=json.load(open(root.parent/'card-transfer/hanzi414/manifest.json'))
groups=[
('果木森林','森林','♧','#417b58','走进果树与花草之间，观察植物的样子。','寻找树木、花草与果实。','先看图，再找字。试着说说你在哪里见过它。','花树叶草果苹梨桃杏李橙橘柚柠檬蕉葡萄莓樱枣椰柿菠萝芒葫芦莲藕芹韭葱姜蒜笋芋薯稻麦谷芽芝麻菇林森根苗种瓣藤兰菊荷柏柳杨木竹枝'),
('山海探险','山海','≈','#267b8e','沿着溪流走向山海，认识脚下的大地。','寻找山川、水域与自然材料。','看看卡片里的景物。哪些你见过，哪些想去看？','山水地川河湖江溪泉池井浪波潮岸岛洋湾沙漠峰岭坡丘岩石泥尘灰银铜铁钢珠陆原野田海火金土玉'),
('云端时光','云端','☁','#8274b2','抬头看天空，跟着天气与时间慢慢旅行。','寻找天空、天气与时间的字。','看图想一想：这种景象在什么天气或什么时候出现？','日月云雨雪风天露霜冰雾霞虹雷电晴阴暑寒暖凉冷热春夏秋冬早午晚晨夜夕光影亮暗星辰宇宙空年明昨今朝太阳岁'),
('亲友小镇','小镇','⌂','#c9834b','拜访熟悉的人，认识称呼与陪伴。','寻找家人、朋友和称呼。','请和家人一起读。说说你会用这个字称呼谁。','你他她它们爸妈爷奶哥姐弟妹娃宝儿女孩子男老少幼童青家亲父母祖孙兄叔伯姑姨舅公婆友伙伴邻居师生'),
('香香厨房','厨房','♨','#c77068','把餐桌上的食材与器具认一认。','寻找食物、味道与餐具。','对照卡片认字；不随意尝陌生食物，炊具请交给大人。','米面饭粥汤菜瓜豆茶蛋糖盐油醋酱饼包糕点粉条片块粒碗筷勺盘杯壶瓶盆锅篮甜酸苦辣咸香酒馒饺粽卜茄椒番食刀盒袋桶夹'),
('彩线工坊','工坊','✂','#ad6a9e','摸摸柔软的衣料，看看衣物怎样连在一起。','寻找衣物、布料与手工工具。','观察衣物上的部位。针、剪刀等工具需要大人帮助。','裤裙袜鞋帽衫袄袍衬领袖扣纽绳链兜围巾套克靴拖布棉绒护纱工羽缝针线剪尺衣带'),
('温暖小屋','小屋','◇','#aa8751','逛逛房间，认识日用品，练习照顾自己。','寻找家具、房屋与清洁用品。','看看家里有没有同样的物品。清洁用品不入口，注意安全。','梳镜刷皂帕门窗房屋墙壁顶楼层阶梯台桌椅床柜凳架箱厅室卧住纸开关洗澡清洁抹擦净脏伞网船机箭轮病'),
('星光学园','学园','☆','#4c79ac','把动作、位置、比较和表达连起来。','寻找能描述位置、动作与想法的字。','用卡片里的字说一个短语。遇到多音字，请结合原卡和具体词语学习。','中成白南黄红低湿干浅深远近长短更最会让为这那谁什么怎先上下来去到前后西高小学坏新旧美丑安危全险要想无没在的得数加减乘除等错平正斤吨第钱元票画见忙合收达从过再')]
seen={}; levels=[]
bychar={x['char']:x for x in src}
for ix,(name,short,icon,color,desc,mission,coach,chars) in enumerate(groups):
 cards=[]
 for ch in chars:
  assert ch in bychar,('unknown',ch)
  assert ch not in seen,('duplicate',ch,seen.get(ch),ix)
  seen[ch]=ix
  x=bychar[ch];cards.append({k:x[k] for k in ('id','char','pinyin')})
 levels.append(dict(name=name,shortName=short,icon=icon,color=color,description=desc,mission=mission,coach=coach,cards=cards))
missing=[x for x in src if x['char'] not in seen]
assert not missing,missing
assert sum(len(x['cards']) for x in levels)==414
(root/'dist/data.js').write_text('window.LEVELS = '+json.dumps(levels,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print([(x['name'],len(x['cards'])) for x in levels],flush=True)
def convert(x):
 im=Image.open(x['path']).convert('RGB');im.thumbnail((760,1014),Image.Resampling.LANCZOS)
 dest=root/'dist/cards'/f"{x['id']}.webp";im.save(dest,quality=78,method=3)
 return dest.stat().st_size
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: sizes=list(pool.map(convert,src))
print('Verified',len(sizes),'assets;',sum(sizes),'bytes',flush=True)
