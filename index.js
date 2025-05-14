document.addEventListener('DOMContentLoaded', () => {
    // Number to Words Conversion
    function ConvertNumberToWords(number) {
        const belowTwenty = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        const thousands = ["", "Thousand", "Lakh", "Crore"];

        if (number === 0) return "Zero";

        let numStr = number.toString();
        let words = "";

        if (numStr.includes(".")) {
            let [integerPart, decimalPart] = numStr.split(".");
            words = convertIntegerPart(integerPart) + " and ";
            words += convertDecimalPart(decimalPart) + " Paisa";
            return words;
        } else {
            return convertIntegerPart(numStr);
        }

        function convertIntegerPart(num) {
            if (num === "0") return "Zero";
            let digits = num.split("").reverse().map(Number);
            let result = "";
            let thousandIndex = 0;

            for (let i = 0; i < digits.length; i += (i === 0 ? 3 : 2)) {
                let chunk = [];
                if (i === 0) {
                    chunk = digits.slice(0, 3);
                } else {
                    chunk = digits.slice(i, i + 2);
                }

                if (chunk.every(d => d === 0)) continue;

                let chunkNum = chunk.reverse().join("");
                let chunkWords = "";

                if (chunkNum.length === 3 && chunk[0] !== 0) {
                    chunkWords += belowTwenty[chunk[0]] + " Hundred ";
                }

                let lastTwo = parseInt(chunkNum.slice(-2));
                if (lastTwo < 20 && lastTwo > 0) {
                    chunkWords += belowTwenty[lastTwo] + " ";
                } else if (lastTwo >= 20) {
                    chunkWords += tens[Math.floor(lastTwo / 10)] + " " + belowTwenty[lastTwo % 10] + " ";
                }

                if (chunkWords) {
                    result = chunkWords + thousands[thousandIndex] + " " + result;
                }
                thousandIndex++;
            }
            return result.trim();
        }

        function convertDecimalPart(dec) {
            let digits = dec.split("").map(Number);
            let result = "";
            digits.forEach(d => {
                result += belowTwenty[d] + " ";
            });
            return result.trim();
        }
    }

    // Fetch Google Sheets URL from backend
    let scriptURL;
    fetch('/config')
        .then(response => response.json())
        .then(config => {
            scriptURL = config.googleSheetUrl;
        })
        .catch(err => console.error('Failed to fetch config:', err));

    // Form Submission
    const form = document.getElementById('form');
    const submitButton = document.getElementById('but');
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('sample_form').style.display = 'none';
        document.getElementById('main_formm').style.display = 'block';

        // Collect form data
        let date = document.getElementById('date').value;
        let invoiceNumber = document.getElementById('invoice_number').value;
        let customerName = document.getElementById('customer_name').value;
        let eRickshawName = document.getElementById('e_rickshaw_name').value;
        let amount = parseFloat(document.getElementById('amount').value);
        let gstRate = 5; // 5% GST
        let cgst = (amount * (gstRate / 2)) / 100;
        let sgst = cgst;
        let total = amount + cgst + sgst;

        // Update DOM
        document.getElementById('invoice_date').textContent = date;
        document.getElementById('invoice_number_display').textContent = invoiceNumber;
        document.getElementById('customer_name_display').textContent = customerName;
        document.getElementById('e_rickshaw_display').textContent = eRickshawName;
        document.getElementById('basic_value').textContent = amount.toFixed(2);
        document.getElementById('cgst_value').textContent = cgst.toFixed(2);
        document.getElementById('sgst_value').textContent = sgst.toFixed(2);
        document.getElementById('total_value').textContent = total.toFixed(2);
        document.getElementById('amount_in_words').textContent = ConvertNumberToWords(total);

        // Ensure View Previous Invoices button is visible
        const viewPreviousButton = document.getElementById('view_previous_invoices');
        if (viewPreviousButton) {
            viewPreviousButton.style.display = 'block';
        }

        // Save to Google Sheets
        fetch(scriptURL, { method: 'POST', body: new FormData(form) })
            .then(response => console.log('Form submitted to Google Sheets'))
            .catch(error => console.error('Google Sheets error:', error));

        // Save to MongoDB
        let invoiceData = {
            invoiceNumber,
            date,
            customerName,
            eRickshawName,
            amount: total
        };
        fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
        })
        .then(response => response.json())
        .then(data => console.log('Invoice saved:', data))
        .catch(err => console.error('MongoDB save error:', err));

        // Enable print button
        document.getElementById('print_btn').style.display = 'block';
    });

    // PDF Generation
    function printInvoice() {
        const element = document.getElementById('main_formm');
        const viewPrevious = document.getElementById('view_previous_invoices');
        if (viewPrevious) {
            viewPrevious.style.display = 'none';
        }
        html2pdf().from(element).set({
            margin: [10, 10, 10, 10],
            filename: 'invoice.pdf',
            pagebreak: { mode: 'avoid-all' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).save().then(() => {
            if (viewPrevious) {
                viewPrevious.style.display = 'block';
            }
        }).catch(err => {
            if (viewPrevious) {
                viewPrevious.style.display = 'block';
            }
            console.error('PDF generation error:', err);
        });
    }

    // View Previous Invoices
    const viewPreviousButton = document.getElementById('view_previous_invoices');
    if (viewPreviousButton) {
        viewPreviousButton.addEventListener('click', () => {
            window.location.href = 'previous_invoices.html';
        });
    }

    // Expose printInvoice globally for button onclick
    window.printInvoice = printInvoice;
});