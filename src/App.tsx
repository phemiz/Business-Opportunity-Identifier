import { useState, useRef } from 'react';
import { generateDocument } from './services/geminiService';
import Markdown from 'react-markdown';
import { FileText, Download, Share2, MessageCircle, ChevronRight, Loader2, CheckCircle2, Building, ArrowLeft, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const DOCUMENT_TYPES = [
  { id: 'business_plan', title: 'Business Plan (BoI/GEEP)', icon: Building, desc: 'Formal business plan for Nigerian grants and loans.' },
  { id: 'tenancy_agreement', title: 'Tenancy Agreement', icon: FileText, desc: 'Standard Lagos/Abuja tenancy and lease agreements.' },
  { id: 'ngo_constitution', title: 'NGO Constitution', icon: ShieldCheck, desc: 'CAC Part F compliant constitution for NGOs and Foundations.' },
  { id: 'general_proposal', title: 'General Business Proposal', icon: FileText, desc: 'Professional proposal for B2B contracts and partnerships.' }
];

const CONSULTANTS = [
  { name: 'Barr. Chinedu Okeke', role: 'CAC Registration Expert', phone: '2348000000001' },
  { name: 'Aisha Mohammed', role: 'BoI Grant Consultant', phone: '2348000000002' },
  { name: 'Tunde Bakare & Co.', role: 'Legal Drafting', phone: '2348000000003' }
];

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [docType, setDocType] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    purpose: '',
    state: '',
    budget: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectDoc = (type: any) => {
    setDocType(type);
    setStep(2);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const doc = await generateDocument(docType.title, formData);
      setGeneratedDoc(doc);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!documentRef.current) return;
    try {
      const canvas = await html2canvas(documentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${docType.title.replace(/\s+/g, '_')}_NaijaDocs.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`I just generated a professional ${docType.title} using NaijaDocs AI! Generate yours for free here: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const resetApp = () => {
    setStep(1);
    setDocType(null);
    setGeneratedDoc(null);
    setFormData({ name: '', businessType: '', purpose: '', state: '', budget: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-emerald-700 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <ShieldCheck className="w-8 h-8 text-emerald-300" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">NaijaDocs AI</h1>
              <p className="text-[10px] text-emerald-200 font-medium uppercase tracking-wider">Govt-Standard Documents</p>
            </div>
          </div>
          {step > 1 && (
            <button onClick={resetApp} className="text-sm font-medium text-emerald-100 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Start Over
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left/Main Content */}
        <div className="w-full lg:w-8/12 flex flex-col gap-6">
          
          {/* Step 1: Select Document */}
          {step === 1 && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">What do you want to create today?</h2>
                <p className="text-slate-500 mt-2">Select a document type to generate a formal, high-level Nigerian legal or business document.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DOCUMENT_TYPES.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md hover:ring-1 hover:ring-emerald-500 cursor-pointer transition-all group"
                  >
                    <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                      <doc.icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{doc.title}</h3>
                    <p className="text-sm text-slate-500">{doc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <docType.icon className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Generate {docType.title}</h2>
                  <p className="text-sm text-slate-500">Please provide the details below to customize your document.</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Organization Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent" placeholder="e.g. Chukwudi Okafor or XYZ Ltd" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State / Location</label>
                    <select required name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white">
                      <option value="">Select State</option>
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja (FCT)</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Kano">Kano</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Type / Industry</label>
                  <input required type="text" name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent" placeholder="e.g. Agriculture, Real Estate, Tech Startup" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purpose / Objective</label>
                  <textarea required name="purpose" value={formData.purpose} onChange={handleInputChange} rows={3} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent" placeholder="Briefly describe what this document is for (e.g. Applying for BoI 10M grant to expand poultry farm)"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Budget / Capital (₦)</label>
                  <input required type="text" name="budget" value={formData.budget} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent" placeholder="e.g. ₦5,000,000" />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-70 transition-colors mt-4"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Drafting Document with AI...
                    </>
                  ) : (
                    'Generate with AI'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Generated Document */}
          {step === 3 && generatedDoc && (
            <div className="animate-in fade-in duration-500 space-y-6">
              
              {/* Action Bar */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-10">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  Document Ready
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={shareOnWhatsApp} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-sm transition-colors">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-sm transition-colors shadow-sm">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>

              {/* Document Paper */}
              <div className="bg-white shadow-md border border-slate-200 p-8 md:p-12 rounded-sm min-h-[800px]">
                <div id="document-content" className="prose prose-slate prose-emerald max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-h2:border-slate-200 prose-p:text-justify prose-li:text-justify">
                  <Markdown>{generatedDoc}</Markdown>
                </div>
              </div>

              {/* Premium Support Section */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Premium Support</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">Need a professional to review this document or help you register with the Corporate Affairs Commission (CAC)?</p>
                <a 
                  href="https://wa.me/2348000000000?text=Hello,%20I%20need%20premium%20support%20for%20my%20NaijaDocs%20document." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#1ebe57] transition-colors shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  Message a Verified Agent on WhatsApp
                </a>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full lg:w-4/12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Business Consultants
            </h3>
            <p className="text-xs text-slate-500 mb-6">Promoted experts available for CAC registration, grant applications, and legal reviews.</p>
            
            <div className="space-y-4">
              {CONSULTANTS.map((consultant, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-100 transition-colors">
                  <h4 className="font-semibold text-slate-900 text-sm">{consultant.name}</h4>
                  <p className="text-xs text-emerald-700 font-medium mb-3">{consultant.role}</p>
                  <a 
                    href={`https://wa.me/${consultant.phone}?text=Hello%20${encodeURIComponent(consultant.name)},%20I%20found%20you%20on%20NaijaDocs.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:text-[#25D366] hover:border-[#25D366] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat on WhatsApp
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">Want to list your services here?</p>
              <a href="#" className="text-xs font-bold text-emerald-600 hover:underline">Apply for Sponsorship</a>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
