
# Patient Priority Queue Visualizer

An interactive educational web application demonstrating and comparing three implementations of a Priority Queue using Python and Data Structures and Algorithms (DSA).

The project visualizes how patients are prioritized and processed using three different approaches: an Unsorted Array, a Sorted Linked List, and a Binary Min-Heap. It combines a Python Flask backend with an HTML, CSS, and JavaScript frontend to provide step-by-step algorithm execution.

## 1. Problem Statement & Real-World Motivation

In a priority queue, elements are processed according to their priority rather than simply following their arrival order.

A patient queue is a useful educational example for understanding how priority-based scheduling works. Patients with higher priority are processed before patients with lower priority.

The project demonstrates how the same priority queue operations can be implemented using different data structures and how their internal behavior differs.

**Important:** The priority values used in this project are illustrative examples for learning data structures. They are not medical assessments and must not be used for real clinical triage.

## 2. Priority Queue Rule

- A smaller priority number represents a higher priority.
- Patients with equal priority are processed in arrival order (FIFO).
- **Push:** Add a patient to the queue.
- **Pop:** Remove and return the highest-priority patient.
- **Peek:** View the highest-priority patient without removing them.

### Example

| Patient | Priority |
|---|---:|
| Patient A | 3 |
| Patient B | 1 |
| Patient C | 2 |
| Patient D | 1 |

Expected Pop order:

**Patient B → Patient D → Patient C → Patient A**

Patient B is processed before Patient D because both have priority 1, but Patient B arrived first.

## 3. Three Data Structure Approaches

### Approach 1: Unsorted Array

**Data structure:** Python list.

- Push appends a patient to the end of the list.
- Pop scans the list to find and remove the highest-priority patient.
- Peek scans the list to identify the highest-priority patient without removing them.

This approach keeps insertion simple but requires searching when retrieving the next patient.

### Approach 2: Sorted Linked List

**Data structure:** Priority-ordered linked-list representation.

- Push finds the correct position and inserts the patient according to priority.
- Pop removes the patient at the head.
- Peek examines the head without removing it.

This approach maintains priority order as patients are inserted.

### Approach 3: Binary Min-Heap

**Data structure:** Binary min-heap.

- Push inserts a patient and restores the heap property using sift-up.
- Pop removes the root, moves the final element to the root, and restores the heap property using sift-down.
- Peek examines the root without removing it.

The root contains the patient with the smallest priority number.

## 4. Web Visualizer Features

- **Three approaches:** Switch between Unsorted Array, Sorted Linked List, and Binary Min-Heap.
- **Patient insertion:** Add a patient with a name and priority.
- **Pop operation:** Remove the next patient according to priority.
- **Peek operation:** Inspect the next patient without removing them.
- **Load Example:** Populate the queue with sample patients.
- **Clear All:** Reset the queue.
- **Algorithm walkthrough:** Navigate through execution steps using Previous and Next.
- **Operation history:** Review the steps generated during an operation.
- **Visual representations:** Explore array positions, linked-list nodes and pointers, and heap tree relationships.

## 5. Technology Stack

| Component | Technology |
|---|---|
| Backend | Python |
| Web framework | Flask |
| Frontend structure | HTML |
| Styling | CSS |
| Interactivity | JavaScript |
| Core concepts | Priority Queues, Arrays, Linked Lists, Binary Heaps |

## 6. Project Structure

```text
patient-priority-queue-visualizer/
│
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
├── vercel.json
│
├── templates/
│   └── index.html
│
└── public/
    ├── script.js
    └── style.css
```

## 7. Getting Started

### Prerequisites

- Python 3.12 or newer
- Visual Studio Code (recommended)
- A web browser

### Installation

1. Download or clone the repository.
2. Open the project folder containing `app.py` in VS Code.
3. Open **Terminal → New Terminal**.
4. Create a virtual environment:

   ```powershell
   py -m venv .venv
   ```

5. Activate the environment on Windows PowerShell:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

6. Install the dependencies:

   ```powershell
   py -m pip install -r requirements.txt
   ```

## 8. How to Run

Start the Flask development server:

```powershell
py app.py
```

Open your browser and visit:

**http://127.0.0.1:5000**

Keep the terminal running while using the website.

If the `py` command is unavailable, try `python` instead.

## 9. Execution Walkthrough

1. Select one of the three data structure approaches.
2. Click **Load Example** or add a patient manually.
3. Observe the queue's visual representation.
4. Use **Pop** to remove the next patient according to priority.
5. Use **Peek** to inspect the next patient without removing them.
6. Navigate through the algorithm steps using **Previous** and **Next**.
7. Use **Clear All** to reset the queue and try another approach.

## 10. GitHub and Deployment

### Uploading to GitHub

1. Create a new, empty GitHub repository.
2. Upload the project files, including `app.py`, `requirements.txt`, `templates/`, and `public/`.
3. Ensure `.gitignore` excludes your virtual environment and local configuration files.
4. Share the repository link with your teammates for review and collaboration.

### Deployment

The project includes a `vercel.json` configuration file intended for deployment on Vercel.

Before publishing, verify that the Flask application, static assets, and API routes work correctly in the deployed environment.

## 11. Learning Outcomes

This project demonstrates:

- Implementation of priority queue operations.
- Differences between unsorted and ordered data structures.
- Priority ordering and FIFO behavior for equal priorities.
- Binary heap insertion and deletion.
- Step-by-step visualization of algorithms.
- Integration of a Python backend with a web frontend.

**Developed as an educational MCA project for Data Structures and Algorithms.**
