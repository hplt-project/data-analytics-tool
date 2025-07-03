import {
  BarChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  ResponsiveContainer,
} from "recharts";
import { numberFormatter, DataFormatter } from "@/lib/helpers";
import { Info } from "lucide-react";
import { Tooltip as InfoTooltip } from "react-tooltip";

import styles from "@/styles/ReportScores.module.css";

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

export default function DocumentScores({ scores, footNote }) {
  const processedScores = scores.reduce(
    (acc, item) => {
      const processedItem = {
        token: item[0],
        freq: item[1],
        freqFormatted: numberFormatter(item.freq),
        fill: "#E9C46A",
      };

      if (parseFloat(item[0]) < 5) {
        acc.underFive += item[1];
      }
      if (parseFloat(item[0]) >= 5) {
        acc.overFive += item[1];
      }

      acc.processedItems.push(processedItem);
      acc.totalValue += item[1];

      return acc;
    },
    {
      totalValue: 0,
      processedItems: [],
      underFive: 0,
      overFive: 0,
    }
  );
  const { totalValue, processedItems, underFive, overFive } = processedScores;

  const percUnderFive = (underFive * 100) / totalValue;

  const percOverFive = (overFive * 100) / totalValue;

  const docScoresNums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="custom-chart">
      <div className={styles.title}>
        <h3>Distribution of documents by document score</h3>
        <a className="doc-scores-distribution-info">
          {!footNote && (
            <Info
              className={[styles.helpCircle, styles.desktopData].join(" ")}
              strokeWidth={2}
              color="#022831"
              width={18}
            />
          )}
        </a>
        <InfoTooltip
          anchorSelect=".doc-scores-distribution-info"
          place="top"
          clickable
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>
              Obtained with Web Docs Scorer (
              <a
                className={styles.tooltipLink}
                href="https://github.com/pablop16n/web-docs-scorer/"
                target="_blank"
              >
                https://github.com/pablop16n/web-docs-scorer/
              </a>
              )
            </span>
          </div>
        </InfoTooltip>
      </div>
      <div className={styles.documentScoresContainer}>
        {percUnderFive >= 0 && percOverFive >= 0 && (
          <div className={styles.reportTitle}>
            <p>
              score {"<"} 5 - <strong>{+percUnderFive.toFixed(2)}%</strong> (
              {numberFormatter(underFive)} documents)
            </p>
            <p>
              score {">="} 5 - <strong>{+percOverFive.toFixed(2)}%</strong> (
              {numberFormatter(overFive)} documents)
            </p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            height={300}
            data={processedItems}
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
              fontSize={12}
              tickMargin={5}
              type="number"
              allowDecimals
              domain={[0, 10]}
              ticks={docScoresNums}
            >
              <Label
                value="Scores"
                offset={10}
                position="bottom"
                fontSize={16}
              />
            </XAxis>

            <YAxis
              fontSize={12}
              label={{
                value: "Documents",
                angle: 0,
                position: "top",
                offset: 12,
                fontSize: 14,
              }}
              tickFormatter={DataFormatter}
            />
            <Tooltip
              content={<CustomTooltip measurement={"Documents"} />}
              wrapperStyle={{ outline: "none" }}
            />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="freq" maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
