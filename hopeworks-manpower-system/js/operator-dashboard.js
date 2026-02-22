// Tabs (UI only)
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    // UI-only: in real build, this would route to pages or show sections.
  });
});

// Time In / Time Out UI demo with modal verification
const timeBtn = document.getElementById("timeBtn");
const timeBtnText = document.getElementById("timeBtnText");
const statusPill = document.getElementById("statusPill");

const modal = document.getElementById("verifyModal");
const closeModal = document.getElementById("closeModal");
const cancelVerify = document.getElementById("cancelVerify");
const confirmVerify = document.getElementById("confirmVerify");

const chkFace = document.getElementById("chkFace");
const chkGps = document.getElementById("chkGps");
const chkTime = document.getElementById("chkTime");

let isTimedIn = false;

// open modal when clicking TIME IN/TIME OUT (UI demo)
timeBtn.addEventListener("click", () => {
  openModal();
  runFakeChecks();
});

function openModal(){
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  resetChecks();
}

function closeModalFn(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

closeModal.addEventListener("click", closeModalFn);
cancelVerify.addEventListener("click", closeModalFn);

// Demo confirm: toggles timed in/out
confirmVerify.addEventListener("click", () => {
  // In real app: only confirm if face+gps ok
  isTimedIn = !isTimedIn;

  if (isTimedIn) {
    timeBtnText.textContent = "TIME OUT";
    statusPill.textContent = "Timed In";
    statusPill.classList.remove("status-not-timed", "status-break");
    statusPill.classList.add("status-timed");
  } else {
    timeBtnText.textContent = "TIME IN";
    statusPill.textContent = "Not Timed In";
    statusPill.classList.remove("status-timed", "status-break");
    statusPill.classList.add("status-not-timed");
  }

  closeModalFn();
});

function resetChecks(){
  [chkFace, chkGps, chkTime].forEach(el => {
    el.classList.remove("ok", "bad");
    el.classList.add("pending");
    el.querySelector(".c-dot").style.background = "";
  });
  chkFace.childNodes[1].textContent = " Verifying Face…";
  chkGps.childNodes[1].textContent  = " Checking Location…";
  chkTime.childNodes[1].textContent = " Validating Schedule…";
}

// Fake check progress (UI only). Replace with real verification later.
function runFakeChecks(){
  setTimeout(() => setOk(chkFace, "Face Verified"), 500);
  setTimeout(() => setOk(chkGps, "GPS Verified (Within Site)"), 900);
  setTimeout(() => setOk(chkTime, "Schedule Validated"), 1300);
}

function setOk(el, text){
  el.classList.remove("pending");
  el.classList.add("ok");
  el.childNodes[1].textContent = ` ${text}`;
}