/* script.js */

// --- CONFIGURATION & DATA ---

// Grade Boundaries Data (2008-2024)
const GRADE_DATA = {
    // Paper 2
    2: {
        2024: {"S": 93, "1": 69, "2": 51, "3": 26},
        2023: {"S": 90, "1": 65, "2": 50, "3": 30},
        2022: {"S": 81, "1": 62, "2": 52, "3": 28},
        2021: {"S": 92, "1": 67, "2": 54, "3": 25},
        2020: {"S": 77, "1": 54, "2": 42, "3": 30},
        2019: {"S": 90, "1": 68, "2": 55, "3": 36},
        2018: {"S": 100, "1": 77, "2": 65, "3": 34},
        2017: {"S": 101, "1": 80, "2": 69, "3": 31},
        2016: {"S": 95, "1": 74, "2": 65, "3": 30},
        2015: {"S": 94, "1": 68, "2": 60, "3": 30},
        2014: {"S": 95, "1": 74, "2": 64, "3": 30},
        2013: {"S": 100, "1": 79, "2": 67, "3": 32},
        2012: {"S": 91, "1": 72, "2": 60, "3": 31},
        2011: {"S": 83, "1": 62, "2": 49, "3": 29},
        2010: {"S": 105, "1": 79, "2": 64, "3": 40},
        2009: {"S": 98, "1": 71, "2": 61, "3": 39},
        2008: {"S": 94, "1": 69, "2": 58, "3": 35}
    },
    // Paper 3
    3: {
        2024: {"S": 85, "1": 64, "2": 54, "3": 32},
        2023: {"S": 82, "1": 62, "2": 51, "3": 29},
        2022: {"S": 89, "1": 67, "2": 54, "3": 29},
        2021: {"S": 92, "1": 67, "2": 54, "3": 25},
        2020: {"S": 88, "1": 67, "2": 53, "3": 30},
        2019: {"S": 77, "1": 57, "2": 48, "3": 27},
        2018: {"S": 87, "1": 59, "2": 49, "3": 27},
        2017: {"S": 95, "1": 69, "2": 57, "3": 28},
        2016: {"S": 88, "1": 64, "2": 55, "3": 32},
        2015: {"S": 88, "1": 65, "2": 54, "3": 29},
        2014: {"S": 81, "1": 59, "2": 48, "3": 27},
        2013: {"S": 85, "1": 62, "2": 48, "3": 27},
        2012: {"S": 84, "1": 65, "2": 53, "3": 32},
        2011: {"S": 91, "1": 65, "2": 53, "3": 32},
        2010: {"S": 78, "1": 56, "2": 46, "3": 29},
        2009: {"S": 95, "1": 67, "2": 55, "3": 38},
        2008: {"S": 82, "1": 63, "2": 52, "3": 34}
    }
};

// Global state
let allQuestions = [];
let userProgress = JSON.parse(localStorage.getItem('stepTrackerData')) || {};

// Mock Data
let currentMode = 'practice'; // 'practice' or 'mock'
let currentMockIds = JSON.parse(localStorage.getItem('stepBotMockIds')) || []; 

let currentQuestionId = null;
let timerInterval = null;
let secondsElapsed = 0;

// Initialize
window.onload = function() {
    generateQuestionList();
    loadFilters(); 
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

    let pool = allQuestions.filter(q => {
        if (q.year < startYear || q.year > endYear) return false;
        if (q.paper === 2 && !useP2) return false;
        if (q.paper === 3 && !useP3) return false;
        
        const progress = userProgress[q.id];
        if (progress && progress.done) return false;
        
        return true;
    });

    const pure = pool.filter(q => q.type === 'pure');
    const mech = pool.filter(q => q.type === 'mechanics');
    const stats = pool.filter(q => q.type === 'stats');

    if (pure.length < 8 || mech.length < 2 || stats.length < 2) {
        alert(`Not enough uncompleted questions available!\n\nAvailable:\nPure: ${pure.length} (Need 8)\nMech: ${mech.length} (Need 2)\nStats: ${stats.length} (Need 2)`);
        return;
    }

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

    const mockSet = [...selectedPure, ...selectedMech, ...selectedStats];
    mockSet.sort((a,b) => a.year - b.year || a.paper - b.paper || a.number - b.number);

    currentMockIds = mockSet.map(q => q.id);
    localStorage.setItem('stepBotMockIds', JSON.stringify(currentMockIds));

    renderTable();
    alert("Mock generated! Good luck.");
}

// --- GRADE BOUNDARIES (Fixed) ---

function viewGradeBoundaries() {
    try {
        if (currentMockIds.length === 0) {
            alert("Please generate a mock paper first.");
            return;
        }

        let sums = { "S": 0, "1": 0, "2": 0, "3": 0 };
        let count = 0;

        currentMockIds.forEach(id => {
            const q = allQuestions.find(item => item.id === id);
            
            // Safety Check: Ensure question exists and data exists for that year
            if (q && GRADE_DATA[q.paper] && GRADE_DATA[q.paper][q.year]) {
                const boundaries = GRADE_DATA[q.paper][q.year];
                sums["S"] += boundaries["S"];
                sums["1"] += boundaries["1"];
                sums["2"] += boundaries["2"];
                sums["3"] += boundaries["3"];
                count++;
            } else {
                console.warn(`Missing grade data for question ID: ${id}`);
            }
        });

        if (count === 0) {
            alert("Error: Could not retrieve grade data for these questions.");
            return;
        }

        const avg = {
            "S": Math.round(sums["S"] / count),
            "1": Math.round(sums["1"] / count),
            "2": Math.round(sums["2"] / count),
            "3": Math.round(sums["3"] / count)
        };

        const display = document.getElementById('grade-display');
        display.innerHTML = `
            <div class="grade-row"><span class="grade-label">Grade S:</span> <span class="grade-value">${avg["S"]}</span></div>
            <div class="grade-row"><span class="grade-label">Grade 1:</span> <span class="grade-value">${avg["1"]}</span></div>
            <div class="grade-row"><span class="grade-label">Grade 2:</span> <span class="grade-value">${avg["2"]}</span></div>
            <div class="grade-row"><span class="grade-label">Grade 3:</span> <span class="grade-value">${avg["3"]}</span></div>
        `;

        document.getElementById('modal-backdrop').style.display = 'flex';
        
    } catch (error) {
        console.error("Crash in viewGradeBoundaries:", error);
        alert("Something went wrong calculating grades. Check console for details.");
    }
}

// Explicitly attached to window to ensure HTML can find it
window.closeModal = function() {
    document.getElementById('modal-backdrop').style.display = 'none';
}


// --- UI FUNCTIONS ---

function loadFilters() {
    const yearSelect = document.getElementById('sel-year');
    const mockStart = document.getElementById('mock-start-year');
    const mockEnd = document.getElementById('mock-end-year');

    for(let y=2008; y<=2024; y++) {
        let opt = document.createElement('option');
        opt.value = y; opt.innerText = y;
        yearSelect.appendChild(opt);

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

// Expose to window for HTML access
window.loadFromTable = function(id) {
    const found = allQuestions.find(q => q.id === id);
    if(found) displayQuestion(found);
}

function displayQuestion(q) {
    currentQuestionId = q.id;
    
    const paperLabel = (q.paper === 2) ? "II" : "III";
    const info = `Year: ${q.year} | Paper: ${paperLabel} | Question ${q.number}`;
    document.getElementById('question-info').innerText = info;

    const imgPath = `questions/${q.filename}`; 
    document.getElementById('question-img').src = imgPath;
    document.getElementById('question-img').alt = `STEP ${q.year} ${paperLabel} Q${q.number}`;

    document.getElementById('viewer-controls').style.display = 'block';

    const data = userProgress[q.id] || { marks: '', notes: '' };
    document.getElementById('viewer-marks').value = data.marks;
    document.getElementById('viewer-notes').value = data.notes;

    startTimer();
}

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
        questionsToShow = [...allQuestions].sort((a,b) => b.year - a.year || a.paper - b.paper || a.number - b.number);
    } else {
        if (currentMockIds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No mock generated yet. Adjust settings above and click "Generate Paper".</td></tr>';
            return;
        }
        questionsToShow = allQuestions.filter(q => currentMockIds.includes(q.id));
        questionsToShow.sort((a,b) => a.year - b.year || a.paper - b.paper || a.number - b.number);
    }

    questionsToShow.forEach(q => {
        const data = userProgress[q.id] || { done: false, date: '', marks: '', notes: '' };
        
        const tr = document.createElement('tr');
        if (data.done) tr.style.backgroundColor = "#e8f8f5"; 

        const paperRoman = (q.paper === 2) ? "II" : "III";
        const displayName = `${q.year} ${paperRoman} Q${q.number}`;
        
        const tdCheck = `<td class="col-check"><input type="checkbox" ${data.done ? 'checked' : ''} onchange="updateProgress('${q.id}', 'done', this.checked)"></td>`;
        
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

// Expose to window
window.updateProgress = function(id, field, value) {
    if (!userProgress[id]) {
        userProgress[id] = { done: false, date: '', marks: '', notes: '' };
    }
    userProgress[id][field] = value;
    
    localStorage.setItem('stepTrackerData', JSON.stringify(userProgress));

    if (id === currentQuestionId) {
        if (field === 'marks') document.getElementById('viewer-marks').value = value;
        if (field === 'notes') document.getElementById('viewer-notes').value = value;
    }
    
    if (field === 'done') renderTable();
}

window.syncViewerToData = function() {
    if (!currentQuestionId) return;
    
    const marks = document.getElementById('viewer-marks').value;
    const notes = document.getElementById('viewer-notes').value;
    
    if (!userProgress[currentQuestionId]) userProgress[currentQuestionId] = { done: false, date: '' };
    userProgress[currentQuestionId].marks = marks;
    userProgress[currentQuestionId].notes = notes;
    
    localStorage.setItem('stepTrackerData', JSON.stringify(userProgress));
    renderTable(); 
}

window.markCurrentAsDone = function() {
    if(!currentQuestionId) return;
    
    updateProgress(currentQuestionId, 'done', true);
    
    if (!userProgress[currentQuestionId].date) {
        updateProgress(currentQuestionId, 'date', new Date().toISOString().split('T')[0]);
    }

    syncViewerToData();
    renderTable();
    alert(`Marked ${currentQuestionId} as complete!`);
}

window.showMarkScheme = function() {
    alert("Mark schemes coming soon in a future update!");
}