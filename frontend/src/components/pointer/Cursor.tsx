interface CursorProps {
    x: number;
    y: number;
    label?: string;
}

export function Cursor({ x, y, label }: CursorProps) {
    return (
        <div
            className="remote-cursor"
            style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-2px, -2px)',
                pointerEvents: 'none',
                zIndex: 1000,
                transition: 'left 0.05s linear, top 0.05s linear'
            }}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                    d="M5.5 3.21V20.8L10.5 15.8L14.79 15.8L5.5 3.21Z"
                    fill="#C5A059"
                    stroke="white"
                    strokeWidth="1.5"
                />
            </svg>
            {label && (
                <span
                    style={{
                        position: 'absolute',
                        left: '20px',
                        top: '16px',
                        background: '#C5A059',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {label}
                </span>
            )}
        </div>
    );
}
