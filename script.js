/* script.js */

// --- CONFIGURATION & DATA ---

// Global state
let allQuestions = [];
let userProgress = JSON.parse(localStorage.getItem('stepTrackerData')) || {};

// Mock Data
let currentMode = 'practice'; // 'practice' or 'mock'
// Load existing mock from storage or empty array
let currentMockIds = JSON.parse(localStorage.getItem('stepBotMockIds')) || []; 

let currentQuestionId = null;
let timerInterval = null;
let secondsElapsed = 0;

// Initialize
window.onload = function() {
    generateQuestionList();
    loadFilters(); // Populate dropdowns
    
    // Default to practice mode render
    renderTable(); 
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

// --- MODE SWITCHING ---

function switchMode(mode) {
    currentMode = mode;
    
    // Update Tabs
    document.getElementById('tab-practice').classList.toggle('active', mode === 'practice');
    document.getElementById('tab-mock').classList.toggle('active', mode === 'mock');

    // Update Controls Visibility
    document.getElementById('controls-practice').style.display = (mode === 'practice') ? 'flex' : 'none';
    document.getElementById('controls-mock').style.display = (mode === 'mock') ? 'flex' : 'none';

    // Update Table Title
    const title = (mode === 'practice') ? "All Questions" : "Mock Exam (12 Questions)";
    document.getElementById('tracker-title').innerText = title;

    renderTable();
}

// --- MOCK GENERATION ---

function generateMock() {
    // 1. Get Parameters
    const startYear = parseInt(document.getElementById('mock-start-year').value);
    const endYear = parseInt(document.getElementById('mock-end-year').value);
    const useP2 = document.getElementById('mock-p2').checked;
    const useP3 = document.getElementById('mock-p3').checked;

    if (!useP2 && !useP3) {
        alert("Please select at least one paper type.");
        return;
    }

    if (startYear > endYear) {
        alert("Start year cannot be after end year.");
        return;
    }

    // 2. Filter Pool: Must be in range, right paper, AND NOT DONE
    let pool = allQuestions.filter(q => {
        if (q.year < startYear || q.year > endYear) return false;
        if (q.paper === 2 && !useP2) return false;
        if (q.paper === 3 && !useP3) return false;
        
        // Check if done
        const progress = userProgress[q.id];
        if (progress && progress.done) return false;
        
        return true;
    });

    // 3. Split into Topics
    const pure = pool.filter(q => q.type === 'pure');
    const mech = pool.filter(q => q.type === 'mechanics');
    const stats = pool.filter(q => q.type === 'stats');

    // 4. Validate Counts
    if (pure.length < 8 || mech.length < 2 || stats.length < 2) {
        alert(`Not enough uncompleted questions available in this range!\n\nAvailable:\nPure: ${pure.length} (Need 8)\nMech: ${mech.length} (Need 2)\nStats: ${stats.length} (Need 2)`);
        return;
    }

    // 5. Shuffle and Select (Helper Function)
    function getRandomSubarray(arr, size) {
        let shuffled = arr.slice(0);
        let i = arr.length;
        let temp, index;
        while (i--) {
            index = Math.floor(Math.random() * (i + 1));
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(0, size);
    }

    const selectedPure = getRandomSubarray(pure, 8);
    const selectedMech = getRandomSubarray(mech, 2);
    const selectedStats = getRandomSubarray(stats, 2);

    // 6. Combine and Save
    const mockSet = [...selectedPure, ...selectedMech, ...selectedStats];
    
    // Sort logic for display (Year -> Paper -> Number)
    mockSet.sort((a,b) => a.year - b.year || a.paper - b.paper || a.number - b.number);

    currentMockIds = mockSet.map(q => q.id);
    
    // Save to local storage so refresh doesn't kill the mock
    localStorage.setItem('stepBotMockIds', JSON.stringify(currentMockIds));

    // Render
    renderTable();
    alert("Mock generated! Good luck.");
}


// --- UI FUNCTIONS ---

function loadFilters() {
    const yearSelect = document.getElementById('sel-year');
    const mockStart = document.getElementById('mock-start-year');
    const mockEnd = document.getElementById('mock-end-year');

    for(let y=2008; y<=2024; y++) {
        // Main filter
        let opt = document.createElement('option');
        opt.value = y; opt.innerText = y;
        yearSelect.appendChild(opt);

        // Mock filters
        let optS = document.createElement('option');
        optS.value = y; optS.innerText = y;
        mockStart.appendChild(optS);

        let optE = document.createElement('option');
        optE.value = y; optE.innerText = y;
        if (y === 2024) optE.selected = true;
        mockEnd.appendChild(optE);
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

// Triggered when clicking a question in the table
function loadFromTable(id) {
    const found = allQuestions.find(q => q.id === id);
    if(found) displayQuestion(found);
}

function displayQuestion(q) {
    currentQuestionId = q.id;
    
    // 1. Update Info Text
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

    let questionsToShow = [];

    if (currentMode === 'practice') {
        // Show ALL questions, sorted newest first
        questionsToShow = [...allQuestions].sort((a,b) => b.year - a.year || a.paper - b.paper || a.number - b.number);
    } else {
        // Show MOCK questions
        if (currentMockIds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No mock generated yet. Adjust settings above and click "Generate Paper".</td></tr>';
            return;
        }
        // Filter allQuestions to only find the ones in the ID list
        questionsToShow = allQuestions.filter(q => currentMockIds.includes(q.id));
        // Sort Mock: Pure (1-8) -> Mech -> Stats implies generic order usually works if sorted by Year/Paper/Num
        // But user might want standard exam order. Let's just do standard sort.
        questionsToShow.sort((a,b) => a.year - b.year || a.paper - b.paper || a.number - b.number);
    }

    questionsToShow.forEach(q => {
        const data = userProgress[q.id] || { done: false, date: '', marks: '', notes: '' };
        
        const tr = document.createElement('tr');
        if (data.done) tr.style.backgroundColor = "#e8f8f5"; 

        const paperRoman = (q.paper === 2) ? "II" : "III";
        const displayName = `${q.year} ${paperRoman} Q${q.number}`;
        
        // HTML Generation
        const tdCheck = `<td class="col-check"><input type="checkbox" ${data.done ? 'checked' : ''} onchange="updateProgress('${q.id}', 'done', this.checked)"></td>`;
        
        // Make Name Clickable
        const tdName = `<td class="col-id"><span class="clickable-name" onclick="loadFromTable('${q.id}')">${displayName}</span></td>`;
        
        const tdDate = `<td class="col-date"><input type="date" value="${data.date}" onchange="updateProgress('${q.id}', 'date', this.value)"></td>`;
        const tdMarks = `<td class="col-marks"><input type="number" value="${data.marks}" onchange="updateProgress('${q.id}', 'marks', this.value)"></td>`;
        
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
    
    // If we update via table checkbox, we might want to re-render to apply background color
    if (field === 'done') renderTable();
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
    
    // Re-render table to ensure consistency
    renderTable(); 
}

function markCurrentAsDone() {
    if(!currentQuestionId) return;
    
    updateProgress(currentQuestionId, 'done', true);
    
    if (!userProgress[currentQuestionId].date) {
        updateProgress(currentQuestionId, 'date', new Date().toISOString().split('T')[0]);
    }

    syncViewerToData();
    renderTable();
    alert(`Marked ${currentQuestionId} as complete!`);
}

function showMarkScheme() {
    alert("Mark schemes coming soon in a future update!");
}