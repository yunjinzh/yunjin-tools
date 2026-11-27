# 国贸建筑数据与建模口径

平面采用随项目分发的 OpenStreetMap 城市数据库（© OpenStreetMap contributors，[ODbL](https://www.openstreetmap.org/copyright)）。表内 way 编号链接至对应几何。采用与城区一致的 WGS84 米制投影。闭环折点保留至小数点后六位，玻璃转角、收分与塔冠则按建筑师资料及公开外观图重建。表内高度自各自地面起算，计入裙房。

| 建筑 | OSM 平面 | 高度 | 建筑依据 |
|---|---|---|---|
| 国贸大厦 A 座 | [116944490](https://www.openstreetmap.org/way/116944490) | 330 m | [SOM 项目](https://www.som.com/projects/china-world-trade-center-3a/)；[SOM 对垂直玻璃翼片、渐收体量与商业裙房的说明](https://www.som.com/news/som-celebrates-grand-opening-of-china-world-trade-tower/) |
| 国贸大厦 B 座、商城 | [916885302](https://www.openstreetmap.org/way/916885302)、[660651176](https://www.openstreetmap.org/way/660651176) | 296 m，裙房 32 m | [SOM 建成记录](https://www.som.com/news/three-som-projects-honored-in-china-real-estate-design-awards/)与[倾斜玻璃分层说明](https://www.som.com/projects/china-world-trade-center-3b/)。裙房高度取自 OSM |
| 银泰主楼与东西翼 | [916885301](https://www.openstreetmap.org/way/916885301)、[226280809](https://www.openstreetmap.org/way/226280809)、[226280808](https://www.openstreetmap.org/way/226280808) | 249.9 m、186 m、186 m | [银泰集团对灯笼框架与玻璃金字塔的说明](https://www.china-yintai.com/en-US/business/commercial-group/beijing-yintai-center)、[北京旅游网对双翼高度与裙房层数的说明](https://english.visitbeijing.com.cn/article/47ONwgzpfaE) |
| 银泰裙房 | [226280805](https://www.openstreetmap.org/way/226280805)、[226280804](https://www.openstreetmap.org/way/226280804) | 约 15 m | 北京旅游网记载地上三层。两个轮廓均使用该层数与商业层高估算 |
| 财富金融中心 | [338085198](https://www.openstreetmap.org/way/338085198) | 267 m | [P&T 设计方建成项目](https://web.p-t-group.com/en/project-detail.php?projects_id=16&projects_name=Fortune-Financial-Center)。OSM 此处标 265 m，采用设计方公布值 |
| 正大中心双塔 | [599547915](https://www.openstreetmap.org/way/599547915)、[662019986](https://www.openstreetmap.org/way/662019986) | 各 238 m | [正大中心办公楼资料](https://www.cp-center.cn/en/officeBuilding.html)与[圆角幕墙照片](https://www.cp-center.cn/detail/462.html) |
| 三星中国总部 | [764434414](https://www.openstreetmap.org/way/764434414) | 260 m | [结构设计方建成资料](https://www.sra-se.com/samsung-china-hq)及[RATIO / smdp 向 AIA 芝加哥提交的方形平面、五层东西向裙房和竣工照](https://aiachicago.awardsplatform.com/gallery/YXxKDDnQ/dqgQoNyw)。OSM 记录整座裙房轮廓，塔身从中内收，退距为估算 |
| 中信大厦 | [599547918](https://www.openstreetmap.org/way/599547918) | 528 m | [KPF](https://www.kpf.com/project/citic-tower-china-zun) 公布基部、腰部、顶部宽度分别为 78、54、69 m；[建筑师的 CTBUH 论文](https://global.ctbuh.org/resources/papers/1825-1825-Whitlock_2014_ChinaZun.pdf) 给出腰部标高；[CTBUH 塔冠与内收灯体说明](https://www.skyscrapercenter.com/building/china-zun-tower/11116) |
| 央视总部 | [7820447](https://www.openstreetmap.org/relation/7820447) | 234 m | [OMA 建筑师项目](https://www.oma.com/projects/cctv-headquarters)。倾斜塔、基座和悬臂延用项目原有分体模型，按楼层新增独立幕墙面片及外露钢结构 |

国贸 B 座与银泰主楼的 OSM 平面分别完全落在各自裙房内。其塔身从裙房檐口开始。两个渲染器共用背景建筑的立面、灯窗分布和碰撞平面。窗格间距、装饰肋伸出量、冠部内外构造及机械层标高采用表现性近似。夜景按办公面、退台线与屋冠分开赋值，实际房间使用状况和现场灯光时刻未取得。窗灯与材料均程序化生成。
