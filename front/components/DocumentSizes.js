import styles from "../src/styles/ReportScores.module.css";

import {
  BarChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  LabelList,
  ResponsiveContainer,
} from "recharts";

import { DataFormatter } from "../hooks/hooks";

const CustomTooltip = ({ active, payload, label, measurement }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipOverlap}>
        <p className={styles.labelOverlap}>{label}</p>
        {payload.map((item, idx) => {
          return (
            <>
              {" "}
              <p key={idx}>{`${measurement}:   ${Intl.NumberFormat("en", {
                notation: "compact",
              }).format(item.value)}`}</p>
            </>
          );
        })}
      </div>
    );
  }
};

export default function DocumentSizes({
  scores,
  xLabel,
  yLabel,
  graph,
  partOfTotal,
  totalDocs,
  restPerc,
  restDocs,
}) {
  const processedScores = scores.map((item) => {
    return {
      token: item.token,
      freq: item.freq,
      freqFormatted: Intl.NumberFormat("en", {
        notation: "compact",
      }).format(item.freq),
      fill: item.fill,
    };
  });

  return (
    <div className={styles.reportScoresContainer}>
      {partOfTotal && restDocs && (
        <div className={styles.reportTitle}>
          <p>
            <strong>{"<="} 25</strong> segments{" "}
            <strong>{+partOfTotal.toFixed(2)}%</strong> (
            {Intl.NumberFormat("en", {
              notation: "compact",
            }).format(totalDocs)}{" "}
            documents)
          </p>
          <p>
            <strong>{">"} 25</strong> segments{" "}
            <strong>{+restPerc.toFixed(2)}%</strong> (
            {Intl.NumberFormat("en", {
              notation: "compact",
            }).format(restDocs)}{" "}
            documents)
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={processedScores}
          margin={{
            top: 20,
            right: 0,
            left: 20,
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="2 1" />
          <XAxis
            dataKey="token"
            fontSize={graph === "docsCollections" ? 12 : 14}
            tickMargin={5}
          >
            {" "}
            <Label value={xLabel} offset={10} position="bottom" fontSize={16} />
          </XAxis>
          <YAxis
            fontSize={14}
            label={{
              value: `${yLabel}`,
              angle: -90,
              position: "insideLeft",
              offset: -8,
              fontSize: 16,
            }}
            tickFormatter={DataFormatter}
          />
          <Tooltip
            content={<CustomTooltip measurement={yLabel} />}
            wrapperStyle={{ outline: "none" }}
          />
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="freq">
            {" "}
            <LabelList
              dataKey="freqFormatted"
              position="top"
              fontWeight={600}
              fontSize={graph === "docsCollections" ? 10 : 16}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
