import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://dhzituvdttyfsshgabjp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeml0dXZkdHR5ZnNzaGdhYmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzA2MjIsImV4cCI6MjA3NDQ0NjYyMn0.kRktK7PT1NB14_y7jkVJRTYZ6Jk_g4pYToqO8vjgVeU";  
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------ INSCRIPTION ------------------
async function inscription(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert("Erreur d'inscription : " + error.message);
    return;
  }
  const user = data.user;
  if (user) {
    await creerProfil(user, email);
    alert("Inscription réussie !");
  }
}

async function creerProfil(user, email) {
  const { error } = await supabase
    .from("profiles")
    .insert([
      {
        id: user.id,
        username: email,
        bio: ""
      }
    ]);
  if (error) {
    alert("Erreur création profil : " + error.message);
  } else {
    alert("Profil créé avec succès !");
  }
}

// ------------------ CONNEXION ------------------
async function connexion(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Erreur de connexion : " + error.message);
    return;
  }
  const user = data.user;
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileError) {
      alert("Erreur récupération profil : " + profileError.message);
      return;
    }
    afficherProfil(profile);
    document.getElementById("logoutBtn").classList.remove("d-none");
    alert("Connexion réussie !");
  }
}

// ------------------ AFFICHAGE PROFIL ------------------
function afficherProfil(profile) {
  const container = document.getElementById("profildiv");
  container.innerHTML = `
  <div class="card-body bg-light border rounded p-3 mb-3" style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
    <p><strong>Username :</strong> <span>${profile.username}</span></p>
    <p><strong>Bio :</strong> <span>${profile.bio || "Aucune bio pour l'instant"}</span></p>
  </div>
  <div class="card-body bg-white border rounded p-3" style="box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <h3 class="text-success mb-3">Modifier mon profil</h3>
    <form id="modifProfileForm">
      <div class="mb-3">
        <label for="newUsername" class="form-label">Nouveau username</label>
        <input type="text" id="newUsername" class="form-control border" value="${profile.username}">
      </div>
      <div class="mb-3">
        <label for="newBio" class="form-label">Nouvelle bio</label>
        <input type="text" id="newBio" class="form-control border" value="${profile.bio || ""}">
      </div>
      <button type="submit" class="btn btn-success">Mettre à jour</button>
    </form>
  </div>
`;

  document.getElementById("modifProfileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const newUsername = document.getElementById("newUsername").value;
    const newBio = document.getElementById("newBio").value;
    await updateProfile(profile.id, newUsername, newBio);
  });
}

// ------------------ UPDATE PROFIL ------------------
async function updateProfile(userId, newUsername, newBio) {
  const { error } = await supabase
    .from("profiles")
    .update({ username: newUsername, bio: newBio })
    .eq("id", userId);

  if (error) {
    alert("Erreur mise à jour profil : " + error.message);
  } else {
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    afficherProfil(updatedProfile);
    alert("Profil mis à jour avec succès !");
  }
}

// ------------------ DECONNEXION ------------------
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("Erreur lors de la déconnexion : " + error.message);
  } else {
    document.getElementById("profildiv").innerHTML = "";
    document.getElementById("logoutBtn").classList.add("d-none");
    alert("Déconnecté avec succès !");
  }
}

// ------------------ GESTION DES FORMULAIRES ------------------
document.getElementById("inscriptionForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("motdepasse").value;
  await inscription(email, password);
});

document.getElementById("connexionForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("connectemail").value;
  const password = document.getElementById("connectmdp").value;
  await connexion(email, password);
});

document.getElementById("logoutBtn").addEventListener("click", logout);

// ------------------ SESSION MANAGEMENT ------------------
window.addEventListener("DOMContentLoaded", async () => {
  const { data, error } = await supabase.auth.getUser();
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    if (profile) {
      afficherProfil(profile);
      document.getElementById("logoutBtn").classList.remove("d-none");
      alert("Session restaurée automatiquement !");
    }
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  console.log("Changement de session :", event);
  if (event === "SIGNED_OUT") {
    document.getElementById("profildiv").innerHTML = "";
    document.getElementById("logoutBtn").classList.add("d-none");
    alert("Vous avez été déconnecté.");
  }
});
