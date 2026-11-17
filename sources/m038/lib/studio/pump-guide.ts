import type {StudioEngine} from './engine';
import {cloneView} from './tour';

/** A ready-to-play demonstration; task start views omit the teacher's labels. */
export async function createPumpGuide(engine:StudioEngine){
 engine.showAllParts();engine.setExplode(0);engine.fit();engine.annotatePart('pump-body','泵体：固定外壳，容纳内部旋转部件。');
 await engine.saveKeyframe();engine.updateKeyframe(engine.keyframes[0].id,{name:'01 · 认识整体',hold:3,transition:3});
 engine.annotations=[];engine.setPartDisplay('pump-cover',false);engine.setPartDisplay('pump-body',true,.16);engine.view('front');engine.annotatePart('pump-impeller','叶轮：与传动轴连接，旋转时与液体交换能量。');
 await engine.saveKeyframe();engine.updateKeyframe(engine.keyframes[1].id,{name:'02 · 观察内部',hold:4,transition:3});
 engine.annotations=[];engine.showAllParts();engine.setExplode(36);engine.fit();engine.annotatePart('pump-body','原比例展开：部件大小保持不变。');engine.annotatePart('pump-impeller','叶轮与泵体分离，观察空间关系。');
 await engine.saveKeyframe();engine.updateKeyframe(engine.keyframes[2].id,{name:'03 · 分解与关系',hold:4,transition:3});
 const views=engine.keyframes.map(frame=>({...cloneView(frame.view),annotations:[]}));engine.jumpKeyframe(engine.keyframes[0].id);return views;
}
