import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { supabase, type SurveyRow } from "@/lib/supabase";

const ACCENT = "#8A3BDB";

const YEAR_ORDER = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year or More",
];

interface HobbyEntry {
  name: string;
  count: number;
}

interface YearEntry {
  name: string;
  count: number;
}

interface StateEntry {
  state: string;
  count: number;
  pct: string;
}

function aggregateData(rows: SurveyRow[]) {
  const total = rows.length;

  const yearMap: Record<string, number> = {};
  for (const yr of YEAR_ORDER) yearMap[yr] = 0;
  for (const row of rows) {
    if (row.year_in_college in yearMap) {
      yearMap[row.year_in_college] += 1;
    }
  }
  const yearData: YearEntry[] = YEAR_ORDER.map((name) => ({
    name,
    count: yearMap[name],
  }));

  const hobbyMap: Record<string, number> = {};
  for (const row of rows) {
    for (const hobby of row.hobbies) {
      let label: string;
      if (hobby === "Other" && row.other_hobby && row.other_hobby.trim()) {
        label = row.other_hobby.trim().toLowerCase();
      } else if (hobby === "Other") {
        continue;
      } else {
        label = hobby.toLowerCase();
      }
      hobbyMap[label] = (hobbyMap[label] || 0) + 1;
    }
  }
  const hobbyData: HobbyEntry[] = Object.entries(hobbyMap)
    .map(([label, count]) => ({
      name: label.charAt(0).toUpperCase() + label.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const stateMap: Record<string, number> = {};
  for (const row of rows) {
    stateMap[row.state] = (stateMap[row.state] || 0) + 1;
  }
  const stateData: StateEntry[] = Object.entries(stateMap)
    .map(([state, count]) => ({
      state,
      count,
      pct: total > 0 ? `${Math.round((count / total) * 100)}%` : "0%",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { total, yearData, hobbyData, stateData };
}

const StatePctLabel = (props: {
  x?: number;
  y?: number;
  width?: number;
  value?: string;
}) => {
  const { x = 0, y = 0, width = 0, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width + 6}
      y={y + 10}
      fill="#555"
      fontSize={12}
      fontWeight={500}
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
};

export default function Results() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [yearData, setYearData] = useState<YearEntry[]>([]);
  const [hobbyData, setHobbyData] = useState<HobbyEntry[]>([]);
  const [stateData, setStateData] = useState<StateEntry[]>([]);

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from("hobby_survey_results")
        .select("*");

      if (err) {
        setError(
          err.message?.includes("relation") || err.code === "42P01"
            ? "The database table does not exist yet. Please run the SQL setup script in your Supabase SQL Editor first."
            : `Failed to load results: ${err.message || "Please try again."}`
        );
        setLoading(false);
        return;
      }

      const rows = (data || []) as SurveyRow[];
      const agg = aggregateData(rows);
      setTotal(agg.total);
      setYearData(agg.yearData);
      setHobbyData(agg.hobbyData);
      setStateData(agg.stateData);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#1a1a1a]">Survey Results</h1>
        <Link href="/" className="text-sm font-medium text-[#8A3BDB] hover:underline focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-1 rounded">
          Home
        </Link>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="w-full max-w-2xl mx-auto space-y-12">
          {loading && (
            <div className="text-center py-20 text-gray-500" aria-live="polite" aria-busy="true">
              Loading results…
            </div>
          )}

          {error && !loading && (
            <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <section aria-labelledby="total-heading">
                <h2
                  id="total-heading"
                  className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2"
                >
                  Total Responses
                </h2>
                <div
                  className="text-7xl font-extrabold text-[#8A3BDB] leading-none"
                  aria-label={`${total} total responses`}
                >
                  {total}
                </div>
              </section>

              <section aria-labelledby="year-heading">
                <h2
                  id="year-heading"
                  className="text-base font-semibold text-[#1a1a1a] mb-4"
                >
                  Year in College
                </h2>
                {yearData.every((d) => d.count === 0) ? (
                  <p className="text-sm text-gray-500">No data yet.</p>
                ) : (
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={yearData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#555" }}
                          angle={-20}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#555" }}
                          allowDecimals={false}
                          width={30}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(138,59,219,0.06)" }}
                          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                          formatter={(value: number) => [value, "Responses"]}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {yearData.map((_, i) => (
                            <Cell key={i} fill={ACCENT} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section aria-labelledby="hobbies-heading">
                <h2
                  id="hobbies-heading"
                  className="text-base font-semibold text-[#1a1a1a] mb-4"
                >
                  Most Popular Hobbies
                </h2>
                {hobbyData.length === 0 ? (
                  <p className="text-sm text-gray-500">No data yet.</p>
                ) : (
                  <div
                    className="w-full"
                    style={{ height: Math.max(200, hobbyData.length * 44 + 40) }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={hobbyData}
                        layout="vertical"
                        margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12, fill: "#555" }}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 13, fill: "#1a1a1a" }}
                          width={90}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(138,59,219,0.06)" }}
                          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                          formatter={(value: number) => [value, "Responses"]}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} fill={ACCENT}>
                          <LabelList dataKey="count" position="right" style={{ fontSize: 12, fill: "#555" }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section aria-labelledby="states-heading">
                <h2
                  id="states-heading"
                  className="text-base font-semibold text-[#1a1a1a] mb-4"
                >
                  Top States Represented
                </h2>
                {stateData.length === 0 ? (
                  <p className="text-sm text-gray-500">No data yet.</p>
                ) : (
                  <div
                    className="w-full"
                    style={{ height: Math.max(200, stateData.length * 44 + 40) }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stateData}
                        layout="vertical"
                        margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12, fill: "#555" }}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="state"
                          tick={{ fontSize: 13, fill: "#1a1a1a" }}
                          width={120}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(138,59,219,0.06)" }}
                          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                          formatter={(value: number, _name, props) => [
                            `${value} (${props.payload.pct})`,
                            "Responses",
                          ]}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} fill={ACCENT}>
                          <LabelList dataKey="pct" content={<StatePctLabel />} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        Survey by Mike Colbert, BAIS:3300 - spring 2026.
      </footer>
    </div>
  );
}
