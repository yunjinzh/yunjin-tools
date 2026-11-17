# 三字经知识互动：内容依据与显示约定

核对日期：2026 年 11 月 14 日。儿童说明为本项目原创改写，未复制来源文章或图片；场景为程序化示意。

## 日月星

- NASA《Our Sun: Facts》：太阳属于恒星，发光发热。https://science.nasa.gov/sun/facts/
- NASA《Moonlight》：月光是反射的阳光，月球有受光面与背光面。https://science.nasa.gov/moon/moonlight/
- NASA《Skywatching》：行星与远方恒星均可出现在夜空。因此本场景明确选“远方恒星”，不把古书中的“星”全部等同恒星。https://science.nasa.gov/skywatching/

展示边界：大小、距离、颜色为教学示意；月球受光演示不声称精确月相。没有要求直视太阳或使用望远镜对准太阳的活动。

## 银杏四季

- 哈佛大学阿诺德树木园，Peter Del Tredici《Wake Up and Smell the Ginkgos》：银杏春季萌芽、秋季落叶，物候时间随纬度而变。https://arboretum.harvard.edu/arnoldia-stories/wake-up-and-smell-the-ginkgos/
- 北卡罗来纳州立大学 Extension Plant Toolbox：银杏为落叶木本，叶绿色、扇形，秋色黄色。https://plants.ces.ncsu.edu/plants/ginkgo-biloba/
- 密苏里大学植物观察资料：绿色叶片、秋季黄叶及落叶照片。https://ipm.missouri.edu/garden/rock_F10.cfm

展示边界：只以北半球温带银杏为例；不等同所有树、所有地区，不将冬季固定为下雪。季节按钮用于观察，不用于说明季节形成的天文机制。

## 朝代先后与并存

- 中国国家博物馆“古代中国”夏商西周部分：用于夏、商、周顺序。https://www.chnmuseum.cn/portals/0/web/zt/gudai/detail2.html
- 香港艺术馆茶具文物馆《认识中国》年代参照表（PDF，年表部分）：辽 916—1125，宋 960—1279，北宋 960—1127，南宋 1127—1279，金 1115—1234。https://hk.art.museum/documents/tea-ware/Getting_to_know_about_CHINA.pdf
- 教育部《重编国语辞典修订本》历代年号表：交叉核对辽与金的年号起讫。https://dict.revised.moe.edu.tw/appendix.jsp?ID=3&page=5
- 亚洲艺术博物馆《China: An Introduction to the Song Dynasty (960–1279)》：宋与北方政权并存、1127 年南迁的说明。https://education.asianart.org/resources/an-introduction-to-the-song-dynasty/

显示约定：

- 宋、辽、金时间条不表示地图或疆域，也未穷尽同时期所有政权；西夏等不在本组比较对象中。
- 辽采用 916 年称帝、建年号的常见博物馆纪年口径；资料中也有从 907 年契丹建政起算的口径，详情已说明。
- `activeDynasties(year)` 按完整整数年份比较，起讫年均包含；同一年内发生的变化不声称精确到日期。
- 1127 年宋的显示标签为“北宋转南宋”，避免把过渡年份误写为全年只有同一个分期。
- 1100 年为北宋与辽，1120 年为北宋、辽与金，1150 年为南宋与金。三者不是从头到尾同时存在。
- 夏商周年代不设置精确年刻度；排序只帮助辨认先后，不否认当时还有其他人群和文化。

## 记录含义

`seen` 只表示打开过某个内容；`solved` 表示曾答对本页问题，也包括得到帮助之后；`helped` 保留提示或重试经历。三者均不能证明长期记忆或儿童学习效果。排序记录保留孩子的实际顺序，包括错误顺序，供刷新恢复和后续纠正。
