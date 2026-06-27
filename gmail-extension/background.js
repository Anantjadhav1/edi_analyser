//receives the message(text) 
//here we use the axios library to package the email text to the JSON object
//and sends the http post request to the local background server 
//and after analyzing it receives the result from api
//and then returns to the content.js
importScripts('axios.min.js');

// Sunne ka, jab bhi content script se message aayega
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.type === "ANALYZE_EMAIL") {
    const textToAnalyze = request.text;

    axios.post('http://localhost:3001/api/analyze', { text: textToAnalyze })
    .then(response => {
      //returning the result 
      sendResponse({ success: true, data: response.data });
    })
    .catch(error => {
      let errorMessage = error.message;
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      sendResponse({ success: false, error: errorMessage });
    });

    return true;
  }
});
