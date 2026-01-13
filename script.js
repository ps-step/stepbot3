/* script.js */

// --- CONFIGURATION & DATA ---

const GRADE_BOUNDARIES = {
    // Placeholder
    2008: { 2: [0,0,0,0], 3: [0,0,0,0] },
};

// Global state
let allQuestions = [];
let userProgress = JSON.parse(localStorage.getItem('stepTrackerData')) || {};
let currentQuestionId = null;
let timerInterval = null;
let secondsElapsed = 0;

// Initialize
window.onload = function() {
    generateQuestionList();
    renderTable();
    loadFilters(); 
};

// --- LOGIC ---

function getQuestionType(year, number) {
    if (number <= 8) return 'pure';
    if (year <= 2017) {
        if (number >= 9 && number <= 11) return 'mechanics';
        if (number >= 12 && number <= 13) return 'stats';
    } else {
        if (number >= 9 && number <= 10) return 'mechanics';
        if (number >= 11 && number <= 12) return 'stats';
    }
    return 'unknown';
}

function generateQuestionList() {
    allQuestions = [];
    const papers = [2, 3];
    
    for (let year = 2008; year <= 2024; year++) {
        papers.forEach(paper => {
            let maxQ = (year <= 2017) ? 13 : 12;

            for (let num = 1; num <= maxQ; num++) {
                const type = getQuestionType(year, num);
                const id = `${year}.${paper}.${num}`; 
                
                allQuestions.push({
                    id: id,
                    year: year,
                    paper: paper,
                    number: num,
                    type: type,
                    filename: `${id}.png`
                });
            }
        });
    }
}

// --- UI FUNCTIONS ---

function loadFilters() {
    const yearSelect = document.getElementById('sel-year');
    for(let y=2008; y<=2024; y++) {
        let opt = document.createElement('option');
        opt.value = y; opt.innerText = y;
        yearSelect.appendChild(opt);
    }
}

function generateRandom() {
    const allowP2 = document.getElementById('chk-p2').checked;
    const allowP3 = document.getElementById('chk-p3').checked;
    const allowPure = document.getElementById('chk-pure').checked;
    const allowMech = document.getElementById('chk-mech').checked;
    const allowStats = document.getElementById('chk-stats').checked;

    const eligible = allQuestions.filter(q => {
        if (q.paper === 2 && !allowP2) return false;
        if (q.paper === 3 && !allowP3) return false;
        if (q.type === 'pure' && !allowPure) return false;
        if (q.type === 'mechanics' && !allowMech) return false;
        if (q.type === 'stats' && !allowStats) return false;
        return true;
    });

    if (eligible.length === 0) {
        alert("No questions match your filters!");
        return;
    }

    const randomIndex = Math.floor(Math.random() * eligible.length);
    displayQuestion(eligible[randomIndex]);
}

function loadSpecific() {
    const y = parseInt(document.getElementById('sel-year').value);
    const p = parseInt(document.getElementById('sel-paper').value);
    const n = parseInt(document.getElementById('sel-number').value);

    const found = allQuestions.find(q => q.year === y && q.paper === p && q.number === n);
    
    if (found) {
        displayQuestion(found);
    } else {
        alert("Question not found (Check year/number range)");
    }
}

function displayQuestion(q) {
    currentQuestionId = q.id;
    
    // 1. Update Info Text (Removed Topic)
    // Display Roman Numerals for Paper
    const paperLabel = (q.paper === 2) ? "II" : "III";
    const info = `Year: ${q.year} | Paper: ${paperLabel} | Question ${q.number}`;
    document.getElementById('question-info').innerText = info;

    // 2. Update Image
    const imgPath = `questions/${q.filename}`; 
    document.getElementById('question-img').src = imgPath;
    document.getElementById('question-img').alt = `STEP ${q.year} ${paperLabel} Q${q.number}`;

    // 3. Show Controls
    document.getElementById('viewer-controls').style.display = 'block';

    // 4. Sync Viewer Inputs with Data
    const data = userProgress[q.id] || { marks: '', notes: '' };
    document.getElementById('viewer-marks').value = data.marks;
    document.getElementById('viewer-notes').value = data.notes;

    // 5. Reset and Start Timer
    startTimer();
}

// --- TIMER LOGIC ---
function startTimer() {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    document.getElementById('timer').innerText = `${mins}:${secs}`;
}

// --- TRACKER & SAVING ---

function renderTable() {
    const tbody = document.getElementById('tracker-body');
    tbody.innerHTML = '';

    // Sort: Newest years first
    const sortedQs = [...allQuestions].sort((a,b) => b.year - a.year || a.paper - b.paper || a.number - b.number);

    sortedQs.forEach(q => {
        const data = userProgress[q.id] || { done: false, date: '', marks: '', notes: '' };
        
        const tr = document.createElement('tr');
        if (data.done) tr.style.backgroundColor = "#e8f8f5"; // Slight green tint for done

        // Distinct Name: 2017 II Q12
        const paperRoman = (q.paper === 2) ? "II" : "III";
        const displayName = `${q.year} ${paperRoman} Q${q.number}`;
        
        // HTML Generation
        const tdCheck = `<td class="col-check"><input type="checkbox" ${data.done ? 'checked' : ''} onchange="updateProgress('${q.id}', 'done', this.checked)"></td>`;
        const tdName = `<td class="col-id">${displayName}</td>`;
        const tdDate = `<td class="col-date"><input type="date" value="${data.date}" onchange="updateProgress('${q.id}', 'date', this.value)"></td>`;
        const tdMarks = `<td class="col-marks"><input type="number" value="${data.marks}" onchange="updateProgress('${q.id}', 'marks', this.value)"></td>`;
        
        // Expanding Textarea Logic
        const tdNotes = `
            <td class="col-notes">
                <div class="note-cell">
                    <textarea class="note-input" placeholder="Notes..." onchange="updateProgress('${q.id}', 'notes', this.value)">${data.notes}</textarea>
                </div>
            </td>`;

        tr.innerHTML = tdCheck + tdName + tdDate + tdMarks + tdNotes;
        tbody.appendChild(tr);
    });
}

function updateProgress(id, field, value) {
    if (!userProgress[id]) {
        userProgress[id] = { done: false, date: '', marks: '', notes: '' };
    }
    userProgress[id][field] = value;
    
    // Save to LocalStorage
    localStorage.setItem('stepTrackerData', JSON.stringify(userProgress));

    // If we updated the Table, and the Question is currently open in Viewer, update Viewer inputs
    if (id === currentQuestionId) {
        if (field === 'marks') document.getElementById('viewer-marks').value = value;
        if (field === 'notes') document.getElementById('viewer-notes').value = value;
    }
}

// Sync from Viewer Inputs -> Data -> Table
function syncViewerToData() {
    if (!currentQuestionId) return;
    
    const marks = document.getElementById('viewer-marks').value;
    const notes = document.getElementById('viewer-notes').value;
    
    // Update Data
    if (!userProgress[currentQuestionId]) userProgress[currentQuestionId] = { done: false, date: '' };
    userProgress[currentQuestionId].marks = marks;
    userProgress[currentQuestionId].notes = notes;
    
    localStorage.setItem('stepTrackerData', JSON.stringify(userProgress));
    
    // Simpler to just re-render table to ensure consistency
    renderTable(); 
}

function markCurrentAsDone() {
    if(!currentQuestionId) return;
    
    // Mark Done
    updateProgress(currentQuestionId, 'done', true);
    
    // Set Date if empty
    if (!userProgress[currentQuestionId].date) {
        updateProgress(currentQuestionId, 'date', new Date().toISOString().split('T')[0]);
    }

    // Save Marks/Notes currently in viewer
    syncViewerToData();
    
    renderTable();
    alert(`Marked ${currentQuestionId} as complete!`);
}

function showMarkScheme() {
    alert("Mark schemes coming soon in a future update!");
}