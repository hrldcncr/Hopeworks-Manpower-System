/**
 * HOPEWORKS MANPOWER MANAGEMENT SYSTEM
 * Module: Operator Enrollment Logic (Module 1)
 */

const video = document.getElementById('video');
const enrollModal = document.getElementById('enrollModal');
const btnOpenModal = document.getElementById('btnOpenModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const aiLoader = document.getElementById('aiLoader');
const captureBtn = document.getElementById('captureBtn');

const MODEL_URL = '../models'; 
let currentTab = 'Pending';

/**
 * 1. AI MODELS INITIALIZATION
 */
async function loadModels() {
    try {
        if (aiLoader) aiLoader.style.display = 'flex'; 
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        console.log("AI Models Loaded!");
        if (aiLoader) aiLoader.style.display = 'none'; 
        if (captureBtn) captureBtn.disabled = false;     
    } catch (error) {
        console.error("AI Model Loading Error:", error);
    }
}

/**
 * 2. AUTOMATIC UNIQUE ID GENERATOR
 */
function generateAutoID() {
    const now = new Date();
    const timestampID = "OP" + 
                        now.getFullYear() + 
                        (now.getMonth() + 1).toString().padStart(2, '0') + 
                        now.getDate().toString().padStart(2, '0') + 
                        now.getHours().toString().padStart(2, '0') + 
                        now.getMinutes().toString().padStart(2, '0') + 
                        now.getSeconds().toString().padStart(2, '0');

    const opIDInput = document.getElementById('opID');
    if (opIDInput) {
        opIDInput.value = timestampID;
        opIDInput.readOnly = true; 
    }
}

/**
 * 3. WEBCAM INITIALIZATION
 */
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) { console.error("Camera Error:", err); }
}

function stopVideo() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    const canvas = document.querySelector('.webcam-box canvas');
    if (canvas) canvas.remove();
}

/**
 * 4. UI EVENT LISTENERS & TAB SWITCHING
 */
if (btnOpenModal) {
    btnOpenModal.addEventListener('click', async () => {
        enrollModal.style.display = 'flex';
        generateAutoID();
        await startVideo();
        await loadModels(); 
    });
}

if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
        enrollModal.style.display = 'none';
        stopVideo();
    });
}

function switchTab(evt, status) {
    currentTab = status;
    document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
    evt.currentTarget.classList.add('active');
    loadOperators(status);
}

/**
 * 5. REAL-TIME FACE DETECTION (ALIGNED VERSION)
 */
video.addEventListener('play', () => {
    // Alisin ang lumang canvas kung meron man para iwas-duplicate
    const existingCanvas = document.querySelector('.webcam-box canvas');
    if (existingCanvas) existingCanvas.remove();

    const canvas = faceapi.createCanvasFromMedia(video);
    document.querySelector('.webcam-box').append(canvas);

    // MATCH DIMENSIONS: Ito ang sikreto para hindi lumabas ang box sa camera
    const displaySize = { 
        width: video.clientWidth, 
        height: video.clientHeight 
    };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        if (!video.srcObject) return;
        
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                                        .withFaceLandmarks();
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // I-draw ang blue box at pink dots (landmarks)
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }, 100);
});

/**
 * 6. CAPTURE & SAVE
 */
if (captureBtn) {
    captureBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                        .withFaceLandmarks()
                                        .withFaceDescriptor();

        if (detection) {
            const opData = {
                opID: document.getElementById('opID').value,
                opName: document.getElementById('opName').value,
                opContact: document.getElementById('opContact').value,
                descriptor: Array.from(detection.descriptor)
            };

            fetch('../php/save_operator.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(opData)
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') {
                    alert("Success: " + data.message);
                    loadOperators('Pending'); 
                    btnCloseModal.click();
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(err => alert("Connection Error: Hindi makontak ang PHP server."));
        } else {
            alert("No face detected! Humarap po nang maayos sa camera.");
        }
    });
}

/**
 * 7. LOAD, TOGGLE, & DELETE FUNCTIONS
 */
async function loadOperators(status = currentTab) {
    const tableBody = document.getElementById('operatorTableBody'); 
    if (!tableBody) return;

    try {
        const response = await fetch(`../php/fetch_operators.php?status=${status}`);
        const data = await response.json();
        tableBody.innerHTML = ''; 
        
        data.forEach(op => {
                const badgeClass = `badge-${op.status.toLowerCase()}`;
                
                // NEW LOGIC: Para tama ang tooltip text depende sa status
                let toggleLabel = "";
                if (op.status === 'Pending') {
                    toggleLabel = 'Approve Operator';
                } else if (op.status === 'Active') {
                    toggleLabel = 'Move to Recycle Bin'; // Palitan ang 'Deactivate'
                } else if (op.status === 'Deleted') {
                    toggleLabel = 'Restore Operator';
                }

            tableBody.innerHTML += `
                <tr>
                    <td><strong>${op.operator_id}</strong></td>
                    <td>${op.full_name}</td>
                    <td>${op.contact_number}</td>
                    <td><span class="status-badge badge-active">Enrolled</span></td> 
                    <td><span class="status-badge ${badgeClass}">${op.status}</span></td>
                    <td class="action-btns">
                        <button onclick="toggleStatus('${op.operator_id}', '${op.status}')" class="btn-toggle-status" title="${toggleLabel}">
                            <i class="fa-solid fa-sync"></i>
                        </button>
                        <button onclick="viewProfile('${op.operator_id}')" class="btn-action view-btn"><i class="fa-solid fa-eye"></i></button>
                        <button onclick="editOperator('${op.operator_id}')" class="btn-action edit-btn"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="deleteOp('${op.operator_id}')" class="btn-action delete-btn"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (err) { console.error("Load Error:", err); }
}

async function toggleStatus(id, currentStatus) {
    const nextStatus = currentStatus === 'Pending' ? 'Active' : 'Pending';
    if (confirm(`Change status of ${id} to ${nextStatus}?`)) {
        try {
            const res = await fetch('../php/toggle_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opID: id, currentStatus: currentStatus })
            });
            const result = await res.json();
            if (result.status === 'success') {
                loadOperators(currentTab);
            }
        } catch (err) { alert("Error toggling status."); }
    }
}

async function deleteOp(id) {
    if (confirm("Delete operator " + id + "?")) {
        const res = await fetch('../php/delete_operator.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operator_id: id })
        });
        const result = await res.json();
        if (result.status === 'success') {
            loadOperators(currentTab); 
        }
    }
}

window.onload = () => loadOperators('Pending');