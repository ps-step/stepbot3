/* script.js */

// --- CONFIGURATION & DATA ---

// Grade Boundaries Data (2008-2024)
const GRADE_DATA = {
    2: { 2024: {"S":93,"1":69,"2":51,"3":26}, 2023: {"S":90,"1":65,"2":50,"3":30}, 2022: {"S":81,"1":62,"2":52,"3":28}, 2021: {"S":92,"1":67,"2":54,"3":25}, 2020: {"S":77,"1":54,"2":42,"3":30}, 2019: {"S":90,"1":68,"2":55,"3":36}, 2018: {"S":100,"1":77,"2":65,"3":34}, 2017: {"S":101,"1":80,"2":69,"3":31}, 2016: {"S":95,"1":74,"2":65,"3":30}, 2015: {"S":94,"1":68,"2":60,"3":30}, 2014: {"S":95,"1":74,"2":64,"3":30}, 2013: {"S":100,"1":79,"2":67,"3":32}, 2012: {"S":91,"1":72,"2":60,"3":31}, 2011: {"S":83,"1":62,"2":49,"3":29}, 2010: {"S":105,"1":79,"2":64,"3":40}, 2009: {"S":98,"1":71,"2":61,"3":39}, 2008: {"S":94,"1":69,"2":58,"3":35} },
    3: { 2024: {"S":85,"1":64,"2":54,"3":32}, 2023: {"S":82,"1":62,"2":51,"3":29}, 2022: {"S":89,"1":67,"2":54,"3":29}, 2021: {"S":92,"1":67,"2":54,"3":25}, 2020: {"S":88,"1":67,"2":53,"3":30}, 2019: {"S":77,"1":57,"2":48,"3":27}, 2018: {"S":87,"1":59,"2":49,"3":27}, 2017: {"S":95,"1":69,"2":57,"3":28}, 2016: {"S":88,"1":64,"2":55,"3":32}, 2015: {"S":88,"1":65,"2":54,"3":29}, 2014: {"S":81,"1":59,"2":48,"3":27}, 2013: {"S":85,"1":62,"2":48,"3":27}, 2012: {"S":84,"1":65,"2":53,"3":32}, 2011: {"S":91,"1":65,"2":53,"3":32}, 2010: {"S":78,"1":56,"2":46,"3":29}, 2009: {"S":95,"1":67,"2":55,"3":38}, 2008: {"S":82,"1":63,"2":52,"3":34} }
};

// FULL TOPIC LOOKUP (Mapped from provided data)
// Key: "Year.Paper.Question"
const TOPIC_LOOKUP = {
    // PROOF
    "2024.2.1": "Proof", "2024.2.6": "Proof", "2020.2.3": "Proof", "2020.2.5": "Proof", "2017.2.1": "Proof", "2017.2.6": "Proof", "2015.2.3": "Proof", "2015.2.5": "Proof", "2013.2.6": "Proof", "2012.2.8": "Proof", "2008.2.3": "Proof",
    "2022.3.2": "Proof", "2020.3.8": "Proof", "2017.3.4": "Proof", "2015.3.2": "Proof", "2015.3.5": "Proof", "2013.3.5": "Proof", "2009.3.7": "Proof", "2008.3.5": "Proof",
    
    // NUMERICAL REASONING
    "2024.2.1": "Numerical Reasoning", "2018.2.6": "Numerical Reasoning", "2023.3.5": "Numerical Reasoning", "2022.3.2": "Numerical Reasoning",
    
    // ALGEBRA & FUNCTIONS
    "2024.2.2": "Further Algebra", "2024.2.5": "Algebra", "2023.2.2": "Algebra", "2023.2.3": "Further Algebra", "2023.2.4": "Further Algebra", "2022.2.4": "Algebra", "2022.2.5": "Algebra", "2022.2.7": "Further Algebra", 
    "2021.2.2": "Algebra", "2021.2.3": "Algebra", "2021.2.4": "Algebra", "2020.2.4": "Algebra", "2020.2.5": "Algebra", "2020.2.8": "Algebra", "2019.2.2": "Algebra", "2019.2.3": "Algebra", 
    "2018.2.1": "Algebra", "2018.2.2": "Algebra", "2018.2.3": "Algebra", "2017.2.6": "Algebra", "2016.2.2": "Algebra", "2016.2.3": "Algebra", "2015.2.4": "Algebra", "2014.2.7": "Algebra", "2014.2.8": "Algebra",
    "2013.2.1": "Algebra", "2013.2.3": "Algebra", "2013.2.5": "Algebra", "2013.2.7": "Algebra", "2013.2.8": "Algebra", "2012.2.2": "Algebra", "2012.2.4": "Further Algebra", "2012.2.5": "Algebra",
    "2011.2.1": "Algebra", "2011.2.2": "Algebra", "2011.2.3": "Algebra", "2010.2.7": "Further Algebra", "2009.2.1": "Algebra", "2009.2.2": "Further Algebra", "2009.2.4": "Further Algebra",
    "2008.2.2": "Further Algebra", "2008.2.3": "Algebra", "2008.2.4": "Further Algebra", "2008.2.6": "Algebra", 
    
    // STEP 3 ALGEBRA
    "2024.3.2": "Algebra", "2023.3.4": "Further Algebra", "2022.3.3": "Further Algebra", "2020.3.5": "Further Algebra", "2019.3.2": "Further Algebra", "2019.3.4": "Further Algebra", "2019.3.7": "Further Algebra",
    "2018.3.1": "Further Algebra", "2018.3.4": "Further Algebra", "2018.3.5": "Further Algebra", "2017.3.3": "Further Algebra", "2017.3.4": "Further Algebra", "2017.3.7": "Further Algebra",
    "2016.3.4": "Further Algebra", "2016.3.5": "Further Algebra", "2016.3.8": "Further Algebra", "2015.3.4": "Further Algebra", "2015.3.7": "Further Algebra", "2014.3.1": "Further Algebra", "2014.3.8": "Further Algebra",
    "2012.3.2": "Further Algebra", "2012.3.3": "Further Algebra", "2012.3.4": "Further Algebra", "2012.3.8": "Further Algebra", "2011.3.2": "Further Algebra", "2011.3.7": "Further Algebra", 
    "2010.3.4": "Further Algebra", "2010.3.7": "Further Algebra", "2009.3.3": "Further Algebra", "2009.3.5": "Further Algebra", "2008.3.1": "Algebra", "2008.3.2": "Further Algebra", "2008.3.3": "Further Algebra", "2008.3.8": "Algebra",

    // COORDINATE GEOMETRY
    "2024.2.3": "Geometry", "2024.2.7": "Geometry", "2020.2.2": "Geometry", "2019.2.1": "Geometry", "2017.2.5": "Geometry", "2016.2.1": "Geometry", "2015.2.7": "Geometry", "2014.2.3": "Geometry",
    "2013.2.1": "Geometry", "2013.2.4": "Geometry", "2011.2.8": "Geometry", "2010.2.1": "Geometry", "2009.2.1": "Geometry",
    "2024.3.4": "Geometry", "2024.3.8": "Geometry", "2023.3.1": "Geometry", "2022.3.1": "Geometry", "2022.3.6": "Geometry", "2021.3.1": "Geometry", "2018.3.4": "Geometry", "2017.3.7": "Geometry",
    "2016.3.2": "Geometry", "2014.3.3": "Geometry", "2012.3.3": "Geometry", "2012.3.5": "Geometry", "2010.3.5": "Geometry", "2009.3.1": "Geometry", "2008.3.3": "Geometry",

    // SEQUENCES AND SERIES
    "2024.2.2": "Sequences", "2024.2.6": "Sequences", "2024.2.8": "Sequences", "2023.2.5": "Sequences", "2023.2.6": "Sequences", "2022.2.2": "Sequences", "2022.2.3": "Sequences", "2020.2.3": "Sequences",
    "2019.2.4": "Sequences", "2019.2.5": "Sequences", "2018.2.5": "Sequences", "2017.2.2": "Sequences", "2017.2.7": "Sequences", "2016.2.5": "Sequences", "2016.2.8": "Sequences", "2015.2.3": "Sequences", "2015.2.5": "Sequences",
    "2014.2.6": "Sequences", "2014.2.8": "Sequences", "2013.2.6": "Sequences", "2012.2.1": "Sequences", "2012.2.8": "Sequences", "2011.2.7": "Sequences", "2010.2.3": "Sequences", "2009.2.6": "Sequences",
    "2008.2.1": "Sequences", "2008.2.2": "Sequences", "2008.2.5": "Sequences",
    "2024.3.1": "Sequences", "2024.3.7": "Sequences", "2023.3.4": "Sequences", "2022.3.4": "Sequences", "2021.3.8": "Sequences", "2020.3.5": "Sequences", "2020.3.8": "Sequences", "2018.3.2": "Sequences",
    "2017.3.1": "Sequences", "2017.3.8": "Sequences", "2010.3.1": "Sequences", "2009.3.2": "Sequences", "2009.3.5": "Sequences", "2009.3.7": "Sequences", "2009.3.8": "Sequences", "2008.3.2": "Sequences", "2008.3.5": "Sequences", "2008.3.8": "Sequences",

    // TRIGONOMETRY
    "2023.2.2": "Trigonometry", "2021.2.1": "Trigonometry", "2021.2.6": "Trigonometry", "2019.2.4": "Trigonometry", "2018.2.2": "Trigonometry", "2018.2.3": "Trigonometry", "2018.2.4": "Trigonometry", "2017.2.3": "Trigonometry",
    "2016.2.4": "Trigonometry", "2015.2.2": "Trigonometry", "2015.2.5": "Trigonometry", "2014.2.1": "Trigonometry", "2014.2.6": "Trigonometry", "2012.2.6": "Trigonometry", "2011.2.3": "Trigonometry", "2011.2.4": "Trigonometry", "2011.2.6": "Trigonometry",
    "2010.2.1": "Trigonometry", "2010.2.2": "Trigonometry", "2010.2.6": "Trigonometry", "2009.2.3": "Trigonometry", "2008.2.4": "Trigonometry", "2008.2.6": "Trigonometry",
    
    // EXP & LOG
    "2017.2.4": "Exp/Log", "2017.2.7": "Exp/Log", "2015.2.1": "Exp/Log", "2012.2.4": "Exp/Log", "2010.2.8": "Exp/Log", "2024.3.3": "Exp/Log",

    // DIFFERENTIATION
    "2017.2.3": "Differentiation", "2015.2.1": "Differentiation", "2014.2.2": "Differentiation", "2013.2.5": "Differentiation", "2012.2.5": "Differentiation", "2010.2.1": "Differentiation",
    "2009.2.2": "Differentiation", "2009.2.7": "Differentiation", "2008.2.3": "Differentiation", "2008.2.4": "Differentiation", "2008.2.7": "Differentiation", "2019.3.2": "Differentiation", "2009.3.7": "Differentiation",
    
    // DIFFERENTIAL EQUATIONS (PURE)
    "2022.2.6": "Diff Eqs", "2021.2.5": "Diff Eqs", "2020.2.2": "Diff Eqs", "2019.2.6": "Diff Eqs", "2016.2.6": "Diff Eqs", "2014.2.5": "Diff Eqs", "2008.2.7": "Diff Eqs",
    "2024.3.6": "Diff Eqs", "2023.3.8": "Diff Eqs", "2020.3.7": "Diff Eqs", "2019.3.1": "Diff Eqs", "2018.3.2": "Diff Eqs", "2018.3.3": "Diff Eqs", "2015.3.8": "Diff Eqs", "2013.3.2": "Diff Eqs", "2013.3.7": "Diff Eqs",
    "2012.3.1": "Diff Eqs", "2012.3.7": "Diff Eqs", "2011.3.1": "Diff Eqs", "2010.3.7": "Diff Eqs", "2010.3.8": "Diff Eqs", "2009.3.2": "Diff Eqs", "2008.3.6": "Diff Eqs",

    // INTEGRATION
    "2024.2.8": "Integration", "2022.2.1": "Integration", "2020.2.1": "Integration", "2019.2.2": "Integration", "2018.2.5": "Integration", "2017.2.4": "Integration", "2016.2.7": "Integration", "2015.2.6": "Integration",
    "2014.2.2": "Integration", "2013.2.8": "Integration", "2012.2.3": "Integration", "2011.2.6": "Integration", "2010.2.2": "Integration", "2010.2.4": "Integration", "2009.2.5": "Integration", "2009.2.7": "Integration", "2008.2.5": "Integration", "2008.2.7": "Integration",
    "2023.3.7": "Integration", "2022.3.5": "Integration", "2021.3.3": "Integration", "2011.3.6": "Integration", "2009.3.4": "Integration", "2008.3.4": "Integration",

    // FURTHER CALCULUS
    "2023.2.1": "Further Calculus", "2021.2.8": "Further Calculus", "2018.2.8": "Further Calculus", "2017.2.1": "Further Calculus", "2014.2.4": "Further Calculus", "2013.2.2": "Further Calculus",
    "2021.3.3": "Further Calculus", "2020.3.1": "Further Calculus", "2019.3.5": "Further Calculus", "2018.3.8": "Further Calculus", "2017.3.6": "Further Calculus", "2016.3.1": "Further Calculus", "2016.3.3": "Further Calculus", "2015.3.1": "Further Calculus",
    "2014.3.2": "Further Calculus", "2014.3.4": "Further Calculus", "2014.3.6": "Further Calculus", "2013.3.1": "Further Calculus", "2011.3.4": "Further Calculus", "2010.3.2": "Further Calculus", "2009.3.8": "Further Calculus",

    // VECTORS
    "2024.2.4": "Vectors", "2023.2.8": "Vectors", "2019.2.7": "Vectors", "2018.2.7": "Vectors", "2017.2.8": "Vectors", "2015.2.8": "Vectors", "2012.2.7": "Vectors", "2011.2.5": "Vectors", "2010.2.5": "Vectors", "2009.2.8": "Vectors", "2008.2.8": "Vectors",
    "2022.3.7": "Vectors", "2021.3.4": "Vectors", "2020.3.4": "Vectors", "2019.3.8": "Vectors", "2014.3.7": "Vectors", "2013.3.3": "Vectors", "2010.3.6": "Vectors",

    // COMPLEX NUMBERS
    "2023.2.7": "Complex Numbers", "2020.2.7": "Complex Numbers", "2014.2.6": "Complex Numbers",
    "2023.3.3": "Complex Numbers", "2022.3.8": "Complex Numbers", "2021.3.7": "Complex Numbers", "2020.3.3": "Complex Numbers", "2019.3.6": "Complex Numbers", "2018.3.6": "Complex Numbers", "2018.3.7": "Complex Numbers", "2017.3.2": "Complex Numbers",
    "2016.3.7": "Complex Numbers", "2015.3.6": "Complex Numbers", "2014.3.5": "Complex Numbers", "2013.3.4": "Complex Numbers", "2013.3.6": "Complex Numbers", "2013.3.8": "Complex Numbers", "2012.3.6": "Complex Numbers",
    "2011.3.3": "Complex Numbers", "2011.3.8": "Complex Numbers", "2010.3.3": "Complex Numbers", "2009.3.6": "Complex Numbers", "2008.3.7": "Complex Numbers",

    // MATRICES
    "2023.2.6": "Matrices", "2022.2.8": "Matrices", "2021.2.7": "Matrices", "2020.2.6": "Matrices", "2019.2.8": "Matrices", "2024.3.5": "Matrices", "2021.3.2": "Matrices", "2019.3.3": "Matrices",

    // POLAR COORDINATES
    "2023.3.2": "Polar Coords", "2021.3.5": "Polar Coords", "2020.3.6": "Polar Coords", "2017.3.5": "Polar Coords", "2015.3.3": "Polar Coords", "2011.3.5": "Polar Coords",

    // HYPERBOLIC FUNCTIONS
    "2023.3.6": "Hyperbolic", "2022.3.4": "Hyperbolic", "2021.3.6": "Hyperbolic", "2020.3.2": "Hyperbolic", "2016.3.6": "Hyperbolic", "2014.3.2": "Hyperbolic", "2014.3.6": "Hyperbolic", "2013.3.7": "Hyperbolic",
    "2011.3.6": "Hyperbolic", "2010.3.2": "Hyperbolic", "2008.3.4": "Hyperbolic",

    // --- STATISTICS ---
    // Probability
    "2024.2.12": "Probability", "2021.2.11": "Probability", "2021.2.12": "Probability", "2019.2.11": "Probability", "2018.2.12": "Probability", "2018.2.13": "Probability", "2017.2.13": "Probability", "2016.2.12": "Probability",
    "2015.2.12": "Probability", "2013.2.13": "Probability", "2012.2.12": "Probability", "2011.2.12": "Probability", "2010.2.13": "Probability", "2008.2.12": "Probability", "2008.2.13": "Probability",
    "2023.3.12": "Probability", "2020.3.12": "Probability", "2019.3.11": "Probability", "2019.3.12": "Probability", "2011.3.13": "Probability", "2010.3.12": "Probability",

    // Statistical Distributions
    "2024.2.11": "Distributions", "2023.2.11": "Distributions", "2022.2.11": "Distributions", "2020.2.12": "Distributions", "2018.2.12": "Distributions", "2014.2.13": "Distributions", "2009.2.13": "Distributions", "2008.2.12": "Distributions",
    "2024.3.11": "Distributions", "2022.3.11": "Distributions",

    // Probability Distributions
    "2023.2.12": "Prob Distributions", "2022.2.12": "Prob Distributions", "2019.2.12": "Prob Distributions", "2017.2.12": "Prob Distributions", "2016.2.13": "Prob Distributions", "2015.2.13": "Prob Distributions",
    "2014.2.12": "Prob Distributions", "2013.2.12": "Prob Distributions", "2012.2.13": "Prob Distributions", "2011.2.13": "Prob Distributions", "2010.2.12": "Prob Distributions",
    "2024.3.12": "Prob Distributions", "2023.3.11": "Prob Distributions", "2022.3.12": "Prob Distributions", "2021.3.11": "Prob Distributions", "2020.3.11": "Prob Distributions", "2019.3.11": "Prob Distributions",
    "2018.3.12": "Prob Distributions", "2016.3.12": "Prob Distributions", "2015.3.13": "Prob Distributions", "2014.3.12": "Prob Distributions", "2013.3.13": "Prob Distributions", "2012.3.12": "Prob Distributions", "2012.3.13": "Prob Distributions", "2009.3.13": "Prob Distributions", "2008.3.12": "Prob Distributions",

    // Independent Random Variables
    "2021.3.12": "Indep Rand Vars", "2020.3.12": "Indep Rand Vars", "2017.3.13": "Indep Rand Vars", "2015.3.13": "Indep Rand Vars", "2011.3.13": "Indep Rand Vars",

    // Algebra of Expectation
    "2019.2.12": "Expectation Alg", "2015.2.13": "Expectation Alg", "2013.2.12": "Expectation Alg", "2012.2.13": "Expectation Alg", "2011.2.13": "Expectation Alg",
    "2021.3.12": "Expectation Alg", "2016.3.13": "Expectation Alg", "2013.3.12": "Expectation Alg", "2013.3.13": "Expectation Alg", "2012.3.12": "Expectation Alg", "2012.3.13": "Expectation Alg", "2009.3.13": "Expectation Alg", "2008.3.13": "Expectation Alg",

    // --- MECHANICS ---
    // Kinematics
    "2024.2.9": "Kinematics", "2023.2.10": "Kinematics", "2022.2.10": "Kinematics", "2021.2.10": "Kinematics", "2020.2.9": "Kinematics", "2019.2.9": "Kinematics", "2017.2.11": "Kinematics", "2016.2.11": "Kinematics", "2014.2.10": "Kinematics",
    "2013.2.10": "Kinematics", "2012.2.9": "Kinematics", "2011.2.10": "Kinematics", "2010.2.9": "Kinematics", "2008.2.9": "Kinematics",
    "2014.3.9": "Kinematics", "2009.3.9": "Kinematics", "2008.3.9": "Kinematics",

    // Forces and Newton's Laws
    "2024.2.10": "Forces", "2023.2.9": "Forces", "2022.2.9": "Forces", "2021.2.9": "Forces", "2019.2.10": "Forces", "2018.2.11": "Forces", "2017.2.9": "Forces", "2017.2.10": "Forces", "2016.2.10": "Forces",
    "2014.2.9": "Forces", "2013.2.9": "Forces", "2012.2.10": "Forces", "2011.2.11": "Forces", "2010.2.11": "Forces", "2008.2.11": "Forces",
    "2024.3.10": "Forces", "2023.3.10": "Forces", "2020.3.9": "Forces", "2017.3.10": "Forces", "2011.3.11": "Forces", "2010.3.9": "Forces", "2010.3.11": "Forces", "2009.3.11": "Forces", "2008.3.9": "Forces",

    // Moments
    "2019.2.10": "Moments", "2014.2.9": "Moments", "2012.2.10": "Moments", "2010.2.11": "Moments", "2013.3.9": "Moments", "2013.3.11": "Moments",

    // Energy, Work, Power
    "2016.2.9": "Energy/Work", "2009.2.11": "Energy/Work", "2017.3.11": "Energy/Work",

    // Collisions
    "2020.2.9": "Collisions", "2018.2.9": "Collisions", "2016.2.11": "Collisions", "2015.2.11": "Collisions", "2013.2.11": "Collisions", "2012.2.11": "Collisions", "2011.2.9": "Collisions", "2010.2.10": "Collisions", "2009.2.10": "Collisions", "2008.2.10": "Collisions",
    "2024.3.9": "Collisions", "2022.3.9": "Collisions", "2021.3.9": "Collisions", "2021.3.10": "Collisions", "2019.3.10": "Collisions", "2018.3.9": "Collisions", "2011.3.10": "Collisions",

    // Hooke's Law
    "2020.2.10": "Hooke's Law", "2015.2.10": "Hooke's Law", "2014.2.11": "Hooke's Law", "2011.2.10": "Hooke's Law",
    "2020.3.10": "Hooke's Law", "2012.3.10": "Hooke's Law", "2011.3.10": "Hooke's Law", "2010.3.10": "Hooke's Law", "2009.3.10": "Hooke's Law", "2008.3.10": "Hooke's Law",

    // Centre of Mass
    "2016.2.10": "Centre of Mass", "2015.2.9": "Centre of Mass", "2009.2.9": "Centre of Mass", "2013.3.9": "Centre of Mass", "2013.3.11": "Centre of Mass",

    // Circular Motion
    "2020.2.10": "Circular Motion", "2015.2.9": "Circular Motion", 
    "2021.3.10": "Circular Motion", "2018.3.11": "Circular Motion", "2016.3.10": "Circular Motion", "2015.3.11": "Circular Motion", "2014.3.11": "Circular Motion", "2012.3.10": "Circular Motion", "2011.3.9": "Circular Motion", "2010.3.10": "Circular Motion",

    // Differential Equations (Mechanics)
    "2018.2.10": "Mech Diff Eqs", "2017.2.10": "Mech Diff Eqs", "2009.2.11": "Mech Diff Eqs",
    "2023.3.9": "Mech Diff Eqs", "2016.3.9": "Mech Diff Eqs", "2016.3.11": "Mech Diff Eqs", "2015.3.9": "Mech Diff Eqs", "2015.3.10": "Mech Diff Eqs", "2014.3.10": "Mech Diff Eqs", "2013.3.9": "Mech Diff Eqs", "2009.3.10": "Mech Diff Eqs", "2009.3.11": "Mech Diff Eqs", "2008.3.9": "Mech Diff Eqs"
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
                const broadType = getQuestionType(year, num);
                const id = `${year}.${paper}.${num}`; 
                
                // Lookup Specific Topic, Fallback to Broad Type if not found
                const specificTopic = TOPIC_LOOKUP[id] || (broadType.charAt(0).toUpperCase() + broadType.slice(1));

                allQuestions.push({
                    id: id,
                    year: year,
                    paper: paper,
                    number: num,
                    type: broadType, // pure, mechanics, stats
                    topic: specificTopic, // "Vectors", "Calculus", etc.
                    filename: `${id}.png`
                });
            }
        });
    }
}

// --- MODE SWITCHING ---

function switchMode(mode) {
    currentMode = mode;
    
    document.getElementById('tab-practice').classList.toggle('active', mode === 'practice');
    document.getElementById('tab-mock').classList.toggle('active', mode === 'mock');

    document.getElementById('controls-practice').style.display = (mode === 'practice') ? 'flex' : 'none';
    document.getElementById('controls-mock').style.display = (mode === 'mock') ? 'flex' : 'none';

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

// --- GRADE BOUNDARIES ---

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
            
            if (q && GRADE_DATA[q.paper] && GRADE_DATA[q.paper][q.year]) {
                const boundaries = GRADE_DATA[q.paper][q.year];
                sums["S"] += boundaries["S"];
                sums["1"] += boundaries["1"];
                sums["2"] += boundaries["2"];
                sums["3"] += boundaries["3"];
                count++;
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
    }
}

window.closeModal = function() {
    document.getElementById('modal-backdrop').style.display = 'none';
}


// --- PDF MARK SCHEMES ---

window.showMarkScheme = function() {
    if (!currentQuestionId) {
        alert("Please select a question first.");
        return;
    }

    const q = allQuestions.find(item => item.id === currentQuestionId);
    if (!q) return;

    const pdfPath = `mark_schemes/${q.year}.${q.paper}.pdf`;
    
    const paperRoman = (q.paper === 2) ? "II" : "III";
    document.getElementById('pdf-title').innerText = `Mark Scheme - ${q.year} Paper ${paperRoman}`;
    document.getElementById('pdf-frame').src = pdfPath;
    document.getElementById('pdf-new-tab').href = pdfPath;
    document.getElementById('pdf-backdrop').style.display = 'flex';
}

window.closePdfModal = function() {
    document.getElementById('pdf-backdrop').style.display = 'none';
    document.getElementById('pdf-frame').src = "";
}


// --- UI FUNCTIONS ---

function loadFilters() {
    const yearSelect = document.getElementById('sel-year');
    const mockStart = document.getElementById('mock-start-year');
    const mockEnd = document.getElementById('mock-end-year');
    const topicSelect = document.getElementById('sel-topic');

    // Populate Years
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

    // Populate Topics Groups
    const topics = {
        "Pure": ["Proof", "Numerical Reasoning", "Algebra", "Further Algebra", "Geometry", "Sequences", "Trigonometry", "Exp/Log", "Differentiation", "Diff Eqs", "Integration", "Further Calculus", "Vectors", "Complex Numbers", "Matrices", "Polar Coords", "Hyperbolic"],
        "Mechanics": ["Kinematics", "Forces", "Moments", "Energy/Work", "Collisions", "Hooke's Law", "Centre of Mass", "Circular Motion", "Mech Diff Eqs"],
        "Statistics": ["Probability", "Distributions", "Prob Distributions", "Indep Rand Vars", "Expectation Alg"]
    };

    for (const [groupName, groupTopics] of Object.entries(topics)) {
        let group = document.createElement('optgroup');
        group.label = groupName;
        groupTopics.forEach(t => {
            let opt = document.createElement('option');
            opt.value = t;
            opt.innerText = t;
            group.appendChild(opt);
        });
        topicSelect.appendChild(group);
    }
}

function generateRandom() {
    // Broad Filters
    const allowP2 = document.getElementById('chk-p2').checked;
    const allowP3 = document.getElementById('chk-p3').checked;
    const allowPure = document.getElementById('chk-pure').checked;
    const allowMech = document.getElementById('chk-mech').checked;
    const allowStats = document.getElementById('chk-stats').checked;
    
    // Topic Filter
    const selectedTopic = document.getElementById('sel-topic').value;

    const eligible = allQuestions.filter(q => {
        // 1. Paper Filter
        if (q.paper === 2 && !allowP2) return false;
        if (q.paper === 3 && !allowP3) return false;
        
        // 2. Broad Type Filter
        if (q.type === 'pure' && !allowPure) return false;
        if (q.type === 'mechanics' && !allowMech) return false;
        if (q.type === 'stats' && !allowStats) return false;

        // 3. Topic Filter (New)
        if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;

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

window.loadFromTable = function(id) {
    const found = allQuestions.find(q => q.id === id);
    if(found) displayQuestion(found);
}

function displayQuestion(q) {
    currentQuestionId = q.id;
    
    const paperLabel = (q.paper === 2) ? "II" : "III";
    // Added Topic to Info Bar
    const info = `Year: ${q.year} | Paper: ${paperLabel} | Question ${q.number} | ${q.topic}`;
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

window.renderTable = function() {
    const tbody = document.getElementById('tracker-body');
    tbody.innerHTML = '';

    let questionsToShow = [];
    
    // Get filters for Practice Mode
    const allowP2 = document.getElementById('chk-p2').checked;
    const allowP3 = document.getElementById('chk-p3').checked;
    const allowPure = document.getElementById('chk-pure').checked;
    const allowMech = document.getElementById('chk-mech').checked;
    const allowStats = document.getElementById('chk-stats').checked;
    const selectedTopic = document.getElementById('sel-topic').value;

    if (currentMode === 'practice') {
        // Apply filters to ALL questions
        questionsToShow = allQuestions.filter(q => {
            if (q.paper === 2 && !allowP2) return false;
            if (q.paper === 3 && !allowP3) return false;
            if (q.type === 'pure' && !allowPure) return false;
            if (q.type === 'mechanics' && !allowMech) return false;
            if (q.type === 'stats' && !allowStats) return false;
            if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
            return true;
        });

        questionsToShow.sort((a,b) => b.year - a.year || a.paper - b.paper || a.number - b.number);
    } else {
        if (currentMockIds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No mock generated yet. Adjust settings above and click "Generate Paper".</td></tr>';
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
        
        // Topic Column
        const tdTopic = `<td class="col-topic">${q.topic}</td>`;
        
        const tdDate = `<td class="col-date"><input type="date" value="${data.date}" onchange="updateProgress('${q.id}', 'date', this.value)"></td>`;
        const tdMarks = `<td class="col-marks"><input type="number" value="${data.marks}" onchange="updateProgress('${q.id}', 'marks', this.value)"></td>`;
        
        const tdNotes = `
            <td class="col-notes">
                <div class="note-cell">
                    <textarea class="note-input" placeholder="Notes..." onchange="updateProgress('${q.id}', 'notes', this.value)">${data.notes}</textarea>
                </div>
            </td>`;

        tr.innerHTML = tdCheck + tdName + tdTopic + tdDate + tdMarks + tdNotes;
        tbody.appendChild(tr);
    });
}

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