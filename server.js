require("dotenv").config();
const cors = require("cors");
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const session = require("express-session");

const app = express();

const PORT = 5000;
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true
}));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "temporary-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Salesforce Login
// Salesforce Login
app.get("/auth/login", (req, res) => {
  const codeVerifier = crypto.randomBytes(32).toString("hex");

  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  req.session.codeVerifier = codeVerifier;

  req.session.save((err) => {
    if (err) {
      console.error("Session Save Error:", err);
      return res.status(500).send("Session error");
    }

    const authUrl =
      `${process.env.SF_LOGIN_URL}/services/oauth2/authorize` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(process.env.SF_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(process.env.SF_REDIRECT_URI)}` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}` +
      `&code_challenge_method=S256`;

    res.redirect(authUrl);
  });
});
  // Create Salesforce Account
app.post("/api/accounts", async (req, res) => {
    console.log("Session:", req.session);
    try {
      const response = await axios.post(
        `${req.session.instanceUrl}/services/data/v65.0/sobjects/Account`,
        {
          Name: req.body.Name,
          Industry: req.body.Industry,
          Phone: req.body.Phone,
        },
        {
          headers: {
            Authorization: `Bearer ${req.session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      res.status(201).json(response.data);
    } catch (error) {
        console.error(
          "Salesforce Error:",
          error.response?.data || error.message
        );
      
        res.status(500).json({
          message: "Failed to create account",
          error: error.response?.data || error.message
        });
      }
  });
  // Update Salesforce Account
app.patch("/api/accounts/:id", async (req, res) => {
  console.log("Session:", req.session);

  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

  try {
    const accountId = req.params.id;

    await axios.patch(
      `${req.session.instanceUrl}/services/data/v65.0/sobjects/Account/${accountId}`,
      {
        Name: req.body.Name,
        Industry: req.body.Industry,
        Phone: req.body.Phone,
      },
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      message: "Account updated successfully",
      id: accountId,
    });
  } catch (error) {
    console.error(
      "Salesforce Update Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to update account",
      error: error.response?.data || error.message,
    });
  }
});
// Delete Salesforce Account
app.delete("/api/accounts/:id", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

  try {
    const accountId = req.params.id;

    await axios.delete(
      `${req.session.instanceUrl}/services/data/v65.0/sobjects/Account/${accountId}`,
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
        },
      }
    );

    res.json({
      message: "Account deleted successfully",
      id: accountId,
    });
  } catch (error) {
    console.error(
      "Salesforce Delete Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to delete account",
      error: error.response?.data || error.message,
    });
  }
});
  // Get Salesforce Accounts
app.get("/api/accounts", async (req, res) => {
    try {
      const response = await axios.get(
        `${req.session.instanceUrl}/services/data/v65.0/query`,
        {
          params: {
            q: "SELECT Id, Name, Industry, Phone FROM Account LIMIT 20",
          },
          headers: {
            Authorization: `Bearer ${req.session.accessToken}`,
          },
        }
      );
  
      res.json(response.data.records);
    } catch (error) {
      console.error(
        error.response?.data || error.message
      );
  
      res.status(500).json({
        message: "Failed to fetch accounts",
      });
    }
  });
// Salesforce OAuth Callback
app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    console.log("Code Verifier:", req.session.codeVerifier);
  
    if (!code) {
      return res.status(400).send("Authorization code missing");
    }
  
    try {
      const response = await axios.post(
        `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
        new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.SF_CLIENT_ID,
          client_secret: process.env.SF_CLIENT_SECRET,
          redirect_uri: process.env.SF_REDIRECT_URI,
          code: code,
          code_verifier: req.session.codeVerifier,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
  
     req.session.accessToken = response.data.access_token;
req.session.instanceUrl = response.data.instance_url;

req.session.save((err) => {
  if (err) {
    console.error("Session Save Error:", err);
    return res.status(500).send("Session save failed");
  }

  res.send("Salesforce Login Successful! 🎉");
});
    } catch (error) {
      console.error(
        error.response?.data || error.message
      );
  
      res.status(500).send("Salesforce Login Failed");
    }
  });
// Home
app.get("/", (req, res) => {
  res.send("Salesforce CRUD Backend is Running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});