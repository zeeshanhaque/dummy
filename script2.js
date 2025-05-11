document.addEventListener('DOMContentLoaded', function () {
    let generateClickCount = 0;

    // Initialize utilities
    setupClipboard();
    setupDropdowns();
    setupGenerateButton();
    setupClearStorage();
    loadFromLocalStorage();

    function setupDropdowns() {
        // Services
        document.getElementById('impactedServiceDropdownHeader').addEventListener('click', function() {
            const dropdown = document.getElementById('impactedServiceDropdownList');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Users
        document.getElementById('impactedUsersDropdownHeader').addEventListener('click', function() {
            const dropdown = document.getElementById('impactedUsersDropdownlist');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            const serviceDropdown = document.getElementById('impactedServiceDropdown');
            const serviceList = document.getElementById('impactedServiceDropdownList');
            const usersDropdown = document.getElementById('impactedUsersDropdown');
            const usersList = document.getElementById('impactedUsersDropdownlist');

            if (!serviceDropdown.contains(event.target)) {
                serviceList.style.display = 'none';
            }
            if (!usersDropdown.contains(event.target)) {
                usersList.style.display = 'none';
            }
        });
        
        // Real-time updates for service selection
        const serviceCheckboxes = document.querySelectorAll('input[name="impacted-service"]');
        serviceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateServiceSelectionDisplay();
            });
        });
        
        // Real-time updates for user selection
        const userCheckboxes = document.querySelectorAll('input[name="impacted-users"]');
        userCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateUserSelectionDisplay();
            });
        });
    }
    
    function updateServiceSelectionDisplay() {
        const selectedServices = Array.from(
            document.querySelectorAll('input[name="impacted-service"]:checked')
        ).map(checkbox => checkbox.value);
        
        const impactedServiceSelections = document.getElementById('selectedImpacted');
        impactedServiceSelections.textContent = selectedServices.length > 0 ? selectedServices.join(', ') : 'Select';
        
        // Save selected services to localStorage
        localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    }
    
    function updateUserSelectionDisplay() {
        const selectedUsers = Array.from(
            document.querySelectorAll('input[name="impacted-users"]:checked')
        ).map(checkbox => checkbox.value);
        
        const impactedUsersSelections = document.getElementById('selectedImpactedUsers');
        impactedUsersSelections.textContent = selectedUsers.length > 0 ? selectedUsers.join(', ') : 'Select';
        
        // Save selected users to localStorage
        localStorage.setItem('selectedUsers', JSON.stringify(selectedUsers));
    }

    function loadFromLocalStorage() {
        // Load form field values
        document.getElementById('incident-num').value = localStorage.getItem('incidentNum') || '';
        document.getElementById('service-status').value = localStorage.getItem('serviceStatus') || 'Available';
        document.getElementById('description').value = localStorage.getItem('description') || '';
        document.getElementById('impact').value = localStorage.getItem('impact') || '';
        document.getElementById('start-time').value = localStorage.getItem('startTime') || '';
        document.getElementById('end-time').value = localStorage.getItem('endTime') || '';
        document.getElementById('next-update').value = localStorage.getItem('nextUpdate') || '';
        
        // Load and check service selections
        const savedServices = JSON.parse(localStorage.getItem('selectedServices')) || [];
        savedServices.forEach(service => {
            const checkbox = document.querySelector(`input[name="impacted-service"][value="${service}"]`);
            if (checkbox) checkbox.checked = true;
        });
        updateServiceSelectionDisplay();
        
        // Load and check user selections
        const savedUsers = JSON.parse(localStorage.getItem('selectedUsers')) || [];
        savedUsers.forEach(user => {
            const checkbox = document.querySelector(`input[name="impacted-users"][value="${user}"]`);
            if (checkbox) checkbox.checked = true;
        });
        updateUserSelectionDisplay();
    }

    function setupClearStorage() {
        document.getElementById('clearStorage').addEventListener('click', function() {
            // Add confirmation dialog before clearing storage
            if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
                localStorage.clear();
                
                // Reset form fields
                document.getElementById('dataform').reset();
                document.getElementById('selectedImpacted').textContent = 'Select';
                document.getElementById('selectedImpactedUsers').textContent = 'Select';
                
                // Hide output sections
                document.getElementById('copyToBtn').style.display = 'none';
                document.getElementById('copySubBtn').style.display = 'none';
                document.getElementById('copyButton').style.display = 'none';
                document.getElementById('outputRecepient').innerHTML = '';
                document.getElementById('outputSubject').innerHTML = '';
                document.getElementById('outputContent').innerHTML = '';
            }
        });
    }

    function setupGenerateButton() {
        document.getElementById('generateButton').addEventListener('click', function () {
            const incidentNum = document.getElementById('incident-num').value.trim();
            const serviceStatus = document.getElementById('service-status').value;
            const description = document.getElementById('description').value;
            const impact = document.getElementById('impact').value;
            const progress = document.getElementById('progress').value.trim();
            const startTimeValue = document.getElementById('start-time').value;
            const endTimeValue = document.getElementById('end-time').value;
            const nextUpdateValue = document.getElementById('next-update').value;
    
            const incidentInput = document.getElementById('incident-num');
            const incidentError = document.getElementById('incError');
            const startTime = formatDateTime(startTimeValue);
            const endTime = formatDateTime(endTimeValue);
            const nextUpdate = formatDateTime(nextUpdateValue);
    
            // Process the impacted services and users for validation
            const impactedServiceCheckboxes = document.querySelectorAll('input[name="impacted-service"]:checked');
            const selectedImpactedServices = Array.from(impactedServiceCheckboxes).map(checkbox => checkbox.value);
    
            const impactedUsersCheckboxes = document.querySelectorAll('input[name="impacted-users"]:checked');
            const selectedImpactedUsers = Array.from(impactedUsersCheckboxes).map(checkbox => checkbox.value);
            
            // check service selection
            if (selectedImpactedServices.length === 0) {
                alert('Please Select at least one Service/Application');
                return;
            }
    
            // check user selection
            if (selectedImpactedUsers.length === 0) {
                alert('Please Select at least one User Impacted');
                return;
            }
            
            // check incident number
            const validationResult = validateIncident(incidentNum);
            if (!validationResult.isValid) {
                incidentInput.classList.add('invalid');
                incidentError.style.display = 'block';
                generateClickCount++;
                return;
            } else {
                incidentInput.classList.remove('invalid');
                incidentError.style.display = 'none';
                
                // If incident number starts with zero, ask for confirmation
                if (validationResult.startsWithZero) {
                    const confirmZero = confirm('Incident number starts with zero. Do you want to proceed anyway?');
                    if (!confirmZero) {
                        return;
                    }
                }
            }
            
            // Progress validation
            if (!progress) {
                if (!confirm("Progress is empty, proceed?")) {
                    return;
                }
            }
    
            // All validation passed, now add progress entry if not empty
            if (progress) {
                addProgressEntry(progress);
            }
    
            // Save to localStorage after validation passes
            localStorage.setItem("incidentNum", incidentNum);
            localStorage.setItem("serviceStatus", serviceStatus);
            localStorage.setItem("description", description);
            localStorage.setItem("impact", impact);
            localStorage.setItem("startTime", startTimeValue);
            localStorage.setItem("endTime", endTimeValue);
            localStorage.setItem("nextUpdate", nextUpdateValue);
    
            // Get values from storage
            let incNumFromLS = localStorage.getItem("incidentNum");
            let serviceStatusFromLS = localStorage.getItem("serviceStatus");
            let descriptionFromLS = localStorage.getItem("description");
            let impactFromLS = localStorage.getItem("impact");
    
            // Process the impacted services and users
            const result = processSelections();
            if (!result.success) return;
            
            // Generate the output elements
            generateOutputElements(
                result.recepientList, 
                serviceStatusFromLS, 
                incNumFromLS, 
                result.impactedServiceListFromLS, 
                result.impactedUsersListFromLS, 
                startTime, 
                endTime, 
                nextUpdate, 
                descriptionFromLS, 
                impactFromLS,
                serviceStatus
            );
        });
    }

    function addProgressEntry(progress) {
        const newEntry = {
            datetime: formatDateTime(new Date()),
            text: progress
        };

        const entries = JSON.parse(localStorage.getItem('stringEntries')) || [];
        entries.push(newEntry);
        localStorage.setItem('stringEntries', JSON.stringify(entries));
        document.getElementById('progress').value = "";
    }

    function processSelections() {
        const impactedServiceCheckboxes = document.querySelectorAll('input[name="impacted-service"]:checked');
        const selectedImpactedServices = Array.from(impactedServiceCheckboxes).map(checkbox => checkbox.value);

        const impactedUsersCheckboxes = document.querySelectorAll('input[name="impacted-users"]:checked');
        const selectedImpactedUsers = Array.from(impactedUsersCheckboxes).map(checkbox => checkbox.value);

        let recepientDLs = [];

        if (selectedImpactedServices.length === 0) {
            alert('Please Select at least one Service/Application');
            return { success: false };
        }

        if (selectedImpactedUsers.length === 0) {
            alert('Please Select at least one User Impacted');
            return { success: false };
        }

        const impactedServiceList = formatList(selectedImpactedServices);
        let impactedUsersList = formatList(selectedImpactedUsers);
        impactedUsersList = impactedUsersList.length > 23 ? "GLOBAL" : impactedUsersList;

        localStorage.setItem("impactedServiceList", impactedServiceList);
        localStorage.setItem("impactedUsersList", impactedUsersList);

        let impactedServiceListFromLS = localStorage.getItem("impactedServiceList");
        let impactedUsersListFromLS = localStorage.getItem("impactedUsersList");

        // Generate recipient list
        if (selectedImpactedUsers.includes('APAC')) {
            recepientDLs.push('apac@gmail.com');
        }
        if (selectedImpactedUsers.includes('EMEA')) {
            recepientDLs.push('emea@gmail.com');
        }
        if (selectedImpactedUsers.includes('AMERICAS')) {
            recepientDLs.push('americas@gmail.com');
        }

        let recepientList = recepientDLs.join("; ");

        return { 
            success: true, 
            recepientList, 
            impactedServiceListFromLS, 
            impactedUsersListFromLS 
        };
    }

    function generateOutputElements(recepientList, serviceStatus, incidentNum, services, users, 
                                   startTime, endTime, nextUpdate, description, impact, rawServiceStatus) {
        // Generate recipient output
        const outputRecepient = `
            <div class="receient-container flex">
                <div class="to-div"><p class="to-tile"><u>T</u>o</p></div>
                <div class="to-line flex"><p class="subject-body" id="recepient-body">${recepientList}</p></div>
            </div>`;

        document.getElementById('outputRecepient').innerHTML = outputRecepient;
        document.getElementById('copyToBtn').style.display = 'block';

        // Generate subject output
        const outputSubject = `
            <div class="sub-line flex">
                <p class="subject-title">S<u>u</u>bject</p>
                <p class="subject-body" id="subject-body">[${serviceStatus}] FOREX Incident Management Notification - ${services}</p>
            </div>`;

        document.getElementById('outputSubject').innerHTML = outputSubject;
        document.getElementById('copySubBtn').style.display = 'block';

        // Generate table output
        const outputTable = generateTable(services, users, serviceStatus, startTime, endTime, 
                                        nextUpdate, incidentNum, description, impact);
        document.getElementById('outputContent').innerHTML = outputTable;
        document.getElementById('copyButton').style.display = "block";

        // Load progress entries into the table
        loadEntries();

        // Apply color to service status
        applyServiceStatusColor(rawServiceStatus);
    }

    function applyServiceStatusColor(serviceStatus) {
        const serviceStatusDiv = document.getElementById('serviceStatusDiv');
        if (!serviceStatusDiv) return;
        
        switch (serviceStatus) {
            case "Available":
                serviceStatusDiv.style.backgroundColor = '#6fc040';
                break;
            case "Under Observation":
                serviceStatusDiv.style.backgroundColor = '#0070d2';
                break;
            case "Unavailable":
                serviceStatusDiv.style.backgroundColor = 'yellow';
                serviceStatusDiv.style.color = 'black';
                break;
            case "Degraded":
                serviceStatusDiv.style.backgroundColor = 'red';
                break;
        }
    }

    function loadEntries() {
        const entries = JSON.parse(localStorage.getItem('stringEntries')) || [];
        const tableBody = document.getElementById("tableBody");
        if (!tableBody) return;
        
        tableBody.innerHTML = ''; // Clear existing entries
        entries.forEach(entry => {
            tableBody.innerHTML += rowTemplate(entry);
        });
    }
    
    function formatDateTime(inputValue) {
        if (!inputValue) return "";
        const date = new Date(inputValue);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = String(date.getFullYear());
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}/${day}/${year} ${hours}:${minutes}`;
    }

    function validateIncident(num) {
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

    function rowTemplate(entry) {
        return `<tr>
            <td colspan="1">${entry.datetime}</td>
            <td colspan="3">${entry.text}</td>
        </tr>`;
    }

    function formatList(items) {
        if (!Array.isArray(items)) return '';

        const len = items.length;

        if (len === 0) return '';
        if (len === 1) return items[0];
        if (len === 2) return `${items[0]} and ${items[1]}`;

        const allButLast = items.slice(0, -1).join(', ');
        const lastItem = items[len - 1];
        return `${allButLast}, and ${lastItem}`;
    }


    // Set up clipboard functionality for copy buttons
    function setupClipboard() {
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

    function copyToClipboard(content, successElementId) {
        navigator.clipboard.writeText(content).then(() => {
            const message = document.getElementById(successElementId);
            message.style.display = 'block';
            setTimeout(() => { message.style.display = 'none'; }, 1250);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }


    // Copy table with styles to clipboard
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


    // Show copy success message
    function showCopySuccess() {
        const successMessage = document.getElementById('copySuccess');
        successMessage.style.display = 'block';
        setTimeout(() => { successMessage.style.display = 'none'; }, 1250);
    }

    // Fallback copy method for browsers that don't support ClipboardItem
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

    // Generates HTML table with dynamic service status cell color
    function generateTable(services, users, serviceStatus, startTime, endTime,
        nextUpdate, incidentNum, description, impact) {
       
        // Determine the appropriate CSS class based on service status
        let statusClass;
        switch(serviceStatus) {
            case "Available":
                statusClass = "status-available";
                break;
            case "Under Observation":
                statusClass = "status-observation";
                break;
            case "Unavailable":
                statusClass = "status-unavailable";
                break;
            case "Degraded":
                statusClass = "status-degraded";
                break;
            default:
                statusClass = "status-available";
        }
        
        // Check if there are any progress entries
        const entries = JSON.parse(localStorage.getItem('stringEntries')) || [];
        const hasProgressEntries = entries.length > 0;
        
        // Base table structure without progress section
        let tableHTML = `
        <table class="output-table" border="1">
        <tr>
        <td colspan="1" style="border-right: none; padding:0">
           <img src="assets/bnp-logo.png" alt="bnp-paribas" class="bnp-logo">
        </td>
        <td colspan="3" style="border-left: none; padding:0">
           <p class="table-title">FOREX Service Desk Incident Notification</p>
        </td>
        </tr>
        <tr>
        <td class="input-question" colspan="1">Service/Application(s) Impacted:</td>
        <td class="input-answer" colspan="1">${services}</td>
        <td class="input-question" colspan="1">Service Status:</td>
        <td class="input-answer ${statusClass}" colspan="1"><p id="serviceStatusDiv" class="abcd">${serviceStatus}</p></td>
        </tr>
        <tr>
        <td class="input-question" colspan="1" rowspan="2">Users Impacted:</td>
        <td class="input-answer" colspan="1" rowspan="2">${users}</td>
        <td class="input-question" style="height:20px" colspan="1">Time Started [LT]:</td>
        <td class="input-answer" style="height:20px" colspan="1">${startTime}</td>
        </tr>
        <tr>
        <td class="input-question" style="height:20px" colspan="1">Time Ended [LT]:</td>
        <td class="input-answer" style="height:20px" colspan="1">${endTime}</td>
        </tr>
        <tr>
        <td class="input-question" colspan="1">Incident #:</td>
        <td class="input-answer" colspan="1">${incidentNum}</td>
        <td class="input-question" colspan="1">Next Update At [LT]:</td>
        <td class="input-answer" colspan="1">${nextUpdate}</td>
        </tr>
        <tr>
        <td class="input-question" colspan="1">Description:</td>
        <td class="input-answer" colspan="3">${description}</td>
        </tr>
        <tr>
        <td colspan="1" class="input-question">Impact:</td>
        <td class="input-answer" colspan="3">${impact}</td>
        </tr>`;
        
        // Only add progress section if there are entries
        if (hasProgressEntries) {
            tableHTML += `
            <tr>
            <td colspan="4" class="progress-header">Progress in Chronological Order</td>
            </tr>
            <tr>
            <td class="progress-header" colspan="1">Date/Time [LT]</td>
            <td class="progress-header" colspan="3">Details</td>
            </tr>
            <tbody id="tableBody">
            </tbody>`;
        }
        
        // Close the table
        tableHTML += `</table>`;
        
        return tableHTML;
    }
});