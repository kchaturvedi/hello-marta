import { useState, useEffect } from "react";
import _ from "lodash";
import { Flipper, Flipped } from "react-flip-toolkit";

import schedule from "./data";

const directionsMap = {
  E: "East",
  W: "West",
  N: "North",
  S: "South"
};

export default function App() {
  const fetchAndProcess = async () => {
    const response = await fetch(
      "http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals"
    );
    const data = await response.json();
    const rawRoutes = data
      .map((r) => {
        r.color = _.lowerCase(r.LINE === "GOLD" ? "amber" : r.LINE);
        r.LINE = _.startCase(_.capitalize(r.LINE));
        r.STATION = _.startCase(_.capitalize(r.STATION));
        r.DESTINATION = _.startCase(_.capitalize(r.DESTINATION));
        r.DIRECTION = directionsMap[r.DIRECTION];
        r.WAITING_SECONDS = parseInt(r.WAITING_SECONDS, 10);
        r.key = r.WAITING_SECONDS + r.TRAIN_ID;
        return r;
      })
      .sort((a, b) => (a.WAITING_SECONDS < b.WAITING_SECONDS ? -1 : 1));
    setAllRoutes(rawRoutes);
  };

  const [allRoutes, setAllRoutes] = useState([]);
  const allStations = [...new Set(allRoutes.map((s) => s.STATION))];
  const allLines = [...new Set(allRoutes.map((s) => s.LINE))];
  const allDestinations = [...new Set(allRoutes.map((s) => s.DESTINATION))];

  const [selectedStation, setStation] = useState("");
  const [selectedLine, setLine] = useState("");
  const [selectedDestination, setDestination] = useState("");

  const [routes, setRoutes] = useState(allRoutes);

  useEffect(() => {
    fetchAndProcess();
  }, []);

  useEffect(() => {
    setRoutes(
      allRoutes
        .filter((r) => selectedStation === "" || r.STATION === selectedStation)
        .filter((r) => selectedLine === "" || r.LINE === selectedLine)
        .filter(
          (r) =>
            selectedDestination === "" || r.DESTINATION === selectedDestination
        )
    );
  }, [allRoutes, selectedStation, selectedLine, selectedDestination]);

  return (
    <div className="m-8 max-w-4xl mx-auto justify-center">
      <h1 className="text-3xl mb-8 text-center">Hello Marta</h1>
      <form className="flex mx-auto justify-center gap-4 text-xl">
        <select
          className="w-1/3"
          name="station"
          id="station"
          onChange={(e) => setStation(e.target.value)}
        >
          <option value="">All Stations</option>
          {allStations.map((s) => (
            <option key={s.key} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="station"
          id="station"
          onChange={(e) => setLine(e.target.value)}
        >
          <option value="">All Lines</option>
          {allLines.map((s) => (
            <option key={s.key} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="station"
          id="station"
          onChange={(e) => setDestination(e.target.value)}
        >
          <option value="">All Destinations</option>
          {allDestinations.map((s) => (
            <option key={s.key} value={s}>
              {s}
            </option>
          ))}
        </select>
      </form>
      <Flipper flipKey={routes.map((r) => r.key)}>
        <div className="flex flex-col max-w-xl mx-auto gap-4 py-8 w-full justify-center">
          {routes.map((r) => (
            <Flipped key={r.key} flipId={r.key}>
              <div
                className={`flex bg-white justify-between border border-t-4 border-t-${r.color}-400 p-4 rounded-lg`}
              >
                <div className="flex flex-col">
                  <span className="text-gray-500">{r.LINE} Line</span>
                  <span className="text-lg font-semibold">
                    Arriving at {r.STATION}
                  </span>
                  <span>Final Stop: {r.DESTINATION}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-gray-500">
                    {r.WAITING_TIME !== "Arriving" && "Arriving in "}
                    {r.WAITING_TIME}
                  </span>
                  <span className="text-lg font-semibold">
                    ETA {r.NEXT_ARR}
                  </span>
                  <span>Going {r.DIRECTION}</span>
                </div>
              </div>
            </Flipped>
          ))}
        </div>
      </Flipper>
    </div>
  );
}
