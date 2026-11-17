"""Shared authoring helpers for source-grounded Super Minds courses."""
def rows(text):
 return [line.strip().split('|') for line in text.strip().splitlines() if line.strip()]
def vocab(text):
 return [dict(word=a,zh=b,example=c) for a,b,c in rows(text)]
def q(prompt,options,answer,why,kind='meaning'):
 return dict(prompt=prompt,options=options.split('|') if isinstance(options,str) else options,answer=answer,why=why,kind=kind)
def passage(title,pages,summary,text,questions,kind='依据课文的教学改写'):
 return dict(title=title,pages=pages,kind=kind,summary=summary,sentences=[dict(en=r[0],zh=r[1],note=r[2] if len(r)>2 else '') for r in rows(text)],questions=questions)
def grammar(title,rule,examples,questions):
 return dict(title=title,rule=rule,examples=[dict(en=a,zh=b) for a,b in rows(examples)],questions=questions)
def phonics(title,note,pairs,page,questions):
 return dict(title=title,note=note,pairs=[dict(a=a,b=b) for a,b in rows(pairs)],page=page,questions=questions)
