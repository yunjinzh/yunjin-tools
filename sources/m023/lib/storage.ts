import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw new Error('记录服务暂不可用');return env.DB;}
