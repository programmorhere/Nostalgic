// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import {
  setDoc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import {
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import {
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBHvlptOXKvNFy_k57EEqJXObT9Nb84_Y",
  authDomain: "nostalgicgaming-da50b.firebaseapp.com",
  projectId: "nostalgicgaming-da50b",
  storageBucket: "nostalgicgaming-da50b.appspot.com",
  messagingSenderId: "8792691756",
  appId: "1:8792691756:web:1dfb2c289845587f296d89",
  measurementId: "G-9ZPRLF3KE4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // Send email verification
      sendEmailVerification(userCredential.user)
        .then(() => {
          console.log("Verification email sent successfully");
        })
        .catch((error) => {
          console.error("Error sending verification email:", error);
        });

      // Add user details to Firestore
      const userDetailsRef = doc(db, "userDetails", email);
      setDoc(userDetailsRef, { username, password })
        .then(() => {
          console.log("User details added to Firestore");
          showAlert("success", "Signed up successfully");
        })
        .catch((error) => {
          console.error("Error adding user details to Firestore:", error);
          showAlert("danger", "Error adding user details to Firestore");
        });

      console.log("Signed up successfully:", user);
    })
    .catch((error) => {
      // Error occurred during sign up
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error during sign up:", errorCode, errorMessage);
      showAlert("danger", "Error during sign up");
    });
}
function signInWithGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((userCredential) => {
      // Signed in with Google successfully
      const user = userCredential.user;
      console.log("Signed in with Google:", user);
      window.location.href = "./Extra/index.html";
    })
    .catch((error) => {
      // Error occurred during Google sign-in
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error during Google sign-in:", errorCode, errorMessage);
      showAlert("danger", "Error during Google sign-in");
    });
}

function signIn() {
  //alert("Hello");
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in successfully
      const user = userCredential.user;
      if (user.emailVerified) {
        console.log("Signed in successfully:", user);
        showAlert("success", "Signed in successfully");
      }
      window.location.href = "./Extra/index.html";
    })
    .catch((error) => {
      // Error occurred during sign in
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode);
      if (errorCode === "auth/wrong-password") {
        console.error("Hello Error during sign in:", errorCode, errorMessage);
        showAlert("danger", "Wrong Password");
      } else if (errorCode === "auth/user-not-found") {
        console.error("Hello Error during sign in:", errorCode, errorMessage);
        showAlert("danger", "User not found");
      } else {
        showAlert("danger", errorCode);
      }
    });
}

function adminLogIn() {
  const email = document.getElementById("adminemail").value;
  const password = document.getElementById("adminpassword").value;
  if (email === "admin" && password === "admin") {
    window.location.href = "./Extra/Admin.html";
  } else {
    showAlert("danger", "Wrong Credentials");
  }
}

function showAlert(type, message) {
  const alert = document.getElementById("alert");
  alert.classList.add("alert-" + type);
  alert.textContent = message;
  alert.style.display = "block";
  setTimeout(function () {
    alert.style.display = "none";
    alert.classList.remove("alert-" + type);
  }, 3000);
}

async function deleteUser(email) {
  try {
    // Delete user from Firebase Authentication
    await deleteAuthUser(email);

    const docRef = doc(db, "userDetails", email);

    deleteDoc(docRef)
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });

    console.log("User deleted successfully");
    showAlert("Success", "User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}
// Function to delete user from Firebase Authentication
async function deleteAuthUser(email) {
  try {
    // Get the user details from Firestore
    const userDetailsRef = doc(db, "userDetails", email);
    const userDetailsSnapshot = await getDoc(userDetailsRef);
    const userDetails = userDetailsSnapshot.data();

    if (userDetails) {
      const password = userDetails.password;

      // Get the user credential using the email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Delete the user
      await userCredential.user.delete();
    } else {
      throw new Error("User details not found");
    }
  } catch (error) {
    throw error;
  }
}

async function UpdateUserfunction(email, username) {
  try {
    const userDetailsRef = doc(db, "userDetails", email, "userInfo");

    // Check if the document exists
    const userDetailsSnapshot = await getDoc(userDetailsRef);
    if (!userDetailsSnapshot.exists()) {
      throw new Error("Document does not exist");
    }

    // Update the "username" field in the document
    await updateDoc(userDetailsRef, { username });

    console.log("User updated successfully");
    showAlert("Success", "Updated Successfully");
  } catch (error) {
    console.error("Error updating user:", error);
  }
}

// Register the signUp function for the onclick event
const registerBtn = document.getElementById("register");
if (registerBtn) {
  registerBtn.onclick = signUp;
}
const logInBtn = document.getElementById("logInbtn");
if (logInBtn) {
  logInBtn.addEventListener("click", signIn);
}
const gmailBtn = document.getElementById("gmail");
if (gmailBtn) {
  gmailBtn.addEventListener("click", signInWithGoogle);
}

const updateBtn = document.getElementById("updateBtn_id");
if (updateBtn) {
  const email = document.getElementById("searchEmail").value;
  const userName = document.getElementById("name").value;
  updateBtn.addEventListener("click", UpdateUserfunction(email, userName));
}

// Register the deleteUser function for the onclick event
const deleteBtn = document.getElementById("deleteBtnId");
if (deleteBtn) {
  deleteBtn.addEventListener("click", function () {
    const email = document.getElementById("emailDelete").value;
    deleteUser(email);
  });
}
//document.getElementById("logInbtn").addEventListener("click", signIn);

const adminlogin = document.getElementById("adminlogInbtn");
if (adminlogin) {
  adminlogin.addEventListener("click", function () {
    adminLogIn();
  });
}
