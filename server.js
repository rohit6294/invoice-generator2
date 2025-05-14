const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Parse JSON requests

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  date: String,
  customerName: String,
  Contact: String,
  Aadhar: String,
  GSTIN: String,
  City: String,
  P_S:String,
  P_O:String,
  District: String,
  Pincode: String,
  E_rickshaw:String,
  Color:String,
  Other_Details: String,
  Qty:String,
  Chassis:String,
  amount: Number,
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

app.post("/api/invoices", async(req, res)=>{
    try {
        const newinvoice = new Invoice(req.body);
        await newinvoice.save();
        res.status(201).send(newinvoice);
    } catch (error) {
        console.error("Error saving invoice:", error);
        res.status(500).send({ message: "Error saving invoice", error: error.message });
    }
});

app.get("/api/invoices",async(req,res)=>{
    try {
        const invoices = await Invoice.find();
        res.send(invoices);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).send({ message: "Error fetching invoices", error: error.message });
    }
});

app.get("/api/invoices/:invoiceNumber",async(req,res)=>{
    try {
        const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber });
        if (!invoice) {
          return res.status(404).send({ error: "Invoice not found" });
        }
        res.send(invoice);
    } catch (error) {
        console.error("Error fetching invoice by number:", error);
        res.status(500).send({ message: "Error fetching invoice by number", error: error.message });
    }
});

// Serve index.html for the root route
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));

