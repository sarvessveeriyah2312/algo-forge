import React from 'react';

const INDICATORS = ['EMA', 'RSI', 'MACD', 'Order Block', 'Fair Value Gap'];

const MATRIX_DATA = [
  [1.00, 0.12, 0.45, -0.08, -0.15],
  [0.12, 1.00, 0.61, -0.22, 0.05],
  [0.45, 0.61, 1.00, -0.18, -0.02],
  [-0.08, -0.22, -0.18, 1.00, 0.38],
  [-0.15, 0.05, -0.02, 0.38, 1.00]
];

export const CorrelationMatrix: React.FC = () => {
  const getCellColor = (val: number) => {
    if (val === 1.0) return 'bg-[#00d4aa] text-black font-semibold';
    if (val > 0.5) return 'bg-[#00d4aa]/20 text-[#00d4aa] font-medium';
    if (val > 0.1) return 'bg-[#00d4aa]/10 text-emerald-400';
    if (val < -0.1) return 'bg-[#ef4444]/10 text-red-400';
    return 'bg-[#111827] text-gray-400';
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md font-mono text-xs w-full max-w-lg mx-auto">
      <div className="mb-3 text-center">
        <h4 className="text-sm font-bold text-[#f9fafb] uppercase tracking-wide">Multi-Indicator Correlation Matrix</h4>
        <p className="text-[#6b7280] text-[10px]">Statistical dependency between indicator buy/sell signal overlap</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-[#1f2937] bg-[#0a0e17] text-[#6b7280] text-left">Indicator</th>
              {INDICATORS.map((indicator, idx) => (
                <th key={idx} className="p-2 border border-[#1f2937] bg-[#0a0e17] text-[#9ca3af] text-center font-semibold">
                  {indicator === 'Order Block' ? 'OB' : indicator === 'Fair Value Gap' ? 'FVG' : indicator}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INDICATORS.map((rowIndicator, rIdx) => (
              <tr key={rIdx}>
                <td className="p-2 border border-[#1f2937] bg-[#0a0e17] text-[#f9fafb] text-left font-semibold">
                  {rowIndicator}
                </td>
                {MATRIX_DATA[rIdx].map((val, cIdx) => (
                  <td
                    key={cIdx}
                    className={`p-3 border border-[#1f2937] text-center transition-colors ${getCellColor(val)}`}
                  >
                    {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-[#6b7280] border-t border-[#1f2937] pt-2">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 bg-[#ef4444]/10 border border-[#ef4444]/30 inline-block"></span>
          <span>Negative (-1.0)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 bg-[#111827] border border-[#1f2937] inline-block"></span>
          <span>Neutral (0.0)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 bg-[#00d4aa]/20 border border-[#00d4aa]/40 inline-block"></span>
          <span>Positive (+1.0)</span>
        </div>
      </div>
    </div>
  );
};
