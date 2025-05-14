document.addEventListener('DOMContentLoaded', () => {
    // Number to Words Conversion (remains unchanged)
    function ConvertNumberToWords(number) {
        const belowTwenty = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        const thousands = ["", "Thousand", "Lakh", "Crore"];

        if (number === 0) return "Zero";
        if (isNaN(number)) return "Invalid number";

        let numStr = parseFloat(number).toFixed(2).toString(); // Ensure two decimal places for paisa
        let words = "";

        let [integerPartStr, decimalPartStr] = numStr.split(".");
        let integerPart = parseInt(integerPartStr);
        let decimalPart = parseInt(decimalPartStr);

        words = convertIntegerPart(integerPart) + " Rupees";

        if (decimalPart > 0) {
            words += " and " + convertIntegerPart(decimalPart) + " Paisa"; // Use convertIntegerPart for paisa too
        }
        return words + " Only";

        function convertIntegerPart(num) {
            if (num === 0) return "Zero";
            let numAsStr = num.toString();
            let result = "";
            
            if (numAsStr.length > 7) { // Crore
                result += convertHundreds(numAsStr.slice(0, -7)) + " Crore ";
                numAsStr = numAsStr.slice(-7);
            }
            if (numAsStr.length > 5) { // Lakh
                result += convertHundreds(numAsStr.slice(0, -5)) + " Lakh ";
                numAsStr = numAsStr.slice(-5);
            }
            if (numAsStr.length > 3) { // Thousand
                result += convertHundreds(numAsStr.slice(0, -3)) + " Thousand ";
                numAsStr = numAsStr.slice(-3);
            }
            result += convertHundreds(numAsStr);
            return result.trim();
        }

        function convertHundreds(numStr) {
            let num = parseInt(numStr);
            if (num === 0) return "";
            let tempWords = "";
            if (num >= 100) {
                tempWords += belowTwenty[Math.floor(num / 100)] + " Hundred ";
                num %= 100;
            }
            if (num > 0) {
                if (num < 20) {
                    tempWords += belowTwenty[num] + " ";
                } else {
                    tempWords += tens[Math.floor(num / 10)] + " ";
                    if (num % 10 > 0) {
                        tempWords += belowTwenty[num % 10] + " ";
                    }
                }
            }
            return tempWords;
        }
    }

    // Fetch Google Sheets URL from backend (remains unchanged)
    let scriptURL;
    fetch('/config')
        .then(response => response.json())
        .then(config => {
            scriptURL = config.googleSheetUrl;
        })
        .catch(err => console.error('Failed to fetch config:', err));

    const actualFormElement = document.getElementById('sample_form');
    const submitButton = document.getElementById('but');

    if (submitButton && actualFormElement) {
        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Validate form before proceeding
            if (!actualFormElement.checkValidity()) {
                actualFormElement.reportValidity();
                return;
            }

            document.getElementById('sample_form').style.display = 'none';
            document.getElementById('main_formm').style.display = 'block';

            // Collect form data with correct IDs
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
                E_rickshaw: document.getElementById('car_details_input').value, // Matches schema
                Color: document.getElementById('color_input').value,
                Other_Details: document.getElementById('car_details_input2').value,
                Qty: document.getElementById('quantity_input').value,
                Chassis: document.getElementById('ch_input').value,
                amount: parseFloat(document.getElementById('gstinput').value) // Base amount
            };

            let baseAmount = invoiceData.amount;
            let gstRate = 5; // 5% GST
            let cgst = (baseAmount * (gstRate / 2)) / 100;
            let sgst = cgst;
            let totalAmount = baseAmount + cgst + sgst;
            let totalGST = cgst + sgst;

            // Update DOM with correct IDs
            document.getElementById('date_output').textContent = new Date(invoiceData.date).toLocaleDateString('en-GB'); // Format date
            document.getElementById('invoice_bill').textContent = invoiceData.invoiceNumber;
            document.getElementById('biller_name').textContent = invoiceData.customerName;
            document.getElementById('city_output').textContent = `${invoiceData.City}, P.O: ${invoiceData.P_O}, P.S: ${invoiceData.P_S}`;
            document.getElementById('dist_output').textContent = invoiceData.District;
            document.getElementById('pincode_output').textContent = invoiceData.Pincode;
            document.getElementById('number_output').textContent = invoiceData.Contact;
            document.getElementById('aadhar_output').textContent = invoiceData.Aadhar;
            document.getElementById('gstname').textContent = invoiceData.GSTIN || 'NA';
            document.getElementById('car_details').textContent = invoiceData.E_rickshaw;
            document.getElementById('color').textContent = invoiceData.Color;
            document.getElementById('ch_output').textContent = invoiceData.Chassis;
            document.getElementById('other_output').innerHTML = invoiceData.Other_Details.replace(/\n/g, '<br>'); // Preserve newlines
            document.getElementById('quantity_output').textContent = invoiceData.Qty;
            
            document.querySelectorAll('.basic_value').forEach(el => el.textContent = baseAmount.toFixed(2));
            document.getElementById('subtotal').innerHTML = `<b>${baseAmount.toFixed(2)}</b>`;
            document.querySelectorAll('.gst').forEach(el => el.textContent = cgst.toFixed(2)); // Assumes CGST and SGST are same and displayed similarly
            
            // Rounded off logic - current HTML has static +0.01. If it needs to be dynamic, this needs adjustment.
            // For now, let's assume the totalAmount is the final one and rounding is for display only.
            // const roundedOff = Math.round(totalAmount * 100)/100 - totalAmount; // Example if dynamic rounding needed
            // document.getElementById('rounded').innerHTML = `<b>${roundedOff.toFixed(2)}</b>`;
            document.getElementById('main_with_gst_value').textContent = totalAmount.toFixed(2);
            document.getElementById('amount_word').textContent = ConvertNumberToWords(totalAmount);

            // Update tax table section
            document.getElementById('tgst').textContent = totalGST.toFixed(2);
            // Assuming the HSN/SAC table's basic_value and gst also need update based on current invoice
            const taxTableBasicValue = document.querySelector('.invoice-table-body td:nth-child(2)');
            if (taxTableBasicValue) taxTableBasicValue.textContent = baseAmount.toFixed(2);
            const taxTableCGSTAmount = document.querySelector('.invoice-table-body td:nth-child(4)');
            if (taxTableCGSTAmount) taxTableCGSTAmount.textContent = cgst.toFixed(2);
            const taxTableSGSTAmount = document.querySelector('.invoice-table-body td:nth-child(6)');
            if (taxTableSGSTAmount) taxTableSGSTAmount.textContent = sgst.toFixed(2);
            document.getElementById('basicword').textContent = ConvertNumberToWords(totalGST) + " Only";

            // Save to Google Sheets (Corrected form ID)
            if (scriptURL) {
                fetch(scriptURL, { method: 'POST', body: new FormData(actualFormElement) })
                    .then(response => console.log('Form submitted to Google Sheets'))
                    .catch(error => console.error('Google Sheets error:', error));
            } else {
                console.warn('scriptURL for Google Sheets is not defined. Skipping Google Sheets submission.');
            }

            // Save to MongoDB (sending the more complete invoiceData)
            // The backend schema expects 'amount' to be the total amount. Let's adjust.
            const mongoPayload = {...invoiceData, amount: totalAmount }; 

            fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mongoPayload) // Send the corrected and complete data
            })
            .then(response => response.json())
            .then(data => {
                if (data._id) { // Check if save was successful by looking for an _id
                    console.log('Invoice saved to MongoDB:', data);
                    // Show Preview and Print buttons only after successful save
                    const previewButtonContainer = document.getElementById('pb1');
                    if (previewButtonContainer) previewButtonContainer.classList.remove('hidden');
                    
                    const printButtonContainer = document.getElementById('pb2');
                    if (printButtonContainer) printButtonContainer.classList.remove('hidden');
                } else {
                    console.error('Error saving invoice to MongoDB:', data.message || data);
                    alert('There was an error saving the invoice to the database. Please try again. Details: ' + (data.message || JSON.stringify(data)));
                }
            })
            .catch(err => {
                console.error('MongoDB save fetch error:', err);
                alert('There was a network error saving the invoice. Please try again. Details: ' + err.message);
            });

            // Moved button visibility to after successful save
        });
    } else {
        console.error('Submit button or form not found. Script cannot proceed.');
    }

    // PDF Generation (remains largely unchanged, ensure printBtn is correctly referenced if used here)
    // The printBtn in HTML is id="printBtn", its container is id="pb2"
    // The printInvoice function is globally exposed, so the button in HTML should be <button id='printBtn' onclick='printInvoice()' ...>
    // Or, we add an event listener to it.
    const printActualButton = document.getElementById('printBtn');
    if(printActualButton){
        printActualButton.addEventListener('click', printInvoice);
    }

    function printInvoice() {
        const element = document.getElementById('main_formm');
        // Temporarily hide buttons that shouldn't be in the PDF
        const viewPreviousButton = document.getElementById('view_previous_invoices_btn');
        const toolbar = document.querySelector('.toolbar');
        let viewPreviousDisplayStyle, toolbarDisplayStyle;

        if (viewPreviousButton) {
            viewPreviousDisplayStyle = viewPreviousButton.style.display;
            viewPreviousButton.style.display = 'none';
        }
        if (toolbar) {
            toolbarDisplayStyle = toolbar.style.display;
            toolbar.style.display = 'none';
        }

        html2pdf().from(element).set({
            margin: [10, 10, 10, 10],
            filename: 'invoice.pdf',
            pagebreak: { mode: 'avoid-all', before: '.page-break' }, // Added a class for manual page breaks if needed
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).save().then(() => {
            // Restore button visibility
            if (viewPreviousButton) viewPreviousButton.style.display = viewPreviousDisplayStyle;
            if (toolbar) toolbar.style.display = toolbarDisplayStyle;
        }).catch(err => {
            console.error('PDF generation error:', err);
            // Restore button visibility even if error
            if (viewPreviousButton) viewPreviousButton.style.display = viewPreviousDisplayStyle;
            if (toolbar) toolbar.style.display = toolbarDisplayStyle;
        });
    }

    // View Previous Invoices (remains unchanged)
    const viewPreviousInvoicesLink = document.getElementById('view_previous_invoices_btn'); // Corrected ID from HTML
    if (viewPreviousInvoicesLink) {
        viewPreviousInvoicesLink.addEventListener('click', (e) => {
            // e.preventDefault(); // It's an <a> tag, so prevent default if not wanting navigation yet
            window.location.href = './previous_invoices.html';
        });
    }

    // Expose printInvoice globally if needed, though direct event listener is better
    window.printInvoice = printInvoice; 
});

