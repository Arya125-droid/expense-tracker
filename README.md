# Expense Tracker CLI

A lightweight, local Command Line Interface (CLI) application built with Node.js to track and manage your daily expenses. This application fulfills the requirements of the [Expense Tracker](https://roadmap.sh/projects/expense-tracker) project with bonus features like budgeting, category filtering, monthly analytical summaries, and CSV data exports.

All transaction data is safely persisted locally in an `expenses.json` file.

---

## Features

- **Budget Management**: Set a total budget and receive live alerts if an added expense overdraws it.
- **CRUD Operations**: Add, view, update, and delete expense entries.
- **Auto-Incrementing IDs**: Unique IDs are instantly handled upon creation.
- **Category Support**: Assign custom categories or fallback on an `Uncategorized` default flag.
- **Analytical Summaries**: Fetch total amount spent, average transaction sizes, and high/low spikes globally or for specific months.
- **Filtered Listing**: Display your transactions comprehensively or filtered by specific categories.
- **CSV Exporter**: Back up or export your recorded data out to standard `.csv` spreads anytime.

---

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine (v14.x or higher recommended). Your project also leverages **ES Modules** (`import/export` syntax). Ensure your parent `package.json` contains:
```json
{
  "type": "module"
}
```
---

## Installation & Setup

1. **Clone or copy** the codebase script file into your desired directory (e.g., naming it `index.js`).
2. Open your terminal in that specific directory.
3. Run the tracking script using the instructions below. The application will automatically initialize an `expenses.json` data store file on its very first write operation.

---

## Usage & Command Reference

Run the main file using `node` followed by your target command actions and required arguments.

1. **View Help Menu**
Type an invalid command or no arguments to bring up the execution guide:

```Bash
node index.js
```

2. **Set Your Budget**
Establish a financial ceiling. Your remaining budget dynamically auto-calculates as expenses change.

```Bash
node index.js set-budget 1500
```

3. **Add an Expense**
Provide a description, numeric amount, and an optional category.
```Bash
node index.js add-expense "Groceries" 45.50 "Food"
node index.js add-expense "Movie Ticket" 15.00 "Entertainment"
```

4. **List Expenses**
List all saved entries, or cleanly filter them down by a target category flag.

```Bash
# List all transactions
node index.js list-expenses

# Filtered list by category
node index.js list-expenses "Food"
```

5. **Edit an Expense**
Update details about a transaction by supplying its ID. You can pass new strings/numbers for parameters you wish to change.

```Bash
# Command structure: edit-expense [id] [description] [amount] [category]
node index.js edit-expense 1 "Weekly Groceries" 52.00 "Food"
```

6. **Delete an Expense**
Remove an entry entirely by targeting its ID. This will also accurately credit back your set budget.

```Bash
node index.js delete-expense 1
```
7. **Get Expense Summaries**
Get granular analytical insights (Total, average, highs, and lows) globally or for a specific month.

```Bash
# Global summary
node index.js summary

# Monthly summary (case-insensitive)
node index.js summary "january"
```

8. **Export Data to CSV**
Export your ledger details out to a spreadsheet-ready `.csv` file format.

```Bash
# Exports to default location (expenses_export.csv)
node index.js export-csv

# Exports to a custom path
node index.js export-csv "./backups/june_report.csv"
```

---

## Data Schema Example

Your data is organized cleanly inside `expenses.json` using the following schema structure:

```JSON
{
  "lastId": 2,
  "budget": 1439.50,
  "data": {
    "2": {
      "id": 2,
      "description": "Movie Ticket",
      "amount": 15,
      "category": "Entertainment",
      "createdAt": "2026-06-09T02:00:00.000Z",
      "updatedAt": "2026-06-09T02:00:00.000Z"
    }
  }
}
```