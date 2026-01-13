/* script.js */

// --- CONFIGURATION & DATA ---

// Placeholder for Grade Boundaries (S, 1, 2, 3)
const GRADE_BOUNDARIES = {
    // Structure: Year: { Paper2: [S, 1, 2, 3], Paper3: [S, 1, 2, 3] }
    // Filled with dummy 0s for now as requested
    2008: { 2: [0,0,0,0], 3: [0,0,0,0] },
    2009: { 2: [0,0,0,0], 3: [0,0,0,0] },
    // ... You can populate this later
};

// Global state
let allQuestions = [];
let userProgress = JSON.parse(localStorage.getItem('stepTrackerData')) || {};

// Initialize
window.onload = function() {
    generateQuestionList();
    renderTable();
    loadFilters(); // Populate dropdowns
};

// --- LOGIC ---

function getQuestionType(year, number) {
    // Logic for Pure (Always 1-8)
    if (number <= 8) return 'pure';

    // Logic for 2008-2017
    if (year <= 2017) {
        if (number >= 9 && number <= 11) return 'mechanics';
        if (number >= 12 && number <= 13) return 'stats';
    } 
    // Logic for 2018-2024
    else {
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
            // Determine max questions for that year
            let maxQ = (year <= 2017) ? 13 : 12;

            for (let num = 1; num <= maxQ; num++) {
                const type = getQuestionType(year, num);
                const id = `${year}.${paper}.${num}`; // Unique ID
                
                allQuestions.push({
                    id: id,
                    year: year,
                    paper: paper,
                    number: num,
                    type: type,
                    topic: 'pure', // Default placeholder
                    filename: `${id}.png` // Matches your naming convention
                });
            }
        });
    }
}

// --- UI FUNCTIONS ---

function loadFilters() {
    // Populate "Select Specific" dropdowns
    const yearSelect = document.getElementById('sel-year');
    for(let y=2008; y<=2024; y++) {
        let opt = document.createElement('option');
        opt.value = y; opt.innerText = y;
        yearSelect.appendChild(opt);
    }
}

function generateRandom() {
    // 1. Get User Filters
    const allowP2 = document.getElementById('chk-p2').checked;
    const allowP3 = document.getElementById('chk-p3').checked;
    const allowPure = document.getElementById('chk-pure').checked;
    const allowMech = document.getElementById('chk-mech').checked;
    const allowStats = document.getElementById('chk-stats').checked;

    // 2. Filter the Master List
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

    // 3. Pick Random
    const randomIndex = Math.floor(Math.random() * eligible.length);
    const selected = eligible[randomIndex];

    displayQuestion(selected);
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
    // Update Info Text
    const info = `Year: ${q.year} | Paper: ${q.paper} | Q${q.number} (${q.type})`;
    document.getElementById('question-info').innerText = info;

    // Update Image
    // Assumes images are in a folder named 'questions' relative to index.html
    const imgPath = `questions/${q.filename}`; 
    document.getElementById('question-img').src = imgPath;
    document.getElementById('question-img').alt = `STEP Question ${q.id}`;

    // Store current question ID in button for marking
    document.getElementById('btn-mark-done').dataset.currentId = q.id;
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
        
        // Checkbox
        const tdCheck = `<td><input type="checkbox" ${data.done ? 'checked' : ''} onchange="updateProgress('${q.id}', 'done', this.checked)"></td>`;
        
        // ID
        const tdName = `<td>${q.year} II/III Q${q.number}</td>`;
        
        // Inputs
        const tdDate = `<td><input type="date" value="${data.date}" onchange="updateProgress('${q.id}', 'date', this.value)"></td>`;
        const tdMarks = `<td><input type="number" style="width:50px" value="${data.marks}" onchange="updateProgress('${q.id}', 'marks', this.value)"></td>`;
        const tdNotes = `<td><input type="text" value="${data.notes}" onchange="updateProgress('${q.id}', 'notes', this.value)"></td>`;

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
}

function markCurrentAsDone() {
    const id = document.getElementById('btn-mark-done').dataset.currentId;
    if(!id) return;
    
    updateProgress(id, 'done', true);
    // Set today's date if empty
    if (!userProgress[id].date) {
        updateProgress(id, 'date', new Date().toISOString().split('T')[0]);
    }
    renderTable(); // Refresh table to show check
    alert(`Marked ${id} as done!`);
}

function showMarkScheme() {
    alert("Mark schemes coming soon in a future update!");
}