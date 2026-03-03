import { useState } from 'react';
import { analyzeMarket } from './services/geminiService';
import Markdown from 'react-markdown';
import { MapPin, Search, Building2, Target, Loader2, ExternalLink, AlertCircle, DollarSign, Map as MapIcon, TrendingUp } from 'lucide-react';

export default function App() {
  const [businessModel, setBusinessModel] = useState('');
  const [location, setLocation] = useState('');
  const [budgetLevel, setBudgetLevel] = useState('Medium');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ text: string; mapLinks: { title: string; uri: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessModel || !location) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeMarket(businessModel, location, budgetLevel);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze market. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to extract the score from the markdown text
  const getScore = (text: string) => {
    const match = text.match(/Viability Score:\s*\*?\*?(\d+(?:\.\d+)?)\/10/i);
    return match ? match[1] : null;
  };

  const score = result ? getScore(result.text) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">Business Opportunity Identifier</h1>
              <p className="text-xs text-slate-500 font-medium">Geospatial Intelligence Engine</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Input & Map Visualization */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 shrink-0">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              Location Parameters
            </h2>
            
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label htmlFor="businessModel" className="block text-sm font-medium text-slate-700 mb-1">
                  Business Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="businessModel"
                    required
                    value={businessModel}
                    onChange={(e) => setBusinessModel(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm transition-shadow"
                    placeholder="e.g., Specialty Coffee Shop"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                  Target City / Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm transition-shadow"
                    placeholder="e.g., Downtown Austin, TX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="budgetLevel" className="block text-sm font-medium text-slate-700 mb-1">
                  Budget Level
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    id="budgetLevel"
                    value={budgetLevel}
                    onChange={(e) => setBudgetLevel(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm transition-shadow appearance-none bg-white"
                  >
                    <option value="Low">Low (Bootstrapped / Lean)</option>
                    <option value="Medium">Medium (Standard Commercial)</option>
                    <option value="High">High (Premium / Main Street)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !businessModel || !location}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Analyzing Location...
                  </>
                ) : (
                  'Analyze Location'
                )}
              </button>
            </form>
          </div>

          {/* Map Visualization (Simulated) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col min-h-[300px]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-indigo-600" />
              Interactive Map
            </h2>
            
            <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
              {/* Grid Background Pattern */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              {!result && !isAnalyzing && (
                <div className="text-center z-10 px-4">
                  <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Run an analysis to plot competitors and anchors.</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center z-10 px-4">
                  <div className="relative w-12 h-12 mx-auto mb-3">
                    <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-white animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm text-indigo-600 font-medium">Scanning area...</p>
                </div>
              )}

              {result && !isAnalyzing && (
                <div className="absolute inset-0 p-4">
                  {/* Simulated Pins based on mapLinks */}
                  {result.mapLinks.length > 0 ? (
                    result.mapLinks.map((link, idx) => {
                      // Generate pseudo-random positions based on index to scatter them
                      const top = `${20 + ((idx * 37) % 60)}%`;
                      const left = `${15 + ((idx * 43) % 70)}%`;
                      return (
                        <div 
                          key={idx} 
                          className="absolute group"
                          style={{ top, left }}
                        >
                          <div className="relative -ml-3 -mt-6 cursor-pointer">
                            <MapPin className="w-6 h-6 text-red-500 drop-shadow-md" fill="#fee2e2" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-lg text-[10px] font-medium text-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none border border-slate-100">
                              {link.title}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-500 z-10 relative">
                      No specific locations found to plot.
                    </div>
                  )}
                  
                  {/* Target Center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-md"></div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                      TARGET
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Data Analysis Panel */}
        <div className="w-full lg:w-7/12 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Data Analysis
              </h2>
              {score && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Viability</span>
                  <span className={`text-lg font-bold ${Number(score) >= 7 ? 'text-emerald-600' : Number(score) >= 4 ? 'text-amber-500' : 'text-red-500'}`}>
                    {score}/10
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Analysis Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {!result && !isAnalyzing && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                  <Target className="w-12 h-12 text-slate-300 mb-3" />
                  <p>Awaiting parameters to generate viability report.</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">Processing Intelligence...</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-2">
                    Evaluating competitor density, sentiment, and budget alignment.
                  </p>
                </div>
              )}

              {result && !isAnalyzing && (
                <div className="space-y-8">
                  {/* Markdown Report */}
                  <div className="prose prose-slate prose-indigo max-w-none prose-headings:font-semibold prose-h3:text-lg prose-h3:border-b prose-h3:pb-2 prose-h3:border-slate-100 prose-table:w-full prose-th:bg-slate-50 prose-th:p-3 prose-td:p-3 prose-tr:border-b prose-tr:border-slate-100">
                    <Markdown>{result.text}</Markdown>
                  </div>

                  {/* Grounding Sources */}
                  {result.mapLinks.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        Verified Map Sources
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.mapLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                          >
                            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700 truncate pr-4">
                              {link.title}
                            </span>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
