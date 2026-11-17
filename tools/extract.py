import re,html,json
W='/home/user/greenvalley/'
def tables(f):
    s=open(W+f).read()
    out=[]
    for t in re.findall(r'<table.*?</table>',s,flags=re.S):
        rows=[[html.unescape(re.sub(r'<[^>]+>','',c)).strip() for c in re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>',r,flags=re.S)] for r in re.findall(r'<tr.*?</tr>',t,flags=re.S)]
        out.append(rows)
    return out
# (file, table index, group id, photo fn, title fn, cat)
groups=[
 ('washer.html',0,'washer-large','대형세탁기','은성 대형세탁기','washer-large'),
 ('washer.html',1,'washer-mid','중소형세탁기','은성 상업용 세탁기','washer-mid'),
 ('washer.html',2,'washer-coin','코인세탁기','은성 코인세탁기','washer-coin'),
 ('washer.html',3,'washer-shoe','운동화 코인세탁기','은성 운동화 코인세탁기','washer-shoe'),
 ('dryer.html',0,'dryer-large','대형건조기','은성 대형건조기','dryer-blue'),
 ('dryer.html',1,'dryer-mid','중소형건조기','은성 중소형건조기','dryer-mid'),
 ('dryer.html',2,'dryer-coin','코인건조기','은성 코인건조기','dryer-coin'),
 ('boiler.html',0,'boiler-oil','기름 스팀보일러','평화기계 기름 스팀보일러',None),
 ('boiler.html',1,'boiler-elec','전기 스팀보일러','평화기계 전기 스팀보일러',None),
]
cache={}
items=[]
for f,ti,gid,gname,title,photo in groups:
    t=cache.setdefault(f,tables(f))[ti]
    head=t[0]
    for ci,model in enumerate(head[1:],1):
        rows=[(r[0],r[ci]) for r in t[1:]]
        cap=rows[0][1]
        if photo: ph=photo
        elif gid=='boiler-oil':
            n=int(re.sub(r'\D','',model)); ph=f'pho-{n}' if n<=150 else 'pho-big'
        else:
            n=int(re.sub(r'\D','',model)); ph='phe-small' if n<=60 else 'phe-mid'
        items.append(dict(id=f'{gid}_{model}',group=gid,gname=gname,model=model,title=f'{title} {cap} {model}',cap=cap,photo=ph,rows=rows))
json.dump(items,open('specs.json','w'),ensure_ascii=False,indent=1)
print(len(items))
for i in items: print(i['id'],i['photo'],i['rows'][1][1])
