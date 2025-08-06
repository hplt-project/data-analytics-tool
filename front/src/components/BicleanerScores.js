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
import { numberFormatter, DataFormatter } from "@/lib/helpers";
import { Tooltip as InfoTooltip } from "react-tooltip";
import InfoCircle from "./InfoCircle";

import styles from "@/styles/BicleanerScores.module.css";

const CustomTooltip = ({ active, payload, label, measurement, total }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.label}>Score {label}</p>
        {payload.map((item, idx) => {
          return (
            <>
              <p key={idx} className={styles.desc} style={{ color: item.fill }}>
                {`${numberFormatter(item.value)} ${measurement.toLowerCase()}`}{" "}
                <span style={{ fontWeight: 600 }}>{`(${(
                  (item.value / total) *
                  100
                ).toFixed(2)}%)`}</span>
              </p>
            </>
          );
        })}
      </div>
    );
  }
};

export default function BicleanerScores({ scores, footNote }) {
  const processedScores = scores.reduce(
    (acc, item) => {
      const processedItem = {
        token: item[0],
        freq: item[1],
        freqFormatted: numberFormatter(item[1]),
        fill: "#8864FC",
      };

      if (parseFloat(item[0]) < 0.5) {
        acc.underFive += item[1];
      }
      if (parseFloat(item[0]) >= 0.5) {
        acc.overEqualFive += item[1];
      }
      if (parseFloat(item[0]) >= 0.8) {
        acc.overEqualEight += item[1];
      }

      acc.processedItems.push(processedItem);
      acc.totalValue += item[1];

      return acc;
    },
    {
      totalValue: 0,
      processedItems: [],
      underFive: 0,
      overEqualFive: 0,
      overEqualEight: 0,
    }
  );
  const {
    totalValue,
    processedItems,
    underFive,
    overEqualEight,
    overEqualFive,
  } = processedScores;

  const percUnderFive = (underFive * 100) / totalValue;
  const percOverEqualFive = (overEqualFive * 100) / totalValue;
  const percOverEqualEight = (overEqualEight * 100) / totalValue;

  const numbers = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h3>
          Translation likelihood{" "}
          <a className="bicleaner-info-second" style={{ marginLeft: "3px" }}>{!footNote && <InfoCircle />}</a>
          <InfoTooltip
            anchorSelect=".bicleaner-info-second"
            place="top"
            clickable
            style={{ fontWeight: 400, backgroundColor: "rgba(17, 21, 24, 1)", zIndex: 10000 }}
          >
            <p style={{
              fontSize: "14px", fontWeight: 400
            }}>Scores computed by Bicleaner-AI: (
              <a href="https://github.com/bitextor/bicleaner-ai" target="_blank" style={{ color: "#24aaf7;" }}>
                https://github.com/bitextor/bicleaner-ai
              </a>
              )</p>
          </InfoTooltip>
        </h3>
        <div className={styles.numbers}>
          <p>
            {"<"} 5 = {numberFormatter(underFive)} segments |{" "}
            <strong>{percUnderFive.toFixed(1)}%</strong>
          </p>
          <p>
            {"≥"} 5 = {numberFormatter(overEqualFive)} segments |{" "}
            <strong>{percOverEqualFive.toFixed(1)}%</strong>
          </p>
          <p>
            {"≥"} 8 = {numberFormatter(overEqualEight)} segments |{" "}
            <strong>{percOverEqualEight.toFixed(1)}%</strong>
          </p>{" "}

        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          height={300}
          data={processedItems}
          margin={{
            top: 25,
            right: 0,
            left: 5,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="2 1" />
          <XAxis
            dataKey="token"
            fontSize={14}
            tickMargin={5}
            type="number"
            allowDecimals
            ticks={numbers}
            padding={{ left: 50, right: 50 }}
          >
            <Label value="Scores" offset={10} position="bottom" fontSize={16} />
          </XAxis>
          <YAxis
            fontSize={14}
            label={{
              value: "Segments",
              angle: 0,
              position: "top",
              offset: 12,
              fontSize: 14,
            }}
            tickFormatter={DataFormatter}
          />
          <Tooltip
            content={
              <CustomTooltip measurement={"Segments"} total={totalValue} />
            }
            wrapperStyle={{ outline: "none" }}
          />
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="freq" maxBarSize={100}>
            <LabelList
              dataKey="freqFormatted"
              position="top"
              fontWeight={600}
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div >
  );
}
