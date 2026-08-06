// Sett inn offentlig nedlastingsadresse her når installasjonsfilen er publisert.
// Eksempel: const DOWNLOAD_URL = "https://github.com/Sportespen/.../releases/latest/download/...exe";
const DOWNLOAD_URL ="https://github.com/Sportespen/Mangekampanalyse-Downloads/releases/download/v7.2.0/Mangekampanalyse_Pro_7.2.0_Setup.exe";

const buttons = [
  document.getElementById("download-button"),
  document.getElementById("download-button-secondary")
].filter(Boolean);

if (DOWNLOAD_URL) {
  buttons.forEach((button) => {
    button.href = DOWNLOAD_URL;
    button.target = "_blank";
    button.classList.remove("disabled");
    button.removeAttribute("aria-disabled");
    button.textContent = "Last ned Mangekampanalyse Pro";
  });
  const note = document.getElementById("download-note");
  if (note) note.textContent = "Siste tilgjengelige Windows-versjon.";
}
