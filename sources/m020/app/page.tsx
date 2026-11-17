import LearningApp from '../components/learning/app';
import course from '../data/course.json';
import assessments from '../data/assessment.json';
import {requireChatGPTUser} from './chatgpt-auth';
export default async function Page(){await requireChatGPTUser('/');return <LearningApp course={course} labs={assessments.labs.map((l:any)=>({...l,steps:l.steps.map(({expected,...step}:any)=>step)}))} projects={assessments.projects}/>;}
