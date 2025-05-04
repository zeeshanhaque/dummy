/**
 * Format a date input value to the required format
 * @param {string} inputValue - The date/time input value
 * @returns {string} Formatted date/time string
 */
export function formatDateTime(inputValue) {
    if (!inputValue) return "";
    const date = new Date(inputValue);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day}/${year} ${hours}:${minutes}`;
}

/**
 * Validate the incident number format
 * @param {string} num - The incident number to validate
 * @returns {object} Validation result with success status and potential warning
 */
export function validateIncident(num) {
    // First check basic format
    const formatValid = /^INC[0-9]{8}$/.test(num);
    
    if (!formatValid) {
      return { 
        isValid: false,
        startsWithZero: false,
        message: "Ensure INC is in format INC12345678"
      };
    }
    
    // Check if the number portion starts with 0
    const startsWithZero = /^INC0/.test(num);
    
    return {
      isValid: true,
      startsWithZero: startsWithZero,
      message: startsWithZero ? "Incident number starts with zero" : ""
    };
}

/**
 * Create a row template for progress entries
 * @param {Object} entry - The progress entry object
 * @returns {string} HTML string for the table row
 */
export function rowTemplate(entry) {
    return `<tr>
        <td colspan="1">${entry.datetime}</td>
        <td colspan="3">${entry.text}</td>
    </tr>`;
}

/**
 * Format a list input value to the required format
 * @param {Array} items - The date/time input value
 * @returns {string} Formatted date/time string
 */
export function formatList(items) {
    if (!Array.isArray(items)) return '';

    const len = items.length;

    if (len === 0) return '';
    if (len === 1) return items[0];
    if (len === 2) return `${items[0]} and ${items[1]}`;

    const allButLast = items.slice(0, -1).join(', ');
    const lastItem = items[len - 1];
    return `${allButLast}, and ${lastItem}`;
}

/**
 * Set up clipboard functionality for copy buttons
 */
export function setupClipboard() {
    // Setup copy table button
    document.getElementById('copyButton').addEventListener('click', function() {
        copyTableWithStyles();
    });

    // Setup copy recipient button
    document.getElementById('copyToBtn').addEventListener('click', function() {
        const content = document.getElementById('recepient-body').textContent;
        copyToClipboard(content, 'copyToSuccess');
    });

    // Setup copy subject button
    document.getElementById('copySubBtn').addEventListener('click', function() {
        const content = document.getElementById('subject-body').textContent;
        copyToClipboard(content, 'copySubSuccess');
    });
}

/**
 * Copy text content to clipboard
 * @param {string} content - The content to copy
 * @param {string} successElementId - The ID of the success message element
 */
function copyToClipboard(content, successElementId) {
    navigator.clipboard.writeText(content).then(() => {
        const message = document.getElementById(successElementId);
        message.style.display = 'block';
        setTimeout(() => { message.style.display = 'none'; }, 1250);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

/**
 * Copy table with styles to clipboard
 */
function copyTableWithStyles() {
    // Get the table HTML content with styles
    const tableContent = document.getElementById('outputContent').innerHTML;
    
    // Create a temporary element with the styled content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tableContent;
    
    // Apply table styles
    const table = tempDiv.querySelector('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    
    // Apply styles to all cells
    const cells = table.querySelectorAll('td');
    cells.forEach(cell => {
        cell.style.border = '1px solid #000';
        cell.style.padding = '8px';
        cell.style.height = '40px';
    });
    
    // Apply specific styles
    applySpecificStyles(table);
    
    // Create a blob with HTML content including basic CSS
    const htmlContent = `
    <html>
    <head>
        <style>
            body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; }
            .table-title { color: green; font-weight: bold; font-size: 18px; text-align: center; }
            .input-question { background-color: green; font-weight: bold; color: white; width: 25%; }
            .input-answer { width: 25%; }
            .progress-header { background-color: #f0f0f0; font-weight: bold; text-align: center; }
            .abcd { padding: 5px; border-radius: 3px; text-align: center; font-weight: bold; }
            
            /* Service status colors */
            .status-available { background-color: #6fc040; color: white; }
            .status-observation { background-color: #0070d2; color: white; }
            .status-unavailable { background-color: yellow; color: black; }
            .status-degraded { background-color: red; color: white; }
        </style>
    </head>
    <body>
        ${tempDiv.innerHTML}
    </body>
    </html>
    `;
    
    try {
        // Use the Clipboard API to copy HTML content
        const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' })
        });
        
        navigator.clipboard.write([clipboardItem]).then(() => {
            showCopySuccess();
        }).catch(err => {
            console.error('Failed to copy: ', err);
            // Fallback method for browsers that don't support ClipboardItem
            fallbackCopyMethod(htmlContent);
        });
    } catch (error) {
        console.error('ClipboardItem not supported: ', error);
        fallbackCopyMethod(htmlContent);
    }
}

/**
 * Apply specific styles to table elements
 * @param {HTMLElement} table - The table element
 */
function applySpecificStyles(table) {
    const logo = table.querySelector('.bnp-logo');
    if (logo) logo.style.width = '100%';
    
    const tableTitle = table.querySelector('.table-title');
    if (tableTitle) {
        tableTitle.style.color = 'green';
        tableTitle.style.fontWeight = 'bold';
        tableTitle.style.fontSize = '18px';
        tableTitle.style.textAlign = 'center';
    }
    
    // Apply input-question styles
    const questionCells = table.querySelectorAll('.input-question');
    questionCells.forEach(cell => {
        cell.style.backgroundColor = 'green';
        cell.style.fontWeight = 'bold';
        cell.style.color = 'white';
        cell.style.width = '25%';
    });
    
    // Apply input-answer styles
    const answerCells = table.querySelectorAll('.input-answer');
    answerCells.forEach(cell => {
        cell.style.width = '25%';
    });
    
    // Apply progress-header styles
    const progressHeaders = table.querySelectorAll('.progress-header');
    progressHeaders.forEach(header => {
        header.style.backgroundColor = '#f0f0f0';
        header.style.fontWeight = 'bold';
        header.style.textAlign = 'center';
    });

}

/**
 * Show copy success message
 */
function showCopySuccess() {
    const successMessage = document.getElementById('copySuccess');
    successMessage.style.display = 'block';
    setTimeout(() => { successMessage.style.display = 'none'; }, 1250);
}

/**
 * Fallback copy method for browsers that don't support ClipboardItem
 * @param {string} htmlContent - The HTML content to copy
 */
function fallbackCopyMethod(htmlContent) {
    // Create an iframe to hold our content
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    document.body.appendChild(iframe);
    
    // Write content to the iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    // Try to select and copy the content
    try {
        iframeDoc.designMode = 'on';
        iframeDoc.execCommand('selectAll', false, null);
        iframeDoc.execCommand('copy', false, null);
        iframeDoc.designMode = 'off';
        showCopySuccess();
    } catch (err) {
        console.error('Fallback copy method failed:', err);
    } finally {
        // Clean up
        document.body.removeChild(iframe);
    }
}