document.addEventListener('DOMContentLoaded', function () {

    const EMAIL_LISTS = {
        APAC: ['chen.yun@gmail.com', 'akira.tanaka@apacmail.com', 'priya.sharma@apacmail.com', 'min.ji.kim@apacmail.com', 'ali.hassan@emeamail.com'],
        EMEA: ['sophie.dubois@emeamail.com', 'ali.hassan@emeamail.com', 'tom.schmidt@emeamail.com', 'lucas.nielsen@emeamail.com', 'anastasia.popov@emeamail.com'],
        AMERICAS: ['michael.smith@americasmail.com', 'carla.martinez@americasmail.com', 'kevin.johnson@americasmail.com', 'daniela.gomez@americasmail.com', 'thiago.silva@americasmail.com']
    };

    // Initialize utilities
    setupClipboard();
    setupDropdowns();
    setupGenerateButton();
    setupClearStorage();
    loadFromLocalStorage();

    function getSelectedValues(name) {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                   .map(checkbox => checkbox.value);
    }

    function setupDropdowns() {
        document.getElementById('impactedServiceDropdownHeader').addEventListener('click', function() {
            const dropdown = document.getElementById('impactedServiceDropdownList');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

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
        
        // Real-time updates for selections
        const serviceCheckboxes = document.querySelectorAll('input[name="impacted-service"]');
        serviceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateServiceSelectionDisplay);
        });
        
        const userCheckboxes = document.querySelectorAll('input[name="impacted-users"]');
        userCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                handleUserCheckboxChange(checkbox);
            });
        });
    }
    
    function handleUserCheckboxChange(checkbox) {
        if (checkbox.value === 'GLOBAL') {
            if (checkbox.checked) {
                // If GLOBAL is checked, uncheck and disable all other options
                document.querySelectorAll('input[name="impacted-users"]:not([value="GLOBAL"])').forEach(cb => {
                    cb.checked = false;
                    cb.disabled = true;
                });
            } else {
                // If GLOBAL is unchecked, enable all other options
                document.querySelectorAll('input[name="impacted-users"]:not([value="GLOBAL"])').forEach(cb => {
                    cb.disabled = false;
                });
            }
        } else {
            // If any region is checked, uncheck and disable GLOBAL
            const globalCheckbox = document.querySelector('input[name="impacted-users"][value="GLOBAL"]');
            if (checkbox.checked) {
                globalCheckbox.checked = false;
                globalCheckbox.disabled = true;
            } else {
                // If no regions are selected, enable GLOBAL again
                const anyRegionChecked = document.querySelectorAll('input[name="impacted-users"]:not([value="GLOBAL"]):checked').length > 0;
               
                if (!anyRegionChecked) {
                    globalCheckbox.disabled = false;
                }
            }
        }
       
        updateUserSelectionDisplay();
    }
    
    function updateServiceSelectionDisplay() {
        const selectedServices = getSelectedValues('impacted-service');
        
        document.getElementById('selectedImpacted').textContent = selectedServices.length > 0 ? selectedServices.join(', ') : 'Select';
        localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    }
    
    function updateUserSelectionDisplay() {
        const selectedUsers = getSelectedValues('impacted-users');
        
        document.getElementById('selectedImpactedUsers').textContent = selectedUsers.length > 0 ? selectedUsers.join(', ') : 'Select';
        localStorage.setItem('selectedUsers', JSON.stringify(selectedUsers));
    }

    function loadFromLocalStorage() {
        const formFields = {
            'incident-num': 'incidentNum',
            'service-status': 'serviceStatus',
            'description': 'description',
            'impact': 'impact',
            'start-time': 'startTime',
            'end-time': 'endTime',
            'next-update': 'nextUpdate'
        };

        Object.entries(formFields).forEach(([fieldId, storageKey]) => {
            const defaultValue = fieldId === 'service-status' ? 'Available' : '';
            document.getElementById(fieldId).value = localStorage.getItem(storageKey) || defaultValue;
        });
        
        const savedServices = JSON.parse(localStorage.getItem('selectedServices')) || [];
        savedServices.forEach(service => {
            const checkbox = document.querySelector(`input[name="impacted-service"][value="${service}"]`);
            if (checkbox) checkbox.checked = true;
        });
        updateServiceSelectionDisplay();
        
        const savedUsers = JSON.parse(localStorage.getItem('selectedUsers')) || [];
        savedUsers.forEach(user => {
            const checkbox = document.querySelector(`input[name="impacted-users"][value="${user}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Handle GLOBAL and regions state when loading from storage
        const globalSelected = savedUsers.includes('GLOBAL');
        const regionsSelected = savedUsers.some(user => ['APAC', 'EMEA', 'AMERICAS'].includes(user));
        
        if (globalSelected) {
            document.querySelectorAll('input[name="impacted-users"]:not([value="GLOBAL"])').forEach(cb => {
                cb.disabled = true;
            });
        } else if (regionsSelected) {
            document.querySelector('input[name="impacted-users"][value="GLOBAL"]').disabled = true;
        }
        
        updateUserSelectionDisplay();
    }

    function setupClearStorage() {
        document.getElementById('clearStorage').addEventListener('click', function() {
            if (confirm('Clear saved Data?')) {
                localStorage.clear();
                
                document.getElementById('dataform').reset();
                document.getElementById('selectedImpacted').textContent = 'Select';
                document.getElementById('selectedImpactedUsers').textContent = 'Select';
                
                // Re-enable all checkboxes
                document.querySelectorAll('input[name="impacted-users"]').forEach(cb => {
                    cb.disabled = false;
                });
                
                // Hide copy buttons and clear outputs
                ['copyToBtn', 'copyBccBtn', 'copySubBtn', 'copyButton'].forEach(btnId => {
                    document.getElementById(btnId).style.display = 'none';
                });
                
                ['outputTorecipient', 'outputBccrecipient', 'outputSubject', 'outputContent'].forEach(outputId => {
                    document.getElementById(outputId).innerHTML = '';
                });
            }
        });
    }

    function setupGenerateButton() {
        document.getElementById('generateButton').addEventListener('click', function () {
            const formData = {
                incidentNum: document.getElementById('incident-num').value.trim(),
                serviceStatus: document.getElementById('service-status').value,
                description: document.getElementById('description').value,
                impact: document.getElementById('impact').value,
                progress: document.getElementById('progress').value.trim(),
                startTime: document.getElementById('start-time').value,
                endTime: document.getElementById('end-time').value,
                nextUpdate: document.getElementById('next-update').value
            };

            const selectedServices = getSelectedValues('impacted-service');
            const selectedUsers = getSelectedValues('impacted-users');
            
            if (!validateForm(formData, selectedServices, selectedUsers)) {
                return;
            }
            
            if (formData.progress) {
                addProgressEntry(formData.progress);
            }
    
            saveFormData(formData);
    
            const processedData = processSelections(selectedServices, selectedUsers);
            const formattedTimes = formatTimes(formData);
            
            generateOutputElements(
                processedData.recipientList, 
                formData.serviceStatus, 
                formData.incidentNum, 
                processedData.servicesFormatted, 
                processedData.usersFormatted, 
                formattedTimes.startTime, 
                formattedTimes.endTime, 
                formattedTimes.nextUpdate, 
                formData.description, 
                formData.impact
            );
        });
    }

    function validateForm(formData, selectedServices, selectedUsers) {
        if (selectedServices.length === 0) {
            alert('Please Select at least one Service/Application');
            return false;
        }

        if (selectedUsers.length === 0) {
            alert('Please Select at least one User Impacted');
            return false;
        }

        if (!formData.startTime) {
            alert('Please Provide a Start Time');
            return false;
        }

        if (!formData.description) {
            alert('Please Provide a Description');
            return false;
        }

        if (!formData.impact) {
            alert('Please Provide an Impact');
            return false;
        }
        
        const incidentInput = document.getElementById('incident-num');
        const incidentError = document.getElementById('incError');
        const validationResult = validateIncident(formData.incidentNum);
        
        if (!validationResult.isValid) {
            incidentInput.classList.add('invalid');
            incidentError.style.display = 'block';
            return false;
        } else {
            incidentInput.classList.remove('invalid');
            incidentError.style.display = 'none';
            
            if (validationResult.startsWithZero) {
                if (!confirm('Incident number starts with Zero. Proceed anyway?')) {
                    return false;
                }
            }
        }
        
        if (!formData.progress) {
            if (!confirm("Progress is Empty. Proceed anyway?")) {
                return false;
            }
        }

        return true;
    }

    function saveFormData(formData) {
        const fieldMappings = {
            incidentNum: 'incidentNum',
            serviceStatus: 'serviceStatus',
            description: 'description',
            impact: 'impact',
            startTime: 'startTime',
            endTime: 'endTime',
            nextUpdate: 'nextUpdate'
        };

        Object.entries(fieldMappings).forEach(([key, storageKey]) => {
            localStorage.setItem(storageKey, formData[key]);
        });
    }

    function formatTimes(formData) {
        return {
            startTime: formatDateTime(formData.startTime),
            endTime: formatDateTime(formData.endTime),
            nextUpdate: formatDateTime(formData.nextUpdate)
        };
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

    function processSelections(selectedServices, selectedUsers) {
        const servicesFormatted = formatList(selectedServices);
        
        const allRegionsSelected = selectedUsers.includes('APAC') && 
                                  selectedUsers.includes('EMEA') && 
                                  selectedUsers.includes('AMERICAS');
        
        const usersFormatted = allRegionsSelected ? "GLOBAL" : formatList(selectedUsers);

        let allRecipients = [];
        
        if (selectedUsers.includes('GLOBAL')) {
            allRecipients = [...EMAIL_LISTS.APAC, ...EMAIL_LISTS.EMEA, ...EMAIL_LISTS.AMERICAS];
        } else {
            selectedUsers.forEach(region => {
                if (EMAIL_LISTS[region]) {
                    allRecipients = allRecipients.concat(EMAIL_LISTS[region]);
                }
            });
        }

        const recipientList = [...new Set(allRecipients)].join('; ');

        return { 
            recipientList, 
            servicesFormatted, 
            usersFormatted 
        };
    }

    function generateOutputElements(recipientList, serviceStatus, incidentNum, services, users, 
                                   startTime, endTime, nextUpdate, description, impact) {
        const outputrecipientTo = `
            <div class="receient-container flex">
                <div class="to-div"><p class="to-tile"><u>T</u>o</p></div>
                <div class="to-line flex"><p class="subject-body" id="to-recipient-body">zeeshan@gmail.com</p></div>
            </div>`;

        document.getElementById('outputTorecipient').innerHTML = outputrecipientTo;
        document.getElementById('copyToBtn').style.display = 'block';

        const outputrecipientBcc = `
            <div class="receient-container flex">
                <div class="to-div"><p class="to-tile"><u>B</u>cc</p></div>
                <div class="to-line flex"><p class="subject-body" id="bcc-recipient-body">${recipientList}</p></div>
            </div>`;

        document.getElementById('outputBccrecipient').innerHTML = outputrecipientBcc;
        document.getElementById('copyBccBtn').style.display = 'block';

        const outputSubject = `
            <div class="sub-line flex">
                <p class="subject-title">S<u>u</u>bject</p>
                <p class="subject-body" id="subject-body">[${serviceStatus}] FOREX Incident Management Notification - ${services}</p>
            </div>`;

        document.getElementById('outputSubject').innerHTML = outputSubject;
        document.getElementById('copySubBtn').style.display = 'block';

        const outputTable = generateTable(services, users, serviceStatus, startTime, endTime, 
                                        nextUpdate, incidentNum, description, impact);
        document.getElementById('outputContent').innerHTML = outputTable;
        document.getElementById('copyButton').style.display = "block";

        loadEntries();
        applyServiceStatusColor(serviceStatus);
    }

    function applyServiceStatusColor(serviceStatus) {
        const serviceStatusDiv = document.getElementById('serviceStatusDiv');
        if (!serviceStatusDiv) return;
        
        // Reset styles
        serviceStatusDiv.style.color = '';
        
        const statusStyles = {
            "Available": { backgroundColor: '#6fc040' },
            "Under Observation": { backgroundColor: '#0070d2' },
            "Degraded": { backgroundColor: 'yellow', color: 'black' },
            "Unavailable": { backgroundColor: 'red' }
        };

        const style = statusStyles[serviceStatus];
        if (style) {
            Object.assign(serviceStatusDiv.style, style);
        }
    }

    function loadEntries() {
        const entries = JSON.parse(localStorage.getItem('stringEntries')) || [];
        const tableBody = document.getElementById("tableBody");
        if (!tableBody) return;
        
        tableBody.innerHTML = entries.map(entry => rowTemplate(entry)).join('');
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
        const formatValid = /^INC[0-9]{8}$/.test(num);
        
        if (!formatValid) {
          return { 
            isValid: false,
            startsWithZero: false,
          };
        }
        
        return {
          isValid: true,
          startsWithZero: /^INC0/.test(num)
        };
    }

    function rowTemplate(entry) {
        return `<tr>
            <td colspan="1" style="text-align: center;">${entry.datetime}</td>
            <td colspan="3">${entry.text}</td>
        </tr>`;
    }

    function formatList(item) {
        if (!Array.isArray(item)) return '';

        const len = item.length;

        if (len === 0) return '';
        if (len === 1) return item[0];
        if (len === 2) return `${item[0]} and ${item[1]}`;
        
        return `${item.slice(0, -1).join(', ')}, and ${item[len - 1]}`;
    }

    // Set up clipboard functionality for copy buttons
    function setupClipboard() {
        document.getElementById('copyButton').addEventListener('click', copyTableWithStyles);

        const copyButtons = [
            { id: 'copyToBtn', contentId: 'to-recipient-body', successId: 'copyToSuccess' },
            { id: 'copyBccBtn', contentId: 'bcc-recipient-body', successId: 'copyBccSuccess' },
            { id: 'copySubBtn', contentId: 'subject-body', successId: 'copySubSuccess' }
        ];

        copyButtons.forEach(({ id, contentId, successId }) => {
            document.getElementById(id).addEventListener('click', function() {
                const content = document.getElementById(contentId).textContent;
                copyToClipboard(content, successId);
            });
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
        const tableContent = document.getElementById('outputContent').innerHTML;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = tableContent;
        
        const table = tempDiv.querySelector('table');
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        
        const cells = table.querySelectorAll('td');
        cells.forEach(cell => {
            cell.style.border = '1px solid #000';
            cell.style.padding = '8px';
            cell.style.height = '40px';
        });
        
        applySpecificStyles(table);
        
        const htmlContent = `
        <html>
        <head>
            <style>
                body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; }
                .table-title { color: #00915A; font-weight: bold; font-size: 18px; text-align: center; }
                .input-question { background-color: #00915A; font-weight: bold; color: white; width: 25%; }
                .input-answer { width: 25%; }
                .progress-header { background-color: #f0f0f0; font-weight: bold; text-align: center; }
                .abcd { padding: 5px; border-radius: 3px; text-align: center; font-weight: bold; }
                
                /* Service status colors */
                .status-available { background-color: #6fc040; color: white; }
                .status-observation { background-color: #0070d2; color: white; }
                .status-degraded { background-color: yellow; color: black; }
                .status-unavailable { background-color: red; color: white; }
            </style>
        </head>
        <body>
            ${tempDiv.innerHTML}
        </body>
        </html>
        `;
        
        try {
            const clipboardItem = new ClipboardItem({
                'text/html': new Blob([htmlContent], { type: 'text/html' })
            });
            
            navigator.clipboard.write([clipboardItem]).then(() => {
                showCopySuccess();
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        } catch (error) {
            console.error('ClipboardItem not supported: ', error);
        }
    }

    function applySpecificStyles(table) {
        const styleElements = [
            { selector: '.bnp-logo', styles: { width: '100%' } },
            { selector: '.table-title', styles: { color: '#00915A', fontWeight: 'bold', fontSize: '18px', textAlign: 'center' } },
            { selector: '.input-question', styles: { backgroundColor: '#00915A', fontWeight: 'bold', color: 'white', width: '25%' } },
            { selector: '.input-answer', styles: { width: '25%' } },
            { selector: '.progress-header', styles: { backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center' } }
        ];

        styleElements.forEach(({ selector, styles }) => {
            const elements = table.querySelectorAll(selector);
            elements.forEach(element => {
                Object.assign(element.style, styles);
            });
        });
    }

    function showCopySuccess() {
        const successMessage = document.getElementById('copySuccess');
        successMessage.style.display = 'block';
        setTimeout(() => { successMessage.style.display = 'none'; }, 1250);
    }

    function generateTable(services, users, serviceStatus, startTime, endTime,
        nextUpdate, incidentNum, description, impact) {
       
        const statusClasses = {
            "Available": "status-available",
            "Under Observation": "status-observation",
            "Unavailable": "status-unavailable",
            "Degraded": "status-degraded"
        };
        
        const statusClass = statusClasses[serviceStatus] || "status-available";
        
        // Check if there are any progress entries
        const entries = JSON.parse(localStorage.getItem('stringEntries')) || [];
        const hasProgressEntries = entries.length > 0;
        
        // Base table structure
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
        <td class="input-question" colspan="1">Service/Application(s) Impacted</td>
        <td class="input-answer" colspan="1">${services}</td>
        <td class="input-question" colspan="1">Service Status</td>
        <td class="input-answer ${statusClass}" colspan="1"><p id="serviceStatusDiv" class="abcd">${serviceStatus}</p></td>
        </tr>
        <tr>
        <td class="input-question" colspan="1" rowspan="2">Users Impacted</td>
        <td class="input-answer" colspan="1" rowspan="2">${users}</td>
        <td class="input-question" style="height:20px" colspan="1">Time Started [LT]</td>
        <td class="input-answer" style="height:20px" colspan="1">${startTime}</td>
        </tr>
        <tr>
        <td class="input-question" style="height:20px" colspan="1">Time Ended [LT]</td>
        <td class="input-answer" style="height:20px" colspan="1">${endTime}</td>
        </tr>
        <tr>
        <td class="input-question" colspan="1">Incident #</td>
        <td class="input-answer" colspan="1">${incidentNum}</td>
        <td class="input-question" colspan="1">Next Update At [LT]</td>
        <td class="input-answer" colspan="1">${nextUpdate}</td>
        </tr>
        <tr>
        <td class="input-question" colspan="1">Description</td>
        <td class="input-answer" colspan="3">${description}</td>
        </tr>
        <tr>
        <td colspan="1" class="input-question">Impact</td>
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
        
        tableHTML += `</table>`;
        
        return tableHTML;
    }
});