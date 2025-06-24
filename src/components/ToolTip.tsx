import React from 'react';

interface ToolTipProps {
  children?: React.ReactNode;
  content?: string | React.ReactNode;
}
const ToolTip: React.FC<ToolTipProps> = ({ children, content }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const targetRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  // ツールチップのスタイルを位置に基づいて動的に生成
  const getTooltipStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: '#333',
      color: '#fff',
      padding: '5px 10px',
      borderRadius: '4px',
      whiteSpace: 'pre-wrap',
      zIndex: 10,
      pointerEvents: 'none', // ツールチップ自体がマウスイベントをブロックしないように
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s ease-in-out'
    };

    return baseStyle;
  };
  return (
    <div
      className='tooltip-container'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={targetRef}
    >
      {children}
      {isVisible && (
        <div className='tooltip-content' style={getTooltipStyle()}>
          {content}
        </div>
      )}
    </div>
  );
};

export default ToolTip;
