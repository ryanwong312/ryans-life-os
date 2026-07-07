import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block', 'link', 'image'],
      ['clean']
    ],
  },
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'blockquote', 'code-block',
  'link', 'image'
];

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Start writing...', 
  className = '',
  enableVoice = false
}) {
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    if (!isRecording) {
      recognition.start();
      setIsRecording(true);

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onChange(value + ' ' + transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    } else {
      recognition.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      {enableVoice && (
        <div className="flex items-center gap-2 mb-2">
          <Button
            type="button"
            variant={isRecording ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleVoiceToggle}
            className="gap-2"
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Voice Input
              </>
            )}
          </Button>
          {isRecording && (
            <span className="text-sm text-rose-400 animate-pulse">Recording...</span>
          )}
        </div>
      )}
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
      />
      <style>{`
        .ql-container {
          min-height: 200px;
          font-size: 16px;
          font-family: inherit;
        }
        .ql-editor {
          color: #e2e8f0;
          min-height: 200px;
        }
        .ql-editor.ql-blank::before {
          color: #64748b;
          font-style: normal;
        }
        .ql-toolbar {
          background: rgba(30, 41, 59, 0.8);
          border: none !important;
          border-bottom: 1px solid rgba(71, 85, 105, 0.5) !important;
          padding: 6px 8px !important;
        }
        .ql-toolbar button {
          width: 24px !important;
          height: 24px !important;
          padding: 2px !important;
        }
        .ql-toolbar button svg {
          width: 16px !important;
          height: 16px !important;
        }
        .ql-toolbar .ql-picker {
          height: 24px !important;
          font-size: 13px !important;
        }
        .ql-container {
          border: none !important;
        }
        .ql-toolbar .ql-stroke {
          stroke: #94a3b8;
        }
        .ql-toolbar .ql-fill {
          fill: #94a3b8;
        }
        .ql-toolbar .ql-picker {
          color: #94a3b8;
        }
        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2dd4bf;
        }
        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar button.ql-active .ql-fill {
          fill: #2dd4bf;
        }
      `}</style>
    </div>
  );
}