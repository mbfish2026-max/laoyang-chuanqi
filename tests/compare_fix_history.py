import subprocess,tempfile,pathlib,re,functools,http.server,threading,json
from playwright.sync_api import sync_playwright
repo=str(pathlib.Path(__file__).resolve().parents[1])
with tempfile.TemporaryDirectory() as tmp:
 root=pathlib.Path(tmp)
 for rev in ['ae14bd9^1','ae14bd9','33a72f1','af6bfe1','6ef7fa7']:
  d=root/rev.replace('^','_');d.mkdir()
  files=subprocess.check_output(['git','ls-tree','-r','--name-only',rev],cwd=repo,text=True).splitlines()
  for f in files:
   if f.endswith(('.js','.css')) or f=='index.html':
    p=d/f;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(subprocess.check_output(['git','show',rev+':'+f],cwd=repo))
  (d/'assets').symlink_to(pathlib.Path(repo)/'assets')
 class Q(http.server.SimpleHTTPRequestHandler):
  def log_message(self,*a):pass
 srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=tmp));threading.Thread(target=srv.serve_forever,daemon=True).start()
 with sync_playwright() as pw:
  b=pw.chromium.launch();result=[]
  for d in sorted(root.iterdir()):
   c=b.new_context(service_workers='block');c.add_init_script('window.__NOUI=1;window.__NOSHOWLOGIN=1');p=c.new_page();p.route('https://**/*',lambda r:r.abort());p.goto(f'http://127.0.0.1:{srv.server_port}/{d.name}/index.html')
   try:
    r=p.evaluate('''()=>{load();CQSys.createChar('历史','zs');S.lvl=60;S.eq={};S.bag=[];var a=genItem(60,{base:BASEM.swd1,q:3}),v=genItem(60,{base:BASEM.swd1,q:3});a.req=v.req=1;S.eq.weapon=a;S.bag=[v];calc();window.__NOUI=0;showItem(v.uid);var auto=!!document.querySelector('.cmpd,.cqcompare');if(typeof cqbCompare==='function')cqbCompare(v.uid);return {auto,explicit:typeof cqbCompare==='function'?!!document.querySelector('.cmpd,.cqcompare'):null}}''')
   except Exception as e:r={'error':str(e)[:200]}
   result.append({'rev':d.name,**r});c.close()
  expected={'ae14bd9_1':(True,None),'ae14bd9':(False,None),'33a72f1':(False,True),'af6bfe1':(False,True),'6ef7fa7':(False,True)}
  assert all((r.get('auto'),r.get('explicit'))==expected[r['rev']] for r in result),result
  print(json.dumps(result,ensure_ascii=False));b.close()
 srv.shutdown()
