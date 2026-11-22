export function createSqlAttractionsClient() {
  let databasePromise = null;

  async function getDatabase() {
    if (!databasePromise) {
      databasePromise = (async () => {
        if (typeof window.initSqlJs !== "function") {
          throw new Error("The browser SQLite library could not be loaded.");
        }
        const SQL = await window.initSqlJs({
          locateFile: file => `./vendor/${file}`
        });
        const response = await fetch("./database.sql");
        if (!response.ok) throw new Error(`Local SQL file could not be loaded: ${response.status}`);
        const sql = await response.text();
        const database = new SQL.Database();
        database.run(sql);
        return database;
      })();
    }
    return databasePromise;
  }

  async function getSeeAttractions(city, search) {
    const database = await getDatabase();
    const statement = database.prepare(
      "SELECT * FROM bangkok_attractions WHERE lower(city) = lower(?)"
    );
    statement.bind([city]);
    const attractions = [];
    while (statement.step()) {
      const row = statement.getAsObject();
      const childAgeLimit = row.age_of_child == null ? null : Number(row.age_of_child);
      const ageBands = childAgeLimit == null
        ? []
        : [{ minAge: 0, maxAge: childAgeLimit, price: Number(row.child_price_usd) }];
      const openDates = getOpenDates(row, search?.startDate, search?.endDate);
      attractions.push({
        pageid: `bangkok-${row.id}`,
        title: row.attraction,
        extract: null,
        fullurl: null,
        pricing: row.cost_usd == null
          ? { status: "unknown" }
          : { adultPrice: Number(row.cost_usd), ageBands, currency: "$" },
        opening: { status: "open", openDates },
        transportation: search?.hasCar ? null : {
          details: row.public_transport || null
        },
        sqlData: {
          datesClosed: row.dates_closed,
          daysOfWeekClosed: row.days_of_week_closed,
          childPriceNote: row.child_price_note,
          childAgeLimit,
          childPrice: row.child_price_usd
        }
      });
    }
    statement.free();
    return { attractions, source: "local-sql" };
  }

  return { getSeeAttractions };
}

function getOpenDates(row, startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const openDates = [];
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return openDates;

  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
    const closedDates = (row.dates_closed || "").split(",").map(value => value.trim());
    const closedDays = (row.days_of_week_closed || "").split(",").map(value => value.trim().toLowerCase());
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    if (!closedDates.includes(monthDay) && !closedDays.includes(dayName)) {
      openDates.push(date.toISOString().slice(0, 10));
    }
  }
  return openDates;
}
