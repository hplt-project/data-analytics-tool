import { DataFormatter } from "@/lib/helpers";
import styles from "@/styles/SegmentDistribution.module.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipOverlap}>
        <p className={styles.labelOverlap}>{label}</p>

        <p>
          {" "}
          Unique segment frequency:{" "}
          {Intl.NumberFormat("en", {
            notation: "compact",
          }).format(payload[0].value)}
        </p>
        <p>
          {" "}
          Duplicate segment frequency:{" "}
          {Intl.NumberFormat("en", {
            notation: "compact",
          }).format(payload[1].value)}
        </p>
      </div>
    );
  }
};

export default function SegmentDistribution({ data, which, fontSize }) {

  const filteredData = data.filter((item) => item.token < 50);

  const filteredDataTotal = data.reduce((a, b) => b.token <= 50 ? +a + +b.freq : +a, 0);

  const filteredDataTotalDupes = data.reduce((a, b) => b.token <= 50 ? +a + +b.duplicates : +a, 0);

  const filteredDataTotalFormatted = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(filteredDataTotal);

  const filteredDataTotalDupesFormatted = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(filteredDataTotalDupes);

  const finalBar = data.reduce((a, b) => b.token > 50 ? +a + +b.freq : "");

  const finalBarDupes = data.reduce((a, b) => b.token >= 50 ? +a + +b.duplicates : "");

  const fiftyPlusFormatted = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(finalBar);

  const fiftyPlusDupesFormatted = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(finalBarDupes);

  const numbers = Array.from(Array(50).fill(0), (_, index) => index);

  return (
    <div className={styles.segmentDistributionContainer}>
      <div className={styles.segmentTitle}>
        <p>
          <strong> {"≤ 49"} </strong> tokens ={" "}
          <strong>{filteredDataTotalFormatted}</strong> segments |{" "}
          <strong>{filteredDataTotalDupesFormatted}</strong> duplicates
        </p>
        <p>
          <strong> {"> 50"} </strong> tokens ={" "}
          <strong>{fiftyPlusFormatted}</strong> segments |{" "}
          <strong>{fiftyPlusDupesFormatted}</strong> duplicates
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={filteredData}
          margin={{
            top: 30,
            right: 0,
            left: 10,
            bottom: 55,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="token"
            fontSize={fontSize}
            tickMargin={5}
            type="number"
            domain={[0, 50]}
            ticks={numbers}
            label={{
              value: "Number of tokens in the segment",
              angle: 0,
              position: "bottom",
              offset: 0,
              fontSize: fontSize,
            }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            tickFormatter={DataFormatter}
            fontSize={fontSize}
            label={{
              value: "Segments",
              angle: 0,
              position: "top",
              offset: 12,
              fontSize: fontSize,
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ outline: "none" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
          />
          <Bar
            dataKey="freqUnique"
            stackId="a"
            fill="#82ca9d"
            name="Unique segments"
          />
          <Bar
            dataKey="duplicates"
            stackId="a"
            fill="#0099DB"
            name="Duplicated segments"
            margin={{
              top: 0,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          ></Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
