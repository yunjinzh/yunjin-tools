#!/usr/bin/env python3
"""Unattended catalog data writer; get a fresh service credential from Sites first.
Input JSON via stdin only: {token, action:get|publish, output?, input?}.
Never pass credentials in argv, source, schedule prompts or output.
"""
import sys,json,urllib.request,urllib.error,termios
if sys.stdin.isatty():
 attrs=termios.tcgetattr(sys.stdin);attrs[3]&=~termios.ECHO;termios.tcsetattr(sys.stdin,termios.TCSANOW,attrs)
print('Ready for private Site service JSON on stdin (input hidden).',flush=True)
config=json.loads(sys.stdin.readline())
url='https://map-design-learning.yunjinzh.chatgpt.site/api/catalog'
headers={'OAI-Sites-Authorization':'Bearer '+config['token'],'Content-Type':'application/json'}
try:
 data=None
 if config['action']=='publish':
  data=json.dumps(json.load(open(config['input'],encoding='utf-8')),ensure_ascii=False).encode()
 request=urllib.request.Request(url,headers=headers,data=data,method='POST' if data else 'GET')
 with urllib.request.urlopen(request,timeout=45) as response: payload=json.load(response)
 if config.get('output'):
  with open(config['output'],'w',encoding='utf-8') as f:json.dump(payload,f,ensure_ascii=False,indent=2)
 print(json.dumps({'ok':True,'revision':payload['revision'],'items':len(payload['lessons']),'updatedAt':payload['updatedAt'],'message':payload['message']},ensure_ascii=False))
except urllib.error.HTTPError as e:
 print(json.dumps({'ok':False,'status':e.code,'error':'Site service request failed; preserve the request ID and read current revision before retrying.'}));sys.exit(1)
except Exception as e:
 print(json.dumps({'ok':False,'error':type(e).__name__}));sys.exit(1)
