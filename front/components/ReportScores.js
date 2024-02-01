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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length && label) {
    return (
      <div className={styles.tooltipOverlap}>
        <p className={styles.labelOverlap}>{label}</p>
        {payload.map((item, idx) => {
          return (
            <>
              {" "}
              <p key={idx}>{`Frequency:   ${Intl.NumberFormat("en", {
                notation: "compact",
              }).format(item.value)}`}</p>
            </>
          );
        })}
      </div>
    );
  }
};

export default function ReportScores({ scores, xLabel, yLabel }) {
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

  const DataFormater = (number) => {
    if (number > 1000000000) {
      return (number / 1000000000).toString() + "B";
    } else if (number > 1000000) {
      return (number / 1000000).toString() + "M";
    } else if (number > 1000) {
      return (number / 1000).toString() + "K";
    } else {
      return number.toString();
    }
  };

  return (
    <div className={styles.reportScoresContainer}>
      <ResponsiveContainer width="95%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={processedScores}
          margin={{
            top: 5,
            right: 0,
            left: 3,
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="2 1" />
          <XAxis dataKey="token" fontSize={14} tickMargin={5}>
            {" "}
            <Label value={xLabel} offset={10} position="bottom" fontSize={16} />
          </XAxis>
          <YAxis
            fontSize={14}
            label={{
              value: `${yLabel}`,
              angle: -90,
              position: "insideLeft",
              offset: 5,
              fontSize: 16,
            }}
            tickFormatter={DataFormater}
          />
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ outline: "none" }}
          />
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="freq">
            {" "}
            <LabelList
              dataKey="freqFormatted"
              position="top"
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
