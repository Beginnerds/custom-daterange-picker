import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import DatePicker from "./components/DatePicker";

function App() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  return (
    <>
      <main className="h-screen w-screen bg-slate-600 flex flex-col justify-center items-center">
        <DatePicker
          onChange={(range, weekends) => {
            console.log(range, weekends);
          }}
          predefinedRanges={[
            {
              text: "Last 7 days",
              // convert dates to iso string before passing it down the props, because not everything is validated
              dateStart: oneWeekAgo.toISOString(),
              dateEnd: new Date().toISOString(),
            },
            {
              text: "Last 30 days",
              dateStart: oneMonthAgo.toISOString(),
              dateEnd: new Date().toISOString(),
            },
          ]}
        />
      </main>
    </>
  );
}

export default App;
