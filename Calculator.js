const calculatorInput = document.getElementById('calculator-input');
const angleModeButton = document.querySelector('[data-action="angle-mode"]');
let angleMode = 'DEG';

function clearValue() {
    calculatorInput.value = '';
}

function appendValue(value) {
    if (calculatorInput.value === 'Error') {
        calculatorInput.value = '';
    }

    calculatorInput.value += value;
}

function tokenize(expression) {
    const tokens = [];
    let position = 0;

    while (position < expression.length) {
        const remaining = expression.slice(position);
        const whitespace = remaining.match(/^\s+/);
        if (whitespace) {
            position += whitespace[0].length;
            continue;
        }

        const number = remaining.match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
        const identifier = remaining.match(/^[a-z]+/i);
        const symbol = remaining.match(/^[()+\-*/^]/);

        if (number) {
            tokens.push({ type: 'number', value: Number(number[0]) });
            position += number[0].length;
        } else if (identifier) {
            tokens.push({ type: 'identifier', value: identifier[0].toLowerCase() });
            position += identifier[0].length;
        } else if (symbol) {
            tokens.push({ type: 'symbol', value: symbol[0] });
            position += symbol[0].length;
        } else {
            throw new Error('Invalid expression');
        }
    }

    return tokens;
}

function evaluateExpression(expression) {
    const tokens = tokenize(expression);
    let position = 0;
    const peek = () => tokens[position];
    const consume = (value) => {
        if (peek()?.value !== value) {
            throw new Error('Invalid expression');
        }
        position += 1;
    };

    function parseExpression() {
        let value = parseTerm();
        while (peek()?.value === '+' || peek()?.value === '-') {
            const operator = tokens[position++].value;
            const right = parseTerm();
            value = operator === '+' ? value + right : value - right;
        }
        return value;
    }

    function parseTerm() {
        let value = parseUnary();
        while (peek()?.value === '*' || peek()?.value === '/') {
            const operator = tokens[position++].value;
            const right = parseUnary();
            value = operator === '*' ? value * right : value / right;
        }
        return value;
    }

    function parseUnary() {
        if (peek()?.value === '+' || peek()?.value === '-') {
            const operator = tokens[position++].value;
            const value = parseUnary();
            return operator === '-' ? -value : value;
        }
        return parsePower();
    }

    function parsePower() {
        const base = parsePrimary();
        if (peek()?.value === '^') {
            position += 1;
            return Math.pow(base, parseUnary());
        }
        return base;
    }

    function parsePrimary() {
        const token = peek();

        if (token?.type === 'number') {
            position += 1;
            return token.value;
        }

        if (token?.value === '(') {
            position += 1;
            const value = parseExpression();
            consume(')');
            return value;
        }

        if (token?.type === 'identifier') {
            position += 1;
            if (token.value === 'pi') {
                return Math.PI;
            }
            if (token.value === 'e') {
                return Math.E;
            }

            consume('(');
            const argument = parseExpression();
            consume(')');
            return applyFunction(token.value, argument);
        }

        throw new Error('Invalid expression');
    }

    const result = parseExpression();
    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error('Invalid expression');
    }
    return result;
}

function applyFunction(name, value) {
    const toRadians = (degrees) => degrees * Math.PI / 180;
    const fromRadians = (radians) => radians * 180 / Math.PI;

    switch (name) {
        case 'sin':
            return Math.sin(angleMode === 'DEG' ? toRadians(value) : value);
        case 'cos':
            return Math.cos(angleMode === 'DEG' ? toRadians(value) : value);
        case 'tan':
            return Math.tan(angleMode === 'DEG' ? toRadians(value) : value);
        case 'asin':
            return angleMode === 'DEG' ? fromRadians(Math.asin(value)) : Math.asin(value);
        case 'acos':
            return angleMode === 'DEG' ? fromRadians(Math.acos(value)) : Math.acos(value);
        case 'atan':
            return angleMode === 'DEG' ? fromRadians(Math.atan(value)) : Math.atan(value);
        case 'sqrt':
            return Math.sqrt(value);
        case 'ln':
            return Math.log(value);
        case 'log':
            return Math.log10(value);
        case 'exp':
            return Math.exp(value);
        default:
            throw new Error('Unknown function');
    }
}

function resultValue() {
    const expression = calculatorInput.value.trim();
    if (!expression || expression === 'Error') {
        return;
    }

    try {
        const result = evaluateExpression(expression);
        calculatorInput.value = Number.isInteger(result)
            ? String(result)
            : String(Number(result.toPrecision(12)));
    } catch (error) {
        calculatorInput.value = 'Error';
    }
}

function toggleAngleMode() {
    angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
    angleModeButton.textContent = angleMode;
}

document.querySelectorAll('button').forEach((button) => {
    const value = button.dataset.value;
    const action = button.dataset.action;
    const functionName = button.dataset.function;

    if (value) {
        button.addEventListener('click', () => appendValue(value));
    }

    if (functionName) {
        button.addEventListener('click', () => appendValue(functionName + '('));
    }

    if (action === 'clear') {
        button.addEventListener('click', clearValue);
    }

    if (action === 'angle-mode') {
        button.addEventListener('click', toggleAngleMode);
    }

    if (action === 'equals') {
        button.addEventListener('click', resultValue);
    }
});

window.addEventListener('keydown', (event) => {
    const allowed = /^[\d.+\-*/^()]$/;
    const key = event.key;

    if (allowed.test(key)) {
        appendValue(key);
        return;
    }

    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        resultValue();
    } else if (key === 'Backspace') {
        calculatorInput.value = calculatorInput.value.slice(0, -1);
    } else if (key === 'Escape') {
        clearValue();
    }
});