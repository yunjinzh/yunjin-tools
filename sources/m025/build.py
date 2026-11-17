from pathlib import Path

root=Path(__file__).parent
html=(root/'src/legacy.html').read_text()
html=html.replace('按教材单元配对英文与中文，挑战完整拼写，收集种子装扮单词花园。','单词不断落下，三个同词相连自动消除，连锁清空收集种子；按教材单元练习配对与完整拼写。')
html=html.replace('</style>',(root/'src/falling.css').read_text()+'\n</style>',1)
html=html.replace('<button data-view="play" class="active">消消乐</button>','<button data-view="fall">下落挑战</button><button data-view="play">配对与拼写</button>')
html=html.replace('<dialog id="spellDialog"','<dialog id="fallResult" class="dialog victory" aria-labelledby="fallResultTitle"></dialog><dialog id="spellDialog"',1)
html=html.replace('<ol class="rule-list">','<ol class="rule-list"><li><b>下落挑战：</b>选列或按左右方向键移动当前单词，空格或“快速落下”立即落地。3 张及以上相同英文上下左右相连就会消除，拐弯算相连，斜角不算。</li><li><b>连锁与满仓：</b>消除后上方卡片下落，形成新的三张同词会再次连消。触顶后有 6 秒补救；完全堆满，或触顶超过 6 秒，则本轮结束。暂停和切到后台都会停止计时。</li><li><b>下落奖励：</b>每组最高消除纪录每增加 6 张获得 1 颗种子，最高 15 颗；同组不同速度共享奖励。结束后可回顾单词并练习拼写。</li>',1)
html=html.replace('没有倒计时，慢慢想也可以。配对成功代表完成辨认；','下落挑战可随时暂停；配对和拼写模式可以慢慢想。相同英文消除记录不等于独立拼写；配对成功代表完成辨认；',1)
addition='\n'+(root/'src/falling-engine.js').read_text()+'\n'+(root/'src/falling-ui.js').read_text()+'\n'
html=html.replace('</script>',addition+'</script>',1)
(root/'dist/index.html').write_text(html)
print(f'Built self-contained HTML: {len(html.encode()):,} bytes')
