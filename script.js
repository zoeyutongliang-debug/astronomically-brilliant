import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

// Sign in moderator
async function loginModerator(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    moderatorPanel.style.display = "block"; // now safe
  } catch (error) {
    alert("Wrong credentials!");
  }
}

// Check if logged in
onAuthStateChanged(auth, user => {
  if (user) {
    moderatorPanel.style.display = "block"; // moderator logged in
  } else {
    moderatorPanel.style.display = "none"; 
  }
});
window.addEventListener('load', function() {
window.addEventListener('DOMContentLoaded', async () => {
  const saved = localStorage.getItem('questions');
  if (saved) {
    questions = JSON.parse(saved);
  }
  updateModeratorPanel();  // show existing questions in moderator panel if active
  displayVisibleQuestions(); // show previously made visible questions
});

// submit a question
// Submit question
document.getElementById('submitQuestion').addEventListener('click', async () => {
  const questionText = document.getElementById('userQuestion').value.trim();
  if (!questionText) return;

  // Save question in Firebase
  await addDoc(collection(db, "questions"), {
    text: questionText,
    answer: "",
    visible: false // initially not visible
  });

  document.getElementById('userQuestion').value = "";
  loadQuestions();
});

// Questions vs answers

const questionsList = document.getElementById("questionsList");
const modPanel = document.getElementById("modPanel");

function createMessage(data, showAnswer = true) {
  const div = document.createElement("div");
  div.className = "question-item";

  div.innerHTML = `
    <div class="user-block">
      <strong>What you said:</strong>
      <p>${data.text}</p>
    </div>

    ${showAnswer ? `
      <div class="answer-block">
        <strong>My answer:</strong>
        <p>${data.answer || "(not answered yet)"}</p>
      </div>
    ` : ""}
  `;

  return div;
}

// MAIN DISPLAY
if (data.visible) {
  questionsList.appendChild(createMessage(data, true));
}

// MODERATOR DISPLAY
if (isModerator) {
  modPanel.appendChild(createMessage(data, false));
}
  
// Load questions from Firebase
async function loadQuestions() {
  const querySnapshot = await getDocs(collection(db, "questions"));
  const list = document.getElementById('questionsList');
  list.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const docId = docSnap.id;

    const div = document.createElement('div');
    div.className = "question-item";

    // Show question
    const q = document.createElement('p');
    q.textContent = data.text;
    div.appendChild(q);

    // Show answer only if visible
    if (data.visible && data.answer) {
      const a = document.createElement('p');
      a.textContent = "Answer: " + data.answer;
      a.style.fontWeight = "normal";
      a.style.marginTop = "5px";
      div.appendChild(a);
    }

    // MODERATOR OPTIONS
    // You can choose whether to answer/approve visibility
    const answerInput = document.createElement('input');
    answerInput.placeholder = "Type answer...";
    answerInput.style.marginTop = "5px";

    const answerButton = document.createElement('button');
    answerButton.textContent = "Submit Answer";

    const showButton = document.createElement('button');
    showButton.textContent = "Make Visible";

    // Submit answer to Firebase
    answerButton.addEventListener('click', async () => {
      await updateDoc(doc(db, "questions", docId), { answer: answerInput.value });
      answerInput.value = "";
      loadQuestions();
    });

    // Make answer visible
    showButton.addEventListener('click', async () => {
      await updateDoc(doc(db, "questions", docId), { visible: true });
      loadQuestions();
    });

    // Only show these buttons if you are the moderator
    // For now, assume you are moderator on this device
    div.appendChild(answerInput);
    div.appendChild(answerButton);
    div.appendChild(showButton);

    list.appendChild(div);
  });
}

// Initial load
loadQuestions();
});
