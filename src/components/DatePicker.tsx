import React, { useEffect, useRef, useState } from "react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAME = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type RenderedDate = {
  isWeekend: boolean;
  date: Date;
  dayText: string;
  isSelected: boolean;
  inBetweenSelectedDates: boolean;
};

const YEAR_LIST: {
  [key: number | string]: number;
} = {};
const YEAR_LIST_ARR = new Array(10000).fill(undefined);

YEAR_LIST_ARR.forEach((item, ind) => {
  YEAR_LIST[ind] = ind;
});

const DatePicker = ({
  onChange,
  predefinedRanges,
}: {
  onChange: (range: string[], weekends: string[]) => void;
  predefinedRanges?: {
    dateStart: string;
    dateEnd: string;
    text: string;
  }[];
}) => {
  // const [startDate, setStartDate] = useState(
  //   range ? new Date(range[0].date) : ""
  // );
  const [startDate, setStartDate] = useState<string | Date>("");
  // const [endDate, setEndDate] = useState(range ? new Date(range[1].date) : "");
  const [endDate, setEndDate] = useState<string | Date>("");

  // const [displayMonth, setDisplayMonth] = useState(
  //   range ? new Date(range[0].date).getMonth() : new Date().getMonth()
  // );
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
  // const [displayYear, setDisplayYear] = useState(
  //   range ? new Date(range[1].date).getFullYear() : new Date().getFullYear()
  // );
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showDisplayYearSelector, setShowDisplayYearSelector] = useState(false);

  const [datesToRender, setDatesToRender] = useState<RenderedDate[]>();

  const [shortcutButtons, setShortcutButton] = useState<
    {
      dateStart: string;
      dateEnd: string;
      text: string;
    }[]
  >();

  // validate and render predefined ranges
  useEffect(() => {
    if (predefinedRanges?.length) {
      const filtered = predefinedRanges.filter((item, ind) => {
        const areDatesValid =
          isValidDate(item.dateStart) && isValidDate(item.dateEnd);
        let isAnyDateAWeekend = false;
        let isStartDateEarlier = true;
        const textLengthValid = item.text.trim().length > 0;
        if (areDatesValid) {
          isAnyDateAWeekend =
            new Date(item.dateStart).getDay() == 0 ||
            new Date(item.dateStart).getDay() == 6 ||
            new Date(item.dateEnd).getDay() == 0 ||
            new Date(item.dateEnd).getDay() == 6;
          isStartDateEarlier =
            new Date(item.dateStart).getTime() <
            new Date(item.dateEnd).getTime();
        }

        return (
          areDatesValid &&
          !isAnyDateAWeekend &&
          isStartDateEarlier &&
          textLengthValid
        );
      });

      setShortcutButton(filtered);
    }
  }, []);

  // effect to display days for selected month/year combination
  useEffect(() => {
    const daysInSelectedDisplay = getDaysInMonth(displayMonth, displayYear);
    const dateObjArr: RenderedDate[] = [];

    daysInSelectedDisplay.forEach((item, ind) => {
      const isWeekend = item.getDay() == 0 || item.getDay() == 6;
      const date = item;
      const dayText = DAY_NAME[item.getDay()].slice(0, 3);

      const sd = new Date(startDate);
      sd.setHours(0, 0, 0, 0);
      const ed = new Date(endDate);
      ed.setHours(0, 0, 0, 0);

      const isSelected =
        item.getTime() == sd.getTime() || item.getTime() == ed.getTime();

      // const inBetweenSelectedDates = item > startDate && item < endDate;
      const inBetweenSelectedDates = item > sd && item < ed;

      dateObjArr.push({
        isWeekend,
        date,
        dayText,
        isSelected,
        inBetweenSelectedDates,
      });
    });

    setDatesToRender(dateObjArr);
  }, [displayYear, displayMonth, startDate, endDate]);

  // to call the onchange handler
  useEffect(() => {
    if (startDate && endDate) {
      const arrOfDateRange: string[] = [];

      const startYear = new Date(startDate).getFullYear();
      let startMonth: number | string = new Date(startDate).getMonth() + 1;
      let startDateToReturn: number | string = new Date(startDate).getDate();

      if (startMonth < 10) {
        startMonth = "0" + startMonth;
      }
      if (startDateToReturn < 10) {
        startDateToReturn = "0" + startDateToReturn;
      }

      const endYear = new Date(endDate).getFullYear();
      let endMonth: number | string = new Date(endDate).getMonth() + 1;
      let endDateToReturn: number | string = new Date(endDate).getDate();

      if (endMonth < 10) {
        endMonth = "0" + endMonth;
      }
      if (endDateToReturn < 10) {
        endDateToReturn = "0" + endDateToReturn;
      }

      arrOfDateRange.push(
        startYear + "-" + startMonth + "-" + startDateToReturn
      );
      arrOfDateRange.push(endYear + "-" + endMonth + "-" + endDateToReturn);

      onChange(arrOfDateRange, getWeekendsBetweenDates(startDate, endDate));
    }
  }, [startDate, endDate]);

  const getDaysInMonth = (month: number, year: number) => {
    let date = new Date(year, month, 1);
    let days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const selectDate = (item: RenderedDate) => {
    if (item.isWeekend) {
      return;
    }

    // if both are defined , then reset
    if (startDate && endDate) {
      setStartDate(item.date);
      setEndDate("");
    }

    // if no dates are selected mark this date as start date
    else if (!startDate && !endDate) {
      setStartDate(item.date);
    }

    // if start date is selected and this date is greater than it, set it to end date
    else if (startDate && item.date.getTime() > new Date(startDate).getTime()) {
      setEndDate(item.date);
    }

    // if start date is selected and this date is less than it, set it to start date and set old start date to end date
    else if (startDate && item.date.getTime() < new Date(startDate).getTime()) {
      setEndDate(startDate);
      setStartDate(item.date);
    }
  };

  const onDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;

    if (isValidDate(e.target.value.trim())) {
      const d = new Date(e.target.value.trim());
      d.setHours(0, 0, 0, 0);
      const isWeekend = d.getDay() == 0 || d.getDay() == 6;

      if (isWeekend) {
        return;
      }

      const month = d.getMonth();
      const year = d.getFullYear();

      setDisplayMonth(month);
      setDisplayYear(YEAR_LIST[year] || YEAR_LIST[2024]);

      if (input.dataset.dateinputType == "start") {
        setStartDate(d);
      } else {
        setEndDate(d);
      }
    }
  };

  const onClickShortcutButton = (item: {
    dateStart: string;
    dateEnd: string;
    text: string;
  }) => {
    setStartDate(item.dateStart);
    setEndDate(item.dateEnd);

    setDisplayYear(YEAR_LIST[new Date(item.dateEnd).getFullYear()]);
    setDisplayMonth(new Date(item.dateEnd).getMonth());
  };

  const isValidDate = (stringDate: string) => {
    return !isNaN(Date.parse(stringDate));
  };

  const getWeekendsBetweenDates = (
    start: string | Date,
    end: string | Date
  ) => {
    start = new Date(start);
    end = new Date(end);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const weekendDates: string[] = [];

    while (start.getTime() < end.getTime()) {
      const day = start.getDay();

      if (day == 0 || day == 6) {
        let month: number | string = start.getMonth() + 1;
        let date: number | string = start.getDate();

        if (month < 10) {
          month = "0" + month;
        }
        if (date < 10) {
          date = "0" + date;
        }

        weekendDates.push(start.getFullYear() + "-" + month + "-" + date);
      }

      start.setDate(start.getDate() + 1);
    }

    return weekendDates;
  };

  return (
    <div className="rounded-lg px-4 py-8 bg-gray-300  w-full max-w-[400px] min-h-[568px]">
      <p className="bg-white/50 text-sm rounded-md text-center font-medium font text-gray-700 py-2">
        append single digit date and month with a 0 for correct behaviour
      </p>
      <div className="mt-4 bg-white rounded-md flex items-center justify-center gap-6">
        <input
          data-dateinput-type="start"
          className="rounded-md py-2 px-2 w-[45%] text-center"
          type="text"
          placeholder="yyyy-mm-dd"
          onChange={onDateInputChange}
        />
        <span>~</span>
        <input
          data-dateinput-type="end"
          className="rounded-md py-2 px-2 w-[45%] text-center"
          type="text"
          placeholder="yyyy-mm-dd"
          onChange={onDateInputChange}
        />
      </div>

      <div className="selector-container mt-4 flex justify-around items-center">
        <span
          onClick={() => setShowMonthSelector((curr) => !curr)}
          className="relative bg-slate-100  transition-all px-8 py-2 rounded-md cursor-pointer  text-center w-[45%]"
        >
          {MONTH_NAMES[displayMonth]}
          {showMonthSelector && (
            <div className="absolute top-0 left-0 bg-slate-100 rounded-md w-full">
              {MONTH_NAMES.map((item, ind) => {
                return (
                  <div
                    onClick={() => setDisplayMonth(ind)}
                    key={ind}
                    className=" hover:bg-slate-800 hover:text-slate-100 transition-all px-8 py-2  cursor-pointer text-center"
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          )}
        </span>
        <span
          className="relative w-[45%] bg-slate-100 transition-all px-8 py-2 rounded-md cursor-pointer text-center"
          onClick={() => {
            setShowDisplayYearSelector((curr) => !curr);

            const el = document.getElementById(`year${displayYear}`);
            el?.scrollIntoView();
          }}
        >
          {displayYear}
          <div
            className={`absolute top-0 left-0 bg-slate-100 rounded-md w-full max-h-[400px] overflow-y-scroll pointer-events-auto scale-y-0 origin-top ${
              showDisplayYearSelector ? "pointer-events-auto scale-y-100" : ""
            }`}
          >
            {YEAR_LIST_ARR.map((item, ind) => {
              return (
                <div
                  onClick={() => setDisplayYear(YEAR_LIST[ind])}
                  key={ind}
                  id={"year" + ind}
                  className=" hover:bg-slate-800 hover:text-slate-100 transition-all px-8 py-2  cursor-pointer text-center"
                >
                  {YEAR_LIST[ind]}
                </div>
              );
            })}
          </div>
        </span>
      </div>

      {/* dates  */}

      <div className="all_dates_container mt-8 grid grid-cols-7 gap-1">
        {datesToRender?.map((item, ind) => {
          return (
            <div
              key={item.date.toDateString()}
              className={`rounded-md bg-slate-100 ${
                item.isSelected ? "bg-slate-800 text-slate-100" : ""
              } p-2 shadow-sm filter hover:brightness-75 flex flex-col justify-center items-center cursor-pointer ${
                item.inBetweenSelectedDates && !item.isWeekend
                  ? "bg-slate-600 text-slate-50"
                  : ""
              }`}
              onClick={() => selectDate(item)}
            >
              <span
                className={`${
                  item.isSelected ? "text-gray-300" : "text-gray-500"
                } ${
                  item.inBetweenSelectedDates && !item.isWeekend
                    ? "text-gray-200"
                    : "text-gray-500"
                }`}
              >
                {item.dayText}
              </span>
              <span>{ind + 1}</span>
            </div>
          );
        })}
      </div>

      <div className="predefined-ranges-container mt-6 flex justify-start flex-wrap gap-3">
        {shortcutButtons?.map((item, ind) => {
          return (
            <div
              key={ind}
              className="bg-gray-500 text-white py-2 px-4 rounded-md cursor-pointer filter hover:brightness-75"
              onClick={() => onClickShortcutButton(item)}
            >
              {item.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;
