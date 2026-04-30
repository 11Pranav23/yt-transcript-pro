import React, { useState } from 'react';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../components/Common';
import { transcriptAPI, aiAPI } from '../api/api';

export const HomePage = ({ onNavigate, onResultReady }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [language, setLanguage] = useState('en');
  const [transcript, setTranscript] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [showLanguages, setShowLanguages] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedAiAction, setSelectedAiAction] = useState('summarize');

  const validateYouTubeUrl = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleFetchLanguages = async () => {
    if (!youtubeUrl) {
      setError('Please enter a YouTube URL first');
      return;
    }
    try {
      const response = await transcriptAPI.getLanguages(youtubeUrl);
      if (response.data?.languages) {
        setAvailableLanguages(response.data.languages);
        setShowLanguages(!showLanguages);
      }
    } catch (err) {
      setError('Could not fetch available languages');
    }
  };

  const handleGenerateTranscript = async (e) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = validateYouTubeUrl(youtubeUrl);
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video link, Short, or video ID.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setProgressMessage('Fetching transcript...');

    try {
      const response = await transcriptAPI.fetchTranscript(youtubeUrl, language);
      
      if (response.data && response.data.transcript) {
        setSuccess('✅ Subtitles fetched successfully!');
        
        let fetchedMetadata = null;
        try {
          const metadataResponse = await transcriptAPI.getVideoMetadata(videoId);
          fetchedMetadata = metadataResponse.data.metadata;
        } catch (err) {
          console.log('Metadata fetch failed, continuing anyway');
        }

        if (onResultReady) {
          onResultReady({
            transcript: response.data.transcript,
            metadata: fetchedMetadata,
            youtubeUrl,
            language
          });
          return;
        }

        setTranscript(response.data.transcript);
        setProgressMessage('');
        setShowLanguages(false);
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      let errorMessage = 'Failed to fetch subtitles. Please check the URL and try again.';
      
      if (err.response?.status === 404) {
        errorMessage = '❌ Video not found or subtitles are not available.';
      } else if (err.response?.status === 429) {
        errorMessage = '⚠️ YouTube is rate limiting. Please wait and try again.';
      } else if (err.response?.status === 403) {
        errorMessage = '❌ ' + (err.response?.data?.error || 'Subtitles are disabled for this video.');
      } else if (!err.response) {
        errorMessage = '❌ Cannot connect to server. Make sure the backend is running on port 5000.';
      }
      
      setError(errorMessage);
      setProgressMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAction = async (action) => {
    if (!transcript) {
      setError('No transcript available');
      return;
    }

    setAiLoading(true);
    setAiResponse('');
    setSelectedAiAction(action);

    try {
      const transcriptText = Array.isArray(transcript) 
        ? transcript.map(item => item.text).join(' ') 
        : transcript;

      let response;
      if (action === 'summarize') {
        response = await aiAPI.summarize(transcriptText, language);
      } else if (action === 'keypoints') {
        response = await aiAPI.extractKeyPoints(transcriptText, language);
      } else if (action === 'flashcards') {
        response = await aiAPI.generateFlashcards(transcriptText, language, 10);
      } else if (action === 'question') {
        response = await aiAPI.answerQuestion(transcriptText, 'What is this about?', language);
      }

      if (response.data?.response) {
        setAiResponse(response.data.response);
      }
    } catch (err) {
      setError('AI processing failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32 flex flex-col items-center text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">Free - No sign-up required</span>
        </div>

        {/* Big Title */}
        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif font-bold text-white mb-10 leading-[1.1] tracking-tight">
          YouTube to <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 italic pr-2">Transcript,</span>
          <br className="hidden md:block" /> Instantly.
        </h1>

        {/* Main Box */}
        <div className="w-full max-w-3xl mx-auto bg-[#0a0514] border border-indigo-500/20 rounded-2xl p-6 shadow-2xl mb-8 relative z-10 text-left">
          {/* Box Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-600 rounded flex items-center justify-center text-[10px] text-white">▶</span>
              <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Paste YouTube Link</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-mono">Ctrl</span>
              <span className="text-slate-500 text-xs">+</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-mono">V</span>
              <span className="text-slate-500 text-xs ml-1">to paste</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerateTranscript}>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-500">🔗</span>
              </div>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="w-full pl-10 pr-4 py-4 rounded-xl text-sm font-medium border border-slate-800 bg-[#130d1d] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative md:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400">🌐</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pl-10 pr-10 py-4 rounded-xl text-sm font-bold border border-slate-800 bg-[#130d1d] text-white appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-xs">▼</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-4 px-6 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? '⏳ Processing...' : (
                  <>
                    <span className="text-lg">▷</span> Generate Transcript
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Supports youtube.com - youtu.be - Shorts - video IDs</span>
              <button type="button" onClick={() => onNavigate('features')} className="text-indigo-400 hover:text-indigo-300 transition-colors">See all features →</button>
            </div>
          </form>
        </div>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm md:text-base mb-12 max-w-xl mx-auto">
          Paste any YouTube link above and get an accurate, full transcript — free, no account needed.
        </p>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold">
          <div className="px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 10M+ Transcripts
          </div>
          <div className="px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 125+ Languages
          </div>
          <div className="px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> &lt; 3s Processing
          </div>
          <div className="px-4 py-2 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Always Free
          </div>
        </div>
      </section>

      {/* Messages */}
      {error && <div className="max-w-4xl mx-auto px-4 mt-6"><ErrorMessage message={error} /></div>}
      {success && <div className="max-w-4xl mx-auto px-4 mt-6"><SuccessMessage message={success} /></div>}
      {progressMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-6 p-4 bg-slate-800 text-blue-400 rounded-lg flex items-center gap-2 font-semibold">
          <LoadingSpinner />
          <span>{progressMessage}</span>
        </div>
      )}

      {/* Features */}
      <section className="py-16 bg-slate-900 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Choose YT Transcript?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Summaries</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Transform hours of video into concise, actionable summaries in seconds using advanced AI.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">125+ Languages</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Break language barriers with support for over 125 languages and accurate translations.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Key Points</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Automatically extract the most important takeaways and key insights from any video content.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-green-500/50 transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🆓</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Always Free</h3>
              <p className="text-slate-400 text-sm leading-relaxed">No subscriptions, no hidden fees, and no daily limits. Professional tools for everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-slate-950 text-white px-4 py-12 text-center border-t border-slate-800">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition"
        >
          ⬆️ Back to Converter
        </button>
      </section>
    </div>
  );
};

export default HomePage;
