import { formatDateTime, validateIncident, rowTemplate, formatList, setupClipboard } from './utils.js';
import { generateTable } from './tableTemplate.js';

document.addEventListener('DOMContentLoaded', function () {
    let generateClickCount = 0;

    // Initialize utilities
    setupClipboard();
    setupDropdowns();
    setupGenerateButton();
    setupClearStorage();
    loadFromLocalStorage(); // Load saved values when page loads

    function setupDropdowns() {
        // Service selection dropdown
        document.getElementById('impactedServiceDropdownHeader').addEventListener('click', function() {
            const dropdown = document.getElementById('impactedServiceDropdownList');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Users selection dropdown
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
                alert('History cleared successfully');
                
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
    
            if (!progress) {
                window.alert("Please Enter a Progress Update");
                return;
            }
    
            const incidentInput = document.getElementById('incident-num');
            const incidentError = document.getElementById('incError');
            const startTime = formatDateTime(startTimeValue);
            const endTime = formatDateTime(endTimeValue);
            const nextUpdate = formatDateTime(nextUpdateValue);
    
            // Validate the form before saving progress and other data
            const validationResult = validateIncident(incidentNum);
            
            // Process the impacted services and users for validation
            const impactedServiceCheckboxes = document.querySelectorAll('input[name="impacted-service"]:checked');
            const selectedImpactedServices = Array.from(impactedServiceCheckboxes).map(checkbox => checkbox.value);
    
            const impactedUsersCheckboxes = document.querySelectorAll('input[name="impacted-users"]:checked');
            const selectedImpactedUsers = Array.from(impactedUsersCheckboxes).map(checkbox => checkbox.value);
            
            // Check for validation errors
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
                        return; // User chose not to proceed
                    }
                }
            }
            
            if (selectedImpactedServices.length === 0) {
                alert('Please Select at least one Service/Application');
                return;
            }
    
            if (selectedImpactedUsers.length === 0) {
                alert('Please Select at least one User Impacted');
                return;
            }
            
            // All validation passed, now add progress entry and save data
            // Add progress entry only after validation passes
            addProgressEntry(progress);
    
            // Save to localStorage after validation passes
            localStorage.setItem("incidentNum", incidentNum);
            localStorage.setItem("serviceStatus", serviceStatus);
            localStorage.setItem("description", description);
            localStorage.setItem("impact", impact);
            localStorage.setItem("startTime", startTimeValue);
            localStorage.setItem("endTime", endTimeValue);
            localStorage.setItem("nextUpdate", nextUpdateValue);
    
            // Get values from storage
            let incNumFromS = localStorage.getItem("incidentNum");
            let serviceStatusFromS = localStorage.getItem("serviceStatus");
            let descriptionfromS = localStorage.getItem("description");
            let impactFromS = localStorage.getItem("impact");
    
            // Process the impacted services and users
            const result = processSelections();
            if (!result.success) return;
            
            // Generate the output elements
            generateOutputElements(
                result.recepientList, 
                serviceStatusFromS, 
                incNumFromS, 
                result.impactedServiceListFromS, 
                result.impactedUsersListFromS, 
                startTime, 
                endTime, 
                nextUpdate, 
                descriptionfromS, 
                impactFromS,
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

        let impactedServiceListFromS = localStorage.getItem("impactedServiceList");
        let impactedUsersListFromS = localStorage.getItem("impactedUsersList");

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
            impactedServiceListFromS, 
            impactedUsersListFromS 
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
});