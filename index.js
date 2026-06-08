import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expansesDataPath = path.resolve(__dirname, 'expenses.json');

const readData = () => {
    try {
        if (!fs.existsSync(expansesDataPath)) {
            return { lastId: 0, data: {} };
        }
        const data = fs.readFileSync(expansesDataPath, 'utf8').trim();
        return JSON.parse(data || '{"lastId": 0, "data": {}}'); 
    } catch (error) {
        console.error("Error reading data:", error.message);
        return { lastId: 0, data: {} };
    }
}

export const writeData = (data) => {
    try {
        fs.writeFileSync(expansesDataPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error writing data: ", error);
        throw error;
    }
};

const setBudget = (amount) => {
    if(!amount || isNaN(amount)){
        console.log("Validation Failure: A valid numeric amount is required.");
        return;
    }
    try{
        const expensesContainer = readData();
        expensesContainer.budget = parseFloat(amount);
        writeData(expensesContainer);
        console.log(`Budget successfully set to $${amount}!`);
    } catch(error){
        console.error("Error setting budget: ", error);
    }
}

const addExpense = (desc, amt, category) => {
    if(!desc || !amt || isNaN(amt)){
        console.log("Validation Failure: Both description and a valid numeric amount are required.");
        return;
    }
    try{
        const expensesContainer = readData();
        expensesContainer.lastId += 1;
        const newId = expensesContainer.lastId;
        let budgetExceeded = false;
        
        if(expensesContainer.budget !== undefined){
            if(expensesContainer.budget < parseFloat(amt)){
                budgetExceeded = true;
            } 
            expensesContainer.budget -= parseFloat(amt);
        }
        const newExpense = {
            id: newId,
            description: desc,
            amount: parseFloat(amt),
            category: category || 'Uncategorized',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        expensesContainer.data[newId] = newExpense;
        writeData(expensesContainer);
        console.log(`Expense successfully added! (ID: ${newId})`);
        if(budgetExceeded){
            console.warn("Warning: Adding this expense has exceeded your set budget!");
        }
    } catch(error){
        console.log("Error adding expense: ", error);
        return;
    }
}

const editExpense = (id, desc, amt, category) => {
    if(!id){
        console.log("Validation Failure: ID is required.");
        return;
    }
    try{
        const expensesContainer = readData();
        if(!expensesContainer.data[id]){
            console.log(`Expense with ID ${id} not found.`);
            return;
        }
        const expenseToUpdate = expensesContainer.data[id];
        if(desc) expenseToUpdate.description = desc;
        if(amt && !isNaN(amt)){
            const oldAmount = expenseToUpdate.amount;
            const newAmount = parseFloat(amt);
            expenseToUpdate.amount = newAmount;
            if (expensesContainer.budget !== undefined) {
                expensesContainer.budget += oldAmount - newAmount; 
            }
        }
        if(category) expenseToUpdate.category = category;
        expenseToUpdate.updatedAt = new Date().toISOString();
        writeData(expensesContainer);
        console.log(`Expense with ID ${id} successfully updated!`);
    } catch(error){
        console.log("Error editing expense: ", error);
        return;
    }
}

const deleteExpense = (id) => {
    if(!id){
        console.log("Validation Failure: ID is required.");
        return;
    }
    try{
        const expensesContainer = readData();
        if(!expensesContainer.data[id]){
            console.log(`Expense with ID ${id} not found.`);
            return;
        }
        if (expensesContainer.budget !== undefined) {
            expensesContainer.budget += parseFloat(expensesContainer.data[id].amount);
        }
        delete expensesContainer.data[id];
        writeData(expensesContainer);
        console.log(`Expense with ID ${id} successfully deleted!`);
    } catch(error){
        console.log("Error deleting expense: ", error);
        return;
    }
}

const listExpenses = (filterCategory) => {
    const expensesContainer = readData();
    const expensesList = Object.values(expensesContainer.data);
    const filteredExpenses = filterCategory ? expensesList.filter(expense => expense.category.toLowerCase() === filterCategory.toLowerCase()) : expensesList;
    if(filteredExpenses.length === 0){
        console.log("No matching expenses found.");
        return;
    }
    console.log("\n --- YOUR EXPENSES ---");
    filteredExpenses.forEach(expense => {
        console.log(`ID: ${expense.id} | Description: ${expense.description} | Amount: $${expense.amount.toFixed(2)} | Category: ${expense.category} | Created At: ${expense.createdAt} | Updated At: ${expense.updatedAt}`);
    });
    console.log("-----------------------------------------\n");
}

const printExpenseSummary = (totalAmount, averageAmount, highestExpense, lowestExpense, expenseCount) => {
    console.log(`\n --- EXPENSE SUMMARY ---`);
    console.log(`Total Expenses: $${totalAmount.toFixed(2)}`);
    console.log(`Average Expense: $${averageAmount.toFixed(2)}`);
    if (highestExpense) console.log(`Highest Expense: $${highestExpense.amount.toFixed(2)} (ID: ${highestExpense.id}, Description: ${highestExpense.description}) on ${highestExpense.createdAt}`);
    if (lowestExpense) console.log(`Lowest Expense: $${lowestExpense.amount.toFixed(2)} (ID: ${lowestExpense.id}, Description: ${lowestExpense.description}) on ${lowestExpense.createdAt}`);
    console.log(`Total Number of Expenses: ${expenseCount}`);
}

const calculateSummary = (expensesList) => {
    const totalAmount = expensesList.reduce((sum, expense) => sum + expense.amount, 0);
    const averageAmount = totalAmount / expensesList.length;
    const highestExpense = expensesList.reduce((max, expense) => expense.amount > max.amount ? expense : max, expensesList[0]);
    const lowestExpense = expensesList.reduce((min, expense) => expense.amount < min.amount ? expense : min, expensesList[0]);
    const expenseCount = expensesList.length;
    return { totalAmount, averageAmount, highestExpense, lowestExpense, expenseCount };
}

const summary = (month) => {
    const expensesContainer = readData();
    const expensesList = Object.values(expensesContainer.data);
    if(expensesList.length === 0){
        console.log("No expenses found.");
        return;
    }
    if(!month){
        try{
            const { totalAmount, averageAmount, highestExpense, lowestExpense, expenseCount } = calculateSummary(expensesList);
            printExpenseSummary(totalAmount, averageAmount, highestExpense, lowestExpense, expenseCount);
        } catch(error){
            console.error("Error generating summary: ", error);
            return;
        }
    } else{
        const filteredExpenses = expensesList.filter(expense => {
            const expenseMonth = new Date(expense.createdAt).toLocaleString('default', { month: 'long' }).toLowerCase();
            return expenseMonth === month.toLowerCase();
        });
        if(filteredExpenses.length === 0){
            console.log(`No expenses found for the month of ${month}.`);
            return;
        }
        try{
            const { totalAmount, averageAmount, highestExpense, lowestExpense, expenseCount } = calculateSummary(filteredExpenses);
            printExpenseSummary(totalAmount, averageAmount, highestExpense, lowestExpense, expenseCount);
        } catch(error){
            console.error("Error generating summary: ", error);
            return;
        }
    }
}

const exportToCSV = (filePath) => {
    const expensesContainer = readData();
    const expensesList = Object.values(expensesContainer.data);
    if(expensesList.length === 0){
        console.log("No expenses to export.");
        return;
    }
    const csvHeader = "ID,Description,Amount,Category,Created At,Updated At,RemainingBudget\n";
    const csvRows = expensesList.map(expense => {
        const remainingBudget = expensesContainer.budget !== undefined ? expensesContainer.budget.toFixed(2) : 'N/A';
        return `${expense.id},"${expense.description}",${expense.amount.toFixed(2)},"${expense.category}",${expense.createdAt},${expense.updatedAt},${remainingBudget}`;
    });
    const csvContent = csvHeader + csvRows.join("\n");
    try{
        fs.writeFileSync(filePath, csvContent, 'utf-8');
        console.log(`Expenses successfully exported to ${filePath}!`);
    } catch(error){
        console.error("Error exporting to CSV: ", error);
        return;
    }
}

const main = () => {
    const args = process.argv.slice(2);
    const command = args[0];
    switch(command){
        case 'set-budget':
            setBudget(args[1]);
            break;
        case 'add-expense':
            addExpense(args[1], args[2], args[3]);
            break;
        case 'edit-expense':
            editExpense(args[1], args[2], args[3], args[4]);
            break;
        case 'delete-expense':
            deleteExpense(args[1]);
            break;
        case 'list-expenses':
            listExpenses(args[1]);
            break;
        case 'summary':
            summary(args[1]);
            break;
        case 'export-csv':
            exportToCSV(args[1] || path.resolve(__dirname, 'expenses_export.csv'));
            break;
        default:
            console.log(
                `
    Expense Tracker Platform
==================================
Available Execution Commands:
> node <filename>.js set-budget [amount]
> node <filename>.js add-expense "Description" [amount] [category]
> node <filename>.js edit-expense [id] "New Description" [new amount] [new category]
> node <filename>.js delete-expense [id]
> node <filename>.js list-expenses [category]
> node <filename>.js summary [month]
> node <filename>.js export-csv [filePath]
                `
            );
    }
}

main();