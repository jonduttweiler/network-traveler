const APP_PORT = process.env.APP_PORT || 8080;

const fs = require("fs");
const path = require("path");
const express = require("express");
const bundlerRouter = require("./routes/bundler");

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(bundlerRouter);

let versionCache;
app.get("/", async (req, res, next) => {
    try {
        let version = versionCache;
        let name;
        if (!version) {
            const pckPath = path.resolve(__dirname, "package.json");
            const pkgraw = await fs.promises.readFile(pckPath);
            const pkg = JSON.parse(pkgraw);
            name = pkg.name;
            version = pkg.version;
            versionCache = pkg.version;
        }
        return res.json({ app:name, version });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err })
    }
});

app.listen(APP_PORT, _ => {
  console.log("INFO", "BOOTSTRAP", `App listening on port ${APP_PORT}!`);
});
