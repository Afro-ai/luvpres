interface HighlightProps {
    id?: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export function Highlight({ x, y, width, height }: HighlightProps) {
    return (
        <div
            className="remote-highlight"
            style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                width: `${width}%`,
                height: `${height}%`,
                background: 'rgba(255, 235, 59, 0.3)',
                border: '2px solid rgba(255, 193, 7, 0.8)',
                borderRadius: '4px',
                pointerEvents: 'none',
                zIndex: 999,
                animation: 'highlight-pulse 1s ease-out'
            }}
        />
    );
}
