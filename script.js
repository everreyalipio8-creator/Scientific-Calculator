
let expression = "";
let isDegree = true;

const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");

function append(value) {
    expression += value;
    expressionDisplay.textContent = expression;
}

function clearDisplay() {
    expression = "";
    expressionDisplay.textContent = "0";
    resultDisplay.value = "0";
}

function deleteLast() {
    expression = expression.slice(0, -1);
    expressionDisplay.textContent = expression || "0";
}

function toggleMode() {
    isDegree = !isDegree;
    document.getElementById("mode").textContent =
        isDegree ? "DEG" : "RAD";
}

// Tokenize the mathematical expression
function tokenize(input) {
    const tokens = [];
    const pattern = /\s*([0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?|sin|cos|tan|sqrt|log|ln|π|e|[()+\-*/^!%])\s*/gy;

    let position = 0;

    while (position < input.length) {
        pattern.lastIndex = position;
        const match = pattern.exec(input);

        if (!match || match.index !== position) {
            throw new Error("Invalid expression");
        }

        tokens.push(match[1]);
        position = pattern.lastIndex;
    }

    return tokens;
}

// Mathematical parser
function evaluate(input) {
    const tokens = tokenize(input);
    let position = 0;

    function peek() {
        return tokens[position];
    }

    function consume() {
        return tokens[position++];
    }

    function primary() {
        const token = consume();

        if (token === undefined) {
            throw new Error("Incomplete expression");
        }

        if (token === "+") return unary();
        if (token === "-") return -unary();

        if (token === "(") {
            const value = addSub();
            if (consume() !== ")") {
                throw new Error("Missing closing parenthesis");
            }
            return value;
        }

        if (["sin", "cos", "tan", "sqrt", "log", "ln"].includes(token)) {
            if (consume() !== "(") {
                throw new Error("Function needs parentheses");
            }

            const value = addSub();

            if (consume() !== ")") {
                throw new Error("Missing closing parenthesis");
            }

            switch (token) {
                case "sin":
                    return Math.sin(isDegree ? value * Math.PI / 180 : value);
                case "cos":
                    return Math.cos(isDegree ? value * Math.PI / 180 : value);
                case "tan":
                    return Math.tan(isDegree ? value * Math.PI / 180 : value);
                case "sqrt":
                    return Math.sqrt(value);
                case "log":
                    return Math.log10(value);
                case "ln":
                    return Math.log(value);
            }
        }

        if (token === "π") return Math.PI;
        if (token === "e") return Math.E;

        const number = Number(token);

        if (!Number.isFinite(number)) {
            throw new Error("Invalid number");
        }

        return number;
    }

    function factorial(n) {
        if (!Number.isInteger(n) || n < 0 || n > 170) {
            throw new Error("Factorial requires an integer from 0 to 170");
        }

        let result = 1;

        for (let i = 2; i <= n; i++) {
            result *= i;
        }

        return result;
    }

    function postfix() {
        let value = primary();

        while (peek() === "!" || peek() === "%") {
            const operator = consume();

            if (operator === "!") {
                value = factorial(value);
            } else {
                value /= 100;
            }
        }

        return value;
    }

    function power() {
        let value = postfix();

        if (peek() === "^") {
            consume();
            value = Math.pow(value, unary());
        }

        return value;
    }

    function unary() {
        return power();
    }

    function multiplyDivide() {
        let value = unary();

        while (peek() === "*" || peek() === "/") {
            const operator = consume();
            const next = unary();

            value = operator === "*" ? value * next : value / next;
        }

        return value;
    }

    function addSub() {
        let value = multiplyDivide();

        while (peek() === "+" || peek() === "-") {
            const operator = consume();
            const next = multiplyDivide();

            value = operator === "+" ? value + next : value - next;
        }

        return value;
    }

    const result = addSub();

    if (position !== tokens.length) {
        throw new Error("Invalid expression");
    }

    if (!Number.isFinite(result)) {
        throw new Error("Math error");
    }

    return result;
}

function calculate() {
    if (!expression) return;

    try {
        const answer = evaluate(expression);

        const formatted = Number(answer.toPrecision(12));

        resultDisplay.value = formatted;
        expressionDisplay.textContent = expression;

        const history = document.getElementById("history");
        const item = document.createElement("li");

        item.textContent = expression + " = " + formatted;

        history.prepend(item);

        expression = String(formatted);

    } catch (error) {
        resultDisplay.value = "Error";
        expressionDisplay.textContent = error.message;
    }
}

// Keyboard support
document.addEventListener("keydown", function(event) {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        append(key);
    } else if (["+", "-", "*", "/", "^", "(", ")", "%", "!"].includes(key)) {
        append(key);
    } else if (key === "Enter" || key === "=") {
        calculate();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape") {
        clearDisplay();
    }
});
