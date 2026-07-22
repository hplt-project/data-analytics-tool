import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { percFormatter, correctNoiseTag } from "@/lib/helpers";
import InfoTooltip from "./InfoTooltip";
import useIsMobile from "@/lib/useIsMobile";

import styles from "@/styles/NoiseDistributionGraph.module.css";

const CustomTooltip = ({ active, payload, label, total }) => {
  if (active && payload && payload.length) {

    const freq = payload[0].payload.freq;

    const tag = payload[0].payload.tag;

    const percentage = parseFloat((freq * 100) / total).toFixed(2)
    return (
      <div className={styles.tooltip}>
        <p className={styles.label}>{correctNoiseTag(tag)}</p>
        {freq && (
          <p
            className={styles.perc}
          >{`${freq.toLocaleString("en-US")} segments`}{" "}<span style={{ fontWeight: 600 }}>{freq ? `(${percentage}%)` : ""}</span></p>
        )}
      </div>
    );
  }

  return null;
};


export default function NoiseDistribution({
  noiseData,
  sentences,
  trglang,
  footNote,
}) {
  const isMobile = useIsMobile();
  const numbers = isMobile ? [0, 25, 50, 75, 100] : [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const chartData = noiseData.map(([tag, freq]) => ({
    tag,
    label: correctNoiseTag(tag),
    freq,
    percentage: +parseFloat((freq * 100) / sentences).toFixed(2),
    percentageLabel: `${((freq * 100) / sentences).toFixed(2)}%`,
  }));

  return (
    <div className="custom-chart">
      <div className={styles.title}>
        <h3 className={styles.noiseDistributionTitle}>
          Segment {trglang && "pair"} noise distribution
        </h3>
        {!footNote && (
          <InfoTooltip>
            <p>Obtained with Bicleaner Hardrules (
              <a
                href="https://github.com/bitextor/bicleaner-hardrules/"
                target="_blank"
              >
                https://github.com/bitextor/bicleaner-hardrules/
              </a>
              )</p>
          </InfoTooltip>
        )}
      </div>
      <div className={styles.container}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            width={300}
            height={200}
            data={chartData}
            margin={{
              top: 0,
              right: isMobile ? 22 : 10,
              left: isMobile ? 8 : 35,
              bottom: isMobile ? 8 : 15,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={percFormatter}
              ticks={numbers}
              fontSize={isMobile ? 11 : 12}
            />
            <YAxis
              dataKey="label"
              type="category"
              fontSize={isMobile ? 11 : 14}
              tickFormatter={(value) =>
                value.toLocaleString().replace(/ /g, "\u00A0")
              }
            />
            <Tooltip content={<CustomTooltip total={sentences} />} />
            {!isMobile && <Legend />}
            <Bar
              dataKey="percentage"
              fill="#D99002"
              name="% of segments"
            >
              {!isMobile && (
                <LabelList
                  dataKey="percentageLabel"
                  position="right"
                  fontWeight={800}
                  fill="#b97c02ff"
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
