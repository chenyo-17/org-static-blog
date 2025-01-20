document.querySelectorAll("h3, h4, h5, h6").forEach((header) => {
  const content = header.nextElementSibling;
  content.classList.add("section-content");
  header.onclick = () => toggleSection(header);
});

document.querySelectorAll(".org-src-container").forEach((codeSection) => {
  const button = document.createElement("button");
  button.textContent = "▶ Show code";
  button.className = "fold-button";
  button.onclick = () => toggleCode(button);
  codeSection.parentNode.insertBefore(button, codeSection);
  codeSection.style.display = "none";
});

document.querySelectorAll(".latex").forEach((latex) => {
  const button = document.createElement("button");
  button.textContent = "▶ Show latex";
  button.className = "fold-button";
  button.onclick = () => toggleLatex(button);
  latex.parentNode.insertBefore(button, latex);
  latex.style.display = "none";
});

function toggleSection(header) {
  const content = header.nextElementSibling;
  const isVisible = content.style.display !== "none";
  content.style.display = isVisible ? "none" : "block";
}

function toggleCode(button) {
  const codeBlock = button.nextElementSibling;
  const isVisible = codeBlock.style.display !== "none";
  codeBlock.style.display = isVisible ? "none" : "block";
  button.textContent = isVisible ? "▶ Show code" : "▼ Hide code";
}

function toggleLatex(button) {
  const latex = button.nextElementSibling;
  const isVisible = latex.style.display !== "none";
  latex.style.display = isVisible ? "none" : "block";
  button.textContent = isVisible ? "▶ Show latex" : "▼ Hide latex";
}
