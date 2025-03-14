import styles from "@/styles/ReportScores.module.css";

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

import { DataFormatter } from "../../hooks/hooks";

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
              >{`${measurement}:   ${Intl.NumberFormat("en", {
                notation: "compact",
              }).format(item.value)}`}</p>
              {payload[0].payload.perc && (
                <p
                  className={styles.perc}
                >{`% of total:   ${payload[0].payload.perc} %`}</p>
              )}
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
  partOfTotal,
  totalDocs,
  restPerc,
  restDocs,
}) {
  const processedScores = scores.map((item) => {
    return {
      token: item.token,
      freq: item.freq,
      perc: item.perc,
      freqFormatted: Intl.NumberFormat("en", {
        notation: "compact",
      }).format(item.freq),
      fill: item.fill,
    };
  });

  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);

  return (
    <div className={styles.reportScoresContainer}>
      {partOfTotal && restDocs >= 0 && (
        <div className={styles.reportTitleDocsSizes}>
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
            top: 32,
            right: 20,
            left: 10,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="2 1" />
          <XAxis
            dataKey="token"
            type="number"
            fontSize={12}
            tickMargin={5}
            domain={[0, 25]}
            ticks={numbers}
          >
            {" "}
            <Label value={xLabel} offset={10} position="bottom" fontSize={16} />
          </XAxis>
          <YAxis
            fontSize={14}
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
          <Bar dataKey="freq" maxBarSize={30}>
            {" "}
            <LabelList
              dataKey="freqFormatted"
              position="top"
              fontWeight={600}
              fontSize={10}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
