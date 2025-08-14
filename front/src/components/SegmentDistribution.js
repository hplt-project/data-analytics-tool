import { DataFormatter, numberFormatter } from "@/lib/helpers";
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

const CustomTooltip = ({ active, payload, label, total }) => {
  if (active && payload && payload.length) {
    const barTotal = payload[1].value + payload[0].value;
    const freq = payload[0].value;
    const dupFreq = payload[1].value;
    return (
      <div className={styles.tooltipOverlap}>
        <p className={styles.labelOverlap}>{label} Tokens</p>
        <p>
          Total:{" "}
          {numberFormatter(payload[1].value + payload[0].value)} <span style={{ fontWeight: 600 }}>({((barTotal / total) * 100).toFixed(2)}%)</span>
        </p>
        <p>

          {numberFormatter(dupFreq)} duplicate segments <span style={{ fontWeight: 600 }}>({((dupFreq / barTotal) * 100).toFixed(2)}%)</span>
        </p>
        <p>

          {numberFormatter(freq)} unique segments <span style={{ fontWeight: 600 }}>({((freq / barTotal) * 100).toFixed(2)}%)</span>
        </p>

      </div>
    );
  }
};

export default function SegmentDistribution({ data, which, fontSize }) {

  const filteredData = data.filter((item) => item.token < 50);

  const {
    filteredDataTotal,
    filteredDataTotalDupes,
    finalBar,
    finalBarDupes,
    totalFreq,
    totalDupes
  } = data.reduce(
    (acc, item) => {
      const freq = +item.freq || 0;
      const dupes = +item.duplicates || 0;
      const token = +item.token;

      acc.totalFreq += freq;
      acc.totalDupes += dupes;

      if (token <= 50) {
        acc.filteredDataTotal += freq;
        acc.filteredDataTotalDupes += dupes;
      }

      if (token > 50) {
        acc.finalBar += freq;
      }

      if (token >= 50) {
        acc.finalBarDupes += dupes;
      }

      return acc;
    },
    {
      filteredDataTotal: 0,
      filteredDataTotalDupes: 0,
      finalBar: 0,
      finalBarDupes: 0,
      totalFreq: 0,
      totalDupes: 0
    }
  );

  const total = totalDupes + totalFreq;

  const filteredDataTotalFormatted = numberFormatter(filteredDataTotal);
  const filteredDataTotalDupesFormatted = numberFormatter(filteredDataTotalDupes);
  const fiftyPlusFormatted = numberFormatter(finalBar);
  const fiftyPlusDupesFormatted = numberFormatter(finalBarDupes);

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
            top: 25,
            right: 0,
            left: 10,
            bottom: 5,
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
            content={<CustomTooltip total={total} />}
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
