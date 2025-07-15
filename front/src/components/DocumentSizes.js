import styles from "@/styles/DocumentSizes.module.css";
import { Info } from "lucide-react";
import { Tooltip as InfoTooltip } from "react-tooltip";

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

import { DataFormatter } from "@/lib/helpers";

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

function NewDocumentSizes({ documentSizesObj }) {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  const footNote = false;

  const {
    segments,
    totalDocuments,
    remainingSum,
    percentageOfTotal,
    remainingPercentage,
  } = documentSizesObj;

  return (
    <>
      {segments && (
        <div className={styles.docsSizesContainer}>
          <div className={styles.title}>
            <h3>Documents size (in segments) </h3>
            <a className="segments-info-graph">
              {!footNote && (
                <Info
                  className={[styles.helpCircle, styles.desktopData].join(
                    " "
                  )}
                  strokeWidth={2}
                  color="#022831"
                  width={18}
                />
              )}
            </a>
            <InfoTooltip anchorSelect=".segments-info-graph" place="top">
              Segments correspond to paragraph and list boundaries as
              defined by HTML elements{" "}
              <code>
                ({"<"}p{">"}, {"<"}ul{">"}, {"<"}ol{">"}, etc.)
              </code>{" "}
              replaced by newlines.
            </InfoTooltip>
          </div>
          <div className={styles.documentSizes}>
            {percentageOfTotal && remainingSum >= 0 && (
              <div className={styles.reportTitleDocsSizes}>
                <p>
                  <strong>{"≤"} 25</strong> segments{" "}
                  <strong>{+percentageOfTotal.toFixed(2)}%</strong> (
                  {Intl.NumberFormat("en", {
                    notation: "compact",
                  }).format(totalDocuments)}{" "}
                  documents)
                </p>
                <p>
                  <strong>{">"} 25</strong> segments{" "}
                  <strong>{+remainingPercentage.toFixed(2)}%</strong> (
                  {Intl.NumberFormat("en", {
                    notation: "compact",
                  }).format(remainingSum)}{" "}
                  documents)
                </p>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={segments}
                margin={{
                  top: 32,
                  right: 20,
                  left: 10,
                  bottom: 25,
                }}
              >
                <CartesianGrid strokeDasharray="2 1" />
                <XAxis
                  dataKey={(val) => val[0]}
                  type="number"
                  fontSize={12}
                  tickMargin={5}
                  domain={[0, 25]}
                  ticks={numbers}
                >
                  {" "}
                  <Label
                    value="Segments"
                    offset={10}
                    position="bottom"
                    fontSize={16}
                  />
                </XAxis>
                <YAxis
                  fontSize={14}
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
                  content={<CustomTooltip measurement="Documents" />}
                  wrapperStyle={{ outline: "none" }}
                />
                <ReferenceLine y={0} stroke="#000" />
                <Bar
                  dataKey={(val) => val[1]}
                  fill="#38686a"
                  maxBarSize={30}
                >
                  {" "}
                  <LabelList
                    dataKey={(val) =>
                      Intl.NumberFormat("en", {
                        notation: "compact",
                      }).format(val[1])
                    }
                    position="top"
                    fontWeight={600}
                    fontSize={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}

export default NewDocumentSizes;
