// Apun ka auzaar (axios) import karne ka
importScripts('axios.min.js');

// Sunne ka, jab bhi content script se message aayega
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.type === "ANALYZE_EMAIL") {
    const textToAnalyze = request.text;

    // Apne backend server ko text bhej raha hai
    axios.post('http://localhost:3001/api/analyze', { text: textToAnalyze })
    .then(response => {
      // Server se jo badiya result aaya, woh wapas bhej
      sendResponse({ success: true, data: response.data });
    })
    .catch(error => {
      // Agar kuch lafda (error) hua, toh woh bhej
      let errorMessage = error.message;
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      sendResponse({ success: false, error: errorMessage });
    });

    // Yeh line bohot important hai. Iska matlab apun jawab baad me dega.
    return true;
  }
});