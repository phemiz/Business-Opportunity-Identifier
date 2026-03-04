import { useState, useEffect, useRef } from 'react';
import { analyzeMarket } from './services/geminiService';
import Markdown from 'react-markdown';
import { MapPin, Search, Building2, Target, Loader2, ExternalLink, AlertCircle, DollarSign, Map as MapIcon, TrendingUp, History, Trash2, Save, ChevronRight, PieChart } from 'lucide-react';

interface SavedReport {
  id: number;
  business_type: string;
  location: string;
  budget: number;
  score: string;
  report_text: string;
  map_links: { title: string; uri: string }[];
  created_at: string;
}

const INDUSTRIES = [
  "Retail", "Food & Beverage", "Health & Wellness", "Professional Services", 
  "Entertainment", "Automotive", "Technology", "Education", "Other"
];

export default function App() {
  const [businessModel, setBusinessModel] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState(50000);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ text: string; mapLinks: { title: string; uri: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessModel || !location) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const budgetText = budget >= 100000 ? "$100k+" : `$${(budget / 1000).toFixed(0)}k`;
      const analysis = await analyzeMarket(`${industry}: ${businessModel}`, location, budgetText);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze market. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: `${industry}: ${businessModel}`,
          location,
          budget,
          score: getScore(result.text) || "N/A",
          reportText: result.text,
          mapLinks: result.mapLinks
        })
      });
      if (res.ok) {
        await fetchHistory();
        alert("Report saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save report:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  // Helper to extract the score from the markdown text
  const getScore = (text: string) => {
    const match = text.match(/Viability Score:\s*\*?\*?(\d+(?:\.\d+)?)\/10/i);
    return match ? match[1] : null;
  };

  // Helper to extract sentiment counts
  const getSentimentCounts = (text: string) => {
    const pos = text.match(/Positive:\s*\*?\*?(\d+)/i);
    const neg = text.match(/Negative:\s*\*?\*?(\d+)/i);
    const neu = text.match(/Neutral:\s*\*?\*?(\d+)/i);
    return {
      positive: pos ? pos[1] : "0",
      negative: neg ? neg[1] : "0",
      neutral: neu ? neu[1] : "0"
    };
  };

  const score = result ? getScore(result.text) : null;
  const sentiments = result ? getSentimentCounts(result.text) : null;

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
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">Vantage</h1>
              <p className="text-xs text-slate-500 font-medium">Business Opportunity Identifier Engine</p>
            </div>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <History className="w-4 h-4" />
            {showHistory ? "Hide History" : "View History"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 relative">
        
        {/* History Sidebar Overlay */}
        {showHistory && (
          <div className="absolute inset-y-0 left-0 w-full lg:w-80 bg-white border-r border-slate-200 z-20 shadow-xl overflow-y-auto p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Past Evaluations
              </h2>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No saved reports yet.</p>
              ) : (
                history.map((report) => (
                  <div key={report.id} className="group p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer" onClick={() => {
                    setResult({ text: report.report_text, mapLinks: report.map_links });
                    setBusinessModel(report.business_type.split(': ')[1] || report.business_type);
                    setLocation(report.location);
                    setBudget(report.budget);
                    setShowHistory(false);
                  }}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{report.score}/10</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{report.business_type}</h3>
                    <p className="text-xs text-slate-500 truncate mb-2">{report.location}</p>
                    <span className="text-[10px] text-slate-400">{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Left Column: Input & Map Visualization */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 shrink-0">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              Location Parameters
            </h2>
            
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm appearance-none bg-white"
                  >
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Name/Type</label>
                  <input
                    type="text"
                    required
                    value={businessModel}
                    onChange={(e) => setBusinessModel(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                    placeholder="e.g., Artisan Coffee"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target City / Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                    placeholder="e.g., Downtown Austin, TX"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">Budget Allocation</label>
                  <span className="text-sm font-bold text-indigo-600">
                    {budget >= 100000 ? "$100k+" : `$${(budget / 1000).toFixed(0)}k`}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>$5k</span>
                  <span>$50k</span>
                  <span>$100k+</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !businessModel || !location}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

          {/* Map Visualization (Simulated with Heatmap) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-indigo-600" />
                Interactive Map
              </h2>
              {result && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500/30 border border-orange-500"></div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Density Heatmap</span>
                </div>
              )}
            </div>
            
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
                  {/* Simulated Heatmap Layer */}
                  {result.mapLinks.length > 0 && result.mapLinks.map((_, idx) => {
                    const top = `${20 + ((idx * 37) % 60)}%`;
                    const left = `${15 + ((idx * 43) % 70)}%`;
                    return (
                      <div 
                        key={`heat-${idx}`} 
                        className="absolute w-24 h-24 -ml-12 -mt-12 rounded-full bg-orange-500/10 blur-xl animate-pulse"
                        style={{ top, left, animationDelay: `${idx * 200}ms` }}
                      ></div>
                    );
                  })}

                  {/* Simulated Pins */}
                  {result.mapLinks.length > 0 ? (
                    result.mapLinks.map((link, idx) => {
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
              <div className="flex items-center gap-3">
                {result && (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-xs font-bold disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save Report
                  </button>
                )}
                {score && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Viability</span>
                    <span className={`text-lg font-bold ${Number(score) >= 7 ? 'text-emerald-600' : Number(score) >= 4 ? 'text-amber-500' : 'text-red-500'}`}>
                      {score}/10
                    </span>
                  </div>
                )}
              </div>
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
                  {/* Sentiment Summary Cards */}
                  {sentiments && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                        <div className="text-emerald-600 font-bold text-xl">{sentiments.positive}</div>
                        <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Positive</div>
                      </div>
                      <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
                        <div className="text-red-600 font-bold text-xl">{sentiments.negative}</div>
                        <div className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Negative</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                        <div className="text-slate-600 font-bold text-xl">{sentiments.neutral}</div>
                        <div className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">Neutral</div>
                      </div>
                    </div>
                  )}

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
