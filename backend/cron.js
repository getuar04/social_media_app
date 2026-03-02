import cron from "node-cron";

cron.schedule("* * * * * *", async () => {
  console.log("every second");
});