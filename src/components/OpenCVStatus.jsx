import React from 'react'
import { useOpenCV } from '@/contexts/OpenCVContext'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function OpenCVStatus() {
    const { isLoaded, error } = useOpenCV()

    if (error) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>OpenCV Failed</span>
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading OpenCV...</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-200 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>OpenCV Ready</span>
        </div>
    )
}

export default OpenCVStatus
