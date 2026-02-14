/* script.js */

// --- FIREBASE IMPORTS & SETUP ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpGj9r0kHO2_oYx7bYxgEzUh8-XTT3kRE",
  authDomain: "stepbot3-e3547.firebaseapp.com",
  projectId: "stepbot3-e3547",
  storageBucket: "stepbot3-e3547.firebasestorage.app",
  messagingSenderId: "726714235429",
  appId: "1:726714235429:web:e51c16b882350b2f0c9dcc"
};

// Initialize Firebase
let app, auth, db, provider;
let currentUser = null;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
    console.log("Firebase initialized");
} catch (e) {
    console.error("Firebase failed:", e);
}

// --- DATA ---
const GRADE_DATA = {
    2: { 2025: {"S":92,"1":75,"2":61,"3":35}, 2024: {"S":93,"1":69,"2":51,"3":26}, 2023: {"S":90,"1":65,"2":50,"3":30}, 2022: {"S":81,"1":62,"2":52,"3":28}, 2021: {"S":92,"1":67,"2":54,"3":25}, 2020: {"S":77,"1":54,"2":42,"3":30}, 2019: {"S":90,"1":68,"2":55,"3":36}, 2018: {"S":100,"1":77,"2":65,"3":34}, 2017: {"S":101,"1":80,"2":69,"3":31}, 2016: {"S":95,"1":74,"2":65,"3":30}, 2015: {"S":94,"1":68,"2":60,"3":30}, 2014: {"S":95,"1":74,"2":64,"3":30}, 2013: {"S":100,"1":79,"2":67,"3":32}, 2012: {"S":91,"1":72,"2":60,"3":31}, 2011: {"S":83,"1":62,"2":49,"3":29}, 2010: {"S":105,"1":79,"2":64,"3":40}, 2009: {"S":98,"1":71,"2":61,"3":39}, 2008: {"S":94,"1":69,"2":58,"3":35} },
    3: { 2025: {"S":86,"1":61,"2":49,"3":27}, 2024: {"S":85,"1":64,"2":54,"3":32}, 2023: {"S":82,"1":62,"2":51,"3":29}, 2022: {"S":89,"1":67,"2":54,"3":29}, 2021: {"S":92,"1":67,"2":54,"3":25}, 2020: {"S":88,"1":67,"2":53,"3":30}, 2019: {"S":77,"1":57,"2":48,"3":27}, 2018: {"S":87,"1":59,"2":49,"3":27}, 2017: {"S":95,"1":69,"2":57,"3":28}, 2016: {"S":88,"1":64,"2":55,"3":32}, 2015: {"S":88,"1":65,"2":54,"3":29}, 2014: {"S":81,"1":59,"2":48,"3":27}, 2013: {"S":85,"1":62,"2":48,"3":27}, 2012: {"S":84,"1":65,"2":53,"3":32}, 2011: {"S":91,"1":65,"2":53,"3":32}, 2010: {"S":78,"1":56,"2":46,"3":29}, 2009: {"S":95,"1":67,"2":55,"3":38}, 2008: {"S":82,"1":63,"2":52,"3":34} }
};

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
    // SEQUENCES
    "2024.2.2": "Sequences", "2024.2.6": "Sequences", "2024.2.8": "Sequences", "2023.2.5": "Sequences", "2023.2.6": "Sequences", "2022.2.2": "Sequences", "2022.2.3": "Sequences", "2020.2.3": "Sequences",
    "2019.2.4": "Sequences", "2019.2.5": "Sequences", "2018.2.5": "Sequences", "2017.2.2": "Sequences", "2017.2.7": "Sequences", "2016.2.5": "Sequences", "2016.2.8": "Sequences", "2015.2.3": "Sequences", "2015.2.5": "Sequences",
    "2014.2.6": "Sequences", "2014.2.8": "Sequences", "2013.2.6": "Sequences", "2012.2.1": "Sequences", "2012.2.8": "Sequences", "2011.2.7": "Sequences", "2010.2.3": "Sequences", "2009.2.6": "Sequences",
    "2008.2.1": "Sequences", "2008.2.2": "Sequences", "2008.2.5": "Sequences",
    "2024.3.1": "Sequences", "2024.3.7": "Sequences", "2023.3.4": "Sequences", "2022.3.4": "Sequences", "2021.3.8": "Sequences", "2020.3.5": "Sequences", "2020.3.8": "Sequences", "2018.3.2": "Sequences",
    "2017.3.1": "Sequences", "2017.3.8": "Sequences", "2010.3.1": "Sequences", "2009.3.2": "Sequences", "2009.3.5": "Sequences", "2009.3.7": "Sequences", "2009.3.8": "Sequences", "2008.3.2": "Sequences", "2008.3.5": "Sequences", "2008.3.8": "Sequences",
    // TRIG
    "2023.2.2": "Trigonometry", "2021.2.1": "Trigonometry", "2021.2.6": "Trigonometry", "2019.2.4": "Trigonometry", "2018.2.2": "Trigonometry", "2018.2.3": "Trigonometry", "2018.2.4": "Trigonometry", "2017.2.3": "Trigonometry",
    "2016.2.4": "Trigonometry", "2015.2.2": "Trigonometry", "2015.2.5": "Trigonometry", "2014.2.1": "Trigonometry", "2014.2.6": "Trigonometry", "2012.2.6": "Trigonometry", "2011.2.3": "Trigonometry", "2011.2.4": "Trigonometry", "2011.2.6": "Trigonometry",
    "2010.2.1": "Trigonometry", "2010.2.2": "Trigonometry", "2010.2.6": "Trigonometry", "2009.2.3": "Trigonometry", "2008.2.4": "Trigonometry", "2008.2.6": "Trigonometry",
    // EXP
    "2017.2.4": "Exp/Log", "2017.2.7": "Exp/Log", "2015.2.1": "Exp/Log", "2012.2.4": "Exp/Log", "2010.2.8": "Exp/Log", "2024.3.3": "Exp/Log",
    // DIFF
    "2017.2.3": "Differentiation", "2015.2.1": "Differentiation", "2014.2.2": "Differentiation", "2013.2.5": "Differentiation", "2012.2.5": "Differentiation", "2010.2.1": "Differentiation",
    "2009.2.2": "Differentiation", "2009.2.7": "Differentiation", "2008.2.3": "Differentiation", "2008.2.4": "Differentiation", "2008.2.7": "Differentiation", "2019.3.2": "Differentiation", "2009.3.7": "Differentiation",
    // DIFF EQS
    "2022.2.6": "Diff Eqs", "2021.2.5": "Diff Eqs", "2020.2.2": "Diff Eqs", "2019.2.6": "Diff Eqs", "2016.2.6": "Diff Eqs", "2014.2.5": "Diff Eqs", "2008.2.7": "Diff Eqs",
    "2024.3.6": "Diff Eqs", "2023.3.8": "Diff Eqs", "2020.3.7": "Diff Eqs", "2019.3.1": "Diff Eqs", "2018.3.2": "Diff Eqs", "2018.3.3": "Diff Eqs", "2015.3.8": "Diff Eqs", "2013.3.2": "Diff Eqs", "2013.3.7": "Diff Eqs",
    "2012.3.1": "Diff Eqs", "2012.3.7": "Diff Eqs", "2011.3.1": "Diff Eqs", "2010.3.7": "Diff Eqs", "2010.3.8": "Diff Eqs", "2009.3.2": "Diff Eqs", "2008.3.6": "Diff Eqs",
    // INTEGRATION
    "2024.2.8": "Integration", "2022.2.1": "Integration", "2020.2.1": "Integration", "2019.2.2": "Integration", "2018.2.5": "Integration", "2017.2.4": "Integration", "2016.2.7": "Integration", "2015.2.6": "Integration",
    "2014.2.2": "Integration", "2013.2.8": "Integration", "2012.2.3": "Integration", "2011.2.6": "Integration", "2010.2.2": "Integration", "2010.2.4": "Integration", "2009.2.5": "Integration", "2009.2.7": "Integration", "2008.2.5": "Integration", "2008.2.7": "Integration",
    "2023.3.7": "Integration", "2022.3.5": "Integration", "2021.3.3": "Integration", "2011.3.6": "Integration", "2009.3.4": "Integration", "2008.3.4": "Integration",
    // FURTHER CALC
    "2023.2.1": "Further Calculus", "2021.2.8": "Further Calculus", "2018.2.8": "Further Calculus", "2017.2.1": "Further Calculus", "2014.2.4": "Further Calculus", "2013.2.2": "Further Calculus",
    "2021.3.3": "Further Calculus", "2020.3.1": "Further Calculus", "2019.3.5": "Further Calculus", "2018.3.8": "Further Calculus", "2017.3.6": "Further Calculus", "2016.3.1": "Further Calculus", "2016.3.3": "Further Calculus", "2015.3.1": "Further Calculus",
    "2014.3.2": "Further Calculus", "2014.3.4": "Further Calculus", "2014.3.6": "Further Calculus", "2013.3.1": "Further Calculus", "2011.3.4": "Further Calculus", "2010.3.2": "Further Calculus", "2009.3.8": "Further Calculus",
    // VECTORS
    "2024.2.4": "Vectors", "2023.2.8": "Vectors", "2019.2.7": "Vectors", "2018.2.7": "Vectors", "2017.2.8": "Vectors", "2015.2.8": "Vectors", "2012.2.7": "Vectors", "2011.2.5": "Vectors", "2010.2.5": "Vectors", "2009.2.8": "Vectors", "2008.2.8": "Vectors",
    "2022.3.7": "Vectors", "2021.3.4": "Vectors", "2020.3.4": "Vectors", "2019.3.8": "Vectors", "2014.3.7": "Vectors", "2013.3.3": "Vectors", "2010.3.6": "Vectors",
    // COMPLEX
    "2023.2.7": "Complex Numbers", "2020.2.7": "Complex Numbers", "2014.2.6": "Complex Numbers",
    "2023.3.3": "Complex Numbers", "2022.3.8": "Complex Numbers", "2021.3.7": "Complex Numbers", "2020.3.3": "Complex Numbers", "2019.3.6": "Complex Numbers", "2018.3.6": "Complex Numbers", "2018.3.7": "Complex Numbers", "2017.3.2": "Complex Numbers",
    "2016.3.7": "Complex Numbers", "2015.3.6": "Complex Numbers", "2014.3.5": "Complex Numbers", "2013.3.4": "Complex Numbers", "2013.3.6": "Complex Numbers", "2013.3.8": "Complex Numbers", "2012.3.6": "Complex Numbers",
    "2011.3.3": "Complex Numbers", "2011.3.8": "Complex Numbers", "2010.3.3": "Complex Numbers", "2009.3.6": "Complex Numbers", "2008.3.7": "Complex Numbers",
    // MATRICES
    "2023.2.6": "Matrices", "2022.2.8": "Matrices", "2021.2.7": "Matrices", "2020.2.6": "Matrices", "2019.2.8": "Matrices", "2024.3.5": "Matrices", "2021.3.2": "Matrices", "2019.3.3": "Matrices",
    // POLAR
    "2023.3.2": "Polar Coords", "2021.3.5": "Polar Coords", "2020.3.6": "Polar Coords", "2017.3.5": "Polar Coords", "2015.3.3": "Polar Coords", "2011.3.5": "Polar Coords",
    // HYPERBOLIC
    "2023.3.6": "Hyperbolic", "2022.3.4": "Hyperbolic", "2021.3.6": "Hyperbolic", "2020.3.2": "Hyperbolic", "2016.3.6": "Hyperbolic", "2014.3.2": "Hyperbolic", "2014.3.6": "Hyperbolic", "2013.3.7": "Hyperbolic",
    "2011.3.6": "Hyperbolic", "2010.3.2": "Hyperbolic", "2008.3.4": "Hyperbolic",
    // STATS
    "2024.2.12": "Probability", "2021.2.11": "Probability", "2021.2.12": "Probability", "2019.2.11": "Probability", "2018.2.12": "Probability", "2018.2.13": "Probability", "2017.2.13": "Probability", "2016.2.12": "Probability",
    "2015.2.12": "Probability", "2013.2.13": "Probability", "2012.2.12": "Probability", "2011.2.12": "Probability", "2010.2.13": "Probability", "2008.2.12": "Probability", "2008.2.13": "Probability",
    "2023.3.12": "Probability", "2020.3.12": "Probability", "2019.3.11": "Probability", "2019.3.12": "Probability", "2011.3.13": "Probability", "2010.3.12": "Probability",
    "2024.2.11": "Distributions", "2023.2.11": "Distributions", "2022.2.11": "Distributions", "2020.2.12": "Distributions", "2018.2.12": "Distributions", "2014.2.13": "Distributions", "2009.2.13": "Distributions", "2008.2.12": "Distributions",
    "2024.3.11": "Distributions", "2022.3.11": "Distributions",
    "2023.2.12": "Prob Distributions", "2022.2.12": "Prob Distributions", "2019.2.12": "Prob Distributions", "2017.2.12": "Prob Distributions", "2016.2.13": "Prob Distributions", "2015.2.13": "Prob Distributions",
    "2014.2.12": "Prob Distributions", "2013.2.12": "Prob Distributions", "2012.2.13": "Prob Distributions", "2011.2.13": "Prob Distributions", "2010.2.12": "Prob Distributions",
    "2024.3.12": "Prob Distributions", "2023.3.11": "Prob Distributions", "2022.3.12": "Prob Distributions", "2021.3.11": "Prob Distributions", "2020.3.11": "Prob Distributions", "2019.3.11": "Prob Distributions",
    "2018.3.12": "Prob Distributions", "2016.3.12": "Prob Distributions", "2015.3.13": "Prob Distributions", "2014.3.12": "Prob Distributions", "2013.3.13": "Prob Distributions", "2012.3.12": "Prob Distributions", "2012.3.13": "Prob Distributions", "2009.3.13": "Prob Distributions", "2008.3.12": "Prob Distributions",
    "2021.3.12": "Indep Rand Vars", "2020.3.12": "Indep Rand Vars", "2017.3.13": "Indep Rand Vars", "2015.3.13": "Indep Rand Vars", "2011.3.13": "Indep Rand Vars",
    "2019.2.12": "Expectation Alg", "2015.2.13": "Expectation Alg", "2013.2.12": "Expectation Alg", "2012.2.13": "Expectation Alg", "2011.2.13": "Expectation Alg",
    "2021.3.12": "Expectation Alg", "2016.3.13": "Expectation Alg", "2013.3.12": "Expectation Alg", "2013.3.13": "Expectation Alg", "2012.3.12": "Expectation Alg", "2012.3.13": "Expectation Alg", "2009.3.13": "Expectation Alg", "2008.3.13": "Expectation Alg",
    // MECHANICS
    "2024.2.9": "Kinematics", "2023.2.10": "Kinematics", "2022.2.10": "Kinematics", "2021.2.10": "Kinematics", "2020.2.9": "Kinematics", "2019.2.9": "Kinematics", "2017.2.11": "Kinematics", "2016.2.11": "Kinematics", "2014.2.10": "Kinematics",
    "2013.2.10": "Kinematics", "2012.2.9": "Kinematics", "2011.2.10": "Kinematics", "2010.2.9": "Kinematics", "2008.2.9": "Kinematics",
    "2014.3.9": "Kinematics", "2009.3.9": "Kinematics", "2008.3.9": "Kinematics",
    "2024.2.10": "Forces", "2023.2.9": "Forces", "2022.2.9": "Forces", "2021.2.9": "Forces", "2019.2.10": "Forces", "2018.2.11": "Forces", "2017.2.9": "Forces", "2017.2.10": "Forces", "2016.2.10": "Forces",
    "2014.2.9": "Forces", "2013.2.9": "Forces", "2012.2.10": "Forces", "2011.2.11": "Forces", "2010.2.11": "Forces", "2008.2.11": "Forces",
    "2024.3.10": "Forces", "2023.3.10": "Forces", "2020.3.9": "Forces", "2017.3.10": "Forces", "2011.3.11": "Forces", "2010.3.9": "Forces", "2010.3.11": "Forces", "2009.3.11": "Forces", "2008.3.9": "Forces",
    "2019.2.10": "Moments", "2014.2.9": "Moments", "2012.2.10": "Moments", "2010.2.11": "Moments", "2013.3.9": "Moments", "2013.3.11": "Moments",
    "2016.2.9": "Energy/Work", "2009.2.11": "Energy/Work", "2017.3.11": "Energy/Work",
    "2020.2.9": "Collisions", "2018.2.9": "Collisions", "2016.2.11": "Collisions", "2015.2.11": "Collisions", "2013.2.11": "Collisions", "2012.2.11": "Collisions", "2011.2.9": "Collisions", "2010.2.10": "Collisions", "2009.2.10": "Collisions", "2008.2.10": "Collisions",
    "2024.3.9": "Collisions", "2022.3.9": "Collisions", "2021.3.9": "Collisions", "2021.3.10": "Collisions", "2019.3.10": "Collisions", "2018.3.9": "Collisions", "2011.3.10": "Collisions",
    "2020.2.10": "Hooke's Law", "2015.2.10": "Hooke's Law", "2014.2.11": "Hooke's Law", "2011.2.10": "Hooke's Law",
    "2020.3.10": "Hooke's Law", "2012.3.10": "Hooke's Law", "2011.3.10": "Hooke's Law", "2010.3.10": "Hooke's Law", "2009.3.10": "Hooke's Law", "2008.3.10": "Hooke's Law",
    "2016.2.10": "Centre of Mass", "2015.2.9": "Centre of Mass", "2009.2.9": "Centre of Mass", "2013.3.9": "Centre of Mass", "2013.3.11": "Centre of Mass",
    "2020.2.10": "Circular Motion", "2015.2.9": "Circular Motion", 
    "2021.3.10": "Circular Motion", "2018.3.11": "Circular Motion", "2016.3.10": "Circular Motion", "2015.3.11": "Circular Motion", "2014.3.11": "Circular Motion", "2012.3.10": "Circular Motion", "2011.3.9": "Circular Motion", "2010.3.10": "Circular Motion",
    "2018.2.10": "Mech Diff Eqs", "2017.2.10": "Mech Diff Eqs", "2009.2.11": "Mech Diff Eqs",
    "2023.3.9": "Mech Diff Eqs", "2016.3.9": "Mech Diff Eqs", "2016.3.11": "Mech Diff Eqs", "2015.3.9": "Mech Diff Eqs", "2015.3.10": "Mech Diff Eqs", "2014.3.10": "Mech Diff Eqs", "2013.3.9": "Mech Diff Eqs", "2009.3.10": "Mech Diff Eqs", "2009.3.11": "Mech Diff Eqs", "2008.3.9": "Mech Diff Eqs"
};

// Global state
let allQuestions = [];
let userProgress = JSON.parse(localStorage.getItem('stepTrackerData')) || {};
let currentMode = 'practice'; 
let currentMockIds = JSON.parse(localStorage.getItem('stepBotMockIds')) || []; 
let currentQuestionId = null;
let timerInterval = null;
let secondsElapsed = 0;
let sortState = { field: null, direction: 'asc' }; // Track current sort

// Initialize
window.onload = function() {
    generateQuestionList();
    loadFilters(); 
    renderTable(); 
    
    // Auth Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            loadCloudData(user);
            createAuthButton(true);
        } else {
            currentUser = null;
            createAuthButton(false);
        }
    });
};

// --- AUTH FUNCTIONS (Window Attached) ---

function createAuthButton(isLoggedIn) {
    const existing = document.getElementById('auth-btn');
    if(existing) existing.remove();

    const btn = document.createElement('button');
    btn.id = 'auth-btn';
    btn.style.marginLeft = 'auto'; 
    btn.className = isLoggedIn ? 'secondary' : 'primary';
    btn.innerText = isLoggedIn ? 'Sign Out' : 'Sign In with Google';
    
    // Directly assign function (safe inside module)
    btn.onclick = isLoggedIn ? logout : login;
    
    const headerTop = document.querySelector('.header-top');
    if(headerTop) headerTop.appendChild(btn);
}

async function login() {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login failed", error);
        alert("Login failed: " + error.message);
    }
}

async function logout() {
    try {
        await signOut(auth);
        alert("Signed out. Switching to local storage.");
        location.reload();
    } catch (error) {
        console.error("Logout failed", error);
    }
}

async function loadCloudData(user) {
    const docRef = doc(db, "users", user.uid);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const cloudData = docSnap.data().progress;
            userProgress = cloudData;
            localStorage.setItem('stepTrackerData', JSON.stringify(userProgress));
            renderTable();
            if(currentQuestionId) displayQuestion(allQuestions.find(q => q.id === currentQuestionId));
            console.log("Synced");
        } else {
            saveToCloud(); // Upload local data if new user
        }
    } catch (e) {
        console.error("Error loading cloud data", e);
    }
}

async function saveToCloud() {
    if(!currentUser) return;
    try {
        await setDoc(doc(db, "users", currentUser.uid), { 
            progress: userProgress,
            lastUpdated: new Date()
        });
    } catch (e) {
        console.error("Error saving to cloud", e);
    }
}

// --- LOGIC ---

function getQuestionType(year, number) {
    if (number <= 8) return 'pure';
    if (year <= 2018) { // Updated to 2018 based on specification change
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
            let maxQ = (year <= 2018) ? 13 : 12; // Updated to 2018
            for (let num = 1; num <= maxQ; num++) {
                const broadType = getQuestionType(year, num);
                const id = `${year}.${paper}.${num}`; 
                const specificTopic = TOPIC_LOOKUP[id] || (broadType.charAt(0).toUpperCase() + broadType.slice(1));
                allQuestions.push({
                    id: id, year: year, paper: paper, number: num,
                    type: broadType, topic: specificTopic, filename: `${id}.png`
                });
            }
        });
    }
}

// --- TIMER FUNCTIONS (Refined) ---

function startTimer(keepTime = false) {
    if (timerInterval) clearInterval(timerInterval);
    
    // Only reset seconds if we are NOT keeping the time
    if (!keepTime) {
        secondsElapsed = 0;
    }
    
    // Immediate update
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;
    
    const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    timerEl.innerText = `${mins}:${secs}`;
}

// --- GLOBAL EXPORTS (Crucial for HTML onclicks) ---

window.switchMode = function(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${mode}`).classList.add('active');

    document.getElementById('controls-practice').style.display = 'none';
    document.getElementById('controls-mock').style.display = 'none';
    document.getElementById('viewer-panel').style.display = 'none';
    document.getElementById('tracker-panel').style.display = 'none';
    document.getElementById('info-panel').style.display = 'none';
    document.getElementById('resources-panel').style.display = 'none';
    document.getElementById('boundaries-panel').style.display = 'none'; // Ensure hidden

    if (mode === 'practice') {
        document.getElementById('controls-practice').style.display = 'flex';
        document.getElementById('viewer-panel').style.display = 'flex';
        document.getElementById('tracker-panel').style.display = 'flex';
        document.getElementById('tracker-title').innerText = "All Questions";
        renderTable();
    } 
    else if (mode === 'mock') {
        document.getElementById('controls-mock').style.display = 'flex';
        document.getElementById('viewer-panel').style.display = 'flex';
        document.getElementById('tracker-panel').style.display = 'flex';
        document.getElementById('tracker-title').innerText = "Mock Exam (12 Questions)";
        renderTable();
    } 
    else if (mode === 'boundaries') {
        renderBoundaries(); // Render the table on switch
        document.getElementById('boundaries-panel').style.display = 'flex';
    }
    else if (mode === 'info') {
        document.getElementById('info-panel').style.display = 'flex';
    } 
    else if (mode === 'resources') {
        document.getElementById('resources-panel').style.display = 'flex';
    }
}

window.renderBoundaries = function() {
    const container = document.getElementById('boundaries-table-container');
    let html = '<table class="boundaries-table"><thead><tr><th style="width:80px">Year</th><th colspan="4" style="text-align:center">Paper 2 (S / 1 / 2 / 3)</th><th colspan="4" style="text-align:center">Paper 3 (S / 1 / 2 / 3)</th></tr></thead><tbody>';
    
    for (let y = 2025; y >= 2008; y--) {
        const p2 = GRADE_DATA[2][y] || {S:'-',1:'-',2:'-',3:'-'};
        const p3 = GRADE_DATA[3][y] || {S:'-',1:'-',2:'-',3:'-'};
        
        html += `<tr>
            <td style="font-weight:bold">${y}</td>
            <td>${p2.S}</td><td>${p2[1]}</td><td>${p2[2]}</td><td>${p2[3]}</td>
            <td>${p3.S}</td><td>${p3[1]}</td><td>${p3[2]}</td><td>${p3[3]}</td>
        </tr>`;
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

window.generateMock = function() {
    const startYear = parseInt(document.getElementById('mock-start-year').value);
    const endYear = parseInt(document.getElementById('mock-end-year').value);
    const useP2 = document.getElementById('mock-p2').checked;
    const useP3 = document.getElementById('mock-p3').checked;

    if (!useP2 && !useP3) { alert("Select at least one paper."); return; }
    if (startYear > endYear) { alert("Invalid year range."); return; }

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
        alert("Not enough uncompleted questions available.");
        return;
    }

    function shuffle(arr) { return arr.sort(() => 0.5 - Math.random()); }
    const selected = [...shuffle(pure).slice(0,8), ...shuffle(mech).slice(0,2), ...shuffle(stats).slice(0,2)];
    
    // --- UPDATED SORTING: Pure (1) -> Mech (2) -> Stats (3) ---
    const typeRank = { 'pure': 1, 'mechanics': 2, 'stats': 3 };
    
    selected.sort((a, b) => {
        const rankA = typeRank[a.type] || 4;
        const rankB = typeRank[b.type] || 4;
        
        // Primary sort: Type
        if (rankA !== rankB) return rankA - rankB;
        
        // Secondary sort: Year -> Paper -> Number
        return a.year - b.year || a.paper - b.paper || a.number - b.number;
    });

    currentMockIds = selected.map(q => q.id);
    localStorage.setItem('stepBotMockIds', JSON.stringify(currentMockIds));
    renderTable();
    
    // Start/Reset the Exam Timer immediately
    startTimer(false); 
    
    alert("Mock generated! Timer started.");
}

window.viewGradeBoundaries = function() {
    try {
        if (currentMockIds.length === 0) { alert("Generate a mock first."); return; }
        let sums = { "S": 0, "1": 0, "2": 0, "3": 0 };
        let count = 0;
        currentMockIds.forEach(id => {
            const q = allQuestions.find(item => item.id === id);
            if (q && GRADE_DATA[q.paper] && GRADE_DATA[q.paper][q.year]) {
                const b = GRADE_DATA[q.paper][q.year];
                sums["S"]+=b["S"]; sums["1"]+=b["1"]; sums["2"]+=b["2"]; sums["3"]+=b["3"];
                count++;
            }
        });
        if (count === 0) return;
        
        const display = document.getElementById('grade-display');
        display.innerHTML = `
            <div class="grade-row"><span class="grade-label">Grade S:</span> <span class="grade-value">${Math.round(sums["S"]/count)}</span></div>
            <div class="grade-row"><span class="grade-label">Grade 1:</span> <span class="grade-value">${Math.round(sums["1"]/count)}</span></div>
            <div class="grade-row"><span class="grade-label">Grade 2:</span> <span class="grade-value">${Math.round(sums["2"]/count)}</span></div>
            <div class="grade-row"><span class="grade-label">Grade 3:</span> <span class="grade-value">${Math.round(sums["3"]/count)}</span></div>`;
        document.getElementById('modal-backdrop').style.display = 'flex';
    } catch (e) { console.error(e); }
}

window.showMarkScheme = function() {
    if (!currentQuestionId) { alert("Select a question."); return; }
    const q = allQuestions.find(i => i.id === currentQuestionId);
    const pdfPath = `mark_schemes/${q.year}.${q.paper}.pdf`;
    document.getElementById('pdf-title').innerText = `Mark Scheme - ${q.year} II/III`;
    document.getElementById('pdf-frame').src = pdfPath;
    document.getElementById('pdf-new-tab').href = pdfPath;
    document.getElementById('pdf-backdrop').style.display = 'flex';
}

window.closeModal = function() { document.getElementById('modal-backdrop').style.display = 'none'; }
window.closePdfModal = function() { 
    document.getElementById('pdf-backdrop').style.display = 'none'; 
    document.getElementById('pdf-frame').src = "";
}

window.generateRandom = function() {
    const filters = {
        p2: document.getElementById('chk-p2').checked,
        p3: document.getElementById('chk-p3').checked,
        pure: document.getElementById('chk-pure').checked,
        mech: document.getElementById('chk-mech').checked,
        stats: document.getElementById('chk-stats').checked,
        topic: document.getElementById('sel-topic').value
    };

    const eligible = allQuestions.filter(q => {
        if (q.paper === 2 && !filters.p2) return false;
        if (q.paper === 3 && !filters.p3) return false;
        if (q.type === 'pure' && !filters.pure) return false;
        if (q.type === 'mechanics' && !filters.mech) return false;
        if (q.type === 'stats' && !filters.stats) return false;
        if (filters.topic !== 'all' && q.topic !== filters.topic) return false;
        return true;
    });

    if (eligible.length === 0) { alert("No questions match filters!"); return; }
    displayQuestion(eligible[Math.floor(Math.random() * eligible.length)]);
}

window.loadSpecific = function() {
    const y = parseInt(document.getElementById('sel-year').value);
    const p = parseInt(document.getElementById('sel-paper').value);
    const n = parseInt(document.getElementById('sel-number').value);
    const found = allQuestions.find(q => q.year === y && q.paper === p && q.number === n);
    if (found) displayQuestion(found);
    else alert("Question not found");
}

window.loadFromTable = function(id) {
    const found = allQuestions.find(q => q.id === id);
    if(found) displayQuestion(found);
}

function displayQuestion(q) {
    currentQuestionId = q.id;
    const label = q.paper === 2 ? "II" : "III";
    document.getElementById('question-info').innerText = `${q.year} | Paper ${label} | Q${q.number} | ${q.topic}`;
    document.getElementById('question-img').src = `questions/${q.filename}`;
    document.getElementById('viewer-controls').style.display = 'block';
    
    const data = userProgress[q.id] || { marks: '', notes: '' };
    document.getElementById('viewer-marks').value = data.marks;
    document.getElementById('viewer-notes').value = data.notes;
    
    // In Mock mode, keep the timer running (don't reset). In Practice, reset per question.
    if (currentMode === 'mock') {
        startTimer(true); 
    } else {
        startTimer(false);
    }
}

// --- NEW SORTING & TABLE LOGIC ---

window.toggleSort = function(column) {
    // If clicking same column, toggle direction
    if (sortState.field === column) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // New column, set to ascending
        sortState.field = column;
        sortState.direction = 'asc';
    }
    renderTable();
}

window.renderTable = function() {
    const tbody = document.getElementById('tracker-body');
    const thead = document.getElementById('tracker-thead'); // Grab header for dynamic changes
    const avgDisplay = document.getElementById('average-display');
    tbody.innerHTML = '';
    
    let list = [];

    // --- DYNAMIC HEADER CONSTRUCTION ---
    if (currentMode === 'mock') {
        // Mock Mode: Numbering instead of Name, No Topic
        thead.innerHTML = `
            <tr>
                <th class="col-check sortable" onclick="toggleSort('done')">✓</th>
                <th class="col-id sortable" onclick="toggleSort('id')">#</th> <th class="col-date sortable" onclick="toggleSort('date')">Date</th>
                <th class="col-marks sortable" onclick="toggleSort('marks')">Marks</th>
                <th class="col-notes sortable" onclick="toggleSort('notes')">Notes</th>
            </tr>
        `;

        if (currentMockIds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No mock generated.</td></tr>';
            return;
        }
        list = allQuestions.filter(q => currentMockIds.includes(q.id));
    } else {
        // Practice Mode: Standard View
        thead.innerHTML = `
            <tr>
                <th class="col-check sortable" onclick="toggleSort('done')">✓</th>
                <th class="col-id sortable" onclick="toggleSort('id')">Question</th>
                <th class="col-topic sortable" onclick="toggleSort('topic')">Topic</th>
                <th class="col-date sortable" onclick="toggleSort('date')">Date</th>
                <th class="col-marks sortable" onclick="toggleSort('marks')">Marks</th>
                <th class="col-notes sortable" onclick="toggleSort('notes')">Notes</th>
            </tr>
        `;

        const f = {
            p2: document.getElementById('chk-p2').checked,
            p3: document.getElementById('chk-p3').checked,
            pure: document.getElementById('chk-pure').checked,
            mech: document.getElementById('chk-mech').checked,
            stats: document.getElementById('chk-stats').checked,
            topic: document.getElementById('sel-topic').value
        };
        list = allQuestions.filter(q => {
            if (q.paper === 2 && !f.p2) return false;
            if (q.paper === 3 && !f.p3) return false;
            if (q.type === 'pure' && !f.pure) return false;
            if (q.type === 'mechanics' && !f.mech) return false;
            if (q.type === 'stats' && !f.stats) return false;
            if (f.topic !== 'all' && q.topic !== f.topic) return false;
            return true;
        });
    }

    // --- Calculate Average Mark for VISIBLE list ---
    let totalMarks = 0;
    let countedQuestions = 0;

    list.forEach(q => {
        const prog = userProgress[q.id];
        if (prog && prog.done && prog.marks !== "" && !isNaN(prog.marks)) {
            totalMarks += parseInt(prog.marks);
            countedQuestions++;
        }
    });

    if (countedQuestions > 0) {
        const avg = (totalMarks / countedQuestions).toFixed(1);
        avgDisplay.innerText = `Avg: ${avg} / 20`;
        avgDisplay.style.display = 'inline-block';
    } else {
        avgDisplay.style.display = 'none';
    }

    // --- Apply Sorting ---
    if (sortState.field) {
        // Custom Sort
        list.sort((a, b) => {
            let valA, valB;
            const progA = userProgress[a.id] || {};
            const progB = userProgress[b.id] || {};

            switch (sortState.field) {
                case 'done':
                    valA = progA.done ? 1 : 0;
                    valB = progB.done ? 1 : 0;
                    break;
                case 'id':
                    // Sort by Year -> Paper -> Number naturally
                    return sortState.direction === 'asc' 
                        ? (a.year - b.year || a.paper - b.paper || a.number - b.number)
                        : (b.year - a.year || b.paper - a.paper || b.number - a.number);
                case 'topic':
                    valA = a.topic.toLowerCase();
                    valB = b.topic.toLowerCase();
                    break;
                case 'date':
                    valA = progA.date || '';
                    valB = progB.date || '';
                    break;
                case 'marks':
                    valA = parseInt(progA.marks) || 0;
                    valB = parseInt(progB.marks) || 0;
                    break;
                case 'notes':
                    valA = (progA.notes || '').toLowerCase();
                    valB = (progB.notes || '').toLowerCase();
                    break;
            }

            if (valA < valB) return sortState.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortState.direction === 'asc' ? 1 : -1;
            return 0;
        });
    } else {
        // Default Sorting Logic
        if (currentMode === 'mock') {
            // Mock Default: Type Priority
            const typeRank = { 'pure': 1, 'mechanics': 2, 'stats': 3 };
            list.sort((a, b) => {
                const rankA = typeRank[a.type] || 4;
                const rankB = typeRank[b.type] || 4;
                if (rankA !== rankB) return rankA - rankB;
                return a.year - b.year || a.paper - b.paper || a.number - b.number;
            });
        } else {
            // Practice Default: Year Descending
            list.sort((a,b) => b.year - a.year || a.paper - b.paper || a.number - b.number);
        }
    }

    list.forEach((q, index) => {
        const data = userProgress[q.id] || { done: false, date: '', marks: '', notes: '' };
        const tr = document.createElement('tr');
        if (data.done) tr.style.backgroundColor = "#e8f8f5";
        
        let nameColumn, topicColumn;

        if (currentMode === 'mock') {
            // Mock Mode: Number (1, 2, 3...) and NO Topic
            nameColumn = `<td class="col-id"><span class="clickable-name" onclick="loadFromTable('${q.id}')">${index + 1}</span></td>`;
            topicColumn = ''; // Empty string removes the column
        } else {
            // Practice Mode: Full Name and Topic
            const paperLabel = q.paper === 2 ? "II" : "III";
            nameColumn = `<td class="col-id"><span class="clickable-name" onclick="loadFromTable('${q.id}')">${q.year} ${paperLabel} Q${q.number}</span></td>`;
            topicColumn = `<td class="col-topic">${q.topic}</td>`;
        }
        
        tr.innerHTML = `
            <td class="col-check"><input type="checkbox" ${data.done ? 'checked' : ''} onchange="updateProgress('${q.id}', 'done', this.checked)"></td>
            ${nameColumn}
            ${topicColumn}
            <td class="col-date"><input type="date" value="${data.date}" onchange="updateProgress('${q.id}', 'date', this.value)"></td>
            <td class="col-marks"><input type="number" value="${data.marks}" onchange="updateProgress('${q.id}', 'marks', this.value)"></td>
            <td class="col-notes"><div class="note-cell"><textarea class="note-input" placeholder="Notes..." onchange="updateProgress('${q.id}', 'notes', this.value)">${data.notes}</textarea></div></td>
        `;
        tbody.appendChild(tr);
    });
}

window.updateProgress = function(id, field, value) {
    if (!userProgress[id]) userProgress[id] = { done: false, date: '', marks: '', notes: '' };
    userProgress[id][field] = value;
    localStorage.setItem('stepTrackerData', JSON.stringify(userProgress));
    saveToCloud();
    
    if (id === currentQuestionId) {
        if (field === 'marks') document.getElementById('viewer-marks').value = value;
        if (field === 'notes') document.getElementById('viewer-notes').value = value;
    }
    // Re-render table on any change to update averages/sorts instantly
    renderTable();
}

window.syncViewerToData = function() {
    if (!currentQuestionId) return;
    const m = document.getElementById('viewer-marks').value;
    const n = document.getElementById('viewer-notes').value;
    
    if (!userProgress[currentQuestionId]) userProgress[currentQuestionId] = { done: false, date: '' };
    userProgress[currentQuestionId].marks = m;
    userProgress[currentQuestionId].notes = n;
    
    localStorage.setItem('stepTrackerData', JSON.stringify(userProgress));
    saveToCloud();
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
    alert("Marked as complete!");
}

function loadFilters() {
    const yearSelect = document.getElementById('sel-year');
    const mockStart = document.getElementById('mock-start-year');
    const mockEnd = document.getElementById('mock-end-year');
    const topicSelect = document.getElementById('sel-topic');

    for(let y=2008; y<=2024; y++) {
        let opt = document.createElement('option'); opt.value = y; opt.innerText = y; yearSelect.appendChild(opt);
        let optS = document.createElement('option'); optS.value = y; optS.innerText = y; mockStart.appendChild(optS);
        let optE = document.createElement('option'); optE.value = y; optE.innerText = y; if(y===2024) optE.selected=true; mockEnd.appendChild(optE);
    }

    const topics = {
        "Pure": ["Proof", "Numerical Reasoning", "Algebra", "Further Algebra", "Geometry", "Sequences", "Trigonometry", "Exp/Log", "Differentiation", "Diff Eqs", "Integration", "Further Calculus", "Vectors", "Complex Numbers", "Matrices", "Polar Coords", "Hyperbolic"],
        "Mechanics": ["Kinematics", "Forces", "Moments", "Energy/Work", "Collisions", "Hooke's Law", "Centre of Mass", "Circular Motion", "Mech Diff Eqs"],
        "Statistics": ["Probability", "Distributions", "Prob Distributions", "Indep Rand Vars", "Expectation Alg"]
    };

    for (const [g, tList] of Object.entries(topics)) {
        let group = document.createElement('optgroup'); group.label = g;
        tList.forEach(t => {
            let opt = document.createElement('option'); opt.value = t; opt.innerText = t; group.appendChild(opt);
        });
        topicSelect.appendChild(group);
    }

    window.printMock = function() {
        if (currentMockIds.length === 0) { alert("Generate a mock first."); return; }

        // 1. Calculate Grade Boundaries & Build Sources List
        let sums = { "S": 0, "1": 0, "2": 0, "3": 0 };
        let count = 0;
        
        // Start the sources list
        let sourcesHtml = '<h3>Question Sources</h3><ul style="list-style:none; padding:0; font-family: \'Times New Roman\', serif; font-size: 1.1em;">';

        currentMockIds.forEach((id, index) => {
            const q = allQuestions.find(item => item.id === id);
            
            // Accumulate Grade Data
            if (q && GRADE_DATA[q.paper] && GRADE_DATA[q.paper][q.year]) {
                const b = GRADE_DATA[q.paper][q.year];
                sums["S"]+=b["S"]; sums["1"]+=b["1"]; sums["2"]+=b["2"]; sums["3"]+=b["3"];
                count++;
            }

            // Add to Sources List
            const label = q.paper === 2 ? "II" : "III";
            sourcesHtml += `<li style="margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:4px;">
                <strong>Q${index+1}:</strong> ${q.year} STEP ${label} Q${q.number} <span style="color:#666">(${q.topic})</span>
            </li>`;
        });
        sourcesHtml += '</ul>';

        // Build Boundaries Table
        let boundariesHtml = '<h3>Estimated Grade Boundaries</h3><p><em>(Based on average of constituent questions)</em></p>';
        if (count > 0) {
            boundariesHtml += `
            <table border="1" style="border-collapse: collapse; width: 100%; max-width: 500px; margin-top:10px; font-family: 'Times New Roman', serif;">
                <tr style="background:#eee;"><th style="padding:10px;">Grade</th><th style="padding:10px;">Mark / 120</th></tr>
                <tr><td style="padding:10px; text-align:center; font-weight:bold;">S</td><td style="padding:10px; text-align:center;">${Math.round(sums["S"]/count)}</td></tr>
                <tr><td style="padding:10px; text-align:center; font-weight:bold;">1</td><td style="padding:10px; text-align:center;">${Math.round(sums["1"]/count)}</td></tr>
                <tr><td style="padding:10px; text-align:center; font-weight:bold;">2</td><td style="padding:10px; text-align:center;">${Math.round(sums["2"]/count)}</td></tr>
                <tr><td style="padding:10px; text-align:center; font-weight:bold;">3</td><td style="padding:10px; text-align:center;">${Math.round(sums["3"]/count)}</td></tr>
            </table>`;
        } else {
            boundariesHtml += "<p>No historical data available for these questions.</p>";
        }

        // 2. Construct the HTML for the Print Window
        let content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mock Exam</title>
                <style>
                    @page { 
                        margin: 0 !important; 
                        size: auto; 
                    }
                    
                    @media print {
                        body { margin: 0 !important; padding: 0 !important; }
                        /* Force background colors (needed for the white mask to work) */
                        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }

                    body { 
                        margin: 0; 
                        padding: 0; 
                        font-family: 'Times New Roman', Times, serif; 
                        background: white;
                    }
                    
                    .page { 
                        width: 100vw; 
                        height: 100vh; 
                        position: relative; 
                        page-break-after: always; 
                        break-after: page;
                        overflow: hidden; 
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start; 
                    }

                    .page.cover-page {
                        justify-content: center;
                        align-items: center;
                    }

                    img.cover-img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain; 
                    }
                    
                    img.question-img { 
                        width: 100%;
                        height: auto;
                        max-height: 98vh;
                        object-fit: contain; 
                        object-position: left top; 
                        display: block;
                    }

                    /* THE MASK BAR
                    - 315px / 2481px is approx 12.7%. 
                    - We use 12.8% to be safe and cover everything.
                    */
                    .mask-bar {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 12.8%;
                        height: 100%;
                        background: white;
                        z-index: 5; /* Above image, below number */
                    }

                    .q-number {
                        position: absolute;
                        top: 6%; 
                        left: 0;
                        width: 12.8%; /* Centered within the mask bar */
                        text-align: center;
                        font-size: 3.5rem; 
                        font-weight: bold;
                        color: #000;
                        line-height: 1;
                        z-index: 10; /* Above the mask */
                    }

                    /* Info Page Styling */
                    .info-page {
                        justify-content: flex-start;
                        align-items: flex-start;
                        padding: 50px;
                        box-sizing: border-box;
                        height: auto; 
                        min-height: 100vh;
                    }

                    .cover-fallback {
                        text-align: center;
                    }
                    .cover-fallback h1 { font-size: 5em; margin-bottom: 0.2em; color: #333; }
                    .cover-fallback p { font-size: 2em; color: #666; }
                </style>
            </head>
            <body>
                <div class="page cover-page">
                    <img src="cover.png" class="cover-img" alt="Mock Cover" onerror="this.style.display='none'; document.getElementById('fallback').style.display='block'">
                    <div id="fallback" class="cover-fallback" style="display:none;">
                        <div style="height:30vh"></div>
                        <h1>STEP Mock Exam</h1>
                        <p>Generated by StepBot3</p>
                        <p>${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
        `;

        // Add Question Pages with Mask and Number
        currentMockIds.forEach((id, index) => {
            const q = allQuestions.find(item => item.id === id);
            content += `
                <div class="page">
                    <div class="mask-bar"></div>
                    <div class="q-number">${index + 1}</div>
                    <img src="questions/${q.filename}" class="question-img" loading="eager">
                </div>
            `;
        });

        // Add Back Page
        content += `
                <div class="page info-page">
                    ${sourcesHtml}
                    <div style="height: 50px;"></div>
                    ${boundariesHtml}
                </div>
                <script>
                    // Auto-trigger print when loaded
                    window.onload = function() {
                        setTimeout(() => { 
                            window.print(); 
                        }, 800);
                    };
                </script>
            </body>
            </html>
        `;

        // 3. Open Window
        const win = window.open('', '_blank');
        if (!win) { alert("Please allow popups to print."); return; }
        
        win.document.write(content);
        win.document.close();
    }
}