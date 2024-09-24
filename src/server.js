const express = require('express');
const app = express();
const port = 3000; 

app.use(express.json());

app.get('/getcode', (req, res) => {
    res.send('Hello, my group is SDP-G3');
});

app.get('/plus/:num1/:num2', (req, res) => {
    const { num1, num2 } = req.params;

    const isValidNumber = (num) => /^-?\d+(\.\d+)?$|^\d+\.$/.test(num);

    if (!isValidNumber(num1) || !isValidNumber(num2)) {
        return res.status(400).json({ 
            error: 'parameters are not valid numbers' 
        });
    }

    const number1 = parseFloat(num1);
    const number2 = parseFloat(num2);

    res.json({ 
        num1: number1, 
        num2: number2, 
        sum: number1 + number2 
    });
});


if (require.main === module) {
    app.listen(port, () => {
        console.log(`API is running on http://localhost:${port}`);
    });
}

module.exports = app;