// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    document.getElementById('purchaseOrderDate').value = today;

    // Add event listeners
    setupEventListeners();
    updateCalculations();
});

function setupEventListeners() {
    // Add product button
    document.getElementById('addProduct').addEventListener('click', addProduct);

    // Tax checkboxes
    document.querySelectorAll('.tax-section input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // If IGST is checked, uncheck CGST and SGST
            if (this.id === 'igst' && this.checked) {
                document.getElementById('cgst').checked = false;
                document.getElementById('sgst').checked = false;
            }
            // If CGST or SGST is checked, uncheck IGST
            if ((this.id === 'cgst' || this.id === 'sgst') && this.checked) {
                document.getElementById('igst').checked = false;
            }
            updateCalculations();
        });
    });

    // Preview button
    document.getElementById('previewBtn').addEventListener('click', showPreview);

    // Download PDF button
    document.getElementById('downloadBtn').addEventListener('click', downloadPDF);

    // Product calculations
    updateProductListeners();
}

function updateProductListeners() {
    document.querySelectorAll('.product-item').forEach((item, index) => {
        const qty = item.querySelector('.product-qty');
        const rate = item.querySelector('.product-rate');
        const amount = item.querySelector('.product-amount');
        const removeBtn = item.querySelector('.remove-product');

        // Update amount on qty or rate change
        [qty, rate].forEach(input => {
            input.removeEventListener('input', calculateProductAmount);
            input.addEventListener('input', calculateProductAmount);
        });

        function calculateProductAmount() {
            const qtyVal = parseFloat(qty.value) || 0;
            const rateVal = parseFloat(rate.value) || 0;
            amount.value = (qtyVal * rateVal).toFixed(2);
            updateCalculations();
        }

        // Show remove button for non-first items
        if (index > 0) {
            removeBtn.style.display = 'block';
            removeBtn.addEventListener('click', function() {
                item.remove();
                updateCalculations();
            });
        }
    });
}

function addProduct() {
    const productsList = document.getElementById('productsList');
    const newProduct = document.createElement('div');
    newProduct.className = 'product-item';
    newProduct.innerHTML = `
        <div class="product-grid">
            <div class="form-group">
                <label>Product/Item:</label>
                <input type="text" class="product-name" placeholder="Product name">
            </div>

            <div class="form-group">
                <label>Price:</label>
                <input type="number" class="product-price" placeholder="0.00" step="0.01">
            </div>

            <div class="form-group">
                <label>UOM:</label>
                <input type="text" class="product-uom" placeholder="Nos.">
            </div>

            <div class="form-group">
                <label>QTY:</label>
                <input type="number" class="product-qty" placeholder="1" min="1">
            </div>

            <div class="form-group">
                <label>Rate:</label>
                <input type="number" class="product-rate" placeholder="0.00" step="0.01">
            </div>

            <div class="form-group">
                <label>Amount:</label>
                <input type="number" class="product-amount" readonly>
            </div>

            <button type="button" class="remove-product">Remove</button>
        </div>
    `;

    productsList.appendChild(newProduct);
    updateProductListeners();
}

function updateCalculations() {
    let subTotal = 0;

    // Calculate subtotal
    document.querySelectorAll('.product-amount').forEach(amount => {
        subTotal += parseFloat(amount.value) || 0;
    });

    // Update subtotal display
    document.getElementById('subTotal').textContent = '₹ ' + subTotal.toFixed(2);

    // Calculate taxes
    let cgstAmount = 0;
    let sgstAmount = 0;
    let cessAmount = 0;
    let igstAmount = 0;

    // CGST - always show, calculate only if checked
    if (document.getElementById('cgst').checked) {
        cgstAmount = subTotal * 0.09;
    }
    document.getElementById('cgstAmount').querySelector('span:last-child').textContent = '₹ ' + cgstAmount.toFixed(2);

    // SGST - always show, calculate only if checked
    if (document.getElementById('sgst').checked) {
        sgstAmount = subTotal * 0.09;
    }
    document.getElementById('sgstAmount').querySelector('span:last-child').textContent = '₹ ' + sgstAmount.toFixed(2);

    // CESS - always show, calculate only if checked
    if (document.getElementById('cess').checked) {
        cessAmount = subTotal * 0.01;
    }
    document.getElementById('cessAmount').querySelector('span:last-child').textContent = '₹ ' + cessAmount.toFixed(2);

    // IGST - always show, calculate only if checked
    if (document.getElementById('igst').checked) {
        igstAmount = subTotal * 0.18;
    }
    document.getElementById('igstAmount').querySelector('span:last-child').textContent = '₹ ' + igstAmount.toFixed(2);

    // Calculate total
    const totalAmount = subTotal + cgstAmount + sgstAmount + cessAmount + igstAmount;
    document.getElementById('totalAmount').textContent = '₹ ' + totalAmount.toFixed(2);
}

function showPreview() {
    // Populate preview with form data
    document.getElementById('previewInvoiceNo').textContent = document.getElementById('invoiceNo').value || 'A000';

    const invoiceDate = new Date(document.getElementById('invoiceDate').value);
    document.getElementById('previewDate').textContent = invoiceDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '-');

    document.getElementById('previewCustomerName').textContent = document.getElementById('customerName').value || 'N/A';
    const customerAddress = document.getElementById('customerAddress').value || 'N/A';
    document.getElementById('previewCustomerAddress').textContent = customerAddress;
    document.getElementById('previewCustomerContact').textContent = document.getElementById('customerContact').value || 'N/A';
    document.getElementById('previewCustomerGST').textContent = document.getElementById('customerGST').value || 'N/A';

    document.getElementById('previewPONo').textContent = document.getElementById('purchaseOrderNo').value || 'N/A';

    const poDate = document.getElementById('purchaseOrderDate').value;
    if (poDate) {
        const date = new Date(poDate);
        document.getElementById('previewPODate').textContent = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '/');
    } else {
        document.getElementById('previewPODate').textContent = 'N/A';
    }

    document.getElementById('previewVehicleNo').textContent = document.getElementById('vehicleNo').value || 'N/A';
    document.getElementById('previewDeliveryNote').textContent = document.getElementById('deliveryNoteNo').value || 'N/A';

    // Populate products table
    const tbody = document.getElementById('previewProductsBody');
    tbody.innerHTML = '';
    let subTotal = 0;
    let productCount = 0;

    document.querySelectorAll('.product-item').forEach((item, index) => {
        const name = item.querySelector('.product-name').value;
        const price = item.querySelector('.product-price').value;
        const uom = item.querySelector('.product-uom').value;
        const qty = item.querySelector('.product-qty').value;
        const rate = item.querySelector('.product-rate').value;
        const amount = item.querySelector('.product-amount').value;

        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${name || ''}</td>
            <td>${price || ''}</td>
            <td>${uom || ''}</td>
            <td>${qty || ''}</td>
            <td>${rate || ''}</td>
            <td>${amount || ''}</td>
        `;

        if (name || price || qty || rate) {
            subTotal += parseFloat(amount) || 0;
            productCount++;
        }
    });

    // Add empty rows to make the table look consistent (minimum 10 rows)
    const currentRows = tbody.children.length;
    const minRows = 10;

    for (let i = currentRows; i < minRows; i++) {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        `;
    }

    // Add tax rows
    const tfoot = document.querySelector('.products-table tfoot');
    tfoot.innerHTML = `
        <tr>
            <td colspan="6">Sub Total</td>
            <td>${subTotal.toFixed(2)}</td>
        </tr>
    `;

    let totalAmount = subTotal;

    // CGST - always show, calculate only if checked
    const cgst = document.getElementById('cgst').checked ? subTotal * 0.09 : 0;
    totalAmount += cgst;
    const cgstRow = tfoot.insertRow();
    cgstRow.innerHTML = `
        <td colspan="6">CGST 9%</td>
        <td>${cgst.toFixed(2)}</td>
    `;

    // SGST - always show, calculate only if checked
    const sgst = document.getElementById('sgst').checked ? subTotal * 0.09 : 0;
    totalAmount += sgst;
    const sgstRow = tfoot.insertRow();
    sgstRow.innerHTML = `
        <td colspan="6">SGST 9%</td>
        <td>${sgst.toFixed(2)}</td>
    `;

    // CESS - always show, calculate only if checked
    const cess = document.getElementById('cess').checked ? subTotal * 0.01 : 0;
    totalAmount += cess;
    const cessRow = tfoot.insertRow();
    cessRow.innerHTML = `
        <td colspan="6">CESS 1%</td>
        <td>${cess.toFixed(2)}</td>
    `;

    // IGST - always show, calculate only if checked
    const igst = document.getElementById('igst').checked ? subTotal * 0.18 : 0;
    totalAmount += igst;
    const igstRow = tfoot.insertRow();
    igstRow.innerHTML = `
        <td colspan="6">IGST 18%</td>
        <td>${igst.toFixed(2)}</td>
    `;

    document.getElementById('previewTotalAmount').textContent = '₹ ' + totalAmount.toFixed(2);
    document.getElementById('amountInWords').textContent = 'Rupees ' + numberToWords(Math.floor(totalAmount)) + ' Only';

    document.getElementById('previewStampedOn').textContent = document.getElementById('stampedOn').value || 'N/A';
    document.getElementById('previewNextStamping').textContent = document.getElementById('nextStamping').value || 'N/A';

    // Show preview
    document.getElementById('invoicePreview').style.display = 'block';
    document.getElementById('downloadBtn').style.display = 'inline-block';

    // Scroll to preview
    document.getElementById('invoicePreview').scrollIntoView({
        behavior: 'smooth'
    });
}

function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    function convertHundreds(n) {
        let result = '';

        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }

        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        } else if (n >= 10) {
            result += teens[n - 10] + ' ';
            return result;
        }

        if (n > 0) {
            result += ones[n] + ' ';
        }

        return result;
    }

    if (num < 1000) {
        return convertHundreds(num).trim();
    }

    let result = '';

    if (num >= 100000) {
        result += convertHundreds(Math.floor(num / 100000)).trim() + ' Lakh ';
        num %= 100000;
    }

    if (num >= 1000) {
        result += convertHundreds(Math.floor(num / 1000)).trim() + ' Thousand ';
        num %= 1000;
    }

    if (num > 0) {
        result += convertHundreds(num);
    }

    return result.trim();
}

async function downloadPDF() {
    const element = document.querySelector('.invoice-container');
    const opt = {
        margin: 0,
        filename: `invoice_${document.getElementById('invoiceNo').value || 'draft'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use html2canvas and jsPDF
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const padding = 5; // 40mm padding
    const imgWidth = 210 - (padding * 2); // Reduce width by padding on both sides
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = padding; // Start position with padding from top

    pdf.addImage(imgData, 'PNG', padding, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', padding, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    pdf.save(`invoice_${document.getElementById('invoiceNo').value || 'draft'}.pdf`);
}