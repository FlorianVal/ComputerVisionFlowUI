import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { generateCode } from '@/utils/pipelineCodeGenerator'

const LANGUAGES = [
    { id: 'python', label: 'Python', ext: 'py' },
    { id: 'javascript', label: 'JavaScript', ext: 'js' },
]

/**
 * ExportModal
 *
 * Shows generated Python or JavaScript OpenCV code for the current pipeline.
 * Rendered via a React Portal so it sits above the ReactFlow canvas.
 *
 * @param {object[]} nodes - Current ReactFlow nodes (from getNodes())
 * @param {object[]} edges - Current ReactFlow edges (from getEdges())
 * @param {function} onClose - Callback to close the modal
 */
export default function ExportModal({ nodes, edges, onClose }) {
    const [language, setLanguage] = useState('python')
    const [copied, setCopied] = useState(false)
    const backdropRef = useRef(null)

    const code = generateCode(nodes, edges, language)
    const currentLang = LANGUAGES.find(l => l.id === language)

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    // Close on backdrop click
    const handleBackdropClick = useCallback((e) => {
        if (e.target === backdropRef.current) onClose()
    }, [onClose])

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback: select all text in the pre
            const pre = document.querySelector('[data-export-code]')
            if (pre) {
                const range = document.createRange()
                range.selectNodeContents(pre)
                window.getSelection().removeAllRanges()
                window.getSelection().addRange(range)
            }
        }
    }, [code])

    const handleDownload = useCallback(() => {
        const blob = new Blob([code], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pipeline.${currentLang.ext}`
        a.click()
        URL.revokeObjectURL(url)
    }, [code, currentLang])

    return createPortal(
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <div className="relative flex flex-col bg-background border rounded-lg shadow-2xl w-[min(90vw,860px)] max-h-[85vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
                    <div>
                        <h2 className="text-base font-semibold">Export Pipeline Code</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Copy or download runnable OpenCV code for your pipeline
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors ml-4"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Language Tabs */}
                <div className="flex gap-1 px-5 pt-3 shrink-0">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.id}
                            onClick={() => { setLanguage(lang.id); setCopied(false) }}
                            className={[
                                'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
                                language === lang.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                            ].join(' ')}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>

                {/* Code Block */}
                <div className="flex-1 overflow-auto mx-5 mt-3 mb-4 rounded-md border bg-slate-950">
                    <pre
                        data-export-code
                        className="p-4 text-xs text-slate-100 font-mono whitespace-pre leading-relaxed"
                    >
                        {code}
                    </pre>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 px-5 pb-4 shrink-0">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download .{currentLang.ext}
                    </Button>
                    <Button size="sm" onClick={handleCopy}>
                        {copied ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                Copy Code
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    )
}
