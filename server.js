const jsonServer = require("json-server");
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;
const http = require("https");

server.use((req, res, next) => {
  // res.header("Access-Control-Allow-Origin", "http://localhost:9000");
  res.header(
    "Access-Control-Allow-Origin",
    "https://football-bet-stats.vercel.app"
  );
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

server.get("/football", (req, res) => {
  let str = "";
  console.log("football");

  const data = http
    .request(
      "https://1xstavka.ru/LiveFeed/Get1x2_VZip?sports=1&count=200&antisports=188&mode=4&country=1&partner=51&getEmpty=true&noFilterBlockEvent=true",
      (response) => {
        response.on("data", function (chunk) {
          str += chunk;
        });

        response.on("end", function () {
          const data = JSON.parse(str);

          const filteredData = data.Value.filter((game) => {
            const isStats = game.SC.ST;

            if (isStats) {
              const corners = game.SC.ST[0].Value.find(
                (item) => item.ID === 70
              );
              const isTime = game.SC.TS;
              const isTimeLessThan62 = game.SC.TS < 3720;

              if (corners && isTime && isTimeLessThan62) {
                const isManyCorners = corners.S1 >= 5 || corners.S2 >= 5;

                if (isManyCorners) {
                  return game;
                }
              }
            }
          });

          res.jsonp({ football: filteredData });
        });
      }
    )
    .end();
});

server.use(middlewares);

server.listen(port);
