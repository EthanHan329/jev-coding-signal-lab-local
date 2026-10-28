from html.parser import HTMLParser

INK='#112535'; TEAL='#007a7b'; MINT='#d9f1ec'; MUTED='#526b78'; LINE='#9baeb7'; AMBER='#a86616'; PALE='#f6e9d2'
serial=0
class TextOnly(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]
    def handle_data(self,s):
        if s.strip(): self.parts.append(s.strip())
def plain(s):
    p=TextOnly(); p.feed(s); return ' '.join(p.parts)
def txt(x,y,text,size=23,color=INK,anchor='start',weight=400):
    lines=text.split('|')
    return '<text x="%s" y="%s" fill="%s" text-anchor="%s" font-size="%s" font-weight="%s">'%(x,y,color,anchor,size,weight)+''.join('<tspan x="%s" dy="%s">%s</tspan>'%(x,0 if i==0 else size*1.32,html.escape(line)) for i,line in enumerate(lines))+'</text>'
def rect(x,y,w,h,fill='white',stroke=LINE,rx=5):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>'
def node(x,y,w,h,title,sub='',accent=False):
    fill=TEAL if accent else 'white'; col='white' if accent else INK
    return rect(x,y,w,h,fill,TEAL if accent else LINE)+txt(x+w/2,y+h/2-(8 if sub else -8),title,24,col,'middle',600)+(txt(x+w/2,y+h/2+26,sub,18,'#d9f1ec' if accent else MUTED,'middle') if sub else '')
def path(d,color=LINE,arrow=True,dash=False):
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2.5" '+('stroke-dasharray="7 6" ' if dash else '')+(f'marker-end="url(#arrow-{serial})"' if arrow else '')+'/>'
def line(x1,y1,x2,y2,**kw): return path(f'M{x1} {y1} L{x2} {y2}',**kw)
def dot(x,y,n,color=TEAL):
    return f'<circle cx="{x}" cy="{y}" r="22" fill="{color}"/>'+txt(x,y+7,str(n),20,'white','middle',600)
def svg(title,desc,body,h=410):
    return f'<svg class="diagram" viewBox="0 0 1120 {h}" role="img" aria-labelledby="dt-{serial} dd-{serial}" xmlns="http://www.w3.org/2000/svg"><title id="dt-{serial}">{html.escape(title)}</title><desc id="dd-{serial}">{html.escape(desc)}</desc><defs><marker id="arrow-{serial}" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L8 4 L0 8" fill="{LINE}"/></marker></defs><g font-family="Arial, Helvetica, sans-serif">{body}</g></svg>'
def visual(i,body,caption='',desc='',h=410):
    s=slides[i-1]
    s['notes']+='\n\nSupporting detail: '+plain(s['body'])
    s['body']=svg(plain(s['title']),desc or caption,body,h)+(f'<p class="visual-caption">{caption}</p>' if caption else '')
    s['kind']+=' visual'
def start():
    global serial
    serial+=1

# A proportional running-order timeline.
start()
b=''
x=25
for mins,label,sub,color in [(8,'Understand','Agents + classifiers',TEAL),(10,'Explore','Banking examples',TEAL),(12,'Connect','Architecture + options',TEAL),(5,'Adopt','First steps',MUTED),(5,'Discuss','Your bank',AMBER)]:
    w=mins/40*1070
    b+=rect(x,170,w-5,40,color,color,0)+txt(x,132,f'{mins} min',30,color,weight=600)+txt(x,256,label,24,weight=600)+txt(x,290,sub.replace(' + ','|+ ') if w<250 else sub,18,MUTED)
    x+=w
visual(2,b,'35 minutes of presentation, followed by 5 minutes of discussion.','A 40-minute timeline: understand 8 minutes, explore 10, connect 12, adopt 5, discuss 5.')

# Agent loop, including a genuine feedback connector.
start()
b=txt(25,45,'Objective: prepare a card-dispute case',25,TEAL,weight=600)
for x,title,sub in [(25,'Understand','Customer request'),(310,'Gather','Permitted context'),(595,'Act','Authorised tools'),(880,'Check','Outcome + evidence')]:
    b+=node(x,145,210,110,title,sub, title=='Act')
    if x<880:b+=line(x+210,200,x+277,200)
b+=path('M985 255 V335 H130 V264',dash=True)+txt(560,378,'Clarify or retry within the workflow’s limits',21,MUTED,'middle')
visual(3,b,'The bank defines the objective, available tools and approval points.','An agent loops through understanding, gathering permitted context, authorised action and checking the result. A feedback path allows clarification or bounded retries.')

# Classifier as a funnel into exclusive labels.
start()
b=node(20,130,310,125,'Customer message','“Unrecognised payment”')+line(330,192,405,192)+node(415,142,250,100,'Classifier','Choose a defined label',True)
for y,label,active in [(25,'Card dispute',True),(120,'Payment status',False),(215,'Account access',False),(310,'Other / unknown',False)]:
    b+=path(f'M665 192 H735 V{y+34} H790',color=TEAL if active else LINE)+rect(800,y,295,68,MINT if active else 'white',TEAL if active else LINE)+txt(823,y+43,label,24,TEAL if active else MUTED,weight=600 if active else 400)
visual(4,b,'A bounded label gives software a usable next step.','A customer message enters a classifier. The classifier selects card dispute from four allowed labels. This is an illustrative classification.')

# Three output types, with actual probability and ordered-level visuals.
start()
b=''
for y,title,question in [(30,'Choice','Which queue?'),(158,'Score','How complete?'),(286,'Binary / Noul','Possible fraud?')]:
    b+=txt(20,y+22,title,27,TEAL,weight=600)+txt(230,y+22,question,24)+line(460,y+16,530,y+16)
b+=rect(555,10,220,55,MINT,TEAL)+txt(665,45,'Card dispute',22,TEAL,'middle',600)+txt(810,45,'Label + probabilities',20,MUTED)
for k,(label,opacity) in enumerate([('Low',False),('Partial',True),('Complete',False)]):
    b+=rect(555+k*173,138,162,62,TEAL if opacity else 'white',TEAL)+txt(636+k*173,177,label,21,'white' if opacity else MUTED,'middle',600)
b+=rect(555,280,340,22,'#dce5e8','#dce5e8',0)+rect(555,280,245,22,TEAL,TEAL,0)+txt(925,303,'0.72',31,TEAL,weight=600)+txt(555,337,'0',18,MUTED)+txt(895,337,'1',18,MUTED,'end')
visual(5,b,'Illustrative outputs. The bank validates probability quality on its own cases.','Choice selects a category. Score rates an ordered rubric. Binary or Noul returns a yes/no proposition probability; 0.72 here is illustrative.')

start()
b=node(25,35,250,90,'Language model','Plans and drafts')+node(25,245,250,90,'Classifier','Labels and signals',True)+path('M275 80 H350 V185 H410')+path('M275 290 H350 V185 H410')+node(420,135,270,100,'Bank policy','Permissions + limits',True)+line(690,185,790,185)+node(800,135,290,100,'Workflow gateway','Executes allowed steps')+txt(565,300,'Rules decide what is permitted',24,TEAL,'middle',600)+txt(950,300,'Core banking / case systems',20,MUTED,'middle')
visual(6,b,'Model outputs inform the workflow. Bank policy controls execution.','Language models and classifiers send proposals or signals to bank policy, which gates a workflow gateway and core systems.')

start()
b=''
for y,left,mid,right in [(25,'Varied language','Intent label','Correct queue'),(115,'Urgency signals','Review flag','Earlier attention'),(205,'Mixed complexity','Processing route','Appropriate resource'),(295,'Draft + evidence','Quality check','Less rework')]:
    b+=txt(25,y+37,left,25)+line(250,y+30,330,y+30)+node(345,y,350,67,mid,accent=True)+line(695,y+30,790,y+30)+txt(815,y+37,right,24,TEAL,weight=600)
visual(7,b,'Potential benefits must show up in measured workflow outcomes.','Four mappings show input, classifier output and desired workflow outcome. These are potential benefits, not tested results.')

# One message, multiple independent signals.
start()
b=txt(20,46,'“I don’t recognise this card payment,',32,INK,weight=600)+txt(20,91,'and my rent is due tomorrow.”',32,INK,weight=600)+line(20,122,1080,122,arrow=False)
for x,term,meaning in [(20,'Intent','Card dispute'),(305,'Risk signal','Possible fraud'),(590,'Urgency','Time pressure'),(875,'Evidence','Details missing')]:
    b+=line(x+95,145,x+95,211)+txt(x,250,term,19,MUTED)+txt(x,296,meaning,24,TEAL,weight=600)
visual(8,b,'A primary intent and independent flags can coexist.','One customer message yields a card-dispute intent, possible fraud signal, time pressure and missing evidence. These are illustrative interpretations, not model results.')

# A readable branching workflow with a clear authority boundary.
start()
b=node(20,147,230,100,'Case context','Message + evidence')+line(250,197,315,197)+node(330,147,235,100,'Classifier','Intent + uncertainty',True)+path('M565 197 H630 V87 H695')+path('M565 197 H630 V305 H695')
b+=txt(650,40,'Clear + supported',21,TEAL,weight=600)+node(710,53,380,90,'Apply dispute procedure','Prepare authorised specialist case')+txt(650,253,'Ambiguous / incomplete',21,AMBER,weight=600)+node(710,270,380,90,'Clarify or hand off','Ask for evidence / involve staff')
visual(9,b,'Refunds, card blocking and notifications still require their own permissions.','The classifier branches a case into supported processing or clarification and human review. Classifier confidence alone does not authorise financial actions.')

start()
b=node(20,32,255,75,'Registration','Company document')+node(20,142,255,75,'Address letter')+path('M275 70 H315 V145 H353')+path('M275 180 H315 V145 H353')+node(365,95,235,100,'Extract text','OCR if needed')+line(600,145,650,145)+node(665,95,240,100,'Classify','Type + relevance',True)+path('M905 145 H1050 V282 H740')+node(430,280,300,95,'Evidence checklist','Present / missing / review',True)+txt(20,333,'Bank due diligence',25,weight=600)+txt(20,368,'Authenticity and identity checks',19,MUTED)
visual(10,b,'Document classification helps organise evidence. It does not establish authenticity.','Documents feed text extraction, then classification of type and relevance, then an evidence checklist. Bank due diligence remains separate.')

start()
b=''
for x,title,sub in [(20,'Retrieve','Client documents'),(305,'Select','Relevant passages'),(590,'Draft','Credit memo'),(875,'Review','Banker judgement')]:
    b+=node(x,85,220,105,title,sub,title in ['Select','Review'])
    if x<875:b+=line(x+220,138,x+275,138)
b+=path('M700 190 V290 H400 V200',dash=True)+txt(660,330,'Classifier check: evidence gaps / unsupported claims',22,TEAL,'middle',600)
visual(11,b,'DBS reported a rollout to about 1,500 staff. This does not establish Jev usage.','Proposed credit assistant workflow: retrieve documents, select passages, draft a memo and review. A classifier checks evidence gaps and unsupported claims; DBS is a separate adoption example.')

start()
b=txt(20,42,'Lower action authority',22,TEAL,weight=600)+txt(1090,42,'Higher consequence',22,AMBER,'end',600)+line(20,72,1090,72)
for x,y,w,h,title,sub,color in [(20,245,245,85,'Triage','Route a service case',TEAL),(295,205,245,125,'Evidence','Flag missing items',TEAL),(570,165,245,165,'Credit support','Assist a reviewer',MUTED),(845,125,245,205,'Money / lending','Separate governed scope',AMBER)]:
    b+=rect(x,y,w,h,'#e8eff2' if color==MUTED else (PALE if color==AMBER else MINT),color,0)+txt(x+18,y+37,title,25,color,weight=600)+txt(x+18,y+69,sub,17,color)
visual(12,b,'Starting scope should match the bank’s data, workflow and risk appetite.','A qualitative staircase shows increasing action authority from routing through evidence checks and credit support to money or lending decisions. It is not a quantified risk ranking.')

# End-to-end bank-owned architecture with audit rail.
start()
b=txt(20,30,'BANK-CONTROLLED EXECUTION',17,MUTED,weight=600)+rect(10,50,1090,240,'#edf3f5','#c9d8de',0)
for x,w,title,sub,accent in [(30,180,'Context','Identity + data',False),(250,215,'Decision model','Labels + probabilities',True),(505,215,'Policy','Authority + limits',True),(760,315,'Tool gateway','Case / core systems',False)]:
    b+=node(x,115,w,100,title,sub,accent)
    if x<760:b+=line(x+w,165,x+w+32,165)
    b+=line(x+w/2,215,x+w/2,335,arrow=False,dash=True)
b+=rect(30,335,1045,58,INK,INK,0)+txt(552,372,'Audit trail: evidence, versions, policy outcome and action result',23,'white','middle')
visual(13,b,'The model has no direct core-banking credentials. Every action passes through policy.','Context enters the decision model, then policy, then a tool gateway. All stages feed an audit trail. The policy stage is the execution boundary.')

start()
b=txt(20,38,'One exclusive intent distribution',24,weight=600)
for y,label,value in [(90,'Card dispute',.86),(172,'Payment status',.10),(254,'Other',.04)]:
    b+=txt(20,y+24,label,22)+rect(260,y,500,33,'#e4ecef','#e4ecef',0)+rect(260,y,max(value*500,5),33,TEAL if value==.86 else '#8aa4af',TEAL if value==.86 else '#8aa4af',0)+txt(785,y+25,f'{value:.2f}',25,TEAL,weight=600)
b+=rect(895,76,195,252,MINT,TEAL)+txt(913,112,'Independent',20,TEAL,weight=600)+txt(913,140,'flags',20,TEAL,weight=600)+txt(913,190,'Fraud: 0.72',22)+txt(913,236,'Evidence:',20)+txt(913,269,'missing',22,weight=600)
visual(14,b,'Illustrative output, not benchmark data. Intent probabilities sum to one; independent flags do not.','A bar chart shows illustrative card dispute probability 0.86, payment status 0.10 and other 0.04. Separate flags show suspected fraud 0.72 and missing evidence.')

# Different implementation paths converge on a shared contract.
start()
b=''
for y,name,mechanism in [(15,'Jev / System One','State + typed questions'),(107,'Linear classifier','Text features + learned labels'),(199,'SetFit / encoder','Embeddings + classifier head'),(291,'Constrained LLM','Prompt + allowed output')]:
    b+=txt(20,y+25,name,25,TEAL,weight=600)+txt(20,y+54,mechanism,18,MUTED)+line(355,y+28,410,y+28)+path(f'M425 {y+28} H610 V195 H700')
b+=node(715,145,375,100,'Decision contract','Labels / scores / validation',True)
visual(15,b,'Different implementations can fill the same role. Probability semantics and deployment needs differ.','Four candidate approaches converge on a shared bank-owned decision contract. This is an architectural comparison, not a performance ranking.')

start()
b=node(20,140,235,105,'Your workflow','Data + constraints',True)
for y,condition,option in [(15,'Stable labels + examples','Linear / encoder classifier'),(145,'Changing questions','Jev / prompted LLM'),(275,'Extended reasoning','Reasoner + bounded checks')]:
    b+=path(f'M255 192 H310 V{y+46} H365')+txt(390,y+25,condition,21,MUTED)+txt(390,y+62,option,27,TEAL,weight=600)
b+=line(20,375,1095,375,arrow=False)+txt(550,405,'All options: approved data handling, deployment and licensing',21,MUTED,'middle')
visual(16,b,'A design heuristic. A bank benchmark determines the choice.','Workflow conditions suggest candidate model families. Stable labels suggest trained classifiers; changing questions suggest typed-question models or prompted LLMs; complex reasoning suggests a reasoner with checks.',h=430)

start()
b=txt(20,45,'Cases assigned a probability near 0.8',29,weight=600)
for k in range(10):
    x=60+k*106
    b+=f'<circle cx="{x}" cy="165" r="31" fill="{TEAL if k<8 else PALE}" stroke="{TEAL if k<8 else AMBER}" stroke-width="2"/>'
b+=path('M30 218 V236 H831 V218',arrow=False,color=TEAL)+txt(425,278,'About 8 in 10 satisfy the predicted event',26,TEAL,'middle',600)+txt(20,357,'Assess many comparable cases, including language and product segments.',23,MUTED)
visual(17,b,'Conceptual illustration of calibration, not a test result or guarantee for one case.','Ten dots illustrate calibration: among comparable cases with a predicted event probability around 0.8, about eight should satisfy that event. Calibration needs a sufficiently large representative evaluation.')

start()
b=txt(20,36,'Policy combines model evidence with the consequence of being wrong',24,weight=600)+node(20,130,250,110,'Model signals','Intent + uncertainty',True)+line(270,185,343,185)+node(355,130,255,110,'Bank policy','Rules + thresholds',True)
for y,title,sub,color in [(45,'Routine route','Validated and permitted',TEAL),(165,'Human review','Ambiguous or urgent',AMBER),(285,'Restricted action','Independent approval',INK)]:
    b+=path(f'M610 185 H675 V{y+36} H725')+rect(740,y,350,76,MINT if color==TEAL else (PALE if color==AMBER else '#e7edf0'),color)+txt(760,y+30,title,24,color,weight=600)+txt(760,y+59,sub,18,MUTED)
visual(18,b,'There is no universal “safe” probability cutoff. Thresholds follow the bank’s error costs and controls.','Policy maps model signals to routine routing, review, or separately authorised action based on validation and consequences, rather than a universal confidence threshold.')

start()
b=''
for x,n,title,sub in [(20,1,'Offline test','Errors + calibration'),(390,2,'Shadow run','Real cases + overrides'),(760,3,'Limited trial','Customer + cost outcomes')]:
    b+=dot(x+28,60,n)+txt(x,130,title,29,TEAL,weight=600)+txt(x,170,sub,21,MUTED)+rect(x,223,330,105,'white',LINE)+txt(x+18,258,['Same cases for all models','Staff retain control','Monitor and roll back'][n-1],21,weight=600)+txt(x+18,295,['Rare intents and segments','Log errors and exceptions','Count rework and misses'][n-1],19,MUTED)
    if x<760:b+=line(x+295,60,x+345,60)
visual(19,b,'Track urgent-case misses, error among automated cases and the capacity needed for review.','Three evaluation gates progress from offline tests to shadow deployment and then limited trials. Each gate evaluates the complete workflow and retains appropriate control.')

start()
b=txt(20,55,'Value per successfully completed case',34,TEAL,weight=600)
b+=txt(20,151,'Time saved',32,weight=600)+txt(20,197,'Correct routing + less rework',22,MUTED)+txt(435,155,'−',52,MUTED)+txt(515,151,'Total added effort',32,weight=600)+txt(515,197,'Model + review + exceptions',22,MUTED)
b+=line(20,247,1090,247,arrow=False)+txt(20,307,'Measure together',20,MUTED,weight=600)
for x,t in [(20,'Customer outcome'),(410,'Staff capacity'),(780,'IT cost + reliability')]:b+=txt(x,358,t,25,TEAL,weight=600)
visual(20,b,'A cheaper model call can still increase the cost of the workflow.','A qualitative value equation compares time saved with model, review and exception effort. Customer outcomes, staff capacity and IT reliability must be evaluated together.')

start()
b=''
for x,n,title,sub in [(20,1,'Choose','One narrow task'),(305,2,'Compare','Same real cases'),(590,3,'Observe','Alongside staff'),(875,4,'Limit','Routing + fallback')]:
    b+=dot(x+27,90,n)+txt(x,167,title,29,TEAL,weight=600)+txt(x,207,sub,20,MUTED)
    if x<875:b+=line(x+65,90,x+266,90)
b+=rect(20,282,1080,80,INK,INK,0)+txt(560,331,'Business owns the outcome. IT integrates. Risk challenges the evidence.',23,'white','middle')
visual(21,b,'Expand only when the complete workflow improves and the controls hold.','A four-stage adoption roadmap: choose a task, compare candidates, observe beside staff and allow limited routing with a fallback.')

start()
b=node(20,115,300,120,'Classifier','Produces a bounded judgment',True)+line(320,175,395,175)+node(410,115,300,120,'Bank policy','Determines what is allowed',True)+line(710,175,785,175)+node(800,115,300,120,'Agent workflow','Carries out the permitted step')+txt(560,320,'Jev is one implementation of the classifier role.',27,TEAL,'middle',600)
visual(22,b,'Useful automation requires all three, plus evidence that the workflow performs well.','Summary: a classifier produces a judgment, bank policy determines permissions, and an agent workflow performs the permitted step. Jev is one implementation of the classifier role.')
