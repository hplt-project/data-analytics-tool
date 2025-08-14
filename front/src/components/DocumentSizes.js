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

import { DataFormatter, numberFormatter } from "@/lib/helpers";

const CustomTooltip = ({ active, payload, label, total }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.label}>{label} Segments</p>
        {payload.map((item, idx) => {
          return (
            <>
              <p
                key={idx}
                className={styles.desc}
              >{`${numberFormatter(item.value)} documents`} <span style={{ fontWeight: 600 }}>{`(${((item.value / total) * 100).toFixed(2)}%)`}</span></p>

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
    total
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
            <InfoTooltip anchorSelect=".segments-info-graph" place="top" style={{ fontWeight: 400, backgroundColor: "rgba(17, 21, 24, 1)", zIndex: 10000 }}>
              <p style={{ fontSize: "14px" }}> Segments correspond to paragraph and list boundaries as
                defined by HTML elements{" "}
                <code>
                  ({"<"}p{">"}, {"<"}ul{">"}, {"<"}ol{">"}, etc.)
                </code>{" "}
                replaced by newlines.</p>
            </InfoTooltip>
          </div>
          <div className={styles.documentSizes}>
            {percentageOfTotal && remainingSum >= 0 && (
              <div className={styles.reportTitleDocsSizes}>
                <p>
                  <strong>{"≤"} 25</strong> segments{" "}
                  <strong>{+percentageOfTotal.toFixed(2)}%</strong> (
                  {numberFormatter(totalDocuments)}{" "}
                  documents)
                </p>
                <p>
                  <strong>{">"} 25</strong> segments{" "}
                  <strong>{+remainingPercentage.toFixed(2)}%</strong> (
                  {numberFormatter(remainingSum)}{" "}
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
                  padding={{ left: 10, right: 15 }}
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
                  content={<CustomTooltip measurement="Documents" total={total} />}
                  wrapperStyle={{ outline: "none" }}
                />
                <ReferenceLine y={0} stroke="#000" />
                <Bar
                  dataKey={(val) => val[1]}
                  fill="#38686aff"
                  maxBarSize={30}
                >
                  {" "}
                  <LabelList
                    dataKey={(val) =>
                      numberFormatter(val[1])
                    }
                    fill="#244446ff"
                    position="top"
                    fontWeight={800}
                    fontSize={11}
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
