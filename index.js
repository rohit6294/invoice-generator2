function ConvertNumberToWords(num) {
    if (num === 0) return "zero";

    const belowTwenty = [
        "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
        "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
        "seventeen", "eighteen", "nineteen"
    ];
    const tens = [
        "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
        "eighty", "ninety"
    ];
    const places = ["", "thousand", "lakh", "crore"];

    function helper(n) {
        if (n === 0) return "";
        else if (n < 20) return belowTwenty[n - 1] + " ";
        else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
        else return belowTwenty[Math.floor(n / 100) - 1] + " hundred " + (n % 100 !== 0 ? "and " : "") + helper(n % 100);
    }

    let integerPart = Math.floor(num); // Integer part
    let decimalPart = num % 1; // Decimal part
    let word = "";
    let i = 0;

    // Handle integer part
    while (integerPart > 0) {
        let chunk = integerPart % (i === 0 ? 1000 : 100);
        if (chunk !== 0) {
            word = helper(chunk) + places[i] + " " + word;
        }
        integerPart = Math.floor(integerPart / (i === 0 ? 1000 : 100));
        i++;
    }

    word = word.trim();

    // Handle decimal part
    if (decimalPart > 0) {
        let decimalWords = "point ";
        const decimals = decimalPart.toString().split(".")[1]; // Get digits after the decimal point
        for (let digit of decimals) {
            decimalWords += belowTwenty[parseInt(digit) - 1] + " "; // Convert digits to words
        }
        word += " " + decimalWords.trim();
    }

    return word.trim();
}

function printInvoice(e) {
    const viewPreviousInvoicesBtn = document.getElementById("view_previous_invoices_btn");
    if (viewPreviousInvoicesBtn) {
        viewPreviousInvoicesBtn.style.display = "none"; // Hide the button
    }

    document.body.classList.add("print");
    const sample_form = document.getElementById('sample_form'); // Corrected
    sample_form.classList.add("hidden");
    let el = document.getElementById("main_formm");
    el.classList.remove("hidden");

    html2pdf(el, {
        filename: 'MS#' + e + '.pdf', // Corrected
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        html2canvas: { scale: 2 }
    }).then(function() {
        // Restore button visibility after PDF generation is complete or initiated
        if (viewPreviousInvoicesBtn) {
            viewPreviousInvoicesBtn.style.display = "inline-block";
        }
    }).catch(function(error) {
        console.error("Error generating PDF: ", error);
        // Ensure button is restored even if PDF generation fails
        if (viewPreviousInvoicesBtn) {
            viewPreviousInvoicesBtn.style.display = "inline-block";
        }
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxAd4ZF3BfZcRomueGzf7QciFu2B6QKi_Rsn8Dld0zdLG7gOb4-vsAxLRzGFg1BuU-FcA/exec';
    const form = document.forms['google-sheet'];
    const submit = document.getElementById('but');
    submit.addEventListener('click', function (e) {
        e.preventDefault();

        const form_main = document.getElementById('form_main');
        form_main.classList.remove("hidden");

        const sample_form = document.getElementById('sample_form');
        var x = document.getElementById('date_input').value.split('-');

        const date_output = document.getElementById('date_output');
        date_output.textContent = x[2] + '/' + x[1] + '/' + x[0];

        const val = document.getElementById('gstinput');
        const half_gst = document.querySelectorAll(".gst");
        const mainval = parseFloat(val.value);
        const without_gst = (parseFloat((mainval / 1.05).toFixed(2)));
        const gst = parseFloat((mainval - without_gst).toFixed(2)) / 2;
        const full_value = parseFloat(2 * gst + without_gst).toFixed(2);
        const tgst = document.getElementById('tgst');
        tgst.textContent = `${2 * gst}`;
        const basic_value = document.querySelectorAll('.basic_value');
        basic_value.forEach(function (el_val) { // Changed variable name e to el_val to avoid conflict
            el_val.textContent = `${without_gst}`;
        });
        half_gst.forEach(function (element) {
            element.textContent = `${gst}`;
        });

        const main_with_gst_value = document.getElementById('main_with_gst_value');
        main_with_gst_value.textContent = `${full_value}`;

        const rounded = document.getElementById('rounded');
        const rounded_value = (mainval - full_value).toFixed(2);
        rounded.textContent = `${rounded_value}`;

        const car_details_input = document.getElementById('car_details_input').value;
        const car_details = document.getElementById('car_details');
        car_details.innerText = car_details_input.toUpperCase();


        const otherDetails = document.getElementById("car_details_input2").value;
        document.getElementById("other_output").innerText = otherDetails.toUpperCase();

        const color_input = document.getElementById('color_input').value;
        const color = document.getElementById('color');
        color.textContent = `${color_input.toUpperCase()} COLOUR`;
        const ch_input = document.getElementById('ch_input').value;
        const ch_output = document.getElementById('ch_output');
        ch_output.textContent = `${ch_input.toUpperCase()}`;
        const quantity_input = document.getElementById('quantity_input').value;
        const quantity_output = document.getElementById('quantity_output')
        quantity_output.textContent = `${quantity_input} NOS`;

        const word = ConvertNumberToWords(mainval);
        const amount_word = document.getElementById('amount_word');
        amount_word.textContent = `${word.toUpperCase()} ONLY.`;

        const basicword = document.getElementById('basicword');
        let gh = without_gst;
        let beforePoint = Math.floor(gh);
        let afterPoint = Math.round((gh - beforePoint) * 100);
        const a = ConvertNumberToWords(beforePoint);
        const b = ConvertNumberToWords(afterPoint);
        const basword = `${a}` + ' AND ' + `${b}`;
        basicword.textContent = `${basword.toUpperCase()} PAISA ONLY`;



        const biller_name_input = document.getElementById('biller_name_input');
        const biller_name_value = biller_name_input.value;

        const spanBillerName = document.getElementById('biller_name');
        spanBillerName.textContent = `${biller_name_value.toUpperCase()}`;

        const city_name_input_val = document.getElementById('city').value;
        const PS_input_val = document.getElementById('P.S').value;
        const PO_input_val = document.getElementById('P.O').value;
        const dist_input_val = document.getElementById('dist').value;
        const pincode_input_val = document.getElementById('pincode').value;
        const invoice_input_val = document.getElementById('invoice').value;


        const city_output = document.getElementById('city_output');
        city_output.textContent = `${city_name_input_val.toUpperCase()} , ${PS_input_val.toUpperCase()} ,${PO_input_val.toUpperCase()}`;
        const dist_output = document.getElementById('dist_output');
        dist_output.textContent = `${dist_input_val.toUpperCase()} , WEST BENGAL`;
        const pincode_output = document.getElementById('pincode_output');
        pincode_output.textContent = `${pincode_input_val}`;
        const invoice_bill = document.getElementById('invoice_bill');
        invoice_bill.textContent = `${invoice_input_val}`;
        const gst_name_input = document.getElementById('gst_name_input').value;
        const gst_output = document.getElementById('gstname');
        gst_output.textContent = `${gst_name_input.toUpperCase()}`;


        const biller_number_input_val = document.getElementById('biller_number_input').value;
        const biller_aadhar_input_val = document.getElementById('biller_aadhar_input').value;

        const aadhar_output = document.getElementById('aadhar_output');
        aadhar_output.textContent = `${biller_aadhar_input_val}`;

        const number_output = document.getElementById('number_output');
        number_output.textContent = `${biller_number_input_val}`;
        const pb1 = document.getElementById('pb1');
        pb1.classList.remove("hidden");
        pb1.addEventListener('click', () => {
            const pb2 = document.getElementById('pb2');
            pb2.classList.remove("hidden");
            pb1.classList.add("hidden");
            const sample_form_inner = document.getElementById('sample_form'); // Renamed to avoid conflict with outer scope
            sample_form_inner.classList.add("hidden");
            const print = document.getElementById('printBtn');
            print.addEventListener('click', function () {
                printInvoice(invoice_input_val);
                fetch(scriptURL, {
                    method: 'POST',
                    body: new FormData(form)
                })
                .then(response => {
                    console.log("Form submitted successfully to Google Sheets");
                    alert("Bill details are successfully sent to server (Google Sheets)....");
                })
                .catch(error => {
                    console.error('Error submitting to Google Sheets!', error.message);
                });

                const invoiceData = {
                    invoiceNumber: document.getElementById('invoice').value,
                    date: document.getElementById('date_input').value,
                    customerName: document.getElementById('biller_name_input').value,
                    Contact: document.getElementById('biller_number_input').value,
                    Aadhar: document.getElementById('biller_aadhar_input').value,
                    GSTIN: document.getElementById('gst_name_input').value,
                    City: document.getElementById('city').value,
                    P_S: document.getElementById('P.S').value,
                    P_O: document.getElementById('P.O').value,
                    District: document.getElementById('dist').value,
                    Pincode: document.getElementById('pincode').value,
                    E_rickshaw: document.getElementById('car_details_input').value,
                    Color: document.getElementById('color_input').value,
                    Other_Details: document.getElementById('car_details_input2').value,
                    Qty: document.getElementById('quantity_input').value,
                    Chassis: document.getElementById('ch_input').value,
                    amount: parseFloat(document.getElementById('gstinput').value)
                };
        
                fetch('https://msenterprise.onrender.com/api/invoices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(invoiceData),
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().catch(() => response.text()).then(errBody => {
                            console.error("Error response body from MongoDB save:", errBody);
                            throw new Error(`Failed to save invoice to MongoDB. Status: ${response.status}. Body: ${typeof errBody === 'string' ? errBody : JSON.stringify(errBody)}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Invoice saved to MongoDB:', data);
                    alert('Invoice details also saved to database (MongoDB)!');
                })
                .catch(error => {
                    console.error('Error saving invoice to MongoDB:', error);
                    alert('Error saving invoice to database (MongoDB): ' + error.message);
                });
            });
        });
    });
});




// --- Added by Manus for View Previous Invoices feature ---
document.addEventListener("DOMContentLoaded", function () {
    const viewButton = document.getElementById("view_previous_invoices_btn");
    const invoicesContainer = document.getElementById("previous_invoices_container");
    const invoicesList = document.getElementById("invoices_list");

    if (viewButton && invoicesContainer && invoicesList) {
        viewButton.addEventListener("click", async function () {
            // Toggle visibility of the container
            if (invoicesContainer.style.display === "none" || invoicesContainer.style.display === "") {
                invoicesContainer.style.display = "block";
                // Fetch and display invoices
                try {
                    const response = await fetch("https://msenterprise.onrender.com/api/invoices");
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const invoices = await response.json();
                    
                    invoicesList.innerHTML = ""; // Clear previous list

                    if (invoices.length === 0) {
                        const listItem = document.createElement("li");
                        listItem.textContent = "No invoices found.";
                        invoicesList.appendChild(listItem);
                    } else {
                        invoices.forEach(invoice => {
                            const listItem = document.createElement("li");
                            listItem.textContent = `Invoice #: ${invoice.invoiceNumber} - Customer: ${invoice.customerName} - Date: ${new Date(invoice.date).toLocaleDateString()} - Amount: ${invoice.amount}`;
                            invoicesList.appendChild(listItem);
                        });
                    }
                } catch (error) {
                    console.error("Error fetching invoices:", error);
                    invoicesList.innerHTML = "<li>Error loading invoices. Please check the console.</li>";
                }
            } else {
                invoicesContainer.style.display = "none";
                invoicesList.innerHTML = ""; // Clear list when hiding
            }
        });
    }
});

