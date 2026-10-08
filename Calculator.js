const calculatorInput = document.getElementById('calculator-input');
const operators = ['+', '-', '*', '/'];

function clearValue() {
    calculatorInput.value = '';
}

function appendValue(value) {
    const currentValue = calculatorInput.value;
    const lastCharacter = currentValue.slice(-1);

    if (operators.includes(lastCharacter) && operators.includes(value)) {
        calculatorInput.value = currentValue.slice(0, -1) + value;
        return;
    }

    calculatorInput.value += value;
}

function resultValue() {
    const expression = calculatorInput.value.trim();

    if (!expression) {
        return;
    }

    if (!/^[0-9+\-*/.()\s]+$/.test(expression)) {
        calculatorInput.value = 'Error';
        return;
    }

    try {
        const result = Function('"use strict"; return (' + expression + ');')();

        if (!Number.isFinite(result)) {
            calculatorInput.value = 'Error';
            return;
        }

        calculatorInput.value = Number.isInteger(result)
            ? String(result)
            : Number(result.toFixed(10)).toString();
    } catch (error) {
        calculatorInput.value = 'Error';
    }
}

document.querySelectorAll('button').forEach((button) => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value) {
        button.addEventListener('click', () => appendValue(value));
    }

    if (action === 'clear') {
        button.addEventListener('click', clearValue);
    }

    if (action === 'equals') {
        button.addEventListener('click', resultValue);
    }
});

window.addEventListener('keydown', (event) => {
    const allowed = /^[\d.+\-*/]$/;
    const key = event.key;

    if (allowed.test(key)) {
        appendValue(key);
        return;
    }

    if (key === 'Enter') {
        resultValue();
    } else if (key === 'Backspace') {
        calculatorInput.value = calculatorInput.value.slice(0, -1);
    } else if (key === 'Escape') {
        clearValue();
    }
});