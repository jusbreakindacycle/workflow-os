# Competitive and Technology Landscape

This document captures the strategic lesson from the Phase 0 research rather than attempting to reproduce every vendor feature.

## Integration / automation engines

### Zapier / Make
Strong managed SaaS integration breadth and fast business automation. Useful execution targets/connectivity sources, but Workflow OS should not depend on their proprietary workflow representation as its canonical model.

### n8n
Strong low-code/self-hosted workflow automation with AI capabilities and production execution features. Suitable for personal/client-owned deployments. Licensing must be re-checked before any model that centrally hosts/manages client workflows and integrations as a service.

### Activepieces
Open-source-focused automation platform with self-hosting, AI/MCP capabilities, integrations, queue-backed workers, and an extensible core. A strong candidate for the first execution-engine spike.

### Pipedream
Developer-oriented workflows and broad managed integration/tool access, including MCP-oriented connectivity. Useful as a connector/tool substrate or execution target.

## Enterprise orchestration

### Camunda
BPMN/process orchestration is a useful reference for long-running processes, human tasks, retries/incidents, and governing AI-agent behavior inside deterministic process structure.

### UiPath
RPA plus human/agent/process orchestration demonstrates why browser/desktop work is a distinct execution class rather than something the Workflow OS control plane should reinvent.

### Workato
Enterprise orchestration validates the broader category of coordinating systems, people, and AI rather than viewing integration as isolated trigger/action recipes.

## Durable / agent runtimes

### Temporal
Reference architecture for durable code-first workflows where crash/network recovery and long-running state are core requirements.

### LangGraph
Reference for stateful agent reasoning, checkpointing, and human interrupts. It is not a substitute for broad integration or business-process governance.

## Process intelligence

### Celonis
Process/task mining demonstrates that workflow discovery can eventually use observed process data, but building a process-mining platform is outside MVP.

## Strategic conclusion

No single system is the universal executor. Workflow OS should preserve a portable workflow model and route execution to the appropriate class of engine.

The custom defensible layer is:

1. normalized Workflow IR;
2. discovery/feasibility/risk reasoning;
3. engine routing and capability validation;
4. tests/evaluations;
5. cross-engine policy and observability;
6. safe reusable templates;
7. workflow-to-ROI measurement.
