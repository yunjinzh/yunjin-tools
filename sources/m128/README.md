# 地球板块演化实验室

打开 dist/index.html 即可离线运行。无需安装依赖。完整调研报告在第四个页签。

## 重建
Python 3 运行 fetch_data.py，再运行 build.py。data 保存接口原始响应，data-manifest.json 保存 SHA-256。原始数据已包含，无需再次下载。

## 许可
数据：EarthByte / Müller et al. 2019 / GPlates Web Service，CC BY-SA 4.0。https://creativecommons.org/licenses/by-sa/4.0/
显示版进行了抽稀和舍入。数据不代表唯一古地理答案。D3 许可见 D3-LICENSE.txt。原创代码 MIT。

## 验证范围
78 个响应解析与坐标检查；JavaScript 语法检查；浏览器检查球体、地图切换、年代切换、播放、板块选择与机制页。未进行多终端性能基准测试或科研级精度验收。
