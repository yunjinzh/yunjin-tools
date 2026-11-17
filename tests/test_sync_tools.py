import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location('sync_tools', Path(__file__).resolve().parents[1]/'scripts/sync_tools.py')
sync = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sync)

class IncrementalSyncTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)/'repo'
        self.root.mkdir()
        sync.save(self.root/'modules.json', [{'id':'m001','name':'Existing','kind':'web','migration':'web',
            'source_project':'existing-project','source_version':1,'original_url':'https://example.invalid/existing','source':'sources/m001'}])
        sync.save(self.root/'sync/state.json', {'known_sites':{'existing-project':{'version':1}},'pending_verification':{}})
        sync.save(self.root/'sync/module-ids.json', ['m001'])
        sync.save(self.root/'assets/index.json', {})
        self.source = Path(self.temp.name)/'source'
        (self.source/'dist').mkdir(parents=True)
        (self.source/'dist/index.html').write_text('<!doctype html><title>New tool</title>')
        (self.source/'.env').write_text('PRIVATE_VALUE=do-not-copy')
        for args in [('init','-q'),('config','user.name','Sync Test'),('config','user.email','sync-test@example.invalid'),('add','dist'),('commit','-qm','Fixture')]:
            subprocess.run(['git','-C',str(self.source),*args],check=True)
        self.meta = {'id':'new-project','title':'New tool','url':'https://example.invalid/new','version':1}

    def import_tool(self):
        return sync.import_site(self.root,self.meta,self.source,self.source/'dist')

    def test_new_tool_and_new_version_keep_one_stable_module(self):
        first=self.import_tool()
        self.assertEqual(first['id'],'m002')
        self.assertFalse((self.root/'sources/m002/.env').exists())
        again=self.import_tool()
        self.assertEqual(again['id'],first['id'])
        self.meta['version']=2
        updated=self.import_tool()
        self.assertEqual(updated['id'],first['id'])
        self.assertEqual(updated['source_version'],2)
        self.assertEqual(len(sync.read(self.root/'modules.json')),2)

    def test_inventory_removal_does_not_remove_imported_modules(self):
        before=(self.root/'modules.json').read_bytes()
        self.assertEqual(sync.plan(self.root,[]),[])
        self.assertEqual((self.root/'modules.json').read_bytes(),before)

    def test_drafts_are_skipped_and_unverified_imports_stay_pending(self):
        draft={**self.meta,'version':0,'status':'active'}
        self.assertEqual(sync.plan(self.root,[draft]),[])
        self.assertEqual(sync.plan(self.root,[self.meta])[0]['action'],'new')
        self.import_tool()
        self.assertEqual(sync.plan(self.root,[self.meta])[0]['action'],'verify')
        sync.confirm(self.root,'new-project','a'*40,'https://example.invalid/deployed')
        self.assertEqual(sync.plan(self.root,[self.meta]),[])

    def test_credentials_and_missing_builds_preserve_the_working_version(self):
        self.import_tool()
        original=(self.root/'web/m002/index.html').read_bytes()
        catalogue=(self.root/'modules.json').read_bytes()
        (self.source/'dist/private.txt').write_text('-----BEGIN PRIVATE KEY-----\nunit test fixture, not a real key')
        with self.assertRaisesRegex(ValueError,'Potential credential'):
            self.import_tool()
        self.assertEqual((self.root/'web/m002/index.html').read_bytes(),original)
        self.assertEqual((self.root/'modules.json').read_bytes(),catalogue)
        with self.assertRaisesRegex(ValueError,'existing working web version'):
            sync.import_site(self.root,self.meta,self.source,source_only=True)

    def test_import_opt_out_and_path_escape_are_rejected(self):
        with self.assertRaisesRegex(ValueError,'unsafe web entry'):
            sync.import_site(self.root,self.meta,self.source,self.source/'dist',entry='../../outside.html')
        (self.source/'.github-sync-ignore').touch()
        with self.assertRaisesRegex(ValueError,'opted out'):
            self.import_tool()

    def test_same_failure_is_quiet_and_a_new_version_can_retry(self):
        first=sync.defer(self.root,'new-project',1,'Build failed')
        again=sync.defer(self.root,'new-project',1,'Build failed')
        self.assertTrue(first['notify'])
        self.assertFalse(again['notify'])
        self.assertEqual(sync.plan(self.root,[self.meta]),[])
        self.assertEqual(sync.plan(self.root,[{**self.meta,'version':2}])[0]['action'],'new')

    def test_repository_edits_are_not_overwritten_by_source_updates(self):
        self.import_tool()
        for args in [('init','-q'),('config','user.name','Sync Test'),('config','user.email','sync-test@example.invalid'),('add','.'),('commit','-qm','Imported tool')]:
            subprocess.run(['git','-C',str(self.root),*args],check=True)
        baseline=subprocess.check_output(['git','-C',str(self.root),'rev-parse','HEAD'],text=True).strip()
        state=sync.read(self.root/'sync/state.json');state['repository_baseline_commit']=baseline;sync.save(self.root/'sync/state.json',state)
        page=self.root/'web/m002/index.html';page.write_text('User edit that must survive')
        with self.assertRaisesRegex(ValueError,'preserve repository edits'):
            self.import_tool()
        self.assertEqual(page.read_text(),'User edit that must survive')

if __name__=='__main__': unittest.main()
