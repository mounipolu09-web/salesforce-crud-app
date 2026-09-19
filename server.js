require("dotenv").config();

const cors = require("cors");
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "https://salesforce-crud-app-sepia.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Session Configuration
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "temporary-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    },
  })
);

// ==========================================
// Salesforce Login
// ==========================================

app.get("/auth/login", (req, res) => {
  const codeVerifier = crypto.randomBytes(32).toString("hex");

  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const state = Buffer.from(
    JSON.stringify({ codeVerifier })
  ).toString("base64url");

  const authUrl =
    `${process.env.SF_LOGIN_URL}/services/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(process.env.SF_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(process.env.SF_REDIRECT_URI)}` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}` +
    `&code_challenge_method=S256` +
    `&state=${encodeURIComponent(state)}`;

  res.redirect(authUrl);
});

// ==========================================
// Salesforce OAuth Callback
// ==========================================

app.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res
      .status(400)
      .send("Authorization code or state missing");
  }

  let codeVerifier;

  try {
    const decodedState = JSON.parse(
      Buffer.from(state, "base64url").toString()
    );

    codeVerifier = decodedState.codeVerifier;
  } catch (error) {
    return res.status(400).send("Invalid OAuth state");
  }

  if (!codeVerifier) {
    return res.status(400).send("OAuth code verifier missing");
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
        code_verifier: codeVerifier,
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
      "Salesforce OAuth Error:",
      error.response?.data || error.message
    );

    res.status(500).send("Salesforce Login Failed");
  }
});

// ==========================================
// Create Salesforce Account
// ==========================================

app.post("/api/accounts", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

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
      "Salesforce Create Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to create account",
      error: error.response?.data || error.message,
    });
  }
});

// ==========================================
// Get Salesforce Accounts
// ==========================================

app.get("/api/accounts", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

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
      "Salesforce Get Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to fetch accounts",
    });
  }
});

// ==========================================
// Update Salesforce Account
// ==========================================

app.patch("/api/accounts/:id", async (req, res) => {
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

// ==========================================
// Delete Salesforce Account
// ==========================================

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
// ==========================================
// Opportunity CRUD
// ==========================================

// Create Opportunity
app.post("/api/opportunities", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

  try {
    const response = await axios.post(
      `${req.session.instanceUrl}/services/data/v65.0/sobjects/Opportunity`,
      {
        Name: req.body.Name,
        StageName: req.body.StageName,
        CloseDate: req.body.CloseDate,
        Amount: req.body.Amount,
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
      "Opportunity Create Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to create opportunity",
      error: error.response?.data || error.message,
    });
  }
});

// Get Opportunities
app.get("/api/opportunities", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

  try {
    const response = await axios.get(
      `${req.session.instanceUrl}/services/data/v65.0/query`,
      {
        params: {
          q: "SELECT Id, Name, StageName, CloseDate, Amount FROM Opportunity LIMIT 20",
        },
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
        },
      }
    );

    res.json(response.data.records);
  } catch (error) {
    console.error(
      "Opportunity Get Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to fetch opportunities",
    });
  }
});

// Update Opportunity
app.patch("/api/opportunities/:id", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

  try {
    const opportunityId = req.params.id;

    await axios.patch(
      `${req.session.instanceUrl}/services/data/v65.0/sobjects/Opportunity/${opportunityId}`,
      {
        Name: req.body.Name,
        StageName: req.body.StageName,
        CloseDate: req.body.CloseDate,
        Amount: req.body.Amount,
      },
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      message: "Opportunity updated successfully",
      id: opportunityId,
    });
  } catch (error) {
    console.error(
      "Opportunity Update Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to update opportunity",
      error: error.response?.data || error.message,
    });
  }
});

// Delete Opportunity
app.delete("/api/opportunities/:id", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

  try {
    const opportunityId = req.params.id;

    await axios.delete(
      `${req.session.instanceUrl}/services/data/v65.0/sobjects/Opportunity/${opportunityId}`,
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
        },
      }
    );

    res.json({
      message: "Opportunity deleted successfully",
      id: opportunityId,
    });
  } catch (error) {
    console.error(
      "Opportunity Delete Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to delete opportunity",
      error: error.response?.data || error.message,
    });
  }
});
// ==========================================
// LEAD CRUD
// ==========================================

// Create Lead
app.post("/api/leads", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

  try {
    const response = await axios.post(
      `${req.session.instanceUrl}/services/data/v65.0/sobjects/Lead`,
      {
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Company: req.body.Company,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Status: req.body.Status,
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
      "Lead Create Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to create lead",
      error: error.response?.data || error.message,
    });
  }
});

// Get Leads
app.get("/api/leads", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

  try {
    const response = await axios.get(
      `${req.session.instanceUrl}/services/data/v65.0/query`,
      {
        params: {
          q: "SELECT Id, FirstName, LastName, Company, Email, Phone, Status FROM Lead LIMIT 20",
        },
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
        },
      }
    );

    res.json(response.data.records);
  } catch (error) {
    console.error(
      "Lead Get Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to fetch leads",
    });
  }
});

// Update Lead
app.patch("/api/leads/:id", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

  try {
    const leadId = req.params.id;

    await axios.patch(
      `${req.session.instanceUrl}/services/data/v65.0/sobjects/Lead/${leadId}`,
      {
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Company: req.body.Company,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Status: req.body.Status,
      },
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      message: "Lead updated successfully",
      id: leadId,
    });
  } catch (error) {
    console.error(
      "Lead Update Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to update lead",
      error: error.response?.data || error.message,
    });
  }
});

// Delete Lead
app.delete("/api/leads/:id", async (req, res) => {
  if (!req.session.accessToken || !req.session.instanceUrl) {
    return res.status(401).json({
      message: "Please log in to Salesforce first",
    });
  }

  try {
    const leadId = req.params.id;

    await axios.delete(
      `${req.session.instanceUrl}/services/data/v65.0/sobjects/Lead/${leadId}`,
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
        },
      }
    );

    res.json({
      message: "Lead deleted successfully",
      id: leadId,
    });
  } catch (error) {
    console.error(
      "Lead Delete Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to delete lead",
      error: error.response?.data || error.message,
    });
  }
});
// ==========================================
// Home Route
// ==========================================

app.get("/", (req, res) => {
  res.send("Salesforce CRUD Backend is Running!");
});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});