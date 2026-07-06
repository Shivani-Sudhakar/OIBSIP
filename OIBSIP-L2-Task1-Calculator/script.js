class Calculator {
    constructor(displayElement) {
        this.displayElement = displayElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.expression = [];
        this.isResult = false;
    }

    delete() {
        if (this.isResult || this.currentOperand === 'Error') {
            this.clear();
            return;
        }

        if (this.currentOperand !== '' && this.currentOperand !== '0') {
            if (this.currentOperand.length === 1) {
                if (this.expression.length === 0) {
                    this.currentOperand = '0';
                } else {
                    this.currentOperand = '';
                }
            } else {
                this.currentOperand = this.currentOperand.toString().slice(0, -1);
            }
        } else if (this.currentOperand === '' || this.currentOperand === '0') {
            if (this.expression.length > 0) {
                this.expression.pop(); // remove operator
                this.currentOperand = this.expression.pop(); // bring back the previous number
            }
        }
    }

    appendNumber(number) {
        if (this.isResult) {
            this.clear();
        }
        if (this.currentOperand === 'Error') this.clear();
        if (number === '.' && this.currentOperand.includes('.')) return;

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.isResult) {
            this.isResult = false;
        }
        if (this.currentOperand === 'Error') return;

        if (this.currentOperand === '') {
            // Change the last operator if user typed consecutive operators
            if (this.expression.length > 0) {
                this.expression[this.expression.length - 1] = operation;
            }
            return;
        }

        this.expression.push(this.currentOperand);
        this.expression.push(operation);
        this.currentOperand = '';
    }

    compute() {
        if (this.currentOperand === '' && this.expression.length === 0) return;
        if (this.isResult) return;

        let tokens = [...this.expression];
        if (this.currentOperand !== '') {
            tokens.push(this.currentOperand);
        } else {
            // Remove trailing operator if the user hits equals without a final number
            tokens.pop();
        }

        if (tokens.length === 0) return;

        // Pass 1: Multiplication and Division
        let i = 0;
        while (i < tokens.length) {
            if (tokens[i] === '×' || tokens[i] === '÷') {
                const prev = parseFloat(tokens[i - 1]);
                const next = parseFloat(tokens[i + 1]);
                let res;
                if (tokens[i] === '×') res = prev * next;
                if (tokens[i] === '÷') {
                    if (next === 0) {
                        this.currentOperand = 'Error';
                        this.expression = [];
                        this.isResult = true;
                        return;
                    }
                    res = prev / next;
                }
                tokens.splice(i - 1, 3, res.toString());
                i--;
            } else {
                i++;
            }
        }

        // Pass 2: Addition and Subtraction
        i = 0;
        while (i < tokens.length) {
            if (tokens[i] === '+' || tokens[i] === '−') {
                const prev = parseFloat(tokens[i - 1]);
                const next = parseFloat(tokens[i + 1]);
                let res;
                if (tokens[i] === '+') res = prev + next;
                if (tokens[i] === '−') res = prev - next;
                tokens.splice(i - 1, 3, res.toString());
                i--;
            } else {
                i++;
            }
        }

        let result = tokens[0];

        // Prevent extremely long floats from floating point arithmetic inaccuracies
        if (result && result.includes('.')) {
            const parts = result.split('.');
            if (parts[1].length > 10) {
                result = parseFloat(parseFloat(result).toFixed(10)).toString();
            }
        }

        this.currentOperand = result;
        this.expression = [];
        this.isResult = true;
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;
        if (number === '') return '';
        if (number === '-') return '-';

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        let displayStr = '';
        for (let token of this.expression) {
            if (['+', '−', '×', '÷'].includes(token)) {
                displayStr += ` ${token} `;
            } else {
                displayStr += this.getDisplayNumber(token);
            }
        }

        if (this.currentOperand !== '') {
            displayStr += this.getDisplayNumber(this.currentOperand);
        }

        this.displayElement.innerText = displayStr || '0';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const displayElement = document.getElementById('display');
    const calculator = new Calculator(displayElement);

    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;

            if (!action) {
                // If no action data attribute, it's a number
                calculator.appendNumber(button.dataset.value);
            } else if (action === 'operator') {
                calculator.chooseOperation(button.dataset.value);
            } else if (action === 'equals') {
                calculator.compute();
            } else if (action === 'clear') {
                calculator.clear();
            } else if (action === 'delete') {
                calculator.delete();
            }

            calculator.updateDisplay();
        });
    });
});
