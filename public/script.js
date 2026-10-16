const state = {
  approach: "unsorted",
  patients: [],
  steps: [],
  currentStep: 0,
  nextId: 1,
  nextSeq: 1,
  busy: false
};
const approachInfo = {
  unsorted: {
    title: "Unsorted Array",
    subtitle: "Patients stay in insertion order until Pop scans for the highest priority.",
    caption: "Array positions are shown from left to right."
  },
  linked: {
    title: "Sorted Linked List",
    subtitle: "Patients are kept in ascending priority order, with the most urgent patient at the head.",
    caption: "Each patient is a node. Arrows show the next pointer from one node to another."
  },
  heap: {
    title: "Binary Min-Heap",
    subtitle: "The highest-priority patient stays at the root. Push and Pop restore the heap property.",
    caption: "The tree shows parent-child relationships; the array below shows the heap's internal order."
  }
};

const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, ch => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[ch]));
function makePatient(name, priority) {
  return {
    id: `p${state.nextId++}`,
    seq: state.nextSeq++,
    name: name.trim(),
    priority: Number(priority)
  };
}
function currentSnapshot() {
  return state.steps[state.currentStep] || {
    title: "Ready",
    description: "Choose an operation to begin.",
    patients: state.patients,
    highlights: [],
    structure: state.approach === "linked" ? "linked-list" : state.approach
  };
}
function setResult(message, kind = "") {
  const box = $("operation-result");
  box.textContent = message;
  box.className = `operation-result ${kind}`.trim();
}
function patientCard(patient, index, highlights, structure) {
  const isScanning = highlights.includes(patient.id) && !isLastHighlight(patient.id, highlights);
  const isSelected = highlights.length > 0 && highlights[highlights.length - 1] === patient.id;
  let cls = "patient-node";
  if (isScanning) cls += " is-scanning";
  if (isSelected) cls += " is-selected";
  const initial = (patient.name || "P").trim().charAt(0).toUpperCase();
  const indexText = structure === "linked-list" ? `Node ${index}` : structure === "heap" ? `Heap index ${index}` : `Index ${index}`;
  return `<div class="${cls}" title="${escapeHtml(patient.name)} — priority ${patient.priority}">
    <span class="node-index">${index}</span>
    <div class="node-avatar">${escapeHtml(initial)}</div>
    <div class="node-name">${escapeHtml(patient.name)}</div>
    <span class="priority-chip priority-${patient.priority}">Priority ${patient.priority}</span>
    <span class="node-index-label">${indexText}</span>
  </div>`;
}
function isLastHighlight(id, highlights) {
  return highlights.length > 0 && highlights[highlights.length - 1] === id;
}
function renderArray(patients, highlights, structure) {
  if (!patients.length) return emptyMarkup();
  return `<div class="array-layout">${patients.map((p, i) => patientCard(p, i, highlights, structure)).join("")}</div>`;
}
function renderLinked(patients, highlights) {
  if (!patients.length) return emptyMarkup();
  return `<div class="linked-layout"><span class="head-label">HEAD →</span>${patients.map((p, i) =>
    `<div class="linked-node-wrap">${patientCard(p, i, highlights, "linked-list")}${i < patients.length - 1 ? '<span class="node-arrow">→</span>' : '<span class="node-arrow">→ NULL</span>'}</div>`
  ).join("")}</div>`;
}
function renderHeap(patients, highlights) {
  if (!patients.length) return emptyMarkup();
  const n = patients.length;
  const width = 570, height = 220;
  const positions = [];
  const maxLevel = Math.floor(Math.log2(n));
  for (let i = 0; i < n; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const firstAtLevel = (2 ** level) - 1;
    const slot = i - firstAtLevel;
    const slots = 2 ** level;
    const x = ((slot + 0.5) / slots) * width;
    const y = 28 + level * (maxLevel === 0 ? 0 : Math.min(68, 160 / maxLevel));
    positions.push({ x, y });
  }
  let lines = "";
  for (let i = 1; i < n; i++) {
    const parent = Math.floor((i - 1) / 2);
    lines += `<line x1="${positions[parent].x / width * 100}%" y1="${positions[parent].y}" x2="${positions[i].x / width * 100}%" y2="${positions[i].y}"></line>`;
  }
  const nodes = patients.map((p, i) => {
    const pos = positions[i];
    const card = patientCard(p, i, highlights, "heap");
    return `<div class="heap-node" style="left:${pos.x / width * 100}%;top:${pos.y}px">${card}</div>`;
  }).join("");
  const heapArray = patients.map((p, i) => `<span class="heap-cell">[${i}] <strong>${escapeHtml(p.name)}</strong> · P${p.priority}</span>`).join("");
  return `<div class="heap-layout"><div class="heap-tree"><svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${lines}</svg>${nodes}</div><span class="heap-array-label">HEAP ARRAY REPRESENTATION</span><div class="heap-array">${heapArray}</div></div>`;
}
function emptyMarkup() {
  return `<div class="empty-state"><span class="empty-icon">＋</span><strong>Your queue is empty</strong><p>Load the example or add a patient to begin.</p></div>`;
}
function renderTable() {
  const body = $("steps-table-body");
  if (!state.steps.length) {
    body.innerHTML = `<tr class="table-empty"><td colspan="3">Your operation history will appear here.</td></tr>`;
    return;
  }
  body.innerHTML = state.steps.map((step, index) => `<tr class="${index === state.currentStep ? "active-row" : ""}" data-step-row="${index}">
    <td>${index + 1}</td><td>${escapeHtml(step.title)}</td><td>${escapeHtml(step.description)}</td>
  </tr>`).join("");
  const active = body.querySelector(".active-row");
  if (active) active.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
function render() {
  const info = approachInfo[state.approach];
  $("visual-title").textContent = info.title;
  $("visual-subtitle").textContent = info.subtitle;
  $("structure-caption").textContent = info.caption;
  document.querySelectorAll(".approach-option").forEach(button => {
    const active = button.dataset.approach === state.approach;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const step = currentSnapshot();
  const visiblePatients = step.patients || state.patients;
  const structure = step.structure || (state.approach === "linked" ? "linked-list" : state.approach);
  const highlights = step.highlights || [];
  $("patient-count").textContent = visiblePatients.length;
  if (structure === "linked-list") $("structure-view").innerHTML = renderLinked(visiblePatients, highlights);
  else if (structure === "heap") $("structure-view").innerHTML = renderHeap(visiblePatients, highlights);
  else $("structure-view").innerHTML = renderArray(visiblePatients, highlights, "array");
  $("current-step").textContent = state.steps.length ? state.currentStep + 1 : 0;
  $("total-steps").textContent = state.steps.length;
  $("step-title").textContent = step.title || "No operation yet";
  $("step-description").textContent = step.description || "Push a patient, load the example, or select Pop / Peek to see the algorithm in action.";
  $("step-progress-fill").style.width = state.steps.length > 1 ? `${(state.currentStep / (state.steps.length - 1)) * 100}%` : (state.steps.length ? "100%" : "0%");
  $("previous-step").disabled = !state.steps.length || state.currentStep <= 0;
  $("next-step").disabled = !state.steps.length || state.currentStep >= state.steps.length - 1;
  renderTable();
}
async function perform(action, newPatient = null) {
  if (state.busy) return;
  state.busy = true;loadSample
  setResult("Running the Python algorithm…");
  ["pop-button", "peek-button", "load-sample", "clear-all"].forEach(id => $(id).disabled = true);
  try {
    const response = await fetch("/api/operate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approach: state.approach,
        action,
        patients: state.patients,
        new_patient: newPatient
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The operation could not be completed.");
    state.patients = data.patients;
    state.steps = data.steps;
    state.currentStep = Math.max(0, data.steps.length - 1);
    setResult(data.message, data.message.toLowerCase().includes("empty") ? "warning" : "success");
    render();
  } catch (error) {
    setResult(error.message || "Something went wrong. Please try again.", "error");
  } finally {
    state.busy = false;
    ["pop-button", "peek-button", "load-sample", "clear-all"].forEach(id => $(id).disabled = false);
  }
}
async function loadSample() {
  if (state.busy) return;

  state.busy = true;
  state.nextId = 1;
  state.nextSeq = 1;
  state.patients = [];
  state.steps = [];
  state.currentStep = 0;

  const samplePatients = [
    makePatient("Patient A", 3),
    makePatient("Patient B", 1),
    makePatient("Patient C", 2),
    makePatient("Patient D", 1)
  ];

  const allSteps = [];

  ["pop-button", "peek-button", "load-sample", "clear-all"].forEach(
    id => {
      const element = $(id);
      if (element) element.disabled = true;
    }
  );

  setResult("Loading example patients...", "success");
  render();

  try {
    for (const patient of samplePatients) {
      const response = await fetch("/api/operate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approach: state.approach,
          action: "push",
          patients: state.patients,
          new_patient: patient
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load the example.");
      }

      state.patients = data.patients;
      allSteps.push(...(data.steps || []));
    }

    state.steps = allSteps;
    state.currentStep = 0;

    setResult("Example loaded! Click Next to follow the insertion steps.", "success");
    render();

  } catch (error) {
    console.error("Load Example failed:", error);
    setResult(error.message || "Could not load the example.", "error");

  } finally {
    state.busy = false;

    ["pop-button", "peek-button", "load-sample", "clear-all"].forEach(
      id => {
        const element = $(id);
        if (element) element.disabled = false;
      }
    );
  }
}
function clearAll() {
  state.patients = [];
  state.steps = [];
  state.currentStep = 0;
  setResult("Queue cleared. Add a patient or load the example to begin.");
  render();
}
$("patient-form").addEventListener("submit", async event => {
  event.preventDefault();
  const name = $("patient-name").value.trim();
  const priority = Number($("patient-priority").value);
  if (!name) {
    setResult("Enter a patient name or ID first.", "error");
    return;
  }
  const patient = makePatient(name, priority);
  $("patient-name").value = "";
  await perform("push", patient);
  $("patient-name").focus();
});
function normalizePatientsForApproach() {
  // Restore arrival order for the unsorted array. A priority-sorted sequence is
  // also a valid min-heap layout, and gives the heap a valid root before operations.
  if (state.approach === "unsorted") {
    state.patients = [...state.patients].sort((a, b) => a.seq - b.seq);
  } else {
    state.patients = [...state.patients].sort((a, b) => a.priority - b.priority || a.seq - b.seq);
  }
}
document.querySelectorAll(".approach-option").forEach(button => {
  button.addEventListener("click", () => {
    state.approach = button.dataset.approach;
    normalizePatientsForApproach();
    state.steps = [];
    state.currentStep = 0;
    setResult(`Selected ${approachInfo[state.approach].title}. Choose an operation to see its steps.`);
    render();
  });
});
$("pop-button").addEventListener("click", () => perform("pop"));
$("peek-button").addEventListener("click", () => perform("peek"));
$("load-sample").addEventListener("click", () => {
  console.log("Load Example button clicked");
  loadSample();
});
$("clear-all").addEventListener("click", clearAll);
$("previous-step").addEventListener("click", () => {
  if (state.currentStep > 0) {
    state.currentStep--;
    render();
  }
});
$("next-step").addEventListener("click", () => {
  if (state.currentStep < state.steps.length - 1) {
    state.currentStep++;
    render();
  }
});
render();