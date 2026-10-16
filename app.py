from flask import Flask, jsonify, render_template, request
from copy import deepcopy

# Vercel serves files from /public through its CDN. Locally, Flask also serves
# the same directory at /style.css and /script.js.
app = Flask(__name__, static_folder="public", static_url_path="")


@app.get("/")
def home():
    return render_template("index.html")


def patient_label(p):
    return f"{p.get('name', 'Patient')} (P{p.get('priority', '?')})"


def order_key(p):
    # Lower priority number means more urgent; sequence preserves FIFO for ties.
    return (int(p["priority"]), int(p.get("seq", 0)))


def snapshot(title, description, patients, highlights=None, structure=None):
    return {
        "title": title,
        "description": description,
        "patients": deepcopy(patients),
        "highlights": highlights or [],
        "structure": structure or "array",
    }


def operate_unsorted(patients, action, new_patient=None):
    items = deepcopy(patients)
    steps = [snapshot("Ready", "Current unsorted array before the operation.", items, structure="array")]

    if action == "push":
        if not new_patient:
            raise ValueError("Enter a patient name and priority first.")
        items.append(deepcopy(new_patient))
        steps.append(snapshot("Push", f"Append {patient_label(new_patient)} at the end of the array.", items,
                              [new_patient["id"]], "array"))
        message = f"Inserted {patient_label(new_patient)} at the end."
        result = None

    elif action in ("pop", "peek"):
        if not items:
            steps.append(snapshot("Empty queue", "There are no patients to process.", items, structure="array"))
            return items, steps, "The queue is empty.", None

        best_index = 0
        steps.append(snapshot("Start scan", "Assume the first patient has the highest priority.", items,
                              [items[0]["id"]], "array"))
        for i in range(1, len(items)):
            steps.append(snapshot("Scan", f"Compare {patient_label(items[i])} with the current best patient {patient_label(items[best_index])}.",
                                  items, [items[i]["id"], items[best_index]["id"]], "array"))
            if order_key(items[i]) < order_key(items[best_index]):
                best_index = i
                steps.append(snapshot("New highest priority", f"{patient_label(items[best_index])} becomes the current best.", items,
                                      [items[best_index]["id"]], "array"))

        chosen = items[best_index]
        if action == "peek":
            steps.append(snapshot("Peek result", f"Highest-priority patient is {patient_label(chosen)}. The queue is unchanged.",
                                  items, [chosen["id"]], "array"))
            message = f"Peek: {patient_label(chosen)}. No patient was removed."
            result = chosen
        else:
            steps.append(snapshot("Remove patient", f"Remove {patient_label(chosen)} from index {best_index}.",
                                  items, [chosen["id"]], "array"))
            items.pop(best_index)
            steps.append(snapshot("Pop complete", "The patient has been removed. The remaining array keeps its current order.", items,
                                  structure="array"))
            message = f"Treated/removed {patient_label(chosen)}."
            result = chosen
    else:
        raise ValueError("Unsupported operation.")

    return items, steps, message, result


class PatientNode:
    """A genuine singly linked-list node for the sorted-list approach."""
    def __init__(self, patient, next_node=None):
        self.patient = deepcopy(patient)
        self.next = next_node


def build_linked_list(patients):
    head = None
    tail = None
    for patient in sorted(deepcopy(patients), key=order_key):
        node = PatientNode(patient)
        if head is None:
            head = node
        else:
            tail.next = node
        tail = node
    return head


def linked_list_snapshot(head):
    items = []
    current = head
    while current is not None:
        items.append(deepcopy(current.patient))
        current = current.next
    return items


def operate_sorted_linked_list(patients, action, new_patient=None):
    head = build_linked_list(patients)
    steps = [snapshot("Ready", "The sorted linked list keeps the highest-priority patient at HEAD.",
                      linked_list_snapshot(head), structure="linked-list")]

    if action == "push":
        if not new_patient:
            raise ValueError("Enter a patient name and priority first.")
        node = PatientNode(new_patient)
        if head is None or order_key(node.patient) < order_key(head.patient):
            node.next = head
            head = node
            steps.append(snapshot("Insert at head", "The new node becomes HEAD because it belongs before the current head.",
                                  linked_list_snapshot(head), [node.patient["id"]], "linked-list"))
        else:
            previous = head
            current = head.next
            while current is not None and order_key(current.patient) <= order_key(node.patient):
                steps.append(snapshot("Traverse list", f"Compare {patient_label(node.patient)} with node {patient_label(current.patient)}.",
                                      linked_list_snapshot(head), [current.patient["id"], node.patient["id"]], "linked-list"))
                previous = current
                current = current.next
            previous.next = node
            node.next = current
            steps.append(snapshot("Insert node", f"Link {patient_label(node.patient)} after {patient_label(previous.patient)}.",
                                  linked_list_snapshot(head), [node.patient["id"]], "linked-list"))
        return linked_list_snapshot(head), steps, f"Inserted {patient_label(new_patient)} in priority order.", None

    if action not in ("pop", "peek"):
        raise ValueError("Unsupported operation.")
    if head is None:
        steps.append(snapshot("Empty queue", "There are no patients to process.", [], structure="linked-list"))
        return [], steps, "The queue is empty.", None

    chosen = deepcopy(head.patient)
    steps.append(snapshot("Head node", f"HEAD contains {patient_label(chosen)}, the highest-priority patient.",
                          linked_list_snapshot(head), [chosen["id"]], "linked-list"))
    if action == "peek":
        return linked_list_snapshot(head), steps, f"Peek: {patient_label(chosen)}. No patient was removed.", chosen

    head = head.next  # actual linked-list head pointer update
    steps.append(snapshot("Pop complete", f"Remove the former head. New HEAD: {patient_label(head.patient) if head else 'NULL'}.",
                          linked_list_snapshot(head), structure="linked-list"))
    return linked_list_snapshot(head), steps, f"Treated/removed {patient_label(chosen)}.", chosen


def operate_min_heap(patients, action, new_patient=None):
    heap = deepcopy(patients)
    steps = [snapshot("Ready", "The heap root contains the highest-priority patient; parent priority is no greater than child priority.",
                      heap, structure="heap")]

    if action == "push":
        if not new_patient:
            raise ValueError("Enter a patient name and priority first.")
        heap.append(deepcopy(new_patient))
        child = len(heap) - 1
        steps.append(snapshot("Append at end", f"Place {patient_label(new_patient)} in the next available heap position.",
                              heap, [new_patient["id"]], "heap"))
        while child > 0:
            parent = (child - 1) // 2
            steps.append(snapshot("Compare with parent", f"Compare {patient_label(heap[child])} with parent {patient_label(heap[parent])}.",
                                  heap, [heap[child]["id"], heap[parent]["id"]], "heap"))
            if order_key(heap[child]) < order_key(heap[parent]):
                heap[child], heap[parent] = heap[parent], heap[child]
                steps.append(snapshot("Sift up", "Swap the child with its parent to restore heap order.", heap,
                                      [heap[parent]["id"], heap[child]["id"]], "heap"))
                child = parent
            else:
                break
        message = f"Inserted {patient_label(new_patient)} into the min-heap."
        result = None

    elif action in ("pop", "peek"):
        if not heap:
            steps.append(snapshot("Empty queue", "There are no patients to process.", heap, structure="heap"))
            return heap, steps, "The queue is empty.", None
        chosen = deepcopy(heap[0])
        steps.append(snapshot("Heap root", f"The root is the highest-priority patient: {patient_label(chosen)}.",
                              heap, [chosen["id"]], "heap"))
        if action == "peek":
            message = f"Peek: {patient_label(chosen)}. No patient was removed."
            result = chosen
        else:
            last = heap.pop()
            if heap:
                heap[0] = last
                steps.append(snapshot("Move last node to root", "Move the last heap element to the root, then sift it down.",
                                      heap, [heap[0]["id"]], "heap"))
                parent = 0
                while True:
                    left = 2 * parent + 1
                    right = 2 * parent + 2
                    smallest = parent
                    if left < len(heap) and order_key(heap[left]) < order_key(heap[smallest]):
                        smallest = left
                    if right < len(heap) and order_key(heap[right]) < order_key(heap[smallest]):
                        smallest = right
                    if smallest == parent:
                        break
                    steps.append(snapshot("Sift-down comparison", "Compare the parent with its smaller-priority-number child.",
                                          heap, [heap[parent]["id"], heap[smallest]["id"]], "heap"))
                    heap[parent], heap[smallest] = heap[smallest], heap[parent]
                    steps.append(snapshot("Sift down", "Swap to restore the min-heap property.", heap,
                                          [heap[parent]["id"], heap[smallest]["id"]], "heap"))
                    parent = smallest
            steps.append(snapshot("Pop complete", f"Removed {patient_label(chosen)} and restored heap order.", heap,
                                  structure="heap"))
            message = f"Treated/removed {patient_label(chosen)}."
            result = chosen
    else:
        raise ValueError("Unsupported operation.")

    return heap, steps, message, result


@app.post("/api/operate")
def api_operate():
    payload = request.get_json(silent=True) or {}
    approach = payload.get("approach", "unsorted")
    action = payload.get("action")
    patients = payload.get("patients", [])
    new_patient = payload.get("new_patient")

    if not isinstance(patients, list):
        return jsonify(error="Patient list must be a list."), 400

    try:
        if approach == "unsorted":
            updated, steps, message, result = operate_unsorted(patients, action, new_patient)
        elif approach == "linked":
            updated, steps, message, result = operate_sorted_linked_list(patients, action, new_patient)
        elif approach == "heap":
            updated, steps, message, result = operate_min_heap(patients, action, new_patient)
        else:
            return jsonify(error="Choose a valid approach."), 400

        return jsonify(patients=updated, steps=steps, message=message, result=result)
    except (ValueError, KeyError, TypeError) as exc:
        return jsonify(error=str(exc)), 400


@app.get("/api/health")
def health():
    return jsonify(status="ok", app="Emergency Room Priority Queue Visualizer")


if __name__ == "__main__":
    app.run(debug=True)
