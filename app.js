const DEFAULT_USERNAME = "urnjoya";
let CURRENT_USERNAME = DEFAULT_USERNAME;

const profileEl = document.getElementById("profile");
const reposEl = document.getElementById("repos");
const searchBar = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const defaultColor = "#007bff";

// ------------------ Helper for button feedback ------------------
function act(bgc, val, color, delay) {
  searchBtn.style.backgroundColor = bgc;
  searchBar.value = val;
  searchBar.style.color = color;

  setTimeout(() => {
    searchBtn.style.backgroundColor = defaultColor;
    searchBar.value = "";
    searchBar.style.color = "black";
  }, delay);
}

// ------------------ Check if GitHub user exists ------------------
async function githubUserExists(username) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    return res.status === 200;
  } catch (err) {
    console.error("Network error", err);
    return false;
  }
}

// ------------------ Load GitHub user data ------------------
async function loadUserData(username) {
  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error("User not found");
    const user = await userRes.json();

    profileEl.innerHTML = `
      <h2>${user.name || user.login}</h2>
      <p>${user.bio || "No bio"}</p>
      <p>Repos: ${user.public_repos} | Followers: ${user.followers}</p>
      <a href="${user.html_url}" target="_blank">View Profile</a>
    `;

    // Clear previous repos
    reposEl.innerHTML = "";

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos`);
    const repos = await reposRes.json();
    repos.forEach(repo => loadRepoDetails(repo, username));

  } catch (err) {
    console.error(err);
    act("red", "Error loading user", "red", 1500);
  }
}

// ------------------ Repository card generation ------------------
function loadRepoDetails(repo, username) {
  const div = document.createElement("div");
  div.className = "repo";

  const liveUrl = repo.homepage && repo.homepage.startsWith("http")
    ? `<a href="${repo.homepage}" target="_blank">🌐 Live Page</a>`
    : "";

  div.innerHTML = `
    <h3>${repo.name}</h3>
    <p>${repo.description || "No description"}</p>
    <small>⭐ ${repo.stargazers_count} · 🍴 ${repo.forks_count} · ${repo.language || "N/A"}</small>
    <br><small>Updated: ${new Date(repo.updated_at).toDateString()}</small>
    <div style="margin-top:8px">
      <a href="${repo.html_url}" target="_blank">📦 Repo</a>
      ${liveUrl}
    </div>
    <div class="extra" id="extra-${repo.name}"></div>
  `;

  reposEl.appendChild(div);

  loadExtras(repo, div.querySelector(".extra"), username);
}

// ------------------ Latest commits, releases, issues ------------------
function loadExtras(repo, container, username) {
  // Commits
  fetch(repo.commits_url.replace("{/sha}", ""))
    .then(r => r.json())
    .then(commits => {
      if (commits[0]) {
        container.innerHTML += `<small>Last commit: ${commits[0].commit.message.slice(0, 40)}…</small><br>`;
      }
    });

  // Releases
  fetch(repo.releases_url.replace("{/id}", ""))
    .then(r => r.json())
    .then(releases => {
      if (releases[0]) {
        container.innerHTML += `<small>Latest release: ${releases[0].tag_name}</small><br>`;
      }
    });

  // Open issues
  fetch(`https://api.github.com/repos/${username}/${repo.name}`)
    .then(r => r.json())
    .then(data => {
      container.innerHTML += `<small>Open issues: ${data.open_issues_count}</small>`;
    });
}

// ------------------ Search button ------------------
searchBtn.addEventListener("click", async () => {
  const value = searchBar.value.trim();

  if (value === "") {
    act("red", "Null value", "red", 1000);
    return;
  }

  const exists = await githubUserExists(value);
  if (exists) {
    act("green", "User found", "green", 1000);
    CURRENT_USERNAME = value;
  } else {
    act("red", "User not found", "red", 1500);
    CURRENT_USERNAME = DEFAULT_USERNAME;
  }

  // Load data (default or searched)
  loadUserData(CURRENT_USERNAME);
});

// ------------------ Initial load ------------------
loadUserData(DEFAULT_USERNAME);

window.addEventListener('beforeunload', (event) => {
    // 1. Cancel the event as stated by the standard.
    event.preventDefault();
    
    // 2. Included for legacy support (older browsers).
    // The message is ignored by modern browsers, but required to trigger the alert.
    event.returnValue = ''; 
});

