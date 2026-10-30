const SYSTEM_ONE_URL = '/api/systemone';
const CHAT_URL = '/api/chat/completions';
const INTENTS = ['bug_fix','feature','refactor','test_generation','migration','review','other'];
const COMPLEXITIES = ['trivial','simple','moderate','complex','very_complex'];
const RISKS = ['low','medium','high','critical'];
const SIGNAL_KEYS = ['needs_repository_tools','needs_agentic_workflow','needs_long_context','requirements_ambiguous','security_sensitive','tests_executable'];
const MODELS = [
  {key:'jev', label:'Jev 1.13', id:'jev-1.13', kind:'systemone'},
  {key:'jev114', label:'Jev 1.14', id:'typesafe/jev-1.14', kind:'systemone'},
  {key:'decision1', label:'Microsoft Decision-1', id:'microsoft/microsoft-decision-1', kind:'systemone'},
  {key:'qwen', label:'Qwen3 30B A3B', id:'qwen/qwen3-30b-a3b-instruct-2507', kind:'chat'},
  {key:'deepseek', label:'DeepSeek V4 Flash', id:'deepseek/deepseek-v4-flash-0731', kind:'chat', reasoning:{exclude:true}}
];

const seedCases = [
  {id:'C51',lang:'TypeScript · Payments',query:`We run a marketplace checkout across an API, a payment provider, and an event consumer. A customer sometimes sees two charges after a timeout even though the UI only submitted once. The API retries when the provider returns no response; the consumer can also receive duplicate events. Logs show the same cart ID but different request IDs, and support has already refunded several customers. Investigate the repository and fix the underlying idempotency issue across the transaction boundary. Preserve existing legitimate retries and do not store card data. Add tests for simultaneous requests, lost provider responses, and replayed events, and explain any remaining failure modes.`,intent:'bug_fix',complexity:'very_complex',risk:'critical'},
  {id:'C52',lang:'Python · Multi-tenant API',query:`Our reporting service currently computes exports synchronously. Large tenants time out after 30 seconds, but small exports are fine. Add an asynchronous export workflow: return a job ID, allow clients to poll status, and provide a time-limited download when ready. Existing clients must keep working during rollout. Jobs must be isolated by tenant, enforce the caller's permissions again on download, and expire stored files. The queue delivers messages at least once and workers may restart mid-job. Use existing infrastructure where practical, document the API and rollout, and cover duplicate delivery, authorization, and failure recovery in tests.`,intent:'feature',complexity:'very_complex',risk:'critical'},
  {id:'C53',lang:'Go · Authorization',query:`Please review the proposed authorization changes before we merge them; do not implement a fix. The service accepts a tenant ID in the URL and caches membership claims for fifteen minutes. Administrators can revoke a member or move a resource to another tenant, while background jobs use a service identity. The patch adds a cache keyed only by user ID and skips a database lookup on cache hits. Trace how these paths interact, identify concrete cross-tenant access or stale-permission scenarios, and rank findings by impact with file and line references. Mention assumptions and tests that would help verify each finding.`,intent:'review',complexity:'complex',risk:'critical'},
  {id:'C54',lang:'Java · Database migration',query:`We need to move the orders service from a single status column to an event history without interrupting writes. Several versions of the service will run simultaneously during deployment, and downstream consumers still read the old column. Existing records include historical nulls and duplicate external IDs. Design and implement an incremental migration with backfill, compatibility for old readers and writers, verification of counts and ordering, and a safe rollback before the final cutover. Avoid assuming the whole table fits in memory. Include tests for concurrent updates during backfill and document operational steps and conditions for stopping the rollout.`,intent:'migration',complexity:'very_complex',risk:'high'},
  {id:'C55',lang:'Rust · Parser tests',query:`The configuration parser accepts nested sections, quoted strings, comments, and environment-variable substitutions. A recent incident involved a malformed escape sequence near the end of a large file; the parser reported success but silently dropped the last section. Add a focused test suite around the existing parser rather than changing its behavior unless the tests expose a defect. Include representative valid files, malformed and truncated inputs, Unicode boundaries, and a property test for serialization round trips. Assertions should check both the parsed structure and useful error locations. Keep fixtures deterministic and document how to run the tests locally.`,intent:'test_generation',complexity:'complex',risk:'medium'},
  {id:'C56',lang:'TypeScript · Monorepo',query:`Three packages each construct HTTP clients with slightly different timeout, retry, and logging logic. The differences are not all accidental: uploads must never retry non-rewindable streams, and one service redacts a sensitive header. Extract a shared client core while preserving these behaviors and each package's public API. First inspect callers and existing tests, then introduce explicit configuration for the intentional differences. Do not change retry counts or logging content as part of this work. Add regression tests around the current behavior and explain any duplication that should remain because the semantics differ.`,intent:'refactor',complexity:'complex',risk:'high'},
  {id:'C57',lang:'React · Accessibility',query:`A support agent reports that keyboard users cannot reach the confirmation button in the account settings dialog after a validation error. The dialog contains tabs, an asynchronously loaded form, and a nested confirmation step. Mouse users can complete the flow. The current release also added a global Escape handler, but we do not know whether that caused the issue. Reproduce and fix the focus behavior in the existing implementation, preserving unsaved form values and ensuring focus returns to the opener when the dialog closes. Cover keyboard navigation, validation errors, and nested dismissal in tests.`,intent:'bug_fix',complexity:'complex',risk:'medium'},
  {id:'C58',lang:'Incident planning',query:`We are planning the response to intermittent queue lag across three regions. The incident notes say throughput recovered after scaling workers, but the oldest messages were delayed for hours and the root cause is still uncertain. The database team suspects connection limits; the application team suspects a retry storm. Using the supplied incident timeline and metrics, prepare a prioritized investigation plan with owners, evidence to collect, and decision points for mitigation and rollback. Separate established facts from hypotheses and identify questions that need an answer before changing production settings. Do not modify code or deploy anything.`,intent:'other',complexity:'moderate',risk:'medium'},
  {id:'C01',lang:'TypeScript · React',query:'Fix the product table skipping the final page when the item count is an exact multiple of the page size.',intent:'bug_fix',complexity:'simple',risk:'low'},
  {id:'C02',lang:'Python · FastAPI',query:'Add asynchronous webhook delivery with exponential backoff, a maximum retry count, and delivery-status tracking.',intent:'feature',complexity:'moderate',risk:'medium'},
  {id:'C03',lang:'Java · Spring Boot',query:'Merge three duplicated configuration loaders into one typed component without changing precedence rules.',intent:'refactor',complexity:'moderate',risk:'low'},
  {id:'C04',lang:'Rust · Parser',query:'Write unit tests for the configuration parser covering comments, escaped values, empty sections, and malformed headers.',intent:'test_generation',complexity:'simple',risk:'low'},
  {id:'C05',lang:'Vue 2 → Vue 3',query:'Migrate the account settings screen to Vue 3 Composition API while preserving validation and analytics events.',intent:'migration',complexity:'complex',risk:'medium'},
  {id:'C06',lang:'SQL · PostgreSQL',query:'Review this slow reporting query and determine whether the proposed composite index matches its filters and sort order.',intent:'review',complexity:'simple',risk:'low'},
  {id:'C07',lang:'Java · Scheduling',query:'Fix recurring meetings shifting by one hour after daylight-saving transitions for users in multiple time zones.',intent:'bug_fix',complexity:'moderate',risk:'medium'},
  {id:'C08',lang:'C# · ASP.NET',query:'Add CSV export to the inventory search endpoint using the existing filters and a configurable row limit.',intent:'feature',complexity:'simple',risk:'low'},
  {id:'C09',lang:'Python · Machine learning',query:'Review the training pipeline for target leakage caused by features calculated after the prediction timestamp.',intent:'review',complexity:'complex',risk:'high'},
  {id:'C10',lang:'Kotlin · HTTP client',query:'Create integration tests for retry behavior on timeouts, HTTP 429 responses, and successful recovery.',intent:'test_generation',complexity:'moderate',risk:'medium'},
  {id:'C11',lang:'MySQL 5.7 → 8.0',query:'Upgrade the application database to MySQL 8, update incompatible SQL modes, and verify existing replication jobs.',intent:'migration',complexity:'complex',risk:'high'},
  {id:'C12',lang:'C# · Logging',query:'Replace ad-hoc string logging in six services with structured event templates while preserving log levels.',intent:'refactor',complexity:'complex',risk:'high'},
  {id:'C13',lang:'Node.js · Redis',query:'Fix user profile updates remaining stale because cache invalidation runs before the database transaction commits.',intent:'bug_fix',complexity:'moderate',risk:'medium'},
  {id:'C14',lang:'Go · Feature flags',query:'Add percentage-based feature rollout with stable user bucketing, team overrides, and an emergency disable switch.',intent:'feature',complexity:'complex',risk:'medium'},
  {id:'C15',lang:'Terraform · Azure',query:'Add automated tests for a network module covering optional subnets, custom DNS, and invalid address ranges.',intent:'test_generation',complexity:'moderate',risk:'medium'},
  {id:'C16',lang:'TypeScript · Monorepo',query:'Review the dependency graph and identify packages that violate the rule that UI modules cannot import data-access implementations.',intent:'review',complexity:'moderate',risk:'low'},
  {id:'C17',lang:'Pandas → Polars',query:'Migrate a daily aggregation pipeline from Pandas to Polars while preserving null handling and output column order.',intent:'migration',complexity:'moderate',risk:'medium'},
  {id:'C18',lang:'Swift · iOS',query:'Add offline search over downloaded articles with prefix matching and automatic index refresh after synchronization.',intent:'feature',complexity:'moderate',risk:'medium'},
  {id:'C19',lang:'Python · Message queue',query:'Fix event consumers applying updates out of order when delayed messages arrive after newer versions.',intent:'bug_fix',complexity:'complex',risk:'high'},
  {id:'C20',lang:'Python · Airflow',query:'Extract repeated task-group creation from twelve DAGs into a shared builder without changing dependencies or schedules.',intent:'refactor',complexity:'complex',risk:'high'},
  {id:'C21',lang:'Node.js · Authentication',query:'Fix refresh-token rotation intermittently revoking valid sessions when two browser tabs renew at the same time.',intent:'bug_fix',complexity:'complex',risk:'critical'},
  {id:'C22',lang:'TypeScript · CLI',query:'Add a --no-color flag that disables ANSI formatting in command output and help text.',intent:'feature',complexity:'trivial',risk:'low'},
  {id:'C23',lang:'Java · Billing',query:'Split the monolithic billing service into invoice, pricing, and tax modules without changing external behavior.',intent:'refactor',complexity:'very_complex',risk:'high'},
  {id:'C24',lang:'Rust · Serialization',query:'Create property-based tests for binary serialization round trips, truncated inputs, and invalid type tags.',intent:'test_generation',complexity:'moderate',risk:'low'},
  {id:'C25',lang:'Kafka · Microservices',query:'Migrate twelve services to the new Kafka client while preserving delivery guarantees and consumer offsets.',intent:'migration',complexity:'very_complex',risk:'high'},
  {id:'C26',lang:'Terraform · AWS IAM',query:'Review this deployment role for unnecessary permissions and identify a least-privilege policy.',intent:'review',complexity:'moderate',risk:'high'},
  {id:'C27',lang:'CSS · Accessibility',query:'Fix keyboard focus rings disappearing on secondary buttons after the latest theme update.',intent:'bug_fix',complexity:'trivial',risk:'low'},
  {id:'C28',lang:'Go · Audit logging',query:'Add searchable audit-log export with actor, action, date-range, and resource filters.',intent:'feature',complexity:'moderate',risk:'medium'},
  {id:'C29',lang:'Python · Cryptography',query:'Consolidate three encryption helpers behind one interface while preserving ciphertext compatibility and key rotation.',intent:'refactor',complexity:'complex',risk:'critical'},
  {id:'C30',lang:'Java · Payments',query:'Write concurrency and replay tests proving that payment webhooks remain idempotent under duplicate delivery.',intent:'test_generation',complexity:'complex',risk:'critical'},
  {id:'C31',lang:'Kubernetes · Secrets',query:'Migrate application credentials from namespace secrets to the managed secrets platform with zero downtime.',intent:'migration',complexity:'complex',risk:'critical'},
  {id:'C32',lang:'C++ · Performance',query:'Review the image-processing worker and identify the source of its steadily increasing memory usage.',intent:'review',complexity:'complex',risk:'medium'},
  {id:'C33',lang:'Java · Authorization',query:'Fix role changes taking up to fifteen minutes to affect API authorization because permission caches remain stale.',intent:'bug_fix',complexity:'complex',risk:'critical'},
  {id:'C34',lang:'TypeScript · Developer tools',query:'Add semantic code search across the monorepo with symbol filters, ranked results, and incremental indexing.',intent:'feature',complexity:'very_complex',risk:'medium'},
  {id:'C35',lang:'C# · Data access',query:'Replace duplicated SQL filter construction with a typed query builder without changing generated statements.',intent:'refactor',complexity:'moderate',risk:'medium'},
  {id:'C36',lang:'Python · File security',query:'Create integration tests for upload quarantine, malware-scan timeouts, clean-file release, and infected-file deletion.',intent:'test_generation',complexity:'complex',risk:'high'},
  {id:'C37',lang:'Python 3.9 → 3.13',query:'Upgrade six services to Python 3.13, replace removed APIs, and verify native dependencies in CI.',intent:'migration',complexity:'complex',risk:'high'},
  {id:'C38',lang:'Go · Order processing',query:'Review the reservation workflow for a race condition that occasionally permits inventory to become negative.',intent:'review',complexity:'complex',risk:'high'},
  {id:'C39',lang:'Java · Data retention',query:'Fix the account-deletion job skipping child tenants while ensuring records under legal hold are preserved.',intent:'bug_fix',complexity:'very_complex',risk:'critical'},
  {id:'C40',lang:'React · Operations',query:'Add a retry-queue dashboard with failure reasons, age filters, bulk retry, and permission checks.',intent:'feature',complexity:'complex',risk:'high'},
  {id:'C41',lang:'React · State management',query:'Replace scattered component state in the checkout flow with a reducer while preserving analytics and validation.',intent:'refactor',complexity:'moderate',risk:'medium'},
  {id:'C42',lang:'Java · Scheduling',query:'Generate boundary tests for recurring schedules across leap years, daylight-saving changes, and month ends.',intent:'test_generation',complexity:'moderate',risk:'medium'},
  {id:'C43',lang:'REST → Event driven',query:'Migrate order fulfillment from synchronous REST calls to events with idempotency and rollback handling.',intent:'migration',complexity:'very_complex',risk:'high'},
  {id:'C44',lang:'Python · RAG security',query:'Review the retrieval pipeline for prompt-injection paths that could expose restricted internal documents.',intent:'review',complexity:'complex',risk:'critical'},
  {id:'C45',lang:'Rust · Usage billing',query:'Fix integer overflow in usage aggregation that produces negative monthly totals for very large accounts.',intent:'bug_fix',complexity:'moderate',risk:'high'},
  {id:'C46',lang:'Kotlin · Configuration',query:'Add a per-environment switch for verbose HTTP tracing, disabled by default in production.',intent:'feature',complexity:'simple',risk:'low'},
  {id:'C47',lang:'Engineering planning',query:'Estimate the engineering effort and staffing needed to replace the legacy notification platform next quarter.',intent:'other',complexity:'moderate',risk:'medium'},
  {id:'C48',lang:'Incident communication',query:'Draft a customer-facing summary of yesterday’s API outage using the incident timeline and approved facts.',intent:'other',complexity:'simple',risk:'medium'},
  {id:'C49',lang:'Release management',query:'Turn this release plan into an owner-based checklist with dependencies, approvals, and rollback decision points.',intent:'other',complexity:'simple',risk:'medium'},
  {id:'C50',lang:'Sprint planning',query:'Break the observability initiative into prioritized Jira stories with acceptance criteria and sequencing.',intent:'other',complexity:'moderate',risk:'low'}
];

// Shared background must not reveal the expected classification label.
function expandSeedCase(item){
  return `${item.query}\n\nBackground: This request is part of ongoing work in ${item.lang}. The material in the ticket may not describe every relevant dependency or constraint. Before drawing conclusions, consult the available project material and identify which details are established and which are assumptions. If information is missing, explain how that affects the result. Avoid treating an example or a suspected cause as proof of how the system actually behaves.\n\nThe team has asked that existing work be respected. Check the surrounding context and applicable conventions, and avoid unrelated changes. Consider the effect on existing users and integrations where relevant. If there are multiple plausible approaches, choose one that fits the stated scope and explain any meaningful tradeoffs. Do not introduce new requirements or claim that unprovided facts are known.\n\nUse the evidence available in the workspace to assess the request. Where a check or verification is appropriate, describe what it establishes and distinguish a successful result from a check that could not be performed. If the work depends on an external service, configuration, or material that is unavailable, call that out rather than implying it was verified. Preserve the specific constraints in the original request.\n\nFor the handoff, summarize the outcome, the reasoning that matters to the next person, and any remaining uncertainty. Include relevant evidence and practical next steps without inventing owners, dates, approvals, or results. Keep the response focused on the requested work and flag questions that must be resolved before a safe decision can be made.`;
}
let cases = seedCases.map(item=>({...item,query:expandSeedCase(item)}));
let results = [];
let completedReport = null;
let activeFilter = 'all';
let abortController = null;
const CHECKPOINT_KEY = 'jev-coding-signal-lab-checkpoint-v1';
const $ = (id) => document.getElementById(id);

function esc(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function label(value){return String(value).replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());}
function toast(message,error=false){const el=$('toast');el.textContent=message;el.className=`toast show${error?' error':''}`;clearTimeout(toast.t);toast.t=setTimeout(()=>el.className='toast',2800);}
function authHeaders(){return {'Content-Type':'application/json'};}
function waitBetweenCalls(ms,signal){return new Promise((resolve,reject)=>{if(signal.aborted)return reject(new DOMException('Aborted','AbortError'));const timer=setTimeout(()=>{signal.removeEventListener('abort',onAbort);resolve();},ms);const onAbort=()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));};signal.addEventListener('abort',onAbort,{once:true});});}
function resultKey(modelKey,itemId){return `${modelKey}:${itemId}`;}
function runSignature(selected,models,repeat){return JSON.stringify({schemaVersion:5,cases:selected.map(({id,query,intent,complexity,risk})=>({id,query,intent,complexity,risk})),models:models.map(({id,reasoning})=>({id,reasoning:reasoning||null})),repeat});}
function loadCheckpoint(signature){
  try{const saved=JSON.parse(localStorage.getItem(CHECKPOINT_KEY));return saved?.signature===signature&&Array.isArray(saved.results)?saved.results.filter(r=>!r.error&&!r.warning):[];}catch{return [];}
}
function saveCheckpoint(signature,rows){
  try{localStorage.setItem(CHECKPOINT_KEY,JSON.stringify({version:1,signature,savedAt:new Date().toISOString(),results:rows.filter(r=>!r.error&&!r.warning)}));}catch{}
}
function clearCheckpoint(signature){
  try{const saved=JSON.parse(localStorage.getItem(CHECKPOINT_KEY));if(saved?.signature===signature)localStorage.removeItem(CHECKPOINT_KEY);}catch{}
}

function renderDataset(){
  const visible=cases.filter(c=>activeFilter==='all'||c.intent===activeFilter);
  $('datasetBody').innerHTML=visible.map(c=>`<tr><td><input class="case-check" type="checkbox" data-id="${c.id}" checked aria-label="Select ${c.id}"></td><td><details class="query-details"><summary><span class="query-preview">${esc(c.query.split(/\n/)[0].slice(0,160))}${c.query.split(/\n/)[0].length>160?'…':''}</span></summary><div class="query-full">${esc(c.query)}</div></details><span class="query-meta">${c.id} · ${esc(c.lang)}</span></td><td><span class="pill">${label(c.intent)}</span></td><td>${label(c.complexity)}</td><td><span class="pill risk-${c.risk}">${label(c.risk)}</span></td><td>${c.custom?`<button class="row-action" data-delete="${c.id}" aria-label="Delete ${c.id}">×</button>`:''}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">No cases in this filter.</td></tr>';
  $('datasetCount').textContent=cases.length;
  document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{cases=cases.filter(c=>c.id!==b.dataset.delete);renderDataset();});
}

function getSelectedCases(){const ids=[...document.querySelectorAll('.case-check:checked')].map(x=>x.dataset.id);return cases.filter(c=>ids.includes(c.id));}
function getSelectedModels(){const keys=[...document.querySelectorAll('.classifier-check:checked')].map(x=>x.value);return MODELS.filter(m=>keys.includes(m.key));}

function questions(){return {
  intent:{type:'choice',instructions:'Classify the primary engineering intent of this coding query.',criteria:{bug_fix:'Diagnose and correct faulty behavior',feature:'Add new behavior or capability',refactor:'Change code structure without intended behavior change',test_generation:'Primarily create or improve tests',migration:'Move between languages, frameworks, platforms, or data representations',review:'Review, explain, or assess code without implementing a change',other:'None of the listed intents is primary'}},
  complexity:{type:'choice',instructions:'Classify implementation complexity and cross-component reasoning required.',criteria:{trivial:'Tiny, obvious edit with minimal reasoning',simple:'Localized change in one component',moderate:'Multi-file change with bounded dependencies',complex:'Cross-module change requiring substantial reasoning',very_complex:'Architectural or highly coupled change'}},
  risk:{type:'choice',instructions:'Classify implementation risk from blast radius, data sensitivity, and reversibility.',criteria:{low:'Isolated and easily reversible with little user impact',medium:'Meaningful behavior or data impact with bounded blast radius',high:'Sensitive domain, broad change, or difficult rollback',critical:'Authentication, authorization, payments, ledger integrity, secrets, or severe systemic impact'}},
  needs_repository_tools:{type:'noul',instructions:'Does successful completion likely require searching, reading, or editing a repository?'},
  needs_agentic_workflow:{type:'noul',instructions:'Does this likely require iterative repository exploration, edits, and test execution rather than a single response?'},
  needs_long_context:{type:'noul',instructions:'Does this likely require context across many files, modules, or specifications?'},
  requirements_ambiguous:{type:'noul',instructions:'Are requirements too ambiguous to implement safely without clarification?'},
  security_sensitive:{type:'noul',instructions:'Does this affect authentication, authorization, secrets, payments, personal data, or security controls?'},
  tests_executable:{type:'noul',instructions:'Are automated tests likely feasible to execute in a normal repository environment?'}
};}

function classifierSchema(){
  const properties={intent:{type:'string',enum:INTENTS},complexity:{type:'string',enum:COMPLEXITIES},risk:{type:'string',enum:RISKS}};
  SIGNAL_KEYS.forEach(k=>properties[k]={type:'boolean'});
  return {type:'object',properties,required:Object.keys(properties),additionalProperties:false};
}

function answerValue(answer){
  if(!answer)return null;
  if(answer.type==='noul')return Number(answer.noul);
  if(answer.type==='choice')return answer.choice ?? answer.value ?? answer.answer ?? Object.entries(answer.probabilities||{}).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? null;
  if(answer.type==='score')return Number(answer.score ?? answer.value ?? answer.answer ?? 0);
  return answer.choice ?? answer.score ?? answer.noul ?? answer.value ?? null;
}

function isTransientStatus(status){return [408,409,425,429].includes(status)||status>=500;}
function apiError(message,status,retryable=isTransientStatus(status)){
  const error=new Error(message);error.status=status;error.retryable=retryable;return error;
}

async function callJev(item,key,model,signal){
  const started=performance.now();
  const response=await fetch(SYSTEM_ONE_URL,{method:'POST',signal,headers:authHeaders(key),body:JSON.stringify({model:model.id,state:{coding_query:item.query,context:item.lang},questions:questions()})});
  const text=await response.text();let data;try{data=JSON.parse(text);}catch{throw apiError(`OpenRouter returned ${response.status}: ${text.slice(0,180)}`,response.status,response.ok||isTransientStatus(response.status))}
  if(!response.ok)throw apiError(data.error?.message||data.message||`OpenRouter error ${response.status}`,response.status);
  return {data,latency:performance.now()-started};
}

async function callChatClassifier(item,key,model,signal){
  const started=performance.now();
  const prompt=`Classify this coding query. Use the dominant intent. Complexity must be trivial, simple, moderate, complex, or very_complex. Risk must be low, medium, high, or critical; critical covers authentication, authorization, payments, ledger integrity, secrets, or severe systemic impact. Boolean signals must reflect what successful completion likely requires.\n\nContext: ${item.lang}\nQuery: ${item.query}`;
  const request={model:model.id,messages:[{role:'system',content:'You are a coding-query classifier. Return only the requested structured object.'},{role:'user',content:prompt}],response_format:{type:'json_schema',json_schema:{name:'coding_query_signals',strict:true,schema:classifierSchema()}},provider:{require_parameters:true}};
  if(model.reasoning)request.reasoning=model.reasoning;
  const response=await fetch(CHAT_URL,{method:'POST',signal,headers:authHeaders(key),body:JSON.stringify(request)});
  const text=await response.text();let data;try{data=JSON.parse(text);}catch{throw apiError(`OpenRouter returned ${response.status}: ${text.slice(0,180)}`,response.status,response.ok||isTransientStatus(response.status))}
  if(!response.ok)throw apiError(data.error?.message||data.message||`OpenRouter error ${response.status}`,response.status);
  const choice=data.choices?.[0];
  if(choice?.finish_reason==='length')throw apiError(`${model.label} ran out of response tokens before returning a classification`,response.status,true);
  const content=choice?.message?.content;
  const raw=Array.isArray(content)?content.map(x=>x.text||'').join(''):content;
  let parsed;try{parsed=typeof raw==='string'?JSON.parse(raw):raw;}catch{throw apiError(`${model.label} returned invalid JSON`,response.status,true);}
  const validSignals=parsed&&SIGNAL_KEYS.every(k=>typeof parsed[k]==='boolean');
  if(!parsed||!INTENTS.includes(parsed.intent)||!RISKS.includes(parsed.risk)||!COMPLEXITIES.includes(parsed.complexity)||!validSignals)throw apiError(`${model.label} returned an invalid classification`,response.status,true);
  const answers={intent:{type:'choice',choice:parsed.intent},complexity:{type:'choice',choice:parsed.complexity},risk:{type:'choice',choice:parsed.risk}};
  SIGNAL_KEYS.forEach(k=>answers[k]={type:'noul',noul:parsed[k]?1:0});
  data.answers=answers;
  return {data,latency:performance.now()-started};
}

function callClassifier(item,key,model,signal){return model.kind==='systemone'?callJev(item,key,model,signal):callChatClassifier(item,key,model,signal);}

async function callWithRetry(item,key,model,signal,onRetry){
  const maxAttempts=3;let lastError;
  for(let attempt=1;attempt<=maxAttempts;attempt++){
    try{return await callClassifier(item,key,model,signal);}
    catch(error){
      if(error.name==='AbortError')throw error;
      lastError=error;const retryable=error.retryable===true||error instanceof TypeError;
      if(!retryable||attempt===maxAttempts){error.attempts=attempt;throw error;}
      const delay=1500*2**(attempt-1);onRetry?.(attempt+1,maxAttempts,delay);
      await waitBetweenCalls(delay,signal);
    }
  }
  throw lastError;
}

function aggregateRuns(item,runs,model){
  const values=(key)=>runs.map(r=>answerValue(r.data.answers?.[key])).filter(v=>v!==null&&!Number.isNaN(v));
  const mode=(arr)=>arr.sort((a,b)=>arr.filter(v=>v===a).length-arr.filter(v=>v===b).length).at(-1);
  const mean=(arr)=>arr.length?arr.reduce((a,b)=>a+Number(b),0)/arr.length:null;
  const signals={};SIGNAL_KEYS.forEach(k=>signals[k]=mean(values(k)));
  return {id:item.id,item,modelKey:model.key,modelLabel:model.label,servedModel:runs[0]?.data.model||model.id,intent:mode(values('intent')),risk:mode(values('risk')),complexity:mode(values('complexity')),signals,latency:mean(runs.map(r=>r.latency)),cost:runs.reduce((s,r)=>s+Number(r.data.usage?.cost||0),0),runs:runs.length,raw:runs.map(r=>r.data.answers)};
}

function metrics(rows){
  const n=rows.length;if(!n)return null;
  const intent=rows.filter(r=>r.intent===r.item.intent).length,risk=rows.filter(r=>r.risk===r.item.risk).length,complexity=rows.filter(r=>r.complexity===r.item.complexity).length;
  const exact=rows.filter(r=>r.intent===r.item.intent&&r.risk===r.item.risk&&r.complexity===r.item.complexity).length;
  return {n,intent:intent/n,risk:risk/n,complexity:complexity/n,exact:exact/n,latency:rows.reduce((s,r)=>s+r.latency,0)/n,cost:rows.reduce((s,r)=>s+r.cost,0)};
}

function renderSummary(){
  const scored=MODELS.map(model=>({model,m:metrics(results.filter(r=>r.modelKey===model.key&&!r.error))}));
  const maxExact=Math.max(...scored.filter(x=>x.m).map(x=>x.m.exact),-1);
  $('modelSummary').innerHTML=scored.map(({model,m})=>`<article class="model-card ${m&&m.exact===maxExact?'best':''}"><div class="model-card-head"><strong class="model-name ${model.key}">${model.label}</strong>${m&&m.exact===maxExact?'<span class="model-badge">Best exact</span>':''}</div>${m?`<div class="model-stats"><div class="model-stat"><span>Exact</span><b>${Math.round(m.exact*100)}%</b></div><div class="model-stat"><span>Intent</span><b>${Math.round(m.intent*100)}%</b></div><div class="model-stat"><span>Risk</span><b>${Math.round(m.risk*100)}%</b></div></div><div class="model-card-foot"><span>Complexity ${Math.round(m.complexity*100)}%</span><span>${Math.round(m.latency)} ms · ${m.cost?'$'+m.cost.toFixed(5):'cost n/a'}</span></div>`:'<div class="model-card-foot"><span>Not run</span><span>—</span></div>'}</article>`).join('');
}

function renderResults(){
  $('resultCount').textContent=results.length;$('exportResults').disabled=!results.length;renderSummary();
  if(!results.length){$('resultsBody').innerHTML='<tr><td colspan="7" class="empty">No results yet.</td></tr>';return;}
  $('resultsBody').innerHTML=results.map(r=>{
    if(r.error)return `<tr><td><span class="model-name ${r.modelKey}">${r.modelLabel}</span></td><td><span class="query-title">${r.id}</span><span class="query-meta">${esc(r.item.lang)}</span></td><td colspan="4"><span class="failure-note">Failed after ${r.attempts} attempts · ${esc(r.error)}</span></td><td>—</td></tr>`;
    const im=r.intent===r.item.intent,rm=r.risk===r.item.risk,cm=r.complexity===r.item.complexity;
    const sig=Object.entries(r.signals).filter(([,v])=>v>=.5).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k,v])=>`<span class="signal">${label(k)} ${Math.round(v*100)}%</span>`).join('');
    return `<tr><td><span class="model-name ${r.modelKey}">${r.modelLabel}</span></td><td><span class="query-title">${r.id}</span><span class="query-meta">${esc(r.item.lang)} · ${r.runs} run${r.runs>1?'s':''}</span>${r.warning?`<span class="failure-note">Partial · ${esc(r.warning)}</span>`:''}</td><td><span class="pred ${im?'match':'miss'}">${label(r.intent||'—')}</span><span class="expected">Expected ${label(r.item.intent)}</span></td><td><span class="pred ${cm?'match':'miss'}">${label(r.complexity||'—')}</span><span class="expected">Expected ${label(r.item.complexity)}</span></td><td><span class="pred ${rm?'match':'miss'}">${label(r.risk||'—')}</span><span class="expected">Expected ${label(r.item.risk)}</span></td><td><div class="signals">${sig||'—'}</div></td><td>${Math.round(r.latency)} ms</td></tr>`;
  }).join('');
  const failed=results.filter(r=>r.error).length,partial=results.filter(r=>r.warning).length;
  $('resultsHint').textContent=`${results.length-failed} successful model–case results from ${results.reduce((s,r)=>s+(r.runs||0),0)} completed runs${failed?` · ${failed} failed`:''}${partial?` · ${partial} partial`:''}. Categorical labels, including complexity, use majority vote; signals use the mean.`;
}

function mdCell(value){return String(value??'—').replaceAll('|','\\|').replace(/\r?\n/g,' ');}
function downloadFile(content,filename,type){const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href);}
function exportMarkdownReport(){
  if(!completedReport)return;
  const timestamp=completedReport.generated.toISOString().replaceAll(':','-').replace('.','-');
  downloadFile(completedReport.markdown,`jev-coding-signal-report-${timestamp}.md`,'text/markdown');
}
function renderReport(markdown){
  const lines=markdown.split('\n'), blocks=[];
  const cells=line=>line.slice(1,-1).split(/(?<!\\)\|/).map(cell=>esc(cell.trim().replaceAll('\\|','|')));
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(!line)continue;
    if(line.startsWith('|')&&lines[i+1]?.startsWith('|---')){
      const headings=cells(line);i++;
      const rows=[];while(lines[i+1]?.startsWith('|'))rows.push(cells(lines[++i]));
      blocks.push(`<div class="report-table"><table><thead><tr>${headings.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    }else if(line.startsWith('# '))blocks.push(`<h1>${esc(line.slice(2))}</h1>`);
    else if(line.startsWith('## '))blocks.push(`<h2>${esc(line.slice(3))}</h2>`);
    else if(line.startsWith('- '))blocks.push(`<p class="report-item">${esc(line.slice(2)).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</p>`);
    else blocks.push(`<p>${esc(line)}</p>`);
  }
  $('reportContent').innerHTML=blocks.join('');
}
function buildMarkdownReport(generated=new Date()){
  const successful=results.filter(r=>!r.error),failed=results.filter(r=>r.error),partial=results.filter(r=>r.warning);
  const usedModels=MODELS.filter(model=>results.some(r=>r.modelKey===model.key));
  const uniqueCases=[...new Map(results.map(r=>[r.id,r.item])).values()];
  const modelRows=usedModels.map(model=>{const rows=successful.filter(r=>r.modelKey===model.key),m=metrics(rows);return m?`| ${mdCell(model.label)} | ${m.n} | ${Math.round(m.exact*100)}% | ${Math.round(m.intent*100)}% | ${Math.round(m.risk*100)}% | ${Math.round(m.complexity*100)}% | ${Math.round(m.latency)} ms | ${m.cost?'$'+m.cost.toFixed(5):'n/a'} |`:`| ${mdCell(model.label)} | 0 | — | — | — | — | — | — |`;});
  const caseRows=results.map(r=>{const signals=r.error?'—':Object.entries(r.signals||{}).filter(([,v])=>v>=.5).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${label(k)} ${Math.round(v*100)}%`).join(', ')||'None';const status=r.error?`Failed after ${r.attempts} attempts`:r.warning?'Partial':'Complete';return `| ${mdCell(r.modelLabel)} | ${mdCell(r.id)} | ${mdCell(r.item.intent)} → ${mdCell(r.intent)} | ${mdCell(r.item.complexity)} → ${mdCell(r.complexity)} | ${mdCell(r.item.risk)} → ${mdCell(r.risk)} | ${mdCell(signals)} | ${r.error?'—':Math.round(r.latency)+' ms'} | ${mdCell(status)} |`;});
  const datasetRows=uniqueCases.map(item=>`| ${mdCell(item.id)} | ${mdCell(item.lang)} | ${mdCell(item.query)} | ${mdCell(item.intent)} | ${item.complexity} | ${mdCell(item.risk)} |`);
  const failureSection=(failed.length||partial.length)?['','## Failures and partial results','',...failed.map(r=>`- **${mdCell(r.modelLabel)} / ${mdCell(r.id)}:** ${mdCell(r.error)} (after ${r.attempts} attempts)`),...partial.map(r=>`- **${mdCell(r.modelLabel)} / ${mdCell(r.id)}:** ${mdCell(r.warning)}`)]:[];
  return ['# Jev Coding Signal Lab Report','',`Generated: ${generated.toISOString()}`,'','## Run overview','',`- Models: ${usedModels.map(m=>m.label).join(', ')}` ,`- Dataset cases represented: ${uniqueCases.length}`,`- Model–case results: ${results.length}`,`- Completed API runs: ${results.reduce((s,r)=>s+(r.runs||0),0)}`,`- Failed results: ${failed.length}`,`- Partial results: ${partial.length}`,'','## Model comparison','','| Model | Cases | Exact match | Intent accuracy | Risk accuracy | Complexity | Avg latency | Cost |','|---|---:|---:|---:|---:|---:|---:|---:|',...modelRows,'','## Detailed results','','| Model | Case | Intent (expected → predicted) | Complexity | Risk (expected → predicted) | Active signals | Latency | Status |','|---|---|---|---|---|---|---:|---|',...caseRows,...failureSection,'','## Dataset','','| Case | Context | Query | Expected intent | Complexity | Risk |','|---|---|---|---|---|---|',...datasetRows,'','## Methodology','','- Exact match requires intent, complexity, and risk to match the expected labels.','- Repeated runs use majority vote for categorical outputs, including complexity, and the mean for signals.','- System One models return native probabilities; chat-model baselines return schema-constrained labels and booleans.','- Failed results are excluded from model-level accuracy and latency metrics.',''].join('\n');
}

async function runBenchmark(){
  const key = null;
  const checked=getSelectedCases();if(!checked.length){toast('Select at least one case.',true);return;}
  const sampleValue=$('sampleCount').value;
  const selected=sampleValue==='all'?checked:checked.slice(0,Number(sampleValue));
  const models=getSelectedModels();if(!models.length){toast('Select at least one model.',true);return;}
  completedReport=null;$('exportReport').disabled=true;$('reportContent').innerHTML='<p class="hint">Complete a benchmark to see its report.</p>';
  const repeat=Number($('repeatCount').value),signature=runSignature(selected,models,repeat),total=selected.length*repeat*models.length;
  results=loadCheckpoint(signature);const completedKeys=new Set(results.map(r=>resultKey(r.modelKey,r.id)));let completed=results.length*repeat,failed=0;
  saveCheckpoint(signature,results);renderResults();abortController=new AbortController();$('runAll').disabled=true;$('stopRun').disabled=false;$('progressWrap').hidden=false;$('progressCount').textContent=`${completed} / ${total}`;$('progressBar').style.width=`${completed/total*100}%`;$('connectionStatus').innerHTML='<span class="dot"></span>Running';
  if(results.length)toast(`Resuming · ${results.length} completed result${results.length>1?'s':''} restored`);
  try{
    for(const model of models){for(const item of selected){
      if(completedKeys.has(resultKey(model.key,item.id)))continue;
      const runs=[];let runError=null,attempts=0;
      for(let i=0;i<repeat;i++){
        $('progressLabel').textContent=`${model.label} · ${item.id} · run ${i+1} of ${repeat}`;
        try{runs.push(await callWithRetry(item,key,model,abortController.signal,(next,max,delay)=>{$('progressLabel').textContent=`${model.label} · ${item.id} · retry ${next} of ${max} in ${delay/1000}s`;}));}
        catch(error){if(error.name==='AbortError')throw error;runError=error.message;attempts=error.attempts||1;failed++;completed+=repeat-i;}
        if(runError){$('progressCount').textContent=`${completed} / ${total}`;$('progressBar').style.width=`${completed/total*100}%`;if(completed<total)await waitBetweenCalls(Number($('callDelay').value),abortController.signal);break;}
        completed++;
        $('progressCount').textContent=`${completed} / ${total}`;$('progressBar').style.width=`${completed/total*100}%`;
        if(completed<total)await waitBetweenCalls(Number($('callDelay').value),abortController.signal);
      }
      if(runs.length){const row=aggregateRuns(item,runs,model);if(runError)row.warning=`${runError} after ${attempts} attempts`;results.push(row);if(!row.warning){completedKeys.add(resultKey(model.key,item.id));saveCheckpoint(signature,results);}}
      else results.push({id:item.id,item,modelKey:model.key,modelLabel:model.label,error:runError,attempts,runs:0});
      renderResults();
    }}
    if(!failed)clearCheckpoint(signature);else saveCheckpoint(signature,results);
    const generated=new Date();
    completedReport={generated,markdown:buildMarkdownReport(generated)};
    renderReport(completedReport.markdown);$('exportReport').disabled=false;
    switchTab('report');
    toast(`Benchmark complete${failed?` · ${failed} failed case${failed>1?'s':''}`:''}`,failed>0);
  }catch(error){if(error.name==='AbortError')toast('Run stopped.');else toast(error.message,true);}
  finally{$('runAll').disabled=false;$('stopRun').disabled=true;$('connectionStatus').innerHTML='<span class="dot"></span>Ready';abortController=null;}
}

function switchTab(name){document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===name));document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===`${name}Panel`));}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>switchTab(t.dataset.tab));
document.querySelectorAll('.filter').forEach(f=>f.onclick=()=>{activeFilter=f.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===f));renderDataset();});
$('selectAll').onchange=(e)=>document.querySelectorAll('.case-check').forEach(c=>c.checked=e.target.checked);
$('runAll').onclick=runBenchmark;$('stopRun').onclick=()=>abortController?.abort();
$('addCase').onclick=()=>$('caseDialog').showModal();
$('caseForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();const q=$('caseQuery').value.trim();if(!q)return;const complexity=$('caseComplexity').value;cases.push({id:`U${String(cases.filter(c=>c.custom).length+1).padStart(2,'0')}`,lang:'Custom query',query:q,intent:$('caseIntent').value,complexity,risk:$('caseRisk').value,custom:true});$('caseDialog').close();$('caseForm').reset();renderDataset();toast('Custom case added.');});
$('exportReport').onclick=exportMarkdownReport;
$('exportResults').onclick=()=>downloadFile(JSON.stringify({generated_at:new Date().toISOString(),models:getSelectedModels().map(m=>m.id),results},null,2),'coding-classifier-comparison.json','application/json');

function registerWebMCP(){const ctx=document.modelContext;if(!ctx?.registerTool)return;try{void Promise.resolve(ctx.registerTool({name:'stage_coding_query',title:'Stage coding query',description:'Add a labeled coding query to the visible classifier benchmark dataset.',inputSchema:{type:'object',properties:{query:{type:'string'},intent:{type:'string',enum:INTENTS},complexity:{type:'string',enum:COMPLEXITIES},risk:{type:'string',enum:RISKS}},required:['query','intent','complexity','risk'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){if(!input||typeof input.query!=='string'||!INTENTS.includes(input.intent)||!COMPLEXITIES.includes(input.complexity)||!RISKS.includes(input.risk))throw new Error('Invalid coding case');const item={id:`U${String(cases.filter(c=>c.custom).length+1).padStart(2,'0')}`,lang:'Agent-staged query',query:input.query,intent:input.intent,complexity:input.complexity,risk:input.risk,custom:true};cases.push(item);renderDataset();return {id:item.id,total_cases:cases.length};}})).catch(()=>{});}catch{}}

renderDataset();renderResults();registerWebMCP();
