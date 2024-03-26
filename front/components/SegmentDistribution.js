import { DataFormatter } from "../hooks/hooks";
import styles from "./../src/styles/SegmentDistribution.module.css";

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
  Label,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length && label) {
    return (
      <div className={styles.tooltipOverlap}>
        <p className={styles.labelOverlap}>{label}</p>

        <p>
          {" "}
          Unique sentence frequency:{" "}
          {Intl.NumberFormat("en", {
            notation: "compact",
          }).format(payload[0].value)}
        </p>
        <p>
          {" "}
          Duplicate sentence frequency:{" "}
          {Intl.NumberFormat("en", {
            notation: "compact",
          }).format(payload[1].value)}
        </p>
      </div>
    );
  }
};

export default function SegmentDistribution({ data, which }) {
  data.forEach((item) => {
    (item.freqFormatted = Intl.NumberFormat("en", {
      notation: "compact",
    }).format(item.freqFormatted)),
      (item.duplicatesFormatted = Intl.NumberFormat("en", {
        notation: "compact",
      }).format(item.duplicates));
  });

  const filteredData = data.filter((item) => item.token < 50);

  const finalBar = data.reduce((a, b) => (b.token >= 50 ? +a + +b.freq : ""));

  const finalBarDupes = data.reduce((a, b) =>
    b.token >= 50 ? +a + +b.duplicates : ""
  );

  const fiftyPlusFormatted = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(finalBar);

  const fiftyPlusDupesFormatted = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(finalBarDupes);

  return (
    <div
      className={[styles.segmentDistributionContainer, " custom-chart"].join(
        ""
      )}
    >
      <div className={styles.segmentTitle}>
        <p>
          <strong> {">"} 50</strong> | <strong>{fiftyPlusFormatted}</strong>{" "}
          segments <strong>{fiftyPlusDupesFormatted} </strong>duplicates.
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={340}
          data={filteredData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 55,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="token" fontSize={12} tickMargin={5}></XAxis>
          <YAxis
            tickFormatter={DataFormatter}
            label={{
              value: "Segments",
              angle: -90,
              position: "insideLeft",
              offset: -8,
              fontSize: 16,
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ outline: "none" }}
          />
          <Legend />
          <Bar
            dataKey="freqUnique"
            stackId="a"
            fill="#82ca9d"
            name="Unique sentence frequency"
          />
          <Bar
            dataKey="duplicates"
            stackId="a"
            fill="#0099DB"
            name="Duplicates"
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
