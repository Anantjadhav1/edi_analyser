// content_script.js (Updated)

function showModal(initialContent) {
  let modal = document.getElementById("edi-modal");
  if (modal) {
    document.getElementById("edi-modal-title").innerText = "Analyzing...";
    document.getElementById("edi-modal-body").innerHTML = `<p>${initialContent}</p>`;
    modal.style.display = "block";
    return;
  }
  modal = document.createElement("div");
  modal.id = "edi-modal";
  const modalContent = document.createElement("div");
  modalContent.id = "edi-modal-content";
  modalContent.innerHTML = `
    <span id="edi-close-button">&times;</span>
    <h2 id="edi-modal-title">Analyzing...</h2>
    <div id="edi-modal-body">
      <p>${initialContent}</p>
    </div>
  `;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  document.getElementById("edi-close-button").onclick = () => {
    modal.style.display = "none";
  };
}

function updateModalContent(data) {
  if (!data) {
    document.getElementById("edi-modal-body").innerHTML = "<p>Error: No data received.</p>";
    return;
  }
  const formattedHTML = `
    <p><strong>Summary:</strong> ${data.summary || 'N/A'}</p>
    <p><strong>Type:</strong> <span style="font-family: monospace; background: #4a5568; padding: 2px 6px; border-radius: 4px;">${data.messageType || 'UNKNOWN'}</span></p>
    <p><strong>Important:</strong> <span style="color: ${data.isImportant ? '#f56565' : '#68d391'}; font-weight: bold;">${data.isImportant ? 'Yes' : 'No'}</span></p>
    <p><strong>Timestamp:</strong> ${data.timestamp === "N/A" ? "N/A" : new Date(data.timestamp).toLocaleString()}</p>
  `;
  document.getElementById("edi-modal-title").innerText = "Analysis Result";
  document.getElementById("edi-modal-body").innerHTML = formattedHTML;
}

function startAnalysis() {
  const emailBody = document.querySelector(".a3s.aiL, .gs");
  if (!emailBody) {
    alert("Could not find email content to analyze. Make sure the email is fully open.");
    return;
  }
  const emailText = emailBody.innerText;
  showModal("Analyzing your email, please wait...");
  chrome.runtime.sendMessage(
    { type: "ANALYZE_EMAIL", text: emailText },
    (response) => {
      if (response.success) {
        updateModalContent(response.data);
      } else {
        updateModalContent(`Analysis Error: ${response.error}`);
      }
    }
  );
}

function addAnalyzeButton() {
  const buttonBar = document.querySelector(".G-tF");
  if (buttonBar && !document.getElementById("edi_analyze_button")) {
    
    // --- YEH FIX HAI (Step 2) ---
    // Pehle "div" tha, ab "button" hai
    const analyzeButton = document.createElement("button"); 
    // ------------------------

    analyzeButton.className = "edi-analyze-button";
    analyzeButton.id = "edi_analyze_button";
    analyzeButton.innerText = "Analyze";
    analyzeButton.onclick = startAnalysis;
    buttonBar.appendChild(analyzeButton);
  }
}

// --- YEH FIX HAI (Step 1) ---
// Pehle 1000ms tha, ab 300ms hai (bohot fast)
setInterval(addAnalyzeButton, 300);
// ------------------------

console.log("EDI Analyzer Content Script Loaded.");