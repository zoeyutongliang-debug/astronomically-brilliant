import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzfWGiPaf6gDEtWW2nvWmtHNM9-NL53VU",
  authDomain: "astronomicallybrilliant.firebaseapp.com",
  projectId: "astronomicallybrilliant",
  storageBucket: "astronomicallybrilliant.firebasestorage.app",
  messagingSenderId: "790171623774",
  appId: "1:790171623774:web:d0e6ee8e26bd6b28f52fcf",
  measurementId: "G-1SDPQHPQXE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.addEventListener("DOMContentLoaded", () => {

  const submitButton = document.getElementById('submitQuestion');
  const questionInput = document.getElementById('userQuestion');
  const questionsList = document.getElementById('questionsList');
  const moderatorPanel = document.getElementById('moderatorPanel');
  const pendingQuestions = document.getElementById('pendingQuestions');
  const showModerator = document.getElementById('showModerator');
  const exitModerator = document.getElementById('exitModerator');

  let isModerator = false;

  // submit questions
  if (submitButton) {
  submitButton.addEventListener('click', async () => {
    const text = questionInput.value.trim();
    if (!text) return alert("don't be so eager, type a question first!");

    await addDoc(collection(db, "questions"), {
      text,
      answer: "",
      visible: false,
      answered: false
    });

    questionInput.value = "";
    loadQuestions();
  });
}

  // load + display questions
  async function loadQuestions() {
    const querySnapshot = await getDocs(collection(db, "questions"));
    questionsList.innerHTML = "";
    pendingQuestions.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;

      // display question in public list if visible
      if (data.visible) {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.innerHTML = `<strong>somebody said:</strong> ${data.text}<br><strong>i said:</strong> ${data.answer || "(not answered yet)"}`;
        questionsList.appendChild(div);
      }

      // display question in mod panel
      if (isModerator) {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.innerHTML = `<strong>somebody said:</strong> ${data.text}`;

        if (!data.answered) {
          const answerInput = document.createElement('input');
          answerInput.placeholder = "Type your answer...";

          const answerButton = document.createElement('button');
          answerButton.textContent = "Submit Answer";
          answerButton.className = "button";

          answerButton.addEventListener('click', async () => {
            await updateDoc(doc(db, "questions", docId), {
              answer: answerInput.value,
              answered: true
            });
            loadQuestions();
          });

          div.appendChild(answerInput);
          div.appendChild(answerButton);

        } else {
          const aText = document.createElement('p');
          aText.innerHTML = `<strong>i said:</strong> ${data.answer}`;
          div.appendChild(aText);
        }

        const showButton = document.createElement('button');
        showButton.textContent = "make visible";
        showButton.className = "button";

        showButton.addEventListener('click', async () => {
          if (!data.answered) return alert("Answer first!!");

          await updateDoc(doc(db, "questions", docId), {
            visible: true
          });

          loadQuestions();
        });

        div.appendChild(showButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Delete";
        deleteButton.className = "button";

        deleteButton.addEventListener('click', async () => {
          if (confirm("u wanna delete this question?")) {
            await updateDoc(doc(db, "questions", docId), {
              deleted: true
            });
            loadQuestions();
          }
        });

        div.appendChild(deleteButton);

        pendingQuestions.appendChild(div);
      }
    });
  }

  // moderator login
  exitModerator.addEventListener('click', () => {
    isModerator = false;
    moderatorPanel.style.display = "none";
    showModerator.style.display = "inline-block";
    loadQuestions();
  });

  // initial load
  loadQuestions();

});
