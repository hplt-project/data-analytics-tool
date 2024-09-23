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
import { numberFormatter } from "../hooks/hooks";
import { DataFormatter } from "../hooks/hooks";

import styles from "../src/styles/ReportScores.module.css";

const CustomTooltip = ({ active, payload, label, measurement }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.label}>{label}</p>
        {payload.map((item, idx) => {
          return (
            <>
              <p
                key={idx}
                className={styles.desc}
                style={{ color: item.fill }}
              >{`${measurement}:   ${numberFormatter(item.value)}`}</p>
              {item.payload.perc && (
                <p
                  key={idx}
                  className={styles.perc}
                  style={{ color: item.fill }}
                >{`% of total:   ${item.payload.perc} %`}</p>
              )}
            </>
          );
        })}
      </div>
    );
  }
};

export default function ReportScores({
  scores,
  xLabel,
  yLabel,
  graph,
  firstHalf,
  secondHalf,
  firstHalfPerc,
  secondHalfPerc,
  padding,
  labellist,
  fontSize,
}) {
  const processedScores = scores.map((item) => {
    return {
      token: item.token,
      freq: item.freq,
      perc: item.perc ? item.perc : "",
      freqFormatted: Intl.NumberFormat("en", {
        notation: "compact",
      }).format(item.freq),
      fill: item.fill,
    };
  });
  const numbers = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

  const docScoresNums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className={styles.reportScoresContainer}>
      {firstHalf && secondHalf && (
        <div className={styles.reportTitle}>
          <p>
            score {"<"} 5 - <strong>{+firstHalfPerc.toFixed(2)}%</strong> (
            {Intl.NumberFormat("en", {
              notation: "compact",
            }).format(firstHalf)}{" "}
            documents)
          </p>
          <p>
            score {">="} 5 - <strong>{+secondHalfPerc.toFixed(2)}%</strong> (
            {Intl.NumberFormat("en", {
              notation: "compact",
            }).format(secondHalf)}{" "}
            documents)
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          height={300}
          data={processedScores}
          margin={{
            top: 32,
            right: 20,
            left: 10,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="2 1" />
          <XAxis
            dataKey="token"
            fontSize={graph === "docsCollections" ? 12 : 14}
            tickMargin={5}
            type="number"
            allowDecimals
            domain={graph === "docscores" ? [0, 10] : "  "}
            ticks={graph === "docscores" ? docScoresNums : numbers}
            padding={
              graph === "docscores"
                ? { left: 15, right: 5 }
                : { left: padding, right: padding }
            }
          >
            <Label value={xLabel} offset={10} position="bottom" fontSize={16} />
          </XAxis>

          <YAxis
            fontSize={fontSize}
            label={{
              value: `${yLabel}`,
              angle: 0,
              position: "top",
              offset: 12,
              fontSize: 14,
            }}
            tickFormatter={DataFormatter}
          />
          <Tooltip
            content={<CustomTooltip measurement={yLabel} />}
            wrapperStyle={{ outline: "none" }}
          />
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="freq" maxBarSize={graph === "docscores" ? 20 : 100}>
            {" "}
            {graph !== "docscores" && labellist && (
              <LabelList
                dataKey="freqFormatted"
                position="top"
                fontWeight={600}
                fontSize={graph === "docsCollections" ? 10 : fontSize}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
