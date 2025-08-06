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
import InfoCircle from "./InfoCircle";
import { Tooltip as InfoTooltip } from "react-tooltip";

import styles from "@/styles/NoiseDistributionGraph.module.css";

const CustomTooltip = ({ active, payload, label, total }) => {
  if (active && payload && payload.length) {

    const freq = payload[0].payload[1];

    const tag = payload[0].payload[0];

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
  const numbers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <div className="custom-chart">
      <div className={styles.title}>
        <h3 className={styles.noiseDistributionTitle} style={{ marginRight: "3px" }}>
          Segment {trglang && "pair"} noise distribution
        </h3>
        <a className="noise-info">{!footNote && <InfoCircle />}</a>
        <InfoTooltip anchorSelect=".noise-info" place="top" clickable style={{ fontWeight: 400, backgroundColor: "rgba(17, 21, 24, 1)", zIndex: 10000 }}>
          <p style={{ fontSize: "14px" }}> Obtained with Bicleaner Hardrules (
            <a
              className={styles.tooltipLink}
              href="https://github.com/bitextor/bicleaner-hardrules/"
              target="_blank"
            >
              https://github.com/bitextor/bicleaner-hardrules/
            </a>
            )</p>
        </InfoTooltip>
      </div>
      <div className={styles.container}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            width={300}
            height={200}
            data={noiseData}
            margin={{
              top: 0,
              right: 10,
              left: 35,
              bottom: 15,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={percFormatter}
              ticks={numbers}
              fontSize={12}
            />
            <YAxis
              dataKey={(el) => {
                const value = el[0];
                return correctNoiseTag(value);
              }}
              type="category"
              fontSize={14}
              tickFormatter={(value) =>
                value.toLocaleString().replace(/ /g, "\u00A0")
              }
            />
            <Tooltip content={<CustomTooltip total={sentences} />} />
            <Legend />
            <Bar
              dataKey={(val) =>
                +parseFloat((val[1] * 100) / sentences).toFixed(2)
              }
              fill="#D99002"
              name="% of corpus"
            >
              <LabelList
                dataKey={(val) =>
                  `${((val[1] * 100) / sentences).toFixed(2)}%`
                }
                position="right"
                fontWeight={800}
                fill="#b97c02ff"

              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
