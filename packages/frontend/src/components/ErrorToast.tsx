import { useEffect, useState } from 'react'

interface ErrorToastProps {
    message: string
    onClose: () => void
}

export default function ErrorToast({ message, onClose }: ErrorToastProps) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 300) // Wait for fade animation
        }, 5000)

        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div
            className={`fixed top-4 right-4 bg-red-800 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    <span>{message}</span>
                </div>
                <button
                    onClick={() => {
                        setVisible(false)
                        setTimeout(onClose, 300)
                    }}
                    className="ml-4 text-white hover:text-gray-200 font-bold"
                >
                    ×
                </button>
            </div>
        </div>
    )
}
