/* ============================================================
   StudyHub — JavaScript
   ============================================================ */

"use strict";

// ============================================================
// PAGE NAVIGATION
// ============================================================

function showPage(pageId, linkEl) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  // Remove active from all nav items
  document.querySelectorAll(".nav-item").forEach((li) => li.classList.remove("active"));
  // Show target page
  const page = document.getElementById("page-" + pageId);
  if (page) page.classList.add("active");
  // Highlight nav link
  if (linkEl) {
    const navItem = linkEl.closest(".nav-item") || linkEl.parentElement;
    if (navItem) navItem.classList.add("active");
  }
  // Close sidebar on mobile
  closeSidebarMobile();
  // Scroll to top
  document.getElementById("main-content").scrollTop = 0;
  return false;
}

// ============================================================
// SIDEBAR TOGGLE (mobile)
// ============================================================

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
}

function closeSidebarMobile() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  sidebar.classList.remove("open");
  overlay.classList.remove("open");
}

// ============================================================
// SUBJECT FILTER (Materials page)
// ============================================================

let activeSubject = "all";

function filterBySubject(subject, btn) {
  activeSubject = subject;
  document.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("active"));
  if (btn) btn.classList.add("active");
  applyFilter();
}

function applyFilter() {
  const query = (document.getElementById("material-search")?.value || "").toLowerCase().trim();
  document.querySelectorAll(".material-card").forEach((card) => {
    const subjectMatch = activeSubject === "all" || card.dataset.subject === activeSubject;
    const titleMatch = !query || card.dataset.title.toLowerCase().includes(query);
    card.classList.toggle("hidden", !(subjectMatch && titleMatch));
  });
}

function filterMaterialCards() {
  applyFilter();
}

function openModal(title, subject, type, pages, description) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-subject").textContent = subject;
  document.getElementById("modal-type").textContent = type;
  document.getElementById("modal-pages").textContent = pages;
  document.getElementById("modal-body").innerHTML = `<p>${description}</p>`;
  document.getElementById("modal-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(e) {
  if (e && e.target !== document.getElementById("modal-overlay")) return;
  document.getElementById("modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
}


// ============================================================
// NOTES
// ============================================================

const subjectLabels = {
  blue: "Mathematics",
  green: "Biology",
  amber: "Chemistry",
  purple: "History",
  rose: "Physics",
  teal: "English Literature",
};

function createNewNote() {
  document.getElementById("note-form-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeNoteForm(e) {
  if (e && e.target !== document.getElementById("note-form-overlay")) return;
  document.getElementById("note-form-overlay").classList.remove("open");
  document.body.style.overflow = "";
  // Reset form
  document.getElementById("note-title-input").value = "";
  document.getElementById("note-content-input").value = "";
}

function saveNote() {
  const color = document.getElementById("note-subject").value;
  const title = document.getElementById("note-title-input").value.trim();
  const content = document.getElementById("note-content-input").value.trim();
  if (!title) {
    document.getElementById("note-title-input").focus();
    return;
  }

  const today = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const card = document.createElement("div");
  card.className = "note-card";
  card.innerHTML = `
    <div class="note-card-header">
      <span class="note-tag note-tag--${color}">${subjectLabels[color]}</span>
      <span class="note-date">${today}</span>
    </div>
    <h3 class="note-title">${escapeHtml(title)}</h3>
    <p class="note-preview">${escapeHtml(content || "No content yet.")}</p>
    <div class="note-footer">
      <button class="note-btn" onclick="editNote(this)">Edit</button>
      <button class="note-btn note-btn--danger" onclick="deleteNote(this)">Delete</button>
    </div>
  `;

  // Animate in
  card.style.opacity = "0";
  card.style.transform = "scale(.96)";
  document.getElementById("notes-grid").prepend(card);
  requestAnimationFrame(() => {
    card.style.transition = "opacity .25s ease, transform .25s ease";
    card.style.opacity = "1";
    card.style.transform = "scale(1)";
  });

  closeNoteForm();
}

function deleteNote(btn) {
  const card = btn.closest(".note-card");
  card.style.transition = "opacity .2s ease, transform .2s ease";
  card.style.opacity = "0";
  card.style.transform = "scale(.95)";
  setTimeout(() => card.remove(), 210);
}

function editNote(btn) {
  const card = btn.closest(".note-card");
  const title = card.querySelector(".note-title").textContent;
  const body = card.querySelector(".note-preview").textContent;

  document.getElementById("note-title-input").value = title;
  document.getElementById("note-content-input").value = body;
  document.getElementById("note-form-overlay").classList.add("open");
  document.body.style.overflow = "hidden";

  // Override save to update the existing card
  const saveBtn = document.querySelector(".note-form-actions .btn-primary");
  const originalSave = saveBtn.onclick;
  saveBtn.onclick = () => {
    const newTitle = document.getElementById("note-title-input").value.trim();
    const newContent = document.getElementById("note-content-input").value.trim();
    if (!newTitle) {
      document.getElementById("note-title-input").focus();
      return;
    }
    card.querySelector(".note-title").textContent = newTitle;
    card.querySelector(".note-preview").textContent = newContent || "No content yet.";
    saveBtn.onclick = originalSave;
    closeNoteForm();
  };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================
// THEME TOGGLE
// ============================================================

function initTheme() {
  const themeSwitch = document.getElementById("theme-checkbox");
  if (!themeSwitch) return;

  const currentTheme = localStorage.getItem("theme") || "light";
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeSwitch.checked = true;
  }

  themeSwitch.addEventListener("change", function () {
    if (this.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  });
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener("keydown", (e) => {
  // ESC to close modals
  if (e.key === "Escape") {
    document.getElementById("modal-overlay").classList.remove("open");
    document.getElementById("note-form-overlay").classList.remove("open");
    document.body.style.overflow = "";
    closeSidebarMobile();
  }
});

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  // Animate progress bars on load
  setTimeout(() => {
    document.querySelectorAll(".progress-fill").forEach((el) => {
      const w = el.style.width;
      el.style.width = "0";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.width = w;
        });
      });
    });
  }, 200);
});
