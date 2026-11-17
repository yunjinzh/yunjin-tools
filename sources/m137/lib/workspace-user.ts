import {getChatGPTUser} from '../app/chatgpt-auth';
export async function workspaceUser(){
  // Development-only fixture: never present in the production Worker.
  if(import.meta.env.DEV)return {userId:'workbench-local-qa',email:'qa@local.test',displayName:'本地验证',fullName:null};
  return getChatGPTUser();
}
