/**
 * Generates HTML table with dynamic service status cell color
 * @param {string} services - List of impacted services 
 * @param {string} users - List of impacted users
 * @param {string} serviceStatus - Current service status
 * @param {string} startTime - Formatted start time
 * @param {string} endTime - Formatted end time 
 * @param {string} nextUpdate - Formatted next update time
 * @param {string} incidentNum - The incident number
 * @param {string} description - Incident description
 * @param {string} impact - Incident impact details
 * @returns {string} Complete HTML table
 */
export function generateTable(services, users, serviceStatus, startTime, endTime,
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
    
    return `
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
</tr>
<tr>
<td colspan="4" class="progress-header">Progress in Chronological Order</td>
</tr>
<tr>
<td class="progress-header" colspan="1">Date/Time [LT]</td>
<td class="progress-header" colspan="3">Details</td>
</tr>
<tbody id="tableBody">
</tbody>
</table>`;
}