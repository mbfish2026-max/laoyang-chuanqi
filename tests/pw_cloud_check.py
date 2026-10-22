#!/usr/bin/env python3
"""R17: 390×844 new/legacy saves, local Supabase stub only."""
import copy, json, os, re
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
from pw_baseline import Cloud, fake_session, start_server, UID

class AtomicCloud(Cloud):
    def handle(self, route):
        req = route.request
        if urlparse(req.url).path.endswith('/cq_saves'):
            qs = parse_qs(urlparse(req.url).query)
            conflict = req.method == 'POST' and self.row is not None
            stale = req.method == 'PATCH' and (not self.row or any(
                qs.get(k, [''])[0] != 'eq.'+str(v) for k,v in
                [('user_id',UID),('updated_at',self.row['updated_at']),('version',self.row['version'])]))
            if conflict or stale:
                return route.fulfill(status=409 if conflict else 200, content_type='application/json',
                    headers={'access-control-allow-origin':'*'}, body=json.dumps({'code':'23505'} if conflict else []))
        return super().handle(route)

srv, base = start_server()
out = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'test-artifacts', 'r17-cloud')
os.makedirs(out, exist_ok=True)
results=[]
try:
    with sync_playwright() as pw:
        for browser_name in ['chromium','webkit']:
            browser=getattr(pw,browser_name).launch()
            fixture=None
            for mode in ['new','legacy']:
                cloud=AtomicCloud('ok')
                seed={'cq_sb_auth':json.dumps(fake_session())}
                if mode=='legacy':
                    acct=copy.deepcopy(fixture['acct']); chars=copy.deepcopy(fixture['chars'])
                    chars[str(acct['cur'])]['lvl']=7
                    seed['cq_acct']=json.dumps(acct)
                    seed.update({'cq_ch_'+str(k):json.dumps(v) for k,v in chars.items()})
                ctx=browser.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block')
                ctx.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'),cloud.handle)
                ctx.add_init_script('if(!sessionStorage.seeded){sessionStorage.seeded="1";for(const [k,v] of Object.entries(%s))localStorage.setItem(k,v)}'%json.dumps(seed))
                pg=ctx.new_page(); errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
                pg.goto(base+'/index.html');pg.wait_for_function('CL.ready && CL.state==="ok"')
                if mode=='new':
                    pg.evaluate("CQSys.createChar('云验新战','zs');S.gold=12345;save()")
                    pg.wait_for_function('!CL_BUSY');pg.evaluate('flushNow()');pg.wait_for_function('!CL_BUSY && CL.state==="ok"')
                    fixture=pg.evaluate('exportAccount()')
                else:
                    assert pg.evaluate('S.lvl')==7
                    assert pg.evaluate('localStorage.getItem("cq_acct")') is None
                pg.evaluate("closeM();CQSys.setAuto(0);TAB='hero';render()")
                pg.screenshot(path=os.path.join(out,f'{browser_name}_{mode}.png'))
                before=copy.deepcopy(cloud.row);cloud.row['version']+=1
                pg.evaluate('S.gold+=1;save();flushNow()');pg.wait_for_function('CL.kicked===1')
                assert cloud.row['data']==before['data']
                pg.screenshot(path=os.path.join(out,f'{browser_name}_{mode}_conflict.png'))
                assert not errors, errors
                results.append({'browser':browser_name,'mode':mode,'conflictProtected':True,'pageErrors':errors})
                ctx.close()
            browser.close()
    with open(os.path.join(out,'report.json'),'w') as f:json.dump(results,f,ensure_ascii=False,indent=2)
    print('R17 browser cloud checks: 4 passed; screenshots:',out)
finally:
    srv.shutdown()
