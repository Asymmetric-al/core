"""Local structural/reference tests; no Core runtime or browser tests are implied."""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'reference'))
from validate_contracts import ContractError, SaveModel, validate_composition, validate_schema

def fixture(name):return json.loads((ROOT/'examples'/name).read_text())
def semantic(i,t='rich-text'):return {'kind':'semantic','instanceId':i,'semanticType':t,'schemaVersion':1,'content':{}}
def layout(i,t,slots):return {'kind':'layout','instanceId':i,'layoutType':t,'schemaVersion':1,'settings':{},'slots':slots}

class StructuralContracts(unittest.TestCase):
    def setUp(self):self.doc=fixture('composition-v2.valid-structure.json')
    def fails(self):
        with self.assertRaises(ContractError):validate_composition(self.doc)
    def test_valid_v1(self):validate_composition(fixture('composition-v1.valid-structure.json'))
    def test_valid_v2(self):validate_composition(self.doc)
    def test_valid_article(self):validate_composition(fixture('article.valid-structure.json'))
    def test_valid_manifest(self):validate_schema('presentation-manifest.schema.json',fixture('presentation-candidate.valid-structure.json'))
    def test_valid_event(self):validate_schema('workflow-event.schema.json',fixture('workflow-event.valid-structure.json'))
    def test_valid_save(self):validate_schema('editorial-save.schema.json',fixture('editorial-save.valid-structure.json'))
    def test_duplicate_node_id(self):self.doc['nodes'][2]['instanceId']='hero-1';self.fails()
    def test_unknown_node_kind(self):self.doc['nodes'][1]['kind']='script';self.fails()
    def test_unknown_semantics(self):self.doc['nodes'][0]['semanticType']='arbitrary-server-code';self.fails()
    def test_future_semantic_version(self):self.doc['nodes'][0]['schemaVersion']=2;self.fails()
    def test_raw_css_setting(self):self.doc['nodes'][1]['settings']['style']='display:none';self.fails()
    def test_arbitrary_setting_value(self):self.doc['nodes'][1]['settings']['ratio']='999px';self.fails()
    def test_class_name_rejected(self):self.doc['nodes'][1]['className']='hidden';self.fails()
    def test_third_container_level(self):
        self.doc['nodes'][1]['slots']['start'][0]['slots']['items']=[layout('deep','grid',{'items':[semantic('deep-leaf')]})];self.fails()
    def test_stack_inside_stack(self):
        self.doc['nodes']=[layout('outer','stack',{'items':[layout('inner','stack',{'items':[semantic('a')]})]})];self.fails()
    def test_split_inside_split(self):
        self.doc['nodes'][1]['slots']['end']=[layout('bad','split',{'start':[semantic('a')],'end':[semantic('b')]})];self.fails()
    def test_split_stack_mixed_with_leaf(self):self.doc['nodes'][1]['slots']['start'].append(semantic('mixed'));self.fails()
    def test_grid_nested_layout(self):self.doc['nodes'][2]['slots']['items']=[layout('bad','stack',{'items':[semantic('a')]})];self.fails()
    def test_reuse_nested(self):self.doc['nodes'][1]['slots']['end']=[self.doc['nodes'].pop()];self.fails()
    def test_hero_nested(self):self.doc['nodes'][1]['slots']['end']=[semantic('h2','hero')];self.fails()
    def test_hero_not_first(self):self.doc['nodes'][0],self.doc['nodes'][1]=self.doc['nodes'][1],self.doc['nodes'][0];self.fails()
    def test_second_hero(self):self.doc['nodes'].append(semantic('h2','hero'));self.fails()
    def test_article_no_layouts(self):self.doc['family']='article';self.fails()
    def test_v1_no_layouts(self):self.doc['profile']='asym.page-composition/1';self.fails()
    def test_max_root_entries(self):self.doc['nodes']=[semantic(f'n{i}') for i in range(65)];self.fails()
    def test_stack_slot_max(self):self.doc['nodes']=[layout('s','stack',{'items':[semantic(f'n{i}') for i in range(17)]})];self.fails()
    def test_grid_slot_max(self):self.doc['nodes'][2]['slots']['items']=[semantic(f'n{i}') for i in range(13)];self.fails()
    def test_total_node_max(self):self.doc['nodes']=[layout(f's{i}','stack',{'items':[semantic(f'n{i}-{j}') for j in range(16)]}) for i in range(8)];self.fails()
    def test_byte_limit(self):self.doc['nodes'][0]['content']={'x':'z'*524289};self.fails()
    def test_empty_slot_saved_but_not_published(self):
        self.doc['nodes']=[layout('s','split',{'start':[],'end':[semantic('x')]})]
        validate_composition(self.doc)
        with self.assertRaises(ContractError):validate_composition(self.doc,publishing=True)
    def test_reuse_requires_resolved_count_for_publish(self):
        with self.assertRaises(ContractError):validate_composition(self.doc,publishing=True)
    def test_reuse_expansion_bound(self):
        with self.assertRaises(ContractError):validate_composition(self.doc,publishing=True,expanded_reuse_counts={'fixture-revision':128})
    def test_publish_structure_with_reuse_count(self):validate_composition(self.doc,publishing=True,expanded_reuse_counts={'fixture-revision':1})
    def test_allowed_root_stack_split(self):
        self.doc['nodes']=[layout('s','stack',{'items':[layout('p','split',{'start':[semantic('a')],'end':[semantic('b')]})]})]
        validate_composition(self.doc,publishing=True)
    def test_allowed_root_stack_grid(self):
        self.doc['nodes']=[layout('s','stack',{'items':[layout('g','grid',{'items':[semantic('a'),semantic('b')]})]})]
        validate_composition(self.doc,publishing=True)
    def test_v2_ceiling_not_retroactive_v1(self):
        doc=fixture('composition-v1.valid-structure.json');doc['nodes']=[semantic(f'n{i}') for i in range(65)]
        validate_composition(doc) # Core must still apply its separately retained v1 owner limits.
    def test_unauthorized_event_payload(self):
        event=fixture('workflow-event.valid-structure.json');event['html']='<private>'
        with self.assertRaises(ContractError):validate_schema('workflow-event.schema.json',event)
    def test_forged_actor_in_save(self):
        save=fixture('editorial-save.valid-structure.json');save['actorId']='attacker'
        with self.assertRaises(ContractError):validate_schema('editorial-save.schema.json',save)
    def test_bad_manifest_digest(self):
        value=fixture('presentation-candidate.valid-structure.json');value['artifacts']['serverDigest']='latest'
        with self.assertRaises(ContractError):validate_schema('presentation-manifest.schema.json',value)
    def test_manifest_secret_rejected(self):
        value=fixture('presentation-candidate.valid-structure.json');value['providerToken']='secret'
        with self.assertRaises(ContractError):validate_schema('presentation-manifest.schema.json',value)

class ReferenceStateSemantics(unittest.TestCase):
    def test_same_request_replays_once(self):
        m=SaveModel();self.assertEqual(m.save('r',1,1,{'title':'A'}),2);self.assertEqual(m.save('r',1,1,{'title':'A'}),2);self.assertEqual(m.revision,2)
    def test_key_changed_payload_denied(self):
        m=SaveModel();m.save('r',1,1,{'title':'A'})
        with self.assertRaises(ContractError):m.save('r',1,1,{'title':'B'})
    def test_stale_revision_denied(self):
        m=SaveModel();m.save('r',1,1,{})
        with self.assertRaises(ContractError):m.save('s',1,1,{})
    def test_stale_lease_denied(self):
        m=SaveModel();m.take_over()
        with self.assertRaises(ContractError):m.save('r',1,1,{})
    def test_revocation_before_receipt_read(self):
        m=SaveModel();m.save('r',1,1,{})
        with self.assertRaises(ContractError):m.save('r',1,1,{},authorized=False)
    def test_precommit_failure_has_no_effect(self):
        m=SaveModel()
        with self.assertRaises(ContractError):m.save('r',1,1,{'title':'A'},inject_before_commit_failure=True)
        self.assertEqual(m.revision,1);self.assertEqual(m.receipts,{});self.assertEqual(m.content,{})
    def test_new_draft_does_not_mutate_candidate(self):
        m=SaveModel();m.save('r',1,1,{'title':'A'});candidate=m.fixed_candidate();m.save('s',2,1,{'title':'B'})
        self.assertEqual(candidate,{'revision':2,'content':{'title':'A'}});self.assertEqual(m.content,{'title':'B'})
    def test_original_input_cannot_mutate_saved_content(self):
        value={'title':'A'};m=SaveModel();m.save('r',1,1,value);value['title']='changed'
        self.assertEqual(m.content['title'],'A')

if __name__=='__main__':unittest.main()
