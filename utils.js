const https = require("https");

const paystackAccountName = (user_account_number, user_bank_code) =>
  new Promise((resolve, reject) => {
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/bank/resolve?account_number=${user_account_number}&bank_code=${user_bank_code}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));

      res.on("error", () =>
        reject(new Error("Error getting account name. Please try again later."))
      );

      res.on("end", async () => {
        const parsedData = JSON.parse(data);
        res.statusCode === 200
          ? resolve(parsedData.data.account_name)
          : reject(new Error(parsedData.message));
      });
    });

    req.on("error", reject);
    req.end();
  });

module.exports = { paystackAccountName };