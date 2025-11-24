       // ===================================
        // LOCAL STORAGE PERSISTENCE SYSTEM
        // ===================================
        const STORAGE_KEY = 'depedMonitoringFormData';
        let initialFormState = {};
        let hasUnsavedChanges = false;

        // Save form data to Local Storage
        function saveToLocalStorage() {
            const data = getFormData();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            console.log('✅ Form data saved to Local Storage');
        }

        // Load form data from Local Storage
        function loadFromLocalStorage() {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    populateFormFields(data);
                    console.log('✅ Form data loaded from Local Storage');
                    return true;
                } catch (error) {
                    console.error('Error loading saved data:', error);
                    return false;
                }
            }
            return false;
        }

        // Populate form fields with saved data
        function populateFormFields(data) {
            const form = document.getElementById('monitoringForm');
            
            // Populate text inputs, emails, dates, numbers, textareas, selects
            Object.keys(data).forEach(key => {
                const element = form.querySelector(`[name="${key}"]`);
                if (!element) return;

                if (element.tagName === 'TEXTAREA' || element.tagName === 'SELECT' || 
                    element.type === 'text' || element.type === 'email' || 
                    element.type === 'tel' || element.type === 'date' || element.type === 'number') {
                    element.value = data[key] || '';
                } else if (element.type === 'radio') {
                    const radioButton = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radioButton) radioButton.checked = true;
                } else if (element.type === 'checkbox') {
                    element.checked = data[key] === true;
                }
            });
        }

        // Clear saved data from Local Storage
        function clearSavedData() {
            if (confirm('⚠️ Are you sure you want to clear all saved data? This action cannot be undone.')) {
                localStorage.removeItem(STORAGE_KEY);
                document.getElementById('monitoringForm').reset();
                
                // Reset all filters to checked
                document.querySelectorAll('.level-filter').forEach(filter => {
                    filter.checked = true;
                });
                applyProgramFilters();
                
                hasUnsavedChanges = false;
                initialFormState = {};
                
                alert('✅ All saved data has been cleared.');
                console.log('✅ Local Storage cleared');
            }
        }

        // Capture initial form state
        function captureInitialState() {
            initialFormState = JSON.stringify(getFormData());
        }

        // Check if form has unsaved changes
        function checkForUnsavedChanges() {
            const currentState = JSON.stringify(getFormData());
            hasUnsavedChanges = (currentState !== initialFormState);
            return hasUnsavedChanges;
        }

        // Setup auto-save listeners
        function setupAutoSave() {
            const form = document.getElementById('monitoringForm');
            
            // Save on input change (text fields, textareas)
            form.addEventListener('input', function(e) {
                if (e.target.matches('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], textarea')) {
                    debounce(() => {
                        saveToLocalStorage();
                        checkForUnsavedChanges();
                    }, 500)();
                }
            });

            // Save on change (dropdowns, radios, checkboxes, dates)
            form.addEventListener('change', function(e) {
                if (e.target.matches('select, input[type="radio"], input[type="checkbox"], input[type="date"]')) {
                    saveToLocalStorage();
                    checkForUnsavedChanges();
                }
            });
        }

        // Debounce function to limit save frequency
        let debounceTimer;
        function debounce(func, delay) {
            return function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(func, delay);
            };
        }

        // Setup beforeunload warning
        function setupNavigationWarning() {
            window.addEventListener('beforeunload', function(e) {
                if (checkForUnsavedChanges()) {
                    e.preventDefault();
                    e.returnValue = ''; // Chrome requires returnValue to be set
                    return ''; // Some browsers show a custom message
                }
            });
        }

        // ===================================
        // CONDITIONAL VISIBILITY SYSTEM
        // ===================================
        
        function applyProgramFilters() {
            const filters = {
                kindergarten: document.getElementById('filterKindergarten').checked,
                elementary: document.getElementById('filterElementary').checked,
                jhs: document.getElementById('filterJHS').checked,
                shs: document.getElementById('filterSHS').checked,
                sped: document.getElementById('filterSPED').checked,
                homeschool: document.getElementById('filterHomeschool').checked,
                hei: document.getElementById('filterHEI').checked,
                international: document.getElementById('filterInternational').checked
            };

            // Apply filters to program sections
            document.querySelectorAll('.program-section').forEach(section => {
                const program = section.getAttribute('data-program');
                if (filters[program]) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });

            // CONDITIONAL: Accreditation table rows
            document.querySelectorAll('.accred-row').forEach(row => {
                const program = row.getAttribute('data-program');
                if (filters[program]) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });

            // Check if ANY program is enabled for accreditation section
            const anyProgramEnabled = filters.kindergarten || filters.elementary || filters.jhs || filters.shs;
            const accreditationSection = document.getElementById('accreditationSection');
            if (anyProgramEnabled) {
                accreditationSection.style.display = '';
            } else {
                accreditationSection.style.display = 'none';
            }

            // CONDITIONAL: LIS fields (grade-specific)
            document.querySelectorAll('.lis-field').forEach(field => {
                const program = field.getAttribute('data-program');
                if (filters[program]) {
                    field.style.display = '';
                } else {
                    field.style.display = 'none';
                }
            });

            // CONDITIONAL: Warm Bodies fields (grade-specific)
            document.querySelectorAll('.warm-field').forEach(field => {
                const program = field.getAttribute('data-program');
                if (filters[program]) {
                    field.style.display = '';
                } else {
                    field.style.display = 'none';
                }
            });

            // CONDITIONAL: Teachers table rows
            document.querySelectorAll('.teacher-row').forEach(row => {
                const program = row.getAttribute('data-program');
                if (filters[program]) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });

            // Hide entire teachers section if no programs enabled
            const teachersSection = document.getElementById('teachersSection');
            if (anyProgramEnabled) {
                teachersSection.style.display = '';
            } else {
                teachersSection.style.display = 'none';
            }

            // CONDITIONAL: Curriculum fields
            document.querySelectorAll('.curriculum-field').forEach(field => {
                const program = field.getAttribute('data-program');
                if (filters[program]) {
                    field.style.display = '';
                } else {
                    field.style.display = 'none';
                }
            });

            // Hide entire curriculum section if no programs enabled
            const curriculumSection = document.getElementById('curriculumSection');
            if (anyProgramEnabled) {
                curriculumSection.style.display = '';
            } else {
                curriculumSection.style.display = 'none';
            }

            // CONDITIONAL: SHS Labs section
            const shsLabsSection = document.getElementById('shsLabsSection');
            if (filters.shs) {
                shsLabsSection.style.display = '';
            } else {
                shsLabsSection.style.display = 'none';
            }
        }

        // ===================================
        // SUBSIDY VISIBILITY CONTROLS
        // ===================================
        
        function toggleSubsidyBlock(radioName, blockId) {
            const radios = document.getElementsByName(radioName);
            const block = document.getElementById(blockId);

            function updateVisibility() {
                const checkedRadio = Array.from(radios).find(r => r.checked);
                if (checkedRadio && checkedRadio.value === 'yes') {
                    block.style.display = '';
                } else {
                    block.style.display = 'none';
                }
            }
            
            radios.forEach(r => r.addEventListener('change', updateVisibility));
            updateVisibility();
        }

        function initializeProgramFilter() {
            const levelFilters = document.querySelectorAll('.level-filter');
            
            levelFilters.forEach(filter => {
                filter.addEventListener('change', function() {
                    applyProgramFilters();
                });
            });
            
            // CRITICAL FIX: Apply filters immediately on initialization
            applyProgramFilters();
        }

        function clearForm() {
            if (confirm('Are you sure you want to clear all fields?')) {
                document.getElementById('monitoringForm').reset();
                
                // Reset all filters to checked
                document.querySelectorAll('.level-filter').forEach(filter => {
                    filter.checked = true;
                });
                applyProgramFilters();
                
                // Clear local storage
                localStorage.removeItem(STORAGE_KEY);
                hasUnsavedChanges = false;
                captureInitialState();
            }
        }

        function getFormData() {
            const form = document.getElementById('monitoringForm');
            const data = {};

            // Text inputs, emails, dates, numbers, textareas, selects
            const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="number"], textarea, select');
            inputs.forEach(input => {
                data[input.name] = input.value || '';
            });

            // Radio buttons
            const radios = form.querySelectorAll('input[type="radio"]:checked');
            radios.forEach(radio => {
                data[radio.name] = radio.value;
            });

            // Individual checkboxes
            const checkboxes = form.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                data[cb.name] = cb.checked;
            });

            return data;
        }

     function generateDocx() {
    const loading = document.getElementById('loading');
    loading.classList.add('active');

    setTimeout(() => {
        try {
            const data = getFormData();
            
            // Get school name and SDO for filename
            const schoolName = data.schoolNameDeped || data.schoolNameSec || 'School';
            const division = data.sdo || 'Division';
            
            // Get current date in YYYY-MM-DD format
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            // Clean the names for filename (remove special characters)
            const cleanSchoolName = schoolName.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
            const cleanDivision = division.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
            
            // Create filename in format: Division_SchoolName_YYYY-MM-DD.doc
            const fileName = `${cleanDivision}_${cleanSchoolName}_${dateStr}.doc`;
            
            createWordDocument(data, fileName);
            
            // After successful generation, update initial state
            captureInitialState();
            hasUnsavedChanges = false;
            
        } catch (error) {
            alert('Error generating document: ' + error.message);
        } finally {
            loading.classList.remove('active');
        }
    }, 500);
}


        function formatCheckbox(value) {
            return value ? '☑' : '☐';
        }

        function createWordDocument(data, fileName) {
            // Helper function to format grade level data
            function formatGradeLevels(prefix) {
                return `
                    <tr>
                        <td>Kinder: ${data[prefix + 'Kinder'] || '__'}</td>
                        <td>Grade 7: ${data[prefix + 'Grade7'] || '__'}</td>
                    </tr>
                    <tr>
                        <td>Grade 1: ${data[prefix + 'Grade1'] || '__'}</td>
                        <td>Grade 8: ${data[prefix + 'Grade8'] || '__'}</td>
                    </tr>
                    <tr>
                        <td>Grade 2: ${data[prefix + 'Grade2'] || '__'}</td>
                        <td>Grade 9: ${data[prefix + 'Grade9'] || '__'}</td>
                    </tr>
                    <tr>
                        <td>Grade 3: ${data[prefix + 'Grade3'] || '__'}</td>
                        <td>Grade 10: ${data[prefix + 'Grade10'] || '__'}</td>
                    </tr>
                    <tr>
                        <td>Grade 4: ${data[prefix + 'Grade4'] || '__'}</td>
                        <td>Grade 11: ${data[prefix + 'Grade11'] || '__'}</td>
                    </tr>
                    <tr>
                        <td>Grade 5: ${data[prefix + 'Grade5'] || '__'}</td>
                        <td>Grade 12: ${data[prefix + 'Grade12'] || '__'}</td>
                    </tr>
                    <tr>
                        <td>Grade 6: ${data[prefix + 'Grade6'] || '__'}</td>
                        <td></td>
                    </tr>
                `;
            }

            // Format subsidy data with Yes/No
            function formatSubsidyData() {
                let output = '';
                
                if (data.voucherOffered === 'yes') {
                    output += `Voucher: Yes - ${data.voucherCount || '0'} recipients &nbsp;&nbsp;&nbsp;`;
                } else if (data.voucherOffered === 'no') {
                    output += `Voucher: No &nbsp;&nbsp;&nbsp;`;
                } else {
                    output += `Voucher: ____ &nbsp;&nbsp;&nbsp;`;
                }
                
                if (data.escOffered === 'yes') {
                    output += `ESC: Yes - ${data.escCount || '0'} recipients &nbsp;&nbsp;&nbsp;`;
                } else if (data.escOffered === 'no') {
                    output += `ESC: No &nbsp;&nbsp;&nbsp;`;
                } else {
                    output += `ESC: ____ &nbsp;&nbsp;&nbsp;`;
                }
                
                if (data.jdvpOffered === 'yes') {
                    output += `JDVP: Yes - ${data.jdvpCount || '0'} recipients`;
                } else if (data.jdvpOffered === 'no') {
                    output += `JDVP: No`;
                } else {
                    output += `JDVP: ____`;
                }
                
                return output;
            }

            const htmlContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset='utf-8'>
                    <title>DepEd Monitoring Tool</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.3; margin: 0.5in; }
                        h1 { text-align: center; font-size: 14pt; font-weight: bold; margin: 10pt 0; }
                        table { width: 100%; border-collapse: collapse; margin: 5pt 0; }
                        th, td { border: 1px solid #000; padding: 5pt; vertical-align: top; }
                        th { font-weight: bold; }
                        .no-border { border: none; }
                        .header-text { text-align: center; margin: 5pt 0; }
                        .section-title { font-weight: bold; font-size: 11pt; margin-top: 15pt; }
                        .underline { border-bottom: 1px solid #000; display: inline-block; min-width: 200px; }
                        p { margin: 5pt 0; }
                    </style>
                </head>
                <body>
                    <h1>MONITORING TOOL FOR PRIVATE SCHOOLS</h1>
                    
                    <p class="section-title">PART 1: SCHOOL PROFILE</p>
                    <p><em>(Part 1 of this Monitoring Tool should be accomplished by the school)</em></p>
                    
                    <table>
                        <tr>
                            <td colspan="3"><strong>Schools Division Office</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">${data.sdo || ''}</td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Classification According to Offering</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                ${formatCheckbox(data.classNonSectarian)} Non-Sectarian &nbsp;&nbsp;&nbsp;
                                ${formatCheckbox(data.classSectarian)} Sectarian
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>School Registered Name in SEC</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">${data.schoolNameSec || ''}</td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>School Name in DepEd Permit/Recognition</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">${data.schoolNameDeped || ''}</td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Complete Address:</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">${data.address || ''}</td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Email Address:</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">${data.email || ''}</td>
                        </tr>
                        <tr>
                            <td><strong>School ID Number:</strong><br>${data.schoolId || ''}</td>
                            <td><strong>LIS Account Status</strong><br>
                                ${formatCheckbox(data.lisStatus === 'Active')} Active<br>
                                ${formatCheckbox(data.lisStatus === 'Not Active')} Not Active
                            </td>
                            <td><strong>School Contact No.</strong><br>${data.contactNumber || ''}</td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Program Offering</strong><br>
                            <em>(Check if Government Authority certificates are displayed in a conspicuous place in school e.g. Administration Office)</em></td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                ${formatCheckbox(data.progKinder)} <strong>Kindergarten</strong><br>
                                __ Permit No. ${data.kinderPermitNo || '_________________'}<br>
                                Date Issued ${data.kinderPermitDate || '_________________'}<br>
                                __ Recognition No. ${data.kinderRecogNo || '_________________'}<br>
                                Date Issued ${data.kinderRecogDate || '_________________'}<br><br>
                                
                                ${formatCheckbox(data.progElem)} <strong>Elementary</strong><br>
                                __ Permit No. ${data.elemPermitNo || '_________________'}<br>
                                Date Issued ${data.elemPermitDate || '_________________'}<br>
                                __ Recognition No. ${data.elemRecogNo || '_________________'}<br>
                                Date Issued ${data.elemRecogDate || '_________________'}<br><br>
                                
                                ${formatCheckbox(data.progJHS)} <strong>Junior High School</strong><br>
                                __ Permit No. ${data.jhsPermitNo || '_________________'}<br>
                                Date Issued ${data.jhsPermitDate || '_________________'}<br>
                                __ Recognition No. ${data.jhsRecogNo || '_________________'}<br>
                                Date Issued ${data.jhsRecogDate || '_________________'}<br><br>
                                
                                ${formatCheckbox(data.progSPED)} <strong>SPED/SNEd Program</strong><br>
                                __ Permit No. ${data.spedPermitNo || '_________________'}<br>
                                Date Issued ${data.spedPermitDate || '_________________'}<br>
                                __ Recognition No. ${data.spedRecogNo || '_________________'}<br>
                                Date Issued ${data.spedRecogDate || '_________________'}<br><br>
                                
                                ${formatCheckbox(data.progHomeschool)} <strong>Homeschooling Program</strong><br>
                                __ Permit No. ${data.homePermitNo || '_________________'}<br>
                                Date Issued ${data.homePermitDate || '_________________'}<br>
                                Valid until ${data.homeValidUntil || '_________________'}
                            </td>
                            <td>
                                ${formatCheckbox(data.progSHS)} <strong>Senior High School</strong><br>
                                Program Offerings (Track & Strand, Specialization, Date Issued)<br>
                                1. ${data.shsProgram1 || '_________________'}<br>
                                2. ${data.shsProgram2 || '_________________'}<br>
                                3. ${data.shsProgram3 || '_________________'}<br><br>
                                
                                ${formatCheckbox(data.isInternational)} <strong>School Identified as "International School" (IS)</strong><br>
                                ____ by Name (uses "International"): ${data.intlByName || '______'}<br>
                                ____ Through Legislation: ${data.intlLegislation || '______'}<br><br>
                                
                                ${formatCheckbox(data.isHEI)} <strong>Higher Education Institution (HEI) with K to 12 and Program Offering</strong><br><br>
                                
                                <strong>Accreditation Status (FAAP)</strong><br>
                                <table style="margin-top: 5pt;">
                                    <tr>
                                        <th>Program</th>
                                        <th>Level</th>
                                        <th>Valid Until</th>
                                    </tr>
                                    <tr>
                                        <td>Kindergarten</td>
                                        <td>${data.accredKinderLevel || ''}</td>
                                        <td>${data.accredKinderValid || ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Elementary</td>
                                        <td>${data.accredElemLevel || ''}</td>
                                        <td>${data.accredElemValid || ''}</td>
                                    </tr>
                                    <tr>
                                        <td>JHS</td>
                                        <td>${data.accredJHSLevel || ''}</td>
                                        <td>${data.accredJHSValid || ''}</td>
                                    </tr>
                                    <tr>
                                        <td>SHS</td>
                                        <td>${data.accredSHSLevel || ''}</td>
                                        <td>${data.accredSHSValid || ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Complete Basic Ed. Program</td>
                                        <td>${data.accredCompleteLevel || ''}</td>
                                        <td>${data.accredCompleteValid || ''}</td>
                                    </tr>
                                </table>
                                <br>
                                <strong>Accrediting Agency:</strong> ${data.accreditingAgency || '_________________'}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>School Administration</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <strong>Name of School Head/President/CEO:</strong> ${data.schoolHeadCEO || ''}<br>
                                <strong>Name of School Principal:</strong> ${data.schoolPrincipal || ''}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Total Number of Learners Registered in the LIS</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <table>
                                    ${formatGradeLevels('lis')}
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Total Number of Learners Head Counts</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <table>
                                    ${formatGradeLevels('warm')}
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Total Number of Learners Recipients of Government Subsidies</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                ${formatSubsidyData()}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Total Number of Teachers</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <table>
                                    <tr>
                                        <th>Grade Level</th>
                                        <th>Total With LPT</th>
                                        <th>Total Non-Licensed</th>
                                    </tr>
                                    <tr>
                                        <td>Kindergarten</td>
                                        <td>${data.kinderLPT || '0'}</td>
                                        <td>${data.kinderNonLPT || '0'}</td>
                                    </tr>
                                    <tr>
                                        <td>Elementary</td>
                                        <td>${data.elemLPT || '0'}</td>
                                        <td>${data.elemNonLPT || '0'}</td>
                                    </tr>
                                    <tr>
                                        <td>Junior High School (JHS)</td>
                                        <td>${data.jhsLPT || '0'}</td>
                                        <td>${data.jhsNonLPT || '0'}</td>
                                    </tr>
                                    <tr>
                                        <td>Senior High School (SHS)</td>
                                        <td>${data.shsLPT || '0'}</td>
                                        <td>${data.shsNonLPT || '0'}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Existence of School Child Protection and/or Anti-Bullying Policy and Committee</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                Yes: ${formatCheckbox(data.childProtection === 'Yes')} &nbsp;&nbsp;&nbsp;
                                No: ${formatCheckbox(data.childProtection === 'No')}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Learning Modalities Used</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                ${formatCheckbox(data.modalInPerson)} a. In-Person<br>
                                ${formatCheckbox(data.modalBlended)} b. Blended Learning Modality<br>
                                ${formatCheckbox(data.modalDistance)} c. Full Distance<br><br>
                                Grade Level/s Offered: ${data.modalGradeLevels || '_________________'}<br><br>
                                Learning Management System (LMS) Used: ${data.lmsUsed || '_________________'}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Compliance to K to 12 Curriculum / Class Programs</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                Kindergarten ${formatCheckbox(data.curriculumKinder === 'Yes')} Yes ${formatCheckbox(data.curriculumKinder === 'No')} No<br>
                                Elementary ${formatCheckbox(data.curriculumElem === 'Yes')} Yes ${formatCheckbox(data.curriculumElem === 'No')} No<br>
                                JHS ${formatCheckbox(data.curriculumJHS === 'Yes')} Yes ${formatCheckbox(data.curriculumJHS === 'No')} No<br>
                                SHS ${formatCheckbox(data.curriculumSHS === 'Yes')} Yes ${formatCheckbox(data.curriculumSHS === 'No')} No
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>School Facilities</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                No. of Instructional Rooms: ${data.numInstructionalRooms || '_________________'}<br>
                                Classroom Size in sqm (average): ${data.classroomSize || '_________________'}<br>
                                Total Floor Area in square meter: ${data.totalFloorArea || '_________________'}<br>
                                School Lot Area in square meter: ${data.schoolLotArea || '_________________'}
                            </td>
                        </tr>
                    </table>

                    <p class="section-title">PART 2: PHYSICAL PLANT & FACILITIES</p>
                    <p><em>(Parts 2, 3 & 4 are to be accomplished on the actual day of monitoring)</em></p>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Facilities</th>
                                <th style="width: 80px;">Evident</th>
                                <th style="width: 80px;">Not Evident</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>School building/s</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_building_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_building_not)}</td>
                                <td>${data.fac_building_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Activity/Athletics Area</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_athletics_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_athletics_not)}</td>
                                <td>${data.fac_athletics_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Playground</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_playground_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_playground_not)}</td>
                                <td>${data.fac_playground_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Classrooms</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_classrooms_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_classrooms_not)}</td>
                                <td>${data.fac_classrooms_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Medical and Dental Clinic</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_clinic_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_clinic_not)}</td>
                                <td>${data.fac_clinic_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Library/Learning Resource Center</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_library_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_library_not)}</td>
                                <td>${data.fac_library_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Computer Laboratory</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_computer_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_computer_not)}</td>
                                <td>${data.fac_computer_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Registrar's Office</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_registrar_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_registrar_not)}</td>
                                <td>${data.fac_registrar_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Faculty Room</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_faculty_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_faculty_not)}</td>
                                <td>${data.fac_faculty_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Guidance & Counselling Office (from Gr. 1)</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_guidance_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_guidance_not)}</td>
                                <td>${data.fac_guidance_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Canteen</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_canteen_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_canteen_not)}</td>
                                <td>${data.fac_canteen_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Principal's Office</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_principal_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_principal_not)}</td>
                                <td>${data.fac_principal_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Science Laboratory/ies (from Gr. 4)<br>SHS STEM -- min. of 3 laboratories</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_science_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_science_not)}</td>
                                <td>${data.fac_science_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Practice House & Industrial Arts Area (from Gr. 4)</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_practice_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_practice_not)}</td>
                                <td>${data.fac_practice_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Emergency equipment</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_emergency_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_emergency_not)}</td>
                                <td>${data.fac_emergency_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Emergency Signages</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_signages_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_signages_not)}</td>
                                <td>${data.fac_signages_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Fire Exit</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_fireexit_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_fireexit_not)}</td>
                                <td>${data.fac_fireexit_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Male Restroom</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_malerest_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_malerest_not)}</td>
                                <td>${data.fac_malerest_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Female Restroom</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_femalerest_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_femalerest_not)}</td>
                                <td>${data.fac_femalerest_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td>Other Facilities</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_other_evident)}</td>
                                <td style="text-align: center;">${formatCheckbox(data.fac_other_not)}</td>
                                <td>${data.fac_other_remarks || ''}</td>
                            </tr>
                            <tr>
                                <td colspan="4"><strong>Other SHS Laboratories</strong><br>
                                    ${formatCheckbox(data.shsLabTVL)} TVL Track (specify lab): ${data.shsLabTVLDetails || ''}<br>
                                    ${formatCheckbox(data.shsLabHE)} HE<br>
                                    ${formatCheckbox(data.shsLabICT)} ICT<br>
                                    ${formatCheckbox(data.shsLabIA)} IA<br>
                                    ${formatCheckbox(data.shsLabAFA)} AFA<br>
                                    ${formatCheckbox(data.shsLabArts)} Arts & Design Track<br>
                                    ${formatCheckbox(data.shsLabSports)} Sports Track<br>
                                    ${formatCheckbox(data.shsLabUnique)} Unique Track
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">${data.shsLabRemarks || ''}</td>
                            </tr>
                        </tbody>
                    </table>

                    <p class="section-title">PART 3: OTHER FINDINGS:</p>
                    <p><em>(Remarks and observations on the day of actual visit)</em></p>
                    <p>${(data.generalObservations || '').replace(/\n/g, '<br>')}</p>
                    <p>_________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________</p>

                    <p class="section-title">PART 4: STATUS OF THE SIGNIFICANT FINDINGS OF THE MONITORING TEAM DURING THE PREVIOUS MONITORING.</p>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50%;">ADVERSE/SIGNIFICANT FINDINGS</th>
                                <th style="width: 50%;">STATUS/UPDATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${(data.finding1 || '').replace(/\n/g, '<br>')}</td>
                                <td>${(data.status1 || '').replace(/\n/g, '<br>')}</td>
                            </tr>
                            <tr>
                                <td>${(data.finding2 || '').replace(/\n/g, '<br>')}</td>
                                <td>${(data.status2 || '').replace(/\n/g, '<br>')}</td>
                            </tr>
                            <tr>
                                <td>${(data.finding3 || '').replace(/\n/g, '<br>')}</td>
                                <td>${(data.status3 || '').replace(/\n/g, '<br>')}</td>
                            </tr>
                        </tbody>
                    </table>

                    <p style="margin-top: 20pt;">Date Inspected/Monitored: <span class="underline">${data.monitorDate || '_________________'}</span></p>

                    <p style="margin-top: 20pt;"><strong>Prepared by:</strong></p>
                    
                    <p style="margin-top: 40pt;">
                    <span class="underline">${data.monitorName || '_________________________________'}</span><br>
                    <em>Signature Over Printed Name of Monitor &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Position: ${data.monitorPosition || '_________________'}</em>
                    </p>

                    <p><strong>SDO Office/Unit</strong> <span class="underline">${data.sdoOfficeUnit || '_________________________________'}</span></p>

                    <p style="margin-top: 20pt;"><strong>Conforme:</strong></p>

                    <p style="margin-top: 40pt;">
                    <span class="underline">${data.schoolHeadName || '_________________________________'}</span><br>
                    <em>Signature Over Printed Name of School Head</em>
                    </p>

                    <p>Date: <span class="underline">${data.conformeDate || '_________________'}</span></p>

                </body>
                </html>
            `;

            // Convert HTML to Word-compatible format
            const blob = new Blob(['\ufeff', htmlContent], {
                type: 'application/msword'
            });

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert('✅ Document downloaded successfully!\n\nThe monitoring report has been saved and can be opened in Microsoft Word.');
        }

        // Initialize on page load
 // Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize program filter functionality
    initializeProgramFilter();

    // Initialize subsidy visibility controls
    toggleSubsidyBlock('voucherOffered', 'voucherCountBlock');
    toggleSubsidyBlock('escOffered', 'escCountBlock');
    toggleSubsidyBlock('jdvpOffered', 'jdvpCountBlock');

    // Load saved data from Local Storage
    const hasLoadedData = loadFromLocalStorage();
    
    // CRITICAL FIX: Apply filters AFTER loading data to ensure visibility reflects saved state
    applyProgramFilters();
    
    // CRITICAL FIX: Re-trigger subsidy visibility after loading saved data
    if (hasLoadedData) {
        // Force update subsidy field visibility after data is loaded
        ['voucherOffered', 'escOffered', 'jdvpOffered'].forEach(radioName => {
            const radios = document.getElementsByName(radioName);
            radios.forEach(radio => {
                if (radio.checked) {
                    radio.dispatchEvent(new Event('change'));
                }
            });
        });
    }
    
    // Set default date to today if no saved data
    if (!hasLoadedData) {
        const today = new Date().toISOString().split('T')[0];
        const monitorDateInput = document.querySelector('input[name="monitorDate"]');
        if (monitorDateInput) {
            monitorDateInput.value = today;
        }
    }

    // Capture initial state after loading
    captureInitialState();
    
    // Setup auto-save functionality
    setupAutoSave();
    
    // Setup navigation warning
    setupNavigationWarning();
    
    // Add validation messages
    const requiredInputs = document.querySelectorAll('input[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('invalid', function() {
            this.setCustomValidity('This field is required for the monitoring report.');
        });
        input.addEventListener('input', function() {
            this.setCustomValidity('');
        });
    });

    // Checkbox mutual exclusivity for facilities
    const facilities = [
        'building', 'athletics', 'playground', 'classrooms', 'clinic', 
        'library', 'computer', 'registrar', 'faculty', 'guidance', 
        'canteen', 'principal', 'science', 'practice', 'emergency', 
        'signages', 'fireexit', 'malerest', 'femalerest', 'other'
    ];
    
    facilities.forEach(fac => {
        const evidentBox = document.querySelector(`input[name="fac_${fac}_evident"]`);
        const notEvidentBox = document.querySelector(`input[name="fac_${fac}_not"]`);
        
        if (evidentBox && notEvidentBox) {
            evidentBox.addEventListener('change', function() {
                if (this.checked) notEvidentBox.checked = false;
            });
            notEvidentBox.addEventListener('change', function() {
                if (this.checked) evidentBox.checked = false;
            });
        }
    });

    console.log('✅ DepEd Monitoring Tool initialized with auto-save and navigation protection');
    
    // Show notification if data was loaded
    if (hasLoadedData) {
        setTimeout(() => {
            alert('✅ Previously saved data has been restored!');
        }, 500);
    }
});
