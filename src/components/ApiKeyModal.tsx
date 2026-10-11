import { useState } from 'react';
import { X, Key, ShieldCheck, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { ApiSportsAccountStatus } from '../types/football';
import { ApiSportsService } from '../services/apiSports';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ApiSportsAccountStatus;
  onStatusUpdated: (status: ApiSportsAccountStatus) => void;
  onRefreshData: () => void;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  status,
  onStatusUpdated,
  onRefreshData,
}: ApiKeyModalProps) {
  if (!isOpen) return null;

  const [inputKey, setInputKey] = useState(ApiSportsService.getStoredKey());
  const [testing, setTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveAndTest = async () => {
    setTesting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmed = inputKey.trim();
    ApiSportsService.setStoredKey(trimmed);

    const newStatus = await ApiSportsService.checkStatus(trimmed);
    onStatusUpdated(newStatus);
    setTesting(false);

    if (newStatus.connected) {
      setSuccessMsg(`Successfully verified! Plan: ${newStatus.plan}. Requests remaining: ${newStatus.requestsLimit - newStatus.requestsUsed}/${newStatus.requestsLimit}`);
      onRefreshData();
    } else {
      setErrorMsg(newStatus.message || 'Verification failed. Please check the API key.');
    }
  };

  const handleClearKey = async () => {
    ApiSportsService.setStoredKey('');
    setInputKey('');
    const newStatus = await ApiSportsService.checkStatus('');
    onStatusUpdated(newStatus);
    setSuccessMsg(null);
    setErrorMsg(null);
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">api-sports.io API Key Setup</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Tier Info */}
        <div className="text-xs text-slate-300 space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="font-semibold text-white flex items-center justify-between">
            <span>Free Tier on API-Sports (API-Football)</span>
            <a
              href="https://dashboard.api-football.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              Get Free Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-slate-400">
            api-sports.io gives you <strong className="text-white">100 free requests per day</strong>.
            Sign up for free, copy your API key from your account dashboard, and paste it below.
          </p>
          <div className="text-[11px] text-slate-500">
            Note: Our system caches fixture queries for 15 minutes to preserve your daily quota!
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-300 block">
            Your API-Sports API Key
          </label>
          <input
            type="password"
            placeholder="e.g. 7f9a2b8e3c1d4a5b6c7d8e9f0a1b2c3d"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded border border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded border border-emerald-900/50">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Current Connection Status */}
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Status:</span>
            <span className={status.connected ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {status.connected ? 'CONNECTED (LIVE)' : 'SAMPLE / VERIFIED DATA'}
            </span>
          </div>
          {status.connected && (
            <>
              <div className="text-slate-400 flex items-center justify-between">
                <span>Account:</span>
                <span className="text-slate-200">{status.email || 'Free Member'}</span>
              </div>
              <div className="text-slate-400 flex items-center justify-between">
                <span>Requests Used Today:</span>
                <span className="text-slate-200 tabular-nums">
                  {status.requestsUsed} / {status.requestsLimit}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {inputKey ? (
            <button
              onClick={handleClearKey}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear & Use Sample Data
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndTest}
              disabled={testing || !inputKey.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{testing ? 'Testing...' : 'Save & Verify Key'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
