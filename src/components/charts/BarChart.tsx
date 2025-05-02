import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

interface BarChartProps {
  data: Array<{
    [key: string]: string | number;
    Students: number;
    Teachers: number;
    date: string;
  }>;
  keys: string[];
  indexBy: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: number;
  colors?: string[];
  enableLabel?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  keys,
  indexBy,
  margin = { top: 50, right: 30, bottom: 50, left: 40 },
  padding = 0.2,
  colors = ['#10b981', '#fbbf24'], // green for students, yellow for teachers
  enableLabel = false
}) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy={indexBy}
        margin={margin}
        padding={padding}
        valueScale={{ 
          type: 'linear',
          min: 0,
          max: 5
        }}
        indexScale={{ type: 'band', round: true }}
        colors={colors}
        theme={{
          axis: {
            ticks: {
              text: {
                fontSize: 12
              }
            },
            legend: {
              text: {
                fontSize: 13,
                fontWeight: 600
              }
            }
          },
          grid: {
            line: {
              stroke: '#e5e7eb',
              strokeWidth: 1
            }
          },
          legends: {
            text: {
              fontSize: 12
            }
          }
        }}
        enableLabel={enableLabel}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'LAST 7 DAYS REGISTRATIONS',
          legendPosition: 'middle',
          legendOffset: 35
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          format: d => Math.round(d).toString(),
          tickValues: [0, 1, 2, 3, 4, 5]
        }}
        enableGridX={false}
        enableGridY={true}
        gridYValues={[0, 1, 2, 3, 4, 5]}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'top-right',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: -40,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 12,
            symbolShape: 'circle'
          }
        ]}
        role="application"
        ariaLabel="Registration statistics"
        barAriaLabel={e => e.id + ": " + e.formattedValue + " registrations"}
      />
    </div>
  );
};

export default BarChart; 