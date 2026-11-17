import type {SceneView} from './tour';

export type PartKnowledge={id:string;name:string;group:string;purpose:string;principle:string;source:string;};
export type TaskKind='locate'|'sequence'|'annotate'|'explain';
export type LessonTask={id:string;title:string;instruction:string;kind:TaskKind;targets:string[];hint:string;points:number;view?:SceneView;};
export type Lesson={id:string;title:string;objective:string;tasks:LessonTask[];};
export type Attempt={id:string;taskId:string;time:string;correct:boolean|null;answer:string;selected:string[];hintUsed:boolean;view:SceneView;};
export type Review={knowledge:number;expression:number;comment:string;status:'draft'|'returned'|'reviewed';};
export type TeachingState={parts:PartKnowledge[];lesson:Lesson;attempts:Attempt[];learner:string;review:Review;submittedAt?:string;};
export const TASK_LABELS:Record<TaskKind,string>={locate:'定位部件',sequence:'顺序练习',annotate:'部件标注',explain:'解释原理'};
export const freshTeaching=():TeachingState=>({parts:[],lesson:{id:crypto.randomUUID(),title:'我的三维实训',objective:'认识结构，并准确解释部件之间的关系。',tasks:[]},attempts:[],learner:'',review:{knowledge:0,expression:0,comment:'',status:'draft'}});
export function objectiveScore(state:TeachingState){
 const tasks=state.lesson.tasks.filter(t=>t.kind!=='explain');
 const max=tasks.reduce((s,t)=>s+t.points,0);
 const earned=tasks.reduce((s,t)=>s+([...state.attempts].reverse().find(a=>a.taskId===t.id)?.correct===true?t.points:0),0);
 return {earned,max,normalized:max?Math.round(earned/max*70):0,completed:state.lesson.tasks.filter(t=>state.attempts.some(a=>a.taskId===t.id)).length};
}
export function evaluateTask(task:LessonTask,selected:string[],text:string,annotationTargets:string[]):boolean|null{
 if(task.kind==='explain')return null;
 if(task.kind==='locate')return selected.length===1&&task.targets.includes(selected[0]);
 if(task.kind==='sequence')return task.targets.length===selected.length&&task.targets.every((id,i)=>selected[i]===id);
 return task.targets.length>0&&task.targets.every(id=>annotationTargets.includes(id));
}
export function pumpLesson():TeachingState{
 const s=freshTeaching();s.lesson={id:'pump-lesson-v1',title:'离心泵 · 结构认知与讲解',objective:'定位叶轮与轴，理解教学模型的组合关系，并制作带部件说明的导览。',tasks:[
 {id:'pump-locate',title:'找到叶轮',instruction:'通过炸开或隐藏外壳，点击负责与液体交换能量的叶轮，再确认选择。',kind:'locate',targets:['pump-impeller'],hint:'叶轮位于泵体内部，呈金色，带径向分布的叶片。',points:30},
 {id:'pump-sequence',title:'教学模型装回顺序',instruction:'按照本教具的规则，依次选择泵体、叶轮、前端盖，加入顺序后提交。',kind:'sequence',targets:['pump-body','pump-impeller','pump-cover'],hint:'先确定承载结构，再放入内部部件，最后闭合前端盖。本练习是教具顺序，不是现场检修工艺。',points:20},
 {id:'pump-annotate',title:'给轴添加说明',instruction:'选中传动轴并添加一条文本标注，说明它与旋转部件的关系。',kind:'annotate',targets:['pump-shaft'],hint:'使用“标注所选部件”后编辑说明。系统检查标注对象与非空文字，内容准确性由教师评价。',points:20},
 {id:'pump-explain',title:'解释结构关系',instruction:'结合模型，用自己的话说明轴、叶轮和泵体的作用，并调整或新增至少两个视角，形成自己的讲解导览。',kind:'explain',targets:[],hint:'可以从动力传递、旋转部件和固定外壳三方面说明。',points:0}
 ]};return s;
}
