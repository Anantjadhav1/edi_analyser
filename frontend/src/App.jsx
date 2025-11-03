import { useState } from 'react';
import axios from 'axios';
import { Dashboard } from './Dashboard';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      return alert('Please select a file first!');
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('ediFile', selectedFile);

    try {
      const response = await axios.post('http://localhost:3001/api/analyze', formData);

      // --- UPDATE THE TIMELINE WITH REAL AI DATA ---
      const newResult = { ...response.data, id: new Date().getTime() };
      setAnalysisResults(prevResults => 
        [newResult, ...prevResults].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
      // ------------------------------------------

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while analyzing the file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">AI EDI Analyzer</h1>
      <Dashboard results={analysisResults} />

      <div className="bg-gray-800 p-6 rounded-lg mb-6 max-w-2xl mx-auto">
        {/* ... (upload section code is the same) ... */}
        <h2 className="text-xl font-semibold mb-4">Upload Your EDI Message</h2>
        <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
        <button onClick={handleAnalyze} disabled={isLoading} className="mt-4 w-full bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 font-bold disabled:bg-gray-500">
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
        {analysisResults.length > 0 ? (
          <div className="space-y-4">
            {analysisResults.map((result) => (
              <div key={result.id} className="bg-gray-700 p-4 rounded-lg animate-fade-in">
                <p><strong>Summary:</strong> {result.summary}</p>
                <p><strong>Type:</strong> <span className="font-mono bg-gray-600 px-2 py-1 rounded">{result.messageType}</span></p>
                <p><strong>Important:</strong> <span className={result.isImportant ? 'text-red-400 font-bold' : ''}>{result.isImportant ? 'Yes' : 'No'}</span></p>
                <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Analysis results from the AI will be shown here.</p>
        )}
      </div>
    </div>
  );
}

export default App;