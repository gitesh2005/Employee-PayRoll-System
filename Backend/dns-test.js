const dns = require("dns");

dns.resolveSrv(
    "_mongodb._tcp.employeepayroll.ghlmmrf.mongodb.net",
    (err, records) => {

        if (err) {
            console.log("DNS ERROR:");
            console.log(err);
        } else {
            console.log("DNS SUCCESS:");
            console.log(records);
        }

    }
);