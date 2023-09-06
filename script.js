const expirationSelect = document.querySelector("[data-expiration-year]");
const expirationMonth = document.querySelector("[data-expiration-month]");
const logo = document.querySelector("[data-logo]");
const connectedInputsDiv = document.querySelector("[data-connected-inputs]");
const inputFields = connectedInputsDiv.querySelectorAll("input");
const cardNum = document.getElementById("card_num");
const nameInput = document.getElementById("card_name");
const nameOutput = document.getElementById("card_owner_name");
const yearSelect = document.getElementById("expiration-year");
const monthSelect = document.getElementById("expiration-month");
const outputMonth = document.getElementById("month_expire");
const outputYear = document.getElementById("year_expire");
const cvvInput = document.getElementById("cvv");

const currentYear = new Date().getFullYear();
for (let i = currentYear; i < currentYear + 10; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.innerHTML = i.toString().slice(-2);
  expirationSelect.appendChild(option);
}
const currentMonth = new Date().getMonth();
for (let i = 0 + 1; i <= 12; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.innerHTML = i;
  expirationMonth.appendChild(option);
}

// Add event listeners to both select elements
yearSelect.addEventListener("change", validateSelectedDate);
monthSelect.addEventListener("change", validateSelectedDate);

// Function to validate the selected date and update the <p> tags
function validateSelectedDate() {
  const selectedYear = parseInt(yearSelect.value);
  const selectedMonth =
    monthSelect.value > 9 ? monthSelect.value : `0${monthSelect.value}`;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // January is 0, so add 1

  if (selectedYear > currentYear || selectedYear === currentYear) {
    const selectedDateYear = selectedYear - 2000;
    outputYear.textContent = selectedDateYear;
  } else {
    outputYear.textContent = "";
  }

  if (
    selectedYear > currentYear ||
    (selectedYear === currentYear && selectedMonth > currentMonth)
  ) {
    const selectedDateMonth = selectedMonth;
    outputMonth.textContent = ` ${selectedDateMonth} /`;
  } else {
    outputMonth.textContent = "";
  }
}

function updateCardNumber() {
  const cardNumber = Array.from(inputFields)
    .map((input) => input.value)
    .join(" ");
  cardNum.textContent = cardNumber;
}

document.addEventListener("keydown", (e) => {
  const input = e.target;
  const key = e.key;
  if (!isConnectedInput(input)) return;

  switch (key) {
    case "ArrowLeft": {
      if (input.selectionStart === 0 && input.selectionEnd === 0) {
        const previousInput = input.previousElementSibling;
        if (previousInput !== null) {
          previousInput.focus();
        }
        previousInput.selectionStart = previousInput.value.length - 1;
        previousInput.selectionEnd = previousInput.value.length - 1;
        e.preventDefault();
      }
      break;
    }
    case "ArrowRight": {
      if (
        input.selectionStart === input.value.length &&
        input.selectionEnd === input.value.length
      ) {
        const nextInput = input.nextElementSibling;

        if (nextInput !== null) {
          nextInput.focus();
        }
        nextInput.selectionStart = 1;
        nextInput.selectionEnd = 1;
        e.preventDefault();
      }
      break;
    }

    case "Backspace": {
      const firstFour = input
        .closest("[data-connected-inputs]")
        .querySelector("input").value;
      if (firstFour.length === 1) logo.style.display = "none";

      if (input.selectionStart !== input.selectionEnd) return; // ignore
      if (input.selectionStart !== 0) return; // ignore
      const previousInput = input.previousElementSibling;
      if (previousInput === null) return; // ignore
      previousInput.value = previousInput.value.substring(
        0,
        previousInput.value.length
      );
      previousInput.focus();
      previousInput.selectionStart = previousInput.value.length;
      previousInput.selectionEnd = previousInput.value.length;
      e.preventDefault();

      break;
    }

    case "Delete": {
      e.preventDefault();
      break;
    }
    default: {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return; // ignore
      if (key.length !== 1) return; // ignore
      if (input.selectionStart !== input.selectionEnd) return; // ignore
      if (input.selectionStart !== input.value.length) return; // ignore
      if (key.match(/^[^0-9]+$/)) return e.preventDefault(); // ignore

      e.preventDefault();
      onInputChange(input, key);
    }
  }
});

document.addEventListener("paste", (e) => {
  const input = e.target;
  const data = e.clipboardData.getData("text/plain");
  if (!isConnectedInput(input)) return;
  if (!data.match(/^[0-9]+$/)) return e.preventDefault();

  e.preventDefault();
  onInputChange(input, data);
});

function onInputChange(input, newValue) {
  const start = input.selectionStart;
  const end = input.selectionEnd;

  updateValue(input, newValue, start, end);
  focusNextInput(input, newValue.length + start);
  const firstFour = input
    .closest("[data-connected-inputs]")
    .querySelector("input").value;
  if (firstFour.startsWith("4")) {
    logo.src = "./assets/visa.svg";
    logo.style.display = "block";
  } else if (firstFour.startsWith("5")) {
    logo.src = "./assets/mastercard.svg";
    logo.style.display = "block";
  } else if (firstFour.startsWith("3")) {
    logo.src = "./assets/american-express.svg";
    logo.style.display = "block";
  } else if (firstFour.startsWith("2")) {
    logo.src = "./assets/mastercard.svg";
    logo.style.display = "block";
  } else {
    logo.style.display = "none";
  }

  updateCardNumber();
}

function updateValue(input, extraValue, start = 0, end = 0) {
  const newValue = `${input.value.substring(
    0,
    start
  )}${extraValue}${input.value.substring(end, 4)}`;
  input.value = newValue.substring(0, 4);
  if (newValue > 4) {
    const nextInput = input.nextElementSibling;
    if (nextInput === null) return;
    updateValue(nextInput, newValue.substring(4));
  }
}

function focusNextInput(input, dataLength) {
  let addedCharacters = dataLength;
  let currentInput = input;
  while (addedCharacters > 4 && currentInput.nextElementSibling !== null) {
    addedCharacters -= 4;
    currentInput = currentInput.nextElementSibling;
  }
  if (addedCharacters > 4) addedCharacters = 4;
  currentInput.focus();
  currentInput.selectionStart = addedCharacters;
  currentInput.selectionEnd = addedCharacters;
}

function isConnectedInput(input) {
  const parent = input.closest("[data-connected-inputs]");
  return input.matches("input") && parent !== null;
}

nameInput.addEventListener("input", updateName);
nameInput.addEventListener("keydown", updateName);

function updateName(e) {
  let name = nameInput.value;
  name = name.replace(/[^a-zA-Z\s]/g, "");
  name = name.replace(/\s+/g, " ");
  nameInput.value = name;
  const nameParts = name.split(" ");

  if (nameParts.length < 4) {
    nameOutput.textContent = name;
  } else {
    const firstName = nameParts[0];
    const middleName = nameParts[1];
    const lastName = nameParts[2];

    const truncatedName = `${firstName} ${middleName} ${lastName} `;
    nameOutput.textContent = truncatedName;
    e.preventDefault();
  }
}

inputFields.forEach((input) => {
  input.addEventListener("input", updateCardNumber);
  input.addEventListener("keydown", updateCardNumber);
});

cvvInput.addEventListener("input", updateCVV);

function updateCVV() {
  let cvv = cvvInput.value;
  cvv = cvv.replace(/\D/g, "");
}

const submitButton = document.getElementById("submit-button");

submitButton.addEventListener("click", function (e) {
  if (validateCard()) {
    showSuccessMessage();
  }
});

const validateCard = (e) => {
  const cardNumber = Array.from(inputFields)
    .map((input) => input.value)
    .join("");
  const cvv = cvvInput.value;
  const cardName = nameInput.value.split(" ");
  const cardMonth = monthSelect.value;
  const cardYear = yearSelect.value;

  if (cardNumber.length < 16) {
    alert("Please enter a valid card number");

    return;
  }

  if (cvv.length < 3) {
    alert("Please enter a valid CVV");
    return;
  }

  if (cardName.length < 2) {
    alert("Please enter a valid name");
    return;
  }

  if (cardMonth.length < 1) {
    alert("Please enter a valid month");
    return;
  }

  if (cardYear.length < 1) {
    alert("Please enter a valid year");
    return;
  }

  return alert("Your card has been validated");
};
