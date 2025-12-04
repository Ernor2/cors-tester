import React, { useState } from 'react';
import { Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function CORSTester() {
  const [url, setUrl] = useState('https://api.github.com/users/github');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [headers, setHeaders] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testCORS = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const startTime = performance.now();
      
      // Parse custom headers
      let customHeaders = {};
      if (headers.trim()) {
        try {
          customHeaders = JSON.parse(headers);
        } catch (e) {
          throw new Error('Invalid JSON in headers field');
        }
      }

      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...customHeaders
        }
      };

      if (method !== 'GET' && method !== 'HEAD' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      // Get CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': res.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': res.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': res.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': res.headers.get('Access-Control-Allow-Credentials'),
        'Access-Control-Expose-Headers': res.headers.get('Access-Control-Expose-Headers'),
      };

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        corsHeaders,
        time: (endTime - startTime).toFixed(2),
        success: res.ok
      });
    } catch (err) {
      setError({
        message: err.message,
        type: err.name,
        isCORSError: err.message.includes('CORS') || err.message.includes('fetch')
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Send className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">CORS Tester</h1>
          </div>
          
          <p className="text-slate-600 mb-6">
            Test Cross-Origin Resource Sharing (CORS) configuration by making requests to any API endpoint.
          </p>

          {/* Request Configuration */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
                <option>DELETE</option>
                <option>OPTIONS</option>
              </select>
              
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter API URL"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <button
                onClick={testCORS}
                disabled={loading || !url}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Testing...' : 'Send'}
              </button>
            </div>

            {/* Headers */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Custom Headers (JSON)
              </label>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder='{"Authorization": "Bearer token", "X-Custom": "value"}'
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows="3"
              />
            </div>

            {/* Request Body */}
            {method !== 'GET' && method !== 'HEAD' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Request Body (JSON)
                </label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows="4"
                />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Request Failed</h3>
                  <p className="text-red-700 text-sm mb-2">{error.message}</p>
                  {error.isCORSError && (
                    <div className="bg-red-100 rounded p-3 text-sm text-red-900">
                      <p className="font-semibold mb-1">🚨 Likely CORS Issue</p>
                      <p>This error typically means:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>The server doesn't have CORS headers configured</li>
                        <li>The server doesn't allow requests from this origin</li>
                        <li>The preflight OPTIONS request failed</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                {response.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-bold ${getStatusColor(response.status)}`}>
                      {response.status}
                    </span>
                    <span className="text-slate-600">{response.statusText}</span>
                    <span className="ml-auto text-sm text-slate-500">
                      {response.time}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* CORS Headers */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span>CORS Headers</span>
                  {Object.values(response.corsHeaders).some(v => v) ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm space-y-2">
                  {Object.entries(response.corsHeaders).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-slate-600 w-64">{key}:</span>
                      <span className={value ? 'text-green-700' : 'text-red-600'}>
                        {value || '❌ Not set'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Body */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Response Body</h3>
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-sm">
                    {typeof response.data === 'string' 
                      ? response.data 
                      : JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• CORS errors appear in the browser console - check there for details</li>
              <li>• Preflight requests (OPTIONS) happen automatically for certain requests</li>
              <li>• The server must set Access-Control-Allow-Origin to allow cross-origin requests</li>
              <li>• Try a public API like https://api.github.com/users/github to test</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}