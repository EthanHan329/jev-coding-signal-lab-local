# Jev and classifiers in agentic banking

35 minutes presenting + 5 minutes discussion. Slides 24–27 are optional appendices.

## 1. Jev and classifiers in agentic banking

Timing: 1 minute. The topic is adopting Jev and other models as classifiers within banking agent architectures. This is an introductory session, not a vendor selection or a proposal to train a foundation model. Plan 35 minutes of presentation and five minutes of discussion.



## 2. Today’s discussion

Timing: 1 minute. These section timings include the opening. Use the appendices only if questions require more depth. Avoid explaining the mathematics before the customer example.

Supporting detail: Time Topic Question 8 minutes The basic idea What does a classifier add to an agent? 10 minutes Banking examples Where can it improve a workflow? 12 minutes Architecture and model choices How does IT integrate and evaluate it? 5 minutes Adoption What would a sensible first step look like? 5 minutes Discussion Where does this fit in our bank?



## 3. An agent carries out a workflow

Timing: 1.5 minutes. This is a working definition. A chatbot mainly exchanges messages. An agent may also retrieve records, update a case or call a service. Autonomy varies by workflow. The bank chooses which actions are available and which require approval.

Supporting detail: A banking agent uses context and tools to work toward a defined objective. Understand the request. Gather permitted information. Choose and execute allowed steps. Check the result or ask for help. Example: investigate a card dispute, collect evidence and prepare a case for review.



## 4. A classifier answers a bounded question

Timing: 1.5 minutes. Classification maps an input to a defined category. Some models also return probabilities or multiple independent flags. A classifier can process a message, a document excerpt or the state of a workflow. The label set is a business design decision.

Supporting detail: “I don’t recognise this card payment.” The available labels might be card dispute, payment status, account access or other. Illustrative classification card_dispute The workflow uses this label to choose the next process.



## 5. What “Jev-like” means

Timing: 2 minutes. Jev documentation describes state plus typed questions and composable judgments. This proposal borrows the interface and operating pattern. A conventional classifier can implement a similar contract without reproducing Jev architecture. A bank must test calibration on its own target population. A completeness score is not a credit risk score.

Supporting detail: Primitive Banking question Result consumed by software Choice Which service queue fits this request? Allowed label + distribution over labels Score How complete is the evidence against a rubric? Distribution over ordered levels Noul / binary Does the text indicate suspected fraud? Probability for a yes/no proposition A probability describes a model judgment. Bank policy grants authority to act.

- [TypeSafe AI, Jev documentation](https://docs.typesafe.ai/introduction)
- [DigitalOcean, System One API](https://docs.digitalocean.com/products/inference/how-to/use-system-one-api/)

## 6. Different components do different jobs

Timing: 1 minute. Use deterministic rules where the decision is already explicit. Introduce a model where language or context makes rule maintenance difficult. The decision model complements an agent, but a complex planning task may still need a reasoning model. No component should infer customer authentication from conversational confidence.

Supporting detail: Component Useful role Boundary Rules and policy engine Enforce entitlements, limits and mandatory approvals Explicit, versioned bank policy Decision model Interpret ambiguous text and assign bounded labels Can abstain, misclassify or drift Reasoning / language model Plan a workflow, retrieve context and draft explanations Generated content needs evidence checks Workflow and tool gateway Execute approved operations and reconcile outcomes Authentication, idempotency and audit



## 7. Why put a classifier inside an agent?

Timing: 1 minute. These are candidate benefits, not guaranteed improvements. A wrong classifier can add transfers, delays or missed cases. The useful unit of measurement is the completed business process. A classifier call adds cost and latency too, so use it only where it improves the complete flow.

Supporting detail: Workflow need Classifier contribution Business outcome to measure Understand varied customer language Map messages to known intents Fewer avoidable transfers Spot cases needing attention Flag urgency or missing evidence Earlier specialist review Choose a suitable processing path Route simple and complex work separately Lower cost or faster completion Check an intermediate result Assess relevance or completeness Less rework Potential benefits depend on measured model performance and the surrounding workflow.



## 8. The first use case: service-request triage

Timing: 2 minutes. Ask the audience which queue they would choose. Then reveal the multiple signals: dispute, possible fraud, financial pressure and missing transaction evidence. Do not interpret rent urgency alone as proof of vulnerability. This is an illustrative scenario, not actual model output.

Supporting detail: “I don’t recognise this card payment, and my rent is due tomorrow.” One message can contain several signals. Primary intent: disputed card transaction. Urgency and vulnerability: assess separately. Missing evidence: verified transaction details. Policy outcome: route to an authorised specialist.



## 9. The same message, two possible paths

Timing: 2 minutes. Walk through both paths using the same customer request. An agent may collect facts and prepare a case, but refunds, card blocking and customer notifications require their own permissions. Re-run relevant judgments when material context changes, and limit loops and retries.

Supporting detail: Clear and supported Classify the intent. Fetch authorised transaction details. Apply the bank’s dispute procedure. Prepare the specialist case. Ambiguous or incomplete Ask a focused clarification. Avoid guessing the transaction. Route to a person when needed. Record the handoff and reason. The classifier changes the route. The bank’s workflow controls the action.



## 10. Example: onboarding evidence

Timing: 1.5 minutes. This is a proposed workflow. OCR or a multimodal component may first extract text; the cited Jev interface accepts text/state rather than images. Authoritative checks still establish identity and regulatory sufficiency. Document classification cannot establish authenticity. Measure rework and overlooked evidence, not just category accuracy.

Supporting detail: A business customer uploads a registration document and an address letter. Classifier tasks Identify each document type. Assess relevance to the requested evidence. Flag inconsistency for review. Useful outcome: a clearer missing-evidence checklist and fewer repeated requests.

- [DigitalOcean, System One API](https://docs.digitalocean.com/products/inference/how-to/use-system-one-api/)

## 11. Example: a relationship manager’s assistant

Timing: 1.5 minutes. The proposed classifier roles are our architecture examples. DBS describes specialised agents preparing review-ready memo drafts and human bankers deepening the assessment. Do not attribute our classifier architecture or Jev usage to DBS. Credit approval remains a separate governed decision.

Supporting detail: “Prepare the client’s annual credit review.” Classifier tasks Select relevant retrieved passages. Identify evidence gaps. Route unsupported draft claims for review. DBS reported an agentic credit-memo drafting rollout to about 1,500 staff in August 2026. It is an adoption example, not evidence that DBS uses Jev.

- [DBS, corporate credit memo rollout, 19 Aug 2026](https://www.dbs.com/newsroom/DBS_scales_agentic_AI_to_transform_way_of_working_for_corporate_bankers_freeing_up_time_for_more_strategic_client_engagements)

## 12. Where classifiers can help first

Timing: 2 minutes. KYC completeness does not establish identity or replace due diligence. Credit document checking does not approve credit. Payment authority and lending decisions require their own business, legal and validation case. Prioritisation should reward repeatable judgments and clear labels, not just theoretical cost savings.

Supporting detail: Use case Business measure Possible starting scope Service triage Routing accuracy, urgent-case recall, handling time Recommend queue, then limited automatic routing KYC evidence completeness Rework and evidence collection time Flag missing items for review Credit-memo evidence checks Unsupported claims and review time Assist the credit reviewer Payment / lending decisions Loss, customer harm and decision quality Outside initial autonomous scope Illustrative portfolio. Local workflow volume, risk and data availability determine priority.



## 13. The control path

Timing: 2 minutes. Proposed logical architecture. The model has no direct core banking credentials. Keep untrusted customer text separate from policy and system instructions. Restrict tools by principal and workflow state. Store sensitive evidence under bank retention and access rules. Use fail-closed behaviour for policy failure and route unavailable model cases to an existing manual queue.

Supporting detail: Stage What happens Accountable component 1. Context Authenticate caller, minimise data, fetch permitted evidence Identity and data services 2. Judgment Classify intent and independent risk signals Versioned decision model 3. Policy Apply permissions, thresholds and mandatory escalation Bank policy engine 4. Action Route case or request human approval Workflow and tool gateway 5. Evidence Record versions, inputs, outcome and overrides Audit and monitoring Every tool call passes through policy checks, including calls proposed by a reasoning agent.



## 14. One judgment, one explicit contract

Timing: 1.5 minutes. This is an illustrative bank-owned adapter contract, not a verbatim Jev API response. The missing-evidence Boolean can come from deterministic required-field checks. Probabilities for exclusive intent labels sum to one, while independent flags need not. Preserve raw responses for governed diagnostics when retention permits. Model-provided explanation text is not a substitute for a traceable evidence reference.

Supporting detail: {
  "intent": {
    "card_dispute": 0.86,
    "payment_status": 0.10,
    "other": 0.04
  },
  "suspected_fraud": 0.72,
  "missing_evidence": true
} Illustrative output, not a test result Separate mutually exclusive intent labels from independent flags. Include unknown and out-of-scope outcomes. Attach model, question, taxonomy and calibration versions. Validate the response before policy evaluation.



## 15. Jev is one option in a broader toolkit

Timing: 2 minutes. Jev supports Choice, Score and Noul. SetFit is a framework for adapting Sentence Transformers with a classifier. scikit-learn documents sparse text classification. Qwen documents structured outputs using vLLM. These approaches differ in training, serving and output semantics. Do not equate a framework with a model checkpoint or make unsupported claims that one is fastest or cheapest.

Supporting detail: Approach How it classifies Main consideration Jev / System One Typed questions against supplied state Validate native probabilities on bank cases Text features + linear classifier Learns labels from labelled text Useful baseline for stable taxonomies Sentence Transformer / SetFit Embeddings plus a trained classification head Needs representative labels and calibration LLM with constrained output, e.g. Qwen Prompts map context to allowed output labels Valid JSON does not establish correctness These are candidate approaches, not a ranked benchmark.

- [TypeSafe AI, Jev documentation](https://docs.typesafe.ai/introduction)
- [Hugging Face, SetFit documentation](https://huggingface.co/docs/setfit/main/index)
- [scikit-learn, text classification examples](https://scikit-learn.org/stable/auto_examples/text/index.html)
- [Qwen, structured output with vLLM](https://qwen.readthedocs.io/en/v3.0/deployment/vllm.html)

## 16. The right choice depends on the workflow

Timing: 1.5 minutes. This table is a design heuristic, not a performance claim. Data availability, language, licensing and hosting constraints can reverse the choice. Verify vendor residency, retention, model versioning, SLA and exit arrangements. No claim is made that Jev supports an on-premise deployment.

Supporting detail: Situation Options worth testing Stable labels and enough historical examples Conventional classifier or a fine-tuned encoder Questions change and labelled data are limited Jev-style typed questions or a prompted LLM Long, ambiguous evidence requires reasoning Reasoning model with bounded checks and human escalation Data must remain in a controlled environment Approved deployment of a suitable licensed model Compare accuracy, calibration, latency, total cost and deployment fit on the same cases.



## 17. Probability needs validation before automation

Timing: 1.5 minutes. Calibration is an aggregate statistical property, not a guarantee for an individual case. A high confidence score cannot establish authorisation or eliminate correlated errors. Guo et al. show that modern neural networks can be poorly calibrated and evaluate temperature scaling. Post-hoc calibration must use held-out data, with final evaluation on a separate test set. A binary probability and a vendor confidence field need not have the same semantics.

Supporting detail: Among comparable cases scored near 0.8, about 80% should satisfy the predicted event. Bank validation Measure calibration on untouched, representative cases. Check language, product and customer segments. Measure error versus automation coverage. Recheck after model or population changes.

- [Guo et al., On Calibration of Modern Neural Networks, ICML 2017](https://proceedings.mlr.press/v70/guo17a.html)

## 18. Thresholds follow the cost of mistakes

Timing: 1.5 minutes. There is no universal safe cutoff such as 0.95. Choose operating points using error costs, uncertainty bounds, service capacity and the bank’s risk appetite. Abstention routes cases to a staffed process, not an unowned backlog. High recall is meaningful only with precision, volume and reviewer capacity alongside it.

Supporting detail: Decision Primary concern Proposed policy Suspected fraud signal Missing a genuine urgent case Tune recall and escalate ambiguous cases Routine queue assignment Avoidable transfer and rework Automate only in validated segments Missing required evidence Proceeding with an incomplete record Enforce explicit evidence checks A money-moving action Unauthorised or incorrect execution Require independent bank controls and approvals Choose thresholds on validation data. Release only after the risk owner accepts measured residual error.



## 19. How the bank knows it is helping

Timing: 2 minutes. Compare candidates on the same frozen dataset and workflow. Repeated stable outputs do not prove correctness or calibration. Include schema failure, empty output, prompt injection and distribution shift. For rare harmful errors, report sample size and uncertainty bounds instead of declaring safety from zero observed failures. Validation should be independent of the team selecting the model.

Supporting detail: Dimension Evidence required Decision quality Per-class precision and recall, confusion matrix, urgent-case misses Probability quality Brier score or log loss, reliability plots and subgroup calibration Automation safety Error among automated cases, abstention rate, override outcomes Operational reliability End-to-end p95 latency, timeouts, throughput and recovery Economics Cost per correctly completed case, rework and reviewer load Targets and confidence bounds require agreement before testing. Aggregate accuracy alone is insufficient.



## 20. Benefits appear in the whole workflow

Timing: 1.5 minutes. Compare against the current workflow, including staff time, review and exception costs. Separate released capacity from realised cash savings. Measure before and after with comparable cases and clear denominators. Avoid importing vendor benchmark speed or price ratios into a banking ROI claim.

Supporting detail: Business measures Time to the correct queue. Staff time spent on avoidable rework. Urgent cases found and missed. Customer completion and complaints. IT measures Cost per successful case. End-to-end response time. Model and service failure rates. Manual fallback and recovery. A cheaper model call has little value if it creates more manual work.



## 21. A practical way to begin

Timing: 1 minute. This is a possible adoption path, not a budget request. Start with an existing manual process and clear ownership. Keep customer-impacting actions under existing authorisation. Expand only after evidence supports it. Timelines depend on data access, integration and review.

Supporting detail: Step What the team learns Choose one narrow workflow Which judgment causes friction today? Compare candidates offline Can a classifier improve on existing routing? Run alongside staff Does performance hold on real incoming cases? Allow limited routing with a fallback Does the entire workflow improve safely? Business defines the outcome and exceptions. IT provides integration and measurement. Risk teams challenge the evidence.



## 22. What to remember

Timing: 1 minute. The main concept is a bounded judgment service within a larger banking architecture. A model output can inform the next step, while the bank retains control over execution. No classifier is automatically suitable for every banking decision.

Supporting detail: Classifiers give agents usable judgments at specific points in a workflow. Jev packages those judgments as typed outputs with probabilities. Other classification models can fill the same architectural role. Bank policy, validation and operations determine whether the result is useful.



## 23. Discussion

Timing: 5 minutes. Capture candidate workflows and the decision owner. Keep the conversation on narrow judgments that can be labelled and evaluated. Use the appendix if the discussion turns to financial value, data quality or controls.



## 24. Appendix: The data advantage comes from adjudicated decisions

Optional appendix; outside the 40-minute running order. Do not treat past staff actions as perfect ground truth. They can encode inconsistent policy and unequal treatment. Build a label guide and adjudicate disagreements. Sensitive attributes may be needed for controlled fairness evaluation where legally permitted, but should not casually become model inputs. Dataset size follows class frequency, learning curves and the precision needed for the release claim.



## 25. Appendix: The business case depends on workflow savings

Optional appendix; outside the 40-minute running order. Arithmetic: 100,000 × 0.40 × 3/60 × $30 = $60,000. Net = $60,000 − $20,000. At 20% share, net is $10,000; at 60%, $70,000, holding other assumptions fixed. Break-even share is 13.3% before build costs and losses. Rework and exception handling must be included in net minutes or operating costs without double counting. Exclude speculative avoided fraud losses. Add one-time data, integration and validation investment to the actual approval case.



## 26. Appendix: failure and recovery

Optional appendix; outside the 40-minute running order. These are proposed controls and test scenarios, not demonstrated guarantees. A classifier alone is not a reliable security perimeter against prompt injection. Test the complete agent, gateway and workflow. For actions without clean rollback, prevention and approval are essential. Maintain an incident owner, kill switch and a rehearsed manual continuity process.



## 27. Appendix: sources

Sources reviewed 29 September 2026. Vendor documentation supports interface and implementation descriptions, not independent banking performance. DBS supplies a bank-reported adoption example. All workflow examples, integration recommendations and economic assumptions are illustrative. No model was trained or benchmarked for this presentation.

